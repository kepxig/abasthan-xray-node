# abasthan-xray-node
Xray VLESS + WebSocket node running on Abasthan's free tier.
- The start script downloads the latest Xray binary and runs it on `$PORT`.
- The client UUID comes from the `UUID` environment variable — no secrets are stored in this repo.
- WebSocket path: `/ray`, no TLS at the app (the platform terminates TLS).





