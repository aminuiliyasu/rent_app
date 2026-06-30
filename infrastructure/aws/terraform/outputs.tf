output "alb_dns_name" {
  description = "Public DNS name of the application load balancer."
  value       = aws_lb.app.dns_name
}

output "application_url" {
  description = "URL to open the deployed application."
  value       = local.public_app_url
}

output "backend_ecr_repository_url" {
  description = "ECR repository URL for the backend image."
  value       = aws_ecr_repository.backend.repository_url
}

output "frontend_ecr_repository_url" {
  description = "ECR repository URL for the frontend image."
  value       = aws_ecr_repository.frontend.repository_url
}

output "rds_endpoint" {
  description = "PostgreSQL endpoint."
  value       = aws_db_instance.postgres.address
}

output "uploads_s3_bucket" {
  description = "S3 bucket reserved for future object storage."
  value       = aws_s3_bucket.uploads.bucket
}

output "ecs_cluster_name" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.main.name
}

output "backend_service_name" {
  description = "ECS backend service name."
  value       = aws_ecs_service.backend.name
}

output "frontend_service_name" {
  description = "ECS frontend service name."
  value       = aws_ecs_service.frontend.name
}
