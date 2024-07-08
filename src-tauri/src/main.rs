#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
  )]
  
  use hyper::{Client, Method, Request, Body};
  use hyper::body::HttpBody as _;
  use hyper_tls::HttpsConnector;
  use serde::{Deserialize, Serialize};
  use std::collections::HashMap;
  use tauri::State;
  use tokio::time::Instant;
  
  #[derive(Serialize, Deserialize)]
  struct RequestData {
    url: String,
    method: String,
    body: Option<String>,
    headers: Option<HashMap<String, String>>,
    content_type: Option<String>,
  }
  
  #[derive(Serialize, Deserialize)]
  struct ResponseData {
    status: u16,
    duration: u128,
    size: u64,
    body: String,
    headers: Vec<(String, String)>,
    timeline: Vec<String>,
  }
  
  #[tauri::command]
  async fn send_request(client: State<'_, Client<HttpsConnector<hyper::client::HttpConnector>>>, request_data: RequestData) -> Result<ResponseData, String> {
    let client = client.inner();
    let mut timeline = vec![];
    let start = Instant::now();
  
    let method = match request_data.method.as_str() {
      "GET" => Method::GET,
      "POST" => Method::POST,
      "PUT" => Method::PUT,
      "DELETE" => Method::DELETE,
      _ => return Err("Unsupported method".to_string()),
    };
  
    let mut req_builder = Request::builder()
      .method(method)
      .uri(&request_data.url);
  
    if let Some(header_map) = request_data.headers {
      for (key, value) in header_map.iter() {
        req_builder = req_builder.header(key.as_str(), value.as_str());
      }
    }
  
    let request = if let Some(body) = request_data.body {
      req_builder
        .body(Body::from(body))
        .map_err(|e| e.to_string())?
    } else {
      req_builder
        .body(Body::empty())
        .map_err(|e| e.to_string())?
    };
  
    timeline.push(format!("Sending request to {}", request_data.url));
  
    let response = client.request(request).await.map_err(|e| e.to_string())?;
    let duration = start.elapsed().as_millis();
  
    let status = response.status().as_u16();
    let headers: Vec<(String, String)> = response.headers().iter()
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
        .collect();
  
    let mut body = String::new();
    let mut size = 0;
  
    let mut resp_body = response.into_body();
    while let Some(chunk) = resp_body.data().await {
      let chunk = chunk.map_err(|e| e.to_string())?;
      size += chunk.len() as u64;
      body.push_str(&String::from_utf8_lossy(&chunk));
    }
  
    timeline.push("Request complete".to_string());
  
    Ok(ResponseData {
      status,
      duration,
      size,
      body,
      headers,
      timeline,
    })
  }
  
  #[tokio::main]
  async fn main() {
    let https = HttpsConnector::new();
    let client = Client::builder().build::<_, hyper::Body>(https);
  
    tauri::Builder::default()
      .manage(client)
      .invoke_handler(tauri::generate_handler![send_request])
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
  }
  