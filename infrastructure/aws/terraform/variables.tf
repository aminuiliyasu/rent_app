variable "aws_region" {
  type        = string
  description = "AWS region for all resources."
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Short project name used in resource names."
  default     = "rentify"
}

variable "environment" {
  type        = string
  description = "Deployment environment label."
  default     = "prod"
}

variable "db_username" {
  type        = string
  description = "PostgreSQL master username."
  default     = "rentify"
}

variable "db_password" {
  type        = string
  description = "PostgreSQL master password."
  sensitive   = true
}

variable "jwt_secret" {
  type        = string
  description = "JWT signing secret for the backend."
  sensitive   = true
}

variable "frontend_url" {
  type        = string
  description = "Public site URL used for CORS and OAuth redirects."
  default     = ""
}

variable "backend_cpu" {
  type        = number
  description = "Fargate CPU units for the backend task."
  default     = 512
}

variable "backend_memory" {
  type        = number
  description = "Fargate memory (MiB) for the backend task."
  default     = 1024
}

variable "frontend_cpu" {
  type        = number
  description = "Fargate CPU units for the frontend task."
  default     = 512
}

variable "frontend_memory" {
  type        = number
  description = "Fargate memory (MiB) for the frontend task."
  default     = 1024
}

variable "desired_count" {
  type        = number
  description = "Desired task count for each ECS service."
  default     = 1
}
