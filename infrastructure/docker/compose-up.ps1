param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\.."))
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker is not installed or not on PATH."
}

Push-Location $ProjectRoot
try {
  if (-not (Test-Path ".env.docker")) {
    Copy-Item ".env.docker.example" ".env.docker"
    Write-Host "Created .env.docker from .env.docker.example. Update secrets before production use."
  }

  docker compose up --build -d
  Write-Host "Local stack is starting on http://localhost"
} finally {
  Pop-Location
}
