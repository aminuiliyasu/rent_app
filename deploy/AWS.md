# AWS production deployment (Docker + ECS + Namecheap domain)

This guide deploys **Rentify** on AWS with:

- **ECS Fargate** (auto-scaling API + Web containers)
- **Application Load Balancer** + **HTTPS** (ACM certificate)
- **Route 53** hosted zone (connect your **Namecheap** domain)
- **RDS PostgreSQL** (persistent database)
- **S3** (uploads)
- **ECR** (Docker images)
- **GitHub Actions** (build + deploy on every push to `main`)

Firebase (Auth, Firestore, chat) stays on Firebase; AWS runs the Spring API and Next.js frontend.

---

## Architecture

```
Browser → https://rhentify.com (Route 53 → ALB)
            ├─ /api/v1/*, /uploads/*, /ws/*  → ECS API (Spring Boot)
            └─ everything else               → ECS Web (Next.js)

API → RDS PostgreSQL
API → S3 (images / voice uploads)
App → Firebase (auth, listings, bookings, messages)
```

---

## Prerequisites

1. **AWS account** with billing enabled (free tier helps but ECS/RDS/ALB are not fully free).
2. **Domain on Namecheap**: `rhentify.com`.
3. **GitHub repository** with this code pushed to `main`.
4. Local tools: `aws`, `terraform` (>= 1.5), `docker`, `java 17`, `node 20`.
5. Firebase web app config (same values as `frontend/.env.local`).
6. **A dedicated AWS account** for Rhentify (see next section — do not use the account where your other project runs).

---

## Use a separate AWS account (important)

Terraform only touches the AWS account tied to the credentials you use. Your **default** CLI profile (the one already on this PC) will **not** be used if you follow these steps.

### A. Create or pick the Rhentify AWS account

