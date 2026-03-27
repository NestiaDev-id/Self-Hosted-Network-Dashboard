use http_body_util::BodyExt as _;
use serde_json::{Value, from_slice, json};
use vercel_runtime::{Error, Request, Response, run, service_fn};

use netdash_backend::{ProcessRequest, process_payload};

#[tokio::main]
async fn main() -> Result<(), Error> {
    println!("\n[NetDash] Core Engine Initialized.");
    println!("[NetDash] Local Gateway live at: http://127.0.0.1:3000");
    run(service_fn(handler)).await
}

async fn handler(req: Request) -> Result<Response<Value>, Error> {
    if req.method().as_str() == "OPTIONS" {
        let response = Response::builder()
            .status(204)
            .header("access-control-allow-origin", "*")
            .header("access-control-allow-methods", "POST,OPTIONS")
            .header("access-control-allow-headers", "Content-Type")
            .body(json!({}))?;
        return Ok(response);
    }

    if req.method().as_str() != "POST" {
        let response = Response::builder()
            .status(405)
            .header("content-type", "application/json")
            .header("access-control-allow-origin", "*")
            .header("access-control-allow-methods", "POST,OPTIONS")
            .header("access-control-allow-headers", "Content-Type")
            .body(json!({"error": "Method not allowed"}))?;
        return Ok(response);
    }

    let bytes = req.into_body().collect().await?.to_bytes();
    let payload: ProcessRequest = match from_slice(&bytes) {
        Ok(data) => data,
        Err(_) => {
            let response = Response::builder()
                .status(400)
                .header("content-type", "application/json")
                .header("access-control-allow-origin", "*")
                .header("access-control-allow-methods", "POST,OPTIONS")
                .header("access-control-allow-headers", "Content-Type")
                .body(json!({"error": "Invalid JSON payload"}))?;
            return Ok(response);
        }
    };

    let (status, body) = process_payload(payload);
    let response = Response::builder()
        .status(status)
        .header("content-type", "application/json")
        .header("access-control-allow-origin", "*")
        .header("access-control-allow-methods", "POST,OPTIONS")
        .header("access-control-allow-headers", "Content-Type")
        .body(body)?;

    Ok(response)
}
