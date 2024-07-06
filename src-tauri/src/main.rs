#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use reqwest::Client;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue, CONTENT_TYPE};
use reqwest::multipart;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::State;

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
}

#[tauri::command]
async fn send_request(client: State<'_, Client>, request_data: RequestData) -> Result<ResponseData, String> {
  let client = client.inner();
  let start = std::time::Instant::now();

  let mut headers = HeaderMap::new();
  if let Some(header_map) = request_data.headers {
      for (key, value) in header_map.iter() {
          match HeaderName::from_bytes(key.as_bytes()) {
              Ok(header_name) => match HeaderValue::from_str(value) {
                  Ok(header_value) => { headers.insert(header_name, header_value); },
                  Err(_) => return Err(format!("Invalid header value for key: {}", key)),
              },
              Err(_) => return Err(format!("Invalid header name: {}", key)),
          }
      }
  }

  let mut request = match request_data.method.as_str() {
      "GET" => client.get(&request_data.url),
      "POST" => client.post(&request_data.url),
      "PUT" => client.put(&request_data.url),
      "DELETE" => client.delete(&request_data.url),
      _ => return Err("Unsupported method".to_string()),
  };

  if let Some(content_type) = request_data.content_type {
      headers.insert(CONTENT_TYPE, HeaderValue::from_str(&content_type).unwrap());
      match content_type.as_str() {
          "application/json" | "application/xml" => {
              if let Some(body) = request_data.body {
                  request = request.headers(headers.clone()).body(body);
              } else {
                  request = request.headers(headers.clone());
              }
          }
          "multipart/form-data" => {
              let mut form = multipart::Form::new();
              if let Some(body) = request_data.body {
                  let fields: HashMap<String, String> = serde_json::from_str(&body).unwrap();
                  for (key, value) in fields {
                      form = form.text(key, value);
                  }
              }
              request = request.headers(headers.clone()).multipart(form);
          }
          "application/x-www-form-urlencoded" => {
              if let Some(body) = request_data.body {
                  request = request.headers(headers.clone()).body(body);
              } else {
                  request = request.headers(headers.clone());
              }
          }
          _ => return Err("Unsupported content type".to_string()),
      }
  } else {
      request = request.headers(headers.clone());
  }

  let response = request.send().await;

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
          })
      },
      Err(_) => Err("Request failed".to_string()),
  }
}

#[tokio::main]
async fn main() {
  tauri::Builder::default()
      .manage(Client::new())
      .invoke_handler(tauri::generate_handler![send_request])
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}
