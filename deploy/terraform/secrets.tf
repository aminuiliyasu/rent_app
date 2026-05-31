resource "aws_secretsmanager_secret" "app" {
  name = "${local.name_prefix}/app"
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({
    JWT_SECRET = var.jwt_secret
    DB_URL     = "jdbc:postgresql://${aws_db_instance.main.address}:${aws_db_instance.main.port}/rentify?sslmode=require"
    DB_USERNAME = aws_db_instance.main.username
    DB_PASSWORD = random_password.db.result
  })
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${local.name_prefix}-api"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "web" {
  name              = "/ecs/${local.name_prefix}-web"
  retention_in_days = 14
}
