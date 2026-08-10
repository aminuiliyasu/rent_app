# Preview local UI against production API (no local Spring on 8080 required).
$env:BACKEND_PROXY_URL = "https://rhentify.com"
$env:NEXT_PUBLIC_API_URL = "http://localhost:3001/api/v1"
npm run dev
