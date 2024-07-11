use reqwest::Client;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue, CONTENT_TYPE};
use reqwest::multipart;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::State;
use chrono::prelude::*;
use std::sync::Arc;
use tokio::sync::{Mutex, mpsc};
use tokio::sync::mpsc::Sender;

#[derive(Serialize, Deserialize)]
struct RequestData {
    url: String,
    method: String,
    body: Option<String>,
    headers: Option<HashMap<String, String>>,
    content_type: Option<String>,
    path_params: Option<HashMap<String, String>>,
    query_params: Option<HashMap<String, String>>,
    form_data: Option<HashMap<String, String>>,
}

#[derive(Serialize, Deserialize)]
struct ResponseData {
    status: u16,
    duration: u128,
    size: u64,
    body: String,
    headers: Vec<(String, String)>,
    curl_command: String,
    timestamp: String,
    error: Option<String>,
}

struct AppState {
    client: Client,
    cancel_sender: Arc<Mutex<Option<Sender<()>>>>,
}

#[tauri::command]
async fn send_request(state: State<'_, AppState>, request_data: RequestData) -> Result<ResponseData, String> {
    let client = &state.client;
    let (cancel_tx, mut cancel_rx) = mpsc::channel(1);
    *state.cancel_sender.lock().await = Some(cancel_tx);

    let start = std::time::Instant::now();
    let timestamp = Utc::now().to_rfc3339();

    // Handle path parameters
    let mut url = request_data.url.clone();
    if let Some(path_params) = request_data.path_params {
        for (key, value) in path_params.iter() {
            url = url.replace(&format!("{{{}}}", key), value);
        }
    }

    // Handle query parameters
    if let Some(query_params) = request_data.query_params {
        let query_string: String = query_params.iter()
            .map(|(key, value)| format!("{}={}", key, value))
            .collect::<Vec<String>>()
            .join("&");
        url = format!("{}?{}", url, query_string);
    }

    let mut headers = HeaderMap::new();
    let mut curl_command = format!("curl -X {} '{}'", request_data.method, url);

    // Set request headers
    if let Some(header_map) = request_data.headers {
        for (key, value) in header_map.iter() {
            match HeaderName::from_bytes(key.as_bytes()) {
                Ok(header_name) => match HeaderValue::from_str(value) {
                    Ok(header_value) => { 
                        headers.insert(header_name.clone(), header_value.clone()); 
                        curl_command.push_str(&format!(" -H '{}: {}'", header_name, header_value.to_str().unwrap()));
                    },
                    Err(_) => return Err(format!("Invalid header value for key: {}", key)),
                },
                Err(_) => return Err(format!("Invalid header name: {}", key)),
            }
        }
    }

    // Initialize request with the appropriate HTTP method
    let mut request = match request_data.method.as_str() {
        "GET" => client.get(&url),
        "POST" => client.post(&url),
        "PUT" => client.put(&url),
        "DELETE" => client.delete(&url),
        "PATCH" => client.patch(&url),
        "OPTIONS" => client.request(reqwest::Method::OPTIONS, &url),
        "HEAD" => client.head(&url),
        _ => return Err("Unsupported method".to_string()),
    };

    // Set the Content-Type header and body according to the content type
    if let Some(content_type) = request_data.content_type {
        headers.insert(CONTENT_TYPE, HeaderValue::from_str(&content_type).unwrap());
        curl_command.push_str(&format!(" -H 'Content-Type: {}'", content_type));

        match content_type.as_str() {
            "application/json" | "application/xml" | "text/xml" | "text/xml; charset=utf-8" => {
                if let Some(body) = request_data.body {
                    request = request.headers(headers.clone()).body(body.clone());
                    curl_command.push_str(&format!(" -d '{}'", body));
                } else {
                    request = request.headers(headers.clone());
                }
            }
            "multipart/form-data" => {
                let mut form = multipart::Form::new();
                if let Some(form_data) = request_data.form_data {
                    for (key, value) in form_data {
                        form = form.text(key.clone(), value.clone());
                        curl_command.push_str(&format!(" -F '{}={}'", key, value));
                    }
                }
                request = request.headers(headers.clone()).multipart(form);
            }
            "application/x-www-form-urlencoded" => {
                if let Some(body) = request_data.body {
                    request = request.headers(headers.clone()).body(body.clone());
                    curl_command.push_str(&format!(" --data-urlencode '{}'", body));
                } else {
                    request = request.headers(headers.clone());
                }
            }
            _ => return Err("Unsupported content type".to_string()),
        }
    } else {
        request = request.headers(headers.clone());
    }

    // Send the request and handle cancellation
    tokio::select! {
        _ = cancel_rx.recv() => {
            Err("Request canceled".to_string())
        },
        response = request.send() => {
            let duration = start.elapsed().as_millis();
            match response {
                Ok(res) => {
                    let status = res.status().as_u16();
                    let headers = res.headers()
                        .iter()
                        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
                        .collect();
                    let body = res.text().await.unwrap_or_default();
                    let size = body.len() as u64;

                    Ok(ResponseData {
                        status,
                        duration,
                        size,
                        body,
                        headers,
                        curl_command,
                        timestamp,
                        error: None,
                    })
                },
                Err(err) => {
                    let error_message = format!("Request failed: {}", err);
                    println!("Error details: {:?}", err);
                    Err(error_message)
                },
            }
        }
    }
}

#[tauri::command]
async fn cancel_request(state: State<'_, AppState>) -> Result<(), String> {
    if let Some(cancel_sender) = &*state.cancel_sender.lock().await {
        if cancel_sender.send(()).await.is_err() {
            return Err("Failed to send cancel signal".to_string());
        }
    }
    Ok(())
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .manage(AppState {
            client: Client::new(),
            cancel_sender: Arc::new(Mutex::new(None)),
        })
        .invoke_handler(tauri::generate_handler![send_request, cancel_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
