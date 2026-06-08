# AWS EC2 + RDS Setup Guide — Bingo AI Backend

This guide walks through deploying the `apps/backend` Node.js server on AWS EC2 Free Tier with a PostgreSQL RDS database, Redis on the same instance, and Nginx as a reverse proxy.

---

## Architecture

```
Internet
    │
    ▼
EC2 t2.micro (Free Tier)          ← apps/backend (Node.js + Prisma)
├── PM2 process manager
├── Nginx  :80/:443  →  :3000
├── Redis  :6379  (local)
│
└──▶  RDS PostgreSQL db.t3.micro  ← same VPC, private subnet
         (bingo-ai-db)
```

---

## Prerequisites

- AWS account (Free Tier eligible)
- Your repo cloned locally: `github.com/godwinbernard/Bingo-AI-Call-Agent`
- All third-party API keys ready (Twilio, Deepgram, Clerk, Stripe, Anthropic, Resend, AWS S3)

---

## Part 1 — Launch the EC2 Instance

### 1a. Go to AWS Console → EC2 → Launch Instance

| Setting | Value |
|---|---|
| Name | `bingo-ai-backend` |
| AMI | **Ubuntu Server 24.04 LTS** (free tier eligible) |
| Instance type | **t2.micro** (free tier — 1 vCPU, 1 GB RAM) |
| Key pair | Create new → `bingo-ai-key` → download `.pem` — **save it permanently** |
| Network | Default VPC |
| Auto-assign public IP | **Enable** |
| Security group | Create new: `bingo-ai-backend-sg` (configure below) |
| Storage | **20 GB gp3** |

### 1b. Security Group Inbound Rules (`bingo-ai-backend-sg`)

| Type | Port | Source | Purpose |
|---|---|---|---|
| SSH | 22 | My IP | Deployment & maintenance |
| HTTP | 80 | 0.0.0.0/0 | Web traffic |
| HTTPS | 443 | 0.0.0.0/0 | Web traffic (after SSL setup) |
| Custom TCP | 3000 | 0.0.0.0/0 | Twilio webhooks (restrict to Twilio IPs in production) |

> **Twilio webhook IPs** (restrict port 3000 to these in production):
> `54.172.60.0/23`, `54.244.51.0/24`, `54.171.127.192/26`, `35.156.191.128/25`

---

## Part 2 — Launch the RDS Instance

### Go to AWS Console → RDS → Create Database

| Setting | Value |
|---|---|
| Engine | PostgreSQL 16 |
| Template | **Free tier** |
| DB instance identifier | `bingo-ai-db` |
| Master username | `bingo_admin` |
| Master password | Generate strong password — save it |
| Instance class | `db.t3.micro` |
| Storage | 20 GB gp2 |
| **VPC** | **Same VPC as your EC2** |
| **Public access** | **No** (EC2 connects privately — more secure) |
| VPC security group | Create new: `bingo-ai-rds-sg` |

### RDS Security Group — Edit Inbound Rules After Creation

| Type | Port | Source |
|---|---|---|
| PostgreSQL | 5432 | **Security group ID of `bingo-ai-backend-sg`** |

This allows only your EC2 instance to reach the database. Nothing from the public internet can connect.

---

## Part 3 — Connect to EC2 and Install Dependencies

```bash
# From your local machine
chmod 400 ~/Downloads/bingo-ai-key.pem
ssh -i ~/Downloads/bingo-ai-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Install Node.js 20, PM2, Nginx, Git

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 — keeps the app running, restarts on crash
sudo npm install -g pm2

# Nginx — reverse proxy
sudo apt-get install -y nginx

# Git
sudo apt-get install -y git

# Verify
node --version   # v20.x.x
npm --version
pm2 --version
```

### Install Redis (free — no ElastiCache needed on free tier)

```bash
sudo apt-get install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
redis-cli ping   # → PONG
```

---

## Part 4 — Deploy the Backend

```bash
# Clone the repo
git clone https://github.com/godwinbernard/Bingo-AI-Call-Agent.git
cd Bingo-AI-Call-Agent/apps/backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### Create the `.env` File

```bash
nano .env
```

Paste and fill in all values:

```env
# Database
# Get the endpoint from: AWS Console → RDS → your instance → Connectivity & security → Endpoint
DATABASE_URL="postgresql://bingo_admin:YOUR_RDS_PASSWORD@bingo-ai-db.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com:5432/bingo_ai"

# Redis (local on EC2)
REDIS_URL="redis://127.0.0.1:6379"

# App
PORT=3000
BASE_URL="https://api.bingo.ai"
# Use http://YOUR_EC2_PUBLIC_IP:3000 until you set up a domain

# Dashboard (for Socket.io CORS)
DASHBOARD_URL="https://app.bingo.ai"
# Use http://localhost:3001 for local dev

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_STARTER_ANNUAL_PRICE_ID=price_...
STRIPE_GROWTH_PRICE_ID=price_...
STRIPE_GROWTH_ANNUAL_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_...
STRIPE_PAYG_PRICE_ID=price_...

# Clerk
CLERK_SECRET_KEY=sk_...
CLERK_JWT_KEY=jwt_...
CLERK_ORIGIN=https://app.bingo.ai

# Human Dialer
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_API_KEY_SID=SK...
TWILIO_API_KEY_SECRET=...
TWILIO_TWIML_APP_SID=AP...
TWILIO_CALLER_ID=+1...
TWILIO_HOLD_MUSIC_URL=https://api.twilio.com/cowbell.mp3

# Deepgram (real-time transcription)
DEEPGRAM_API_KEY=dg_...

# Anthropic (AI brain + scorecard generation)
ANTHROPIC_API_KEY=sk-ant-...

# AWS S3 (call recordings)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_RECORDINGS_BUCKET=bingo-ai-recordings

