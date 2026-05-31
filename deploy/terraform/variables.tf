variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI profile for a separate account (e.g. rhentify-aws). Leave empty to use default credentials."
  type        = string
  default     = ""
}

variable "project_name" {
  type    = string
  default = "rhentify"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "domain_name" {
  description = "Root domain (e.g. rhentify.com)"
  type        = string
  default     = "rhentify.com"
}

variable "github_repo" {
  description = "GitHub repo owner/name (e.g. myuser/rent_app)"
  type        = string
}

variable "api_desired_count" {
  type    = number
  default = 2
}

variable "web_desired_count" {
  type    = number
  default = 2
}

variable "api_cpu" {
  type    = number
  default = 512
}

variable "api_memory" {
  type    = number
  default = 1024
}

variable "web_cpu" {
  type    = number
  default = 512
}

variable "web_memory" {
  type    = number
  default = 1024
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "firebase_api_key" {
  type      = string
  sensitive = true
}

variable "firebase_auth_domain" {
  type = string
}

variable "firebase_project_id" {
  type = string
}

variable "firebase_storage_bucket" {
  type = string
}

variable "firebase_messaging_sender_id" {
  type = string
}

variable "firebase_app_id" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "google_client_id" {
  description = "Google OAuth2 client ID for Spring Security login"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth2 client secret for Spring Security login"
  type        = string
  sensitive   = true
}
