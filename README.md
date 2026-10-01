# SecureAPI Nexus

A production-grade, multi-layer **Centralized Edge API Gateway** architecture built to secure Mobile Backend environments. This project showcases a zero-trust network perimeter that handles request processing before traffic reaches private microservices.

## 🛠️ Architecture Layers
1. **Authentication:** Cryptographic token validation boundary.
2. **Rate Limiting:** Sliding-window traffic throttle backed by high-speed Redis caching memory.
3. **Threat Detection:** Regex deep payload inspection checking for SQL Injection (SQLi) and Cross-Site Scripting (XSS).
4. **Asynchronous Auditing:** Centralized JSON security incident logging.

## 📂 System Components
* `/gateway`: The outward-facing reverse proxy pipeline intercepting incoming mobile routes.
* `/backend`: Isolated backend application server accessible only via the trusted gateway.
* `/frontend`: An interactive sandbox UI featuring a user view, real-time security alerts dashboard, and attack simulators.

## 🚀 Local Installation
1. Clone the repository.
2. Run `npm run install-all` to configure cross-project dependencies.
3. Start a local Redis instance on port `6379`.
4. Run `npm run start-all` to launch the ecosystem.
