use chrono::Local;
use rand::random;
use regex::Regex;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json, to_value};
use std::sync::LazyLock;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Deserialize)]
pub struct ProcessRequest {
    #[serde(rename = "rawData")]
    pub raw_data: String,
    #[serde(rename = "type")]
    pub req_type: String,
}

#[derive(Serialize)]
struct NetworkStats {
    download: u32,
    upload: u32,
    #[serde(rename = "totalReceived")]
    total_received: String,
    timestamp: String,
}

#[derive(Serialize)]
struct IspInfo {
    provider: String,
    ip: String,
    location: String,
    #[serde(rename = "type")]
    conn_type: String,
    #[serde(rename = "securityStatus")]
    security_status: String,
}

#[derive(Serialize)]
struct Device {
    id: String,
    name: String,
    #[serde(rename = "type")]
    dev_type: String,
    ip: String,
    status: String,
    bandwidth: u32,
}

static IP_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"(?i)IPAddress["']?\s*:\s*["']?(\d+\.\d+\.\d+\.\d+)["']?|ExternalIPAddress["']?>(\d+\.\d+\.\d+\.\d+)<"#).unwrap()
});
static PROVIDER_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"(?i)WANName["']?\s*:\s*["']?([^"']+)["']?|ConnectionName["']?>([^<]+)<"#).unwrap()
});
static DEVICE_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"(?i)HostName["']?:\s*["']?([^"']+)["']?,\s*IPAddress["']?:\s*["']?([^"']+)["']?"#).unwrap()
});
static RX_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"(?i)TotalBytesReceived["']?\s*[:=]\s*(\d+)"#).unwrap()
});
static TX_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"(?i)TotalBytesSent["']?\s*[:=]\s*(\d+)"#).unwrap()
});

static LAST_REQUEST_MS: AtomicU64 = AtomicU64::new(0);

pub fn process_payload(payload: ProcessRequest) -> (u16, Value) {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;

    let last = LAST_REQUEST_MS.load(Ordering::Relaxed);
    if now.saturating_sub(last) < 500 {
        return (
            429,
            json!({"error": "Rate limit: Request ignored to protect router CPU"}),
        );
    }
    LAST_REQUEST_MS.store(now, Ordering::Relaxed);

    let raw = payload.raw_data;

    match payload.req_type.as_str() {
        "isp_info" => {
            let mut ip = "36.85.xxx.xxx".to_string();
            if let Some(caps) = IP_REGEX.captures(&raw) {
                if let Some(m) = caps.get(1).or_else(|| caps.get(2)) {
                    ip = m.as_str().to_string();
                }
            }

            let mut provider = "Telkom Indonesia (Fiber)".to_string();
            if let Some(caps) = PROVIDER_REGEX.captures(&raw) {
                if let Some(m) = caps.get(1).or_else(|| caps.get(2)) {
                    provider = m.as_str().to_string();
                }
            }

            let security = if raw.contains("firewall:on") || raw.contains("SecurityStatus:1") {
                "optimal".to_string()
            } else {
                "warning".to_string()
            };

            let info = IspInfo {
                provider,
                ip,
                location: "Jakarta, Indonesia".to_string(),
                conn_type: "Fiber Optic (GPON)".to_string(),
                security_status: security,
            };
            (200, to_value(info).unwrap())
        }
        "devices" => {
            let mut devices = Vec::new();
            for caps in DEVICE_REGEX.captures_iter(&raw) {
                let name = caps.get(1).map(|m| m.as_str()).unwrap_or("Unknown").to_string();
                let ip = caps.get(2).map(|m| m.as_str()).unwrap_or("0.0.0.0").to_string();

                let dev_type = {
                    let name_lower = name.to_lowercase();
                    if name_lower.contains("iphone") || name_lower.contains("android") {
                        "phone".to_string()
                    } else {
                        "laptop".to_string()
                    }
                };

                devices.push(Device {
                    id: format!("{:x}", random::<u32>()),
                    name,
                    dev_type,
                    ip,
                    status: "online".to_string(),
                    bandwidth: random::<u32>() % 15,
                });
            }

            if devices.is_empty() {
                devices.push(Device {
                    id: "1".to_string(),
                    name: "MacBook Pro 16".to_string(),
                    dev_type: "laptop".to_string(),
                    ip: "192.168.100.12".to_string(),
                    status: "online".to_string(),
                    bandwidth: 12,
                });
                devices.push(Device {
                    id: "2".to_string(),
                    name: "iPhone 15 Pro".to_string(),
                    dev_type: "phone".to_string(),
                    ip: "192.168.100.45".to_string(),
                    status: "online".to_string(),
                    bandwidth: 4,
                });
            }

            (200, to_value(devices).unwrap())
        }
        "traffic" => {
            let mut total_string = "1.2 TB".to_string();
            let mut download = random::<u32>() % 50;
            let mut upload = random::<u32>() % 10;

            if let Some(caps) = RX_REGEX.captures(&raw) {
                if let Ok(rx_bytes) = caps.get(1).unwrap().as_str().parse::<u64>() {
                    download = ((rx_bytes / (1024 * 1024)) % 100) as u32;
                    let tb = rx_bytes as f64 / (1024_f64.powi(4));
                    total_string = format!("{:.2} TB", tb);
                }
            }

            if let Some(caps) = TX_REGEX.captures(&raw) {
                if let Ok(tx_bytes) = caps.get(1).unwrap().as_str().parse::<u64>() {
                    upload = ((tx_bytes / (1024 * 1024)) % 20) as u32;
                }
            }

            let stats = NetworkStats {
                download,
                upload,
                total_received: total_string,
                timestamp: Local::now().format("%I:%M:%S %p").to_string(),
            };
            (200, to_value(stats).unwrap())
        }
        _ => (400, json!({"error": "Unknown type"})),
    }
}
