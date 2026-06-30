resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-db-subnets"
  subnet_ids = aws_subnet.private[*].id
  tags       = local.common_tags
}

resource "aws_db_instance" "postgres" {
  identifier                 = "${local.name_prefix}-postgres"
  engine                     = "postgres"
  engine_version             = "16.4"
  instance_class             = "db.t4g.micro"
  allocated_storage          = 20
  db_name                    = "rentify_db"
  username                   = var.db_username
  password                   = var.db_password
  db_subnet_group_name       = aws_db_subnet_group.main.name
  vpc_security_group_ids     = [aws_security_group.rds.id]
  skip_final_snapshot        = true
  publicly_accessible        = false
  backup_retention_period    = 7
  deletion_protection        = false
  auto_minor_version_upgrade = true
  tags                       = local.common_tags
}