# Resend (email)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@bingo.ai
EMAIL_FROM_NAME=Bingo AI

# Admin
ADMIN_SECRET=your_strong_admin_secret_here
SUPERADMIN_SECRET=your_very_strong_superadmin_secret_here

# Socket.io
SOCKET_IO_SECRET=your_socket_secret_here
```

Save: `Ctrl+X` → `Y` → Enter

### Run Prisma Migrations

```bash
# Creates all tables in your RDS database
npx prisma migrate deploy

# Optional: seed initial data
npm run prisma:seed
```

---

## Part 5 — Start the Backend with PM2

```bash
# Start the backend
pm2 start src/server.js --name bingo-backend

# Persist across reboots
pm2 save
pm2 startup
# Run the command that prints — it will look like:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Check it's running
pm2 status
pm2 logs bingo-backend --lines 50
```

---

## Part 6 — Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/bingo-backend
```

Paste (replace `YOUR_EC2_PUBLIC_IP` with your actual IP or domain):

```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    # Allow large file uploads (call recordings)
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # WebSocket support (Socket.io + Twilio Media Streams)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

```bash
# Enable and test
sudo ln -s /etc/nginx/sites-available/bingo-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t        # → "syntax is ok"
sudo systemctl restart nginx
sudo systemctl enable nginx
```

Test: open `http://YOUR_EC2_PUBLIC_IP/health` — should return `{"status":"ok"}`.

---

## Part 7 — Set Up AWS S3 for Call Recordings

### Create the S3 Bucket

1. Go to AWS Console → S3 → Create bucket
2. Name: `bingo-ai-recordings` (must match `AWS_S3_RECORDINGS_BUCKET` in `.env`)
3. Region: `us-east-1` (match `AWS_REGION`)
4. Block all public access: **On** (recordings are private, accessed via presigned URLs)

### Create an IAM User for the Backend

1. AWS Console → IAM → Users → Create user
2. Name: `bingo-ai-backend`
3. Attach policy → Create inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:GetSignedUrl"
      ],
      "Resource": "arn:aws:s3:::bingo-ai-recordings/*"
    }
  ]
}
```

4. Create access key → save `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` → paste into `.env`

---

## Part 8 — Assign an Elastic IP (Prevent IP Changes on Restart)

1. AWS Console → EC2 → Elastic IPs → Allocate Elastic IP
2. Associate it with your `bingo-ai-backend` instance
3. **Free while associated with a running instance** — you pay only if the instance is stopped

---

## Part 9 — Add SSL with Let's Encrypt (After Domain Setup)

Once you've pointed your domain (e.g. `api.bingo.ai`) to your Elastic IP:

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Issue certificate
sudo certbot --nginx -d api.bingo.ai

# Auto-renewal (already set up by Certbot, verify with)
sudo certbot renew --dry-run
```

Update your `.env`:
```env
BASE_URL=https://api.bingo.ai
```

Then reload PM2:
```bash
pm2 reload bingo-backend
```

---

## Part 10 — Auto-Deploy on Git Push (Optional)

Add this GitHub Actions workflow at `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'apps/backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/Bingo-AI-Call-Agent
            git pull origin main
            cd apps/backend
            npm install
            npx prisma generate
            npx prisma migrate deploy
            pm2 reload bingo-backend
```

Add these GitHub secrets:
- `EC2_HOST` — your Elastic IP
- `EC2_SSH_KEY` — contents of your `bingo-ai-key.pem` file

---

## Environment Variables Summary

### Backend (`apps/backend/.env`)
See `apps/backend/.env.example` for the full list.

### Dashboard (`apps/dashboard/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=https://api.bingo.ai
NEXT_PUBLIC_BACKEND_URL=https://api.bingo.ai
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
ADMIN_SECRET=your_strong_admin_secret_here
SUPERADMIN_SECRET=your_very_strong_superadmin_secret_here

# Human Dialer
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_API_KEY_SID=SK...
TWILIO_API_KEY_SECRET=...
TWILIO_TWIML_APP_SID=AP...
TWILIO_CALLER_ID=+1...
DEEPGRAM_API_KEY=dg_...
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_RECORDINGS_BUCKET=bingo-ai-recordings
SOCKET_IO_SECRET=your_socket_secret_here
```

Set these in Vercel: Dashboard project → Settings → Environment Variables.

---

## Verification Checklist

- [ ] `http://YOUR_EC2_IP/health` returns `{"status":"ok"}`
- [ ] `pm2 status` shows `bingo-backend` as `online`
- [ ] `redis-cli ping` returns `PONG`
- [ ] RDS endpoint connects: `psql $DATABASE_URL -c "SELECT 1"`
- [ ] Prisma migrations ran: `npx prisma migrate status` shows all applied
- [ ] Nginx proxies correctly: no 502 errors
- [ ] SSL works (after domain setup): `https://api.bingo.ai/health`
- [ ] Socket.io connects from dashboard (browser console shows `[Socket.io] connected`)
- [ ] Twilio webhook test call creates a transcript in DB

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `502 Bad Gateway` from Nginx | Run `pm2 status` — app may have crashed. Check `pm2 logs bingo-backend` |
| `ECONNREFUSED` to RDS | Check RDS security group allows port 5432 from `bingo-ai-backend-sg` |
| Prisma migration fails | Ensure `DATABASE_URL` is set correctly and RDS instance is running |
| Socket.io connection refused | Nginx must have `Upgrade` and `Connection` headers set (see Part 6) |
| Deepgram transcripts not appearing | Verify `DEEPGRAM_API_KEY` in `.env`; check `pm2 logs` for errors |
| S3 upload forbidden | Check IAM policy is attached and `AWS_ACCESS_KEY_ID` matches the right user |
