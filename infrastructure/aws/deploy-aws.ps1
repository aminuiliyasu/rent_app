param(
  [string]$Region = "us-east-1",
  [string]$TerraformDir = "$PSScriptRoot\terraform",
  [string]$ImageTag = "latest"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
  throw "AWS CLI is not installed or not on PATH."
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker is not installed or not on PATH."
}
if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
  throw "Terraform is not installed or not on PATH."
}

Push-Location $TerraformDir
try {
  terraform init
  terraform apply -auto-approve
  $BackendRepo = terraform output -raw backend_ecr_repository_url
  $FrontendRepo = terraform output -raw frontend_ecr_repository_url
  $AlbDns = terraform output -raw alb_dns_name
  $Cluster = terraform output -raw ecs_cluster_name
  $BackendService = terraform output -raw backend_service_name
  $FrontendService = terraform output -raw frontend_service_name
} finally {
  Pop-Location
}

$AccountId = (aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$AccountId.dkr.ecr.$Region.amazonaws.com"

Push-Location $RepoRoot
try {
  docker build -t "${BackendRepo}:${ImageTag}" .
  docker push "${BackendRepo}:${ImageTag}"

  docker build `
    --build-arg "BACKEND_PROXY_URL=http://${AlbDns}" `
    -t "${FrontendRepo}:${ImageTag}" `
    ./frontend
  docker push "${FrontendRepo}:${ImageTag}"
} finally {
  Pop-Location
}

aws ecs update-service --cluster $Cluster --service $BackendService --force-new-deployment --region $Region | Out-Null
aws ecs update-service --cluster $Cluster --service $FrontendService --force-new-deployment --region $Region | Out-Null

Write-Host "Deployment triggered."
Write-Host "Application URL: http://$AlbDns"
Write-Host "Point your domain CNAME to the load balancer DNS name when you are ready."
