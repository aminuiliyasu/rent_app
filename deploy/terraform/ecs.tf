resource "aws_ecs_cluster" "main" {
  name = "${local.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_service_discovery_http_namespace" "main" {
  name        = "${local.name_prefix}.local"
  description = "Service Connect namespace"
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${local.name_prefix}-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.api_cpu
  memory                   = var.api_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = "api"
    image     = "${aws_ecr_repository.api.repository_url}:latest"
    essential = true
    portMappings = [{
      name          = "api"
      containerPort = 8080
      hostPort      = 8080
      protocol      = "tcp"
    }]
    environment = [
      { name = "PORT", value = "8080" },
      { name = "AWS_REGION", value = var.aws_region },
      { name = "AWS_S3_BUCKET", value = aws_s3_bucket.uploads.bucket },
      { name = "AWS_S3_PUBLIC_BASE_URL", value = "https://${aws_s3_bucket.uploads.bucket_regional_domain_name}" },
      { name = "DB_DRIVER", value = "org.postgresql.Driver" },
      { name = "DB_DIALECT", value = "org.hibernate.dialect.PostgreSQLDialect" },
      { name = "DB_DDL_AUTO", value = "update" },
      { name = "DB_SHOW_SQL", value = "false" },
      { name = "DB_FORMAT_SQL", value = "false" },
      { name = "DB_POOL_MAX", value = "20" },
      { name = "DB_POOL_MIN", value = "5" },
      { name = "FRONTEND_URL", value = "https://${var.domain_name}" },
      { name = "APP_BASE_URL", value = "https://${var.domain_name}" },
      { name = "SESSION_COOKIE_SECURE", value = "true" },
      { name = "UPLOAD_DIR", value = "uploads" },
      { name = "JWT_EXPIRATION", value = "900000" },
      { name = "JWT_REFRESH_EXPIRATION", value = "604800000" },
      { name = "MAIL_HOST", value = "smtp.sendgrid.net" },
      { name = "MAIL_PORT", value = "587" },
      { name = "MAIL_USERNAME", value = "" },
      { name = "MAIL_PASSWORD", value = "" }
    ]
    secrets = [
      { name = "JWT_SECRET", valueFrom = "${aws_secretsmanager_secret.app.arn}:JWT_SECRET::" },
      { name = "DB_URL", valueFrom = "${aws_secretsmanager_secret.app.arn}:DB_URL::" },
      { name = "DB_USERNAME", valueFrom = "${aws_secretsmanager_secret.app.arn}:DB_USERNAME::" },
      { name = "DB_PASSWORD", valueFrom = "${aws_secretsmanager_secret.app.arn}:DB_PASSWORD::" },
      { name = "GOOGLE_CLIENT_ID", valueFrom = "${aws_secretsmanager_secret.app.arn}:GOOGLE_CLIENT_ID::" },
      { name = "GOOGLE_CLIENT_SECRET", valueFrom = "${aws_secretsmanager_secret.app.arn}:GOOGLE_CLIENT_SECRET::" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.api.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "api"
      }
    }
    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 90
    }
  }])
}

resource "aws_ecs_task_definition" "web" {
  family                   = "${local.name_prefix}-web"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.web_cpu
  memory                   = var.web_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = "web"
    image     = "${aws_ecr_repository.web.repository_url}:latest"
    essential = true
    portMappings = [{
      name          = "web"
      containerPort = 3000
      hostPort      = 3000
      protocol      = "tcp"
    }]
    environment = [
      { name = "PORT", value = "3000" },
      { name = "HOSTNAME", value = "0.0.0.0" },
      { name = "BACKEND_PROXY_URL", value = "http://api:8080" },
      { name = "NEXT_PUBLIC_S3_HOST", value = aws_s3_bucket.uploads.bucket_regional_domain_name }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.web.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "web"
      }
    }
  }])
}

resource "aws_ecs_service" "api" {
  name            = "${local.name_prefix}-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 8080
  }

  service_connect_configuration {
    enabled = true
    service {
      port_name      = "api"
      discovery_name = "api"
      client_alias {
        port     = 8080
        dns_name = "api"
      }
    }
    namespace = aws_service_discovery_http_namespace.main.arn
  }

  depends_on = [aws_lb_listener.https]
}

resource "aws_ecs_service" "web" {
  name            = "${local.name_prefix}-web"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = var.web_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "web"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.https]
}

resource "aws_appautoscaling_target" "api" {
  max_capacity       = 10
  min_capacity       = var.api_desired_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "api_cpu" {
  name               = "${local.name_prefix}-api-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 60
    scale_in_cooldown  = 120
    scale_out_cooldown = 60
  }
}

resource "aws_appautoscaling_target" "web" {
  max_capacity       = 10
  min_capacity       = var.web_desired_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.web.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "web_cpu" {
  name               = "${local.name_prefix}-web-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.web.resource_id
  scalable_dimension = aws_appautoscaling_target.web.scalable_dimension
  service_namespace  = aws_appautoscaling_target.web.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 60
    scale_in_cooldown  = 120
    scale_out_cooldown = 60
  }
}
