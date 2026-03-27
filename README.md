# 🌐 NetDash (High-Performance Router Dashboard)

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Rust](https://img.shields.io/badge/Rust-1.80%2B-000000?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

A **High-Performance Network Interface Layer** for monitoring and controlling routers across diverse hardware environments. **NetDash** abstracts router-specific complexity into a unified system, powered by a memory-safe **Rust backend** and a reactive **React UI**. Designed to run efficiently even on low-resource devices, it enables real-time insights, safe control mechanisms, and future-ready multi-router scalability. Initially optimized for constrained hardware (e.g., Huawei HG8245H), NetDash is evolving into a **universal, adaptive router management engine**.

---

## ✨ Key Features

### 🦀 Rust High-Performance Engine

- **Memory Safety**: Zero-allocation parsing to protect routers with limited RAM.
- **Axum & Tokio**: Blazing-fast concurrent requests with virtually zero overhead.
- **Hardware Parser**: Specialized Regex logic for Huawei/ZTE GPON ONT data extraction.

### 🛡️ Smart Safety & Protection

- **Triple-Confirm Reboot**: Mandatory text confirmation ("REBOOT") plus a final warning checkpoint to prevent accidental network resets.
- **Loop Rejection Guard**: Integrated 500ms debounce in the Rust backend to prevent router overload (anti-brute force protection).
- **Eco-Mode for Huawei**: Default **30s** refresh interval and auto-sanitizer for older HG8245H hardware.

### 💎 Premium UX/UI

- **Glassmorphism Design**: Frosted-glass components with nested gradients and emerald/blue accents.
- **Smart Switch UI**: The **Guest WiFi** button acts as a persistent toggle with visual status (emerald glow when active).
- **Reactive Logs**: Integrated system terminal with jump-to-logs navigation.

---

## 🏗️ Architecture

NetDash uses a hybrid model to offload compute-heavy tasks from the router:

1. **Router (HW)**: Supplies raw data (HTML/XML).
2. **Rust Backend (Axum)**: Receives raw data, parses it instantly via Regex, and returns clean JSON.
3. **React Frontend (Vite)**: Displays metrics and handles user interactions.

---

## 🚀 Getting Started

### 1. Backend (Rust)

From the root directory:

```bash
cargo run
```

The server will start on `http://127.0.0.1:3000`.

### 2. Frontend (React)

Move to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

### 3. Run locally with Vercel Functions (Rust + Frontend)

From the project root:

```bash
vercel dev
```

This runs Vercel Rust Function endpoints from `api/` (including `/api/process`) and serves the frontend in one local environment.

---

## 📂 Project Structure

- `api/`: Rust Vercel Functions entrypoints.
- `src/`: Shared Rust parser/core logic for functions.
- `frontend/src/`: Modern React dashboard UI.
- `frontend/src/components/dashboard/`: Modular UI sections (Metrics, Quick Actions, etc.).

---

## 🛤️ Project Roadmap

- [x] Rust Axum backend with high-performance router integration.
- [x] Safe action system (multi-step validation for reboot & critical actions).
- [x] Eco-mode scheduler (30s refresh optimized for low-RAM devices ~128MB).
- [x] Reboot protection layer (triple-confirm safety guard).
- [ ] Multi-brand scraping layer (ZTE F609/F660, TP-Link, Nokia ONTs).
- [ ] Router & ISP auto-detection engine (dynamic identification).
- [ ] Smart alerting system (custom thresholds & bandwidth anomaly detection).
- [ ] Mobile bridge layer (lightweight iOS/Android integration).

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

_Built with ❤️ by NestiaDev-Id._
