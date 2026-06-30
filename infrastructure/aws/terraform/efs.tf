resource "aws_efs_file_system" "uploads" {
  creation_token = "${local.name_prefix}-uploads"
  encrypted      = true
  tags           = merge(local.common_tags, { Name = "${local.name_prefix}-uploads-efs" })
}

resource "aws_efs_mount_target" "uploads" {
  count           = length(aws_subnet.public)
  file_system_id  = aws_efs_file_system.uploads.id
  subnet_id       = aws_subnet.public[count.index].id
  security_groups = [aws_security_group.efs.id]
}
