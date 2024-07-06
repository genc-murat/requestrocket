#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Serialize, Deserialize)]
struct RequestData {
  url: String,
  method: String,
  body: Option<String>,
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
  let response = match request_data.method.as_str() {
      "GET" => client.get(&request_data.url).send().await,
      "POST" => client.post(&request_data.url).body(request_data.body.unwrap_or_default()).send().await,
      "PUT" => client.put(&request_data.url).body(request_data.body.unwrap_or_default()).send().await,
      "DELETE" => client.delete(&request_data.url).send().await,
      _ => return Err("Unsupported method".to_string()),
  };
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