1. Sign in to [https://aws.amazon.com/](https://aws.amazon.com/) with the **other** account (new account or an empty one).
2. Note the **12-digit account ID** (top-right menu → account name).

### B. Create an IAM admin user in that account (one-time)

In the **Rhentify** AWS Console (not your other project’s account):

1. **IAM → Users → Create user** (e.g. `terraform-rhentify`).
2. Attach **AdministratorAccess** (or a tighter custom policy if you prefer).
3. **Security credentials → Create access key → CLI**.
4. Save **Access key ID** and **Secret access key**.

### C. Add a named CLI profile on your PC (keeps default untouched)

```bash
aws configure --profile rhentify-aws
```

Enter:

- Access key / secret from step B  
- Default region: `us-east-1`  
- Output: `json`

**Do not** run `aws configure` without `--profile` — that would overwrite your existing default profile.

### D. Confirm you are in the correct account

```bash
# Your OTHER project account (should stay as-is):
aws sts get-caller-identity

# Rhentify account (must show the NEW 12-digit account ID):
aws sts get-caller-identity --profile rhentify-aws
```

Only proceed when `rhentify-aws` shows the **Rhentify** account ID, not your other project’s ID.

### E. Point Terraform at that profile

`deploy/terraform/terraform.tfvars` already includes:

```hcl
aws_profile  = "rhentify-aws"
domain_name  = "rhentify.com"
project_name = "rhentify"
```

Every Terraform command will use that profile automatically via the provider block.

Alternatively, for a single command:

```bash
export AWS_PROFILE=rhentify-aws
```

### F. GitHub Actions uses only the Rhentify account

After `terraform apply` in the **Rhentify** account:

1. Run `terraform output github_actions_role_arn` (with `--profile rhentify-aws` if needed).
2. Put that ARN in GitHub secret `AWS_ROLE_ARN`.

CI/CD then deploys **only** to ECR/ECS in the Rhentify account. Your other AWS account is never referenced.

### G. What stays safe in your other account

- No `terraform apply` against the default profile = **no changes** to the other project.
- Separate Terraform state file: `deploy/terraform/terraform.tfstate` (local, only for Rhentify).
- Separate Route 53 zone for `rhentify.com` (created in Rhentify account only).

**Never run** `terraform apply` without checking:

```bash
cd deploy/terraform
terraform plan | head -20
terraform output aws_account_id   # after first apply
```

---

## Step 1 — Configure Terraform variables

```bash
cd deploy/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

| Variable | Value |
|----------|--------|
| `domain_name` | `rhentify.com` |
| `aws_profile` | `rhentify-aws` |
| `github_repo` | `username/rent_app` |
| `jwt_secret` | Long random string |
| `firebase_*` | From Firebase Console |

Generate JWT secret:

```bash
openssl rand -base64 48
```

---

## Step 2 — Create AWS infrastructure

```bash
cd deploy/terraform
terraform init
terraform plan
# Confirm plan shows account you expect, then:
terraform apply
```

If you did not set `aws_profile` in tfvars:

```bash
AWS_PROFILE=rhentify-aws terraform apply
```

Save outputs:

```bash
terraform output route53_name_servers
terraform output github_actions_role_arn
terraform output ecr_api_repository
terraform output ecr_web_repository
```

**First apply** creates ECS services before images exist; tasks may fail until Step 4 completes.

---

## Step 3 — Point Namecheap domain to AWS

1. Log in to **Namecheap** → **Domain List** → **Manage** → **Domain**.
2. **Nameservers** → **Custom DNS**.
3. Paste the **4 Route 53 nameservers** from:

```bash
AWS_PROFILE=rhentify-aws terraform output route53_name_servers
```
4. Save. DNS propagation can take up to 48 hours (often 15–60 minutes).

ACM certificate validation uses the same Route 53 zone automatically.

---

## Step 4 — Configure GitHub secrets

In GitHub: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|--------|--------|
| `AWS_ROLE_ARN` | `terraform output github_actions_role_arn` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase |

No long-lived AWS access keys are required (OIDC role).

---

## Step 5 — First Docker push (optional before CI)

If you want to deploy before enabling GitHub Actions:

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# API
docker build -t rentify-prod-api .
docker tag rentify-prod-api:latest ECR_API_URL:latest
docker push ECR_API_URL:latest

# Web (pass Firebase build args)
docker build -f frontend/Dockerfile frontend \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=... \
  ... \
  -t ECR_WEB_URL:latest
docker push ECR_WEB_URL:latest
```

Replace `ECR_*_URL` with terraform outputs.

---

## Step 6 — Deploy via GitHub Actions

Push to `main`:

```bash
git add .
git commit -m "Deploy AWS infrastructure"
git push origin main
```

Workflow: `.github/workflows/deploy.yml`

- Builds API + Web Docker images
- Pushes to ECR
- Forces ECS rolling deployment
- Waits until services are stable

Monitor: **GitHub → Actions** tab.

---

## Step 7 — Firebase production settings

1. **Firebase Console → Authentication → Settings → Authorized domains**
   - Add `rhentify.com` and `www.rhentify.com`
2. **Google sign-in**: update OAuth client authorized origins to `https://rhentify.com`
3. Deploy Firestore rules (from repo root):

```bash
firebase deploy --only firestore:rules,storage:rules
```

---

## Step 8 — Verify production

1. Open `https://rhentify.com`
2. Sign in (email or Google)
3. Post listing → appears in Feed
4. Create booking → chat works
5. Upload image → URL should be S3 (`*.amazonaws.com`) in production

Health checks:

```bash
curl -s https://rhentify.com/actuator/health
curl -s -o /dev/null -w "%{http_code}" https://rhentify.com/
```

---

## Local Docker stack (before AWS)

```bash
# From repo root, with frontend/.env.local values exported or in shell
docker compose up --build
```

- Web: http://localhost:3000  
- API: http://localhost:8080  
- Postgres: localhost:5432  

---

## Scaling

Terraform defaults:

- **2** API tasks, **2** Web tasks
- Auto-scale **2 → 10** on CPU (60% target)
- RDS `db.t4g.micro` with storage autoscale to 100 GB
- Multi-AZ RDS when `environment = prod`

Adjust in `terraform.tfvars`: `api_desired_count`, `web_desired_count`, `db_instance_class`.

---

## Updating the app

Every push to `main` triggers CI/CD automatically.

Manual redeploy:

```bash
aws ecs update-service --cluster rhentify-prod-cluster --service rhentify-prod-api --force-new-deployment
aws ecs update-service --cluster rhentify-prod-cluster --service rhentify-prod-web --force-new-deployment
```

Infrastructure changes:

```bash
cd deploy/terraform && terraform plan && terraform apply
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| ECS tasks not starting | Check CloudWatch log groups `/ecs/rhentify-prod-api` and `-web` |
| 502 from ALB | Wait for health checks; ensure images exist in ECR |
| Upload fails | Confirm S3 bucket policy + ECS task IAM role |
| Firebase auth fails | Add domain to Firebase authorized domains |
| API DB errors | Verify RDS security group + secrets in Secrets Manager |
| Certificate pending | Wait for Route 53 NS propagation at Namecheap |

---

## Cost notes

Typical monthly cost (low traffic): roughly **$50–120** (ALB + NAT Gateway + RDS + Fargate). NAT Gateway is the main fixed cost. For lower cost, consider removing NAT and using public subnets for Fargate (less secure) or AWS App Runner for simpler setups.

---

## Files reference

| Path | Purpose |
|------|---------|
| `Dockerfile` | Spring Boot API image |
| `frontend/Dockerfile` | Next.js standalone image |
| `docker-compose.yml` | Local full stack |
| `deploy/terraform/` | AWS infrastructure |
| `.github/workflows/deploy.yml` | CI/CD deploy |
| `.github/workflows/ci.yml` | PR/main tests |
