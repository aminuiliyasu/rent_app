output "aws_account_id" {
  description = "Verify this is your Rhentify AWS account before trusting the deploy"
  value       = data.aws_caller_identity.current.account_id
}

output "domain_name" {
  value = var.domain_name
}

output "site_url" {
  value = "https://${var.domain_name}"
}

output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "route53_name_servers" {
  description = "Point Namecheap nameservers to these values"
  value       = aws_route53_zone.main.name_servers
}

output "ecr_api_repository" {
  value = aws_ecr_repository.api.repository_url
}

output "ecr_web_repository" {
  value = aws_ecr_repository.web.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_api_service_name" {
  value = aws_ecs_service.api.name
}

output "ecs_web_service_name" {
  value = aws_ecs_service.web.name
}

output "s3_uploads_bucket" {
  value = aws_s3_bucket.uploads.bucket
}

output "github_actions_role_arn" {
  description = "Set as AWS_ROLE_ARN in GitHub repository secrets"
  value       = aws_iam_role.github_actions.arn
}

output "github_oidc_provider_arn" {
  value = aws_iam_openid_connect_provider.github.arn
}
