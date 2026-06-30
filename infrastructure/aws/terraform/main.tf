locals {
  name_prefix = "${var.project_name}-${var.environment}"
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
  public_app_url = var.frontend_url != "" ? var.frontend_url : "http://${aws_lb.app.dns_name}"
}
