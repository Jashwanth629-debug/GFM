# GlitzUp PestCheck — Production Deployment & DevOps Guide

This guide details the steps required to deploy the **GlitzUp PestCheck** platform to AWS, Heroku, or a Dockerized environment.

---

## 1. Architecture Overview

- **Mobile App**: React Native (Expo) built via **Expo Application Services (EAS Build)** into Android APK / AAB and iOS IPA.
- **Web Admin Dashboard**: React + Vite built to static HTML/JS assets and served via AWS CloudFront + S3 (or Nginx).
- **Backend API**: Node.js Express service running on AWS ECS (Elastic Container Service) or Elastic Beanstalk.
- **Database**: AWS RDS PostgreSQL 15 with multi-AZ replication.
- **Media Storage**: AWS S3 Bucket `glitzup-pestcheck-evidence` with presigned URLs.

---

## 2. Docker Compose Deployment (Quickest Staging Setup)

Create a `docker-compose.yml` in the root:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: glitzup_postgres
    environment:
      POSTGRES_DB: glitzup_pestcheck
      POSTGRES_USER: glitzup_admin
      POSTGRES_PASSWORD: SecretPassword2026!
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./docs/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  backend:
    build: ./backend
    container_name: glitzup_api
    restart: always
    environment:
      PORT: 5000
      DATABASE_URL: postgres://glitzup_admin:SecretPassword2026!@db:5432/glitzup_pestcheck
      JWT_SECRET: ProductionJwtSecretKeyForGlitzUp2026
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      - db

  web:
    build: ./web
    container_name: glitzup_dashboard
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

### Starting the cluster:
```bash
docker-compose up -d --build
```

---

## 3. AWS Production Deployment Steps

### Step 1: Managed Database (AWS RDS PostgreSQL)
1. Provision an **RDS PostgreSQL 15** db instance (`db.t3.medium` recommended).
2. Configure Security Group to allow inbound port `5432` from your ECS cluster.
3. Run the schema script:
   ```bash
   psql -h <rds-endpoint>.rds.amazonaws.com -U glitzup_admin -d glitzup_pestcheck -f docs/schema.sql
   ```

### Step 2: Evidence Media Storage (AWS S3)
1. Create S3 bucket: `glitzup-evidence-vault-chennai`.
2. Configure bucket CORS to allow `PUT` and `GET` from `https://pestcheck.glitzupfm.in`.
3. Set lifecycle rules: Archive photos older than 180 days to S3 Glacier for statutory ISO compliance.

### Step 3: Backend API (AWS ECS Fargate)
1. Build the Docker container:
   ```bash
   docker build -t glitzup/pestcheck-backend:latest ./backend
   ```
2. Tag and push to **AWS ECR (Elastic Container Registry)**:
   ```bash
   aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com
   docker tag glitzup/pestcheck-backend:latest <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com/glitzup-backend:latest
   docker push <aws_account_id>.dkr.ecr.ap-south-1.amazonaws.com/glitzup-backend:latest
   ```
3. Deploy Fargate Task Definition with Environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `AWS_S3_BUCKET`
   - `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`

### Step 4: Web Admin Dashboard (AWS S3 + CloudFront)
1. Build production static bundle:
   ```bash
   cd web
   npm run build
   ```
2. Sync `dist/` directory to S3 hosting bucket:
   ```bash
   aws s3 sync dist/ s3://pestcheck-admin.glitzupfm.in --delete
   ```
3. Invalidate CloudFront CDN cache:
   ```bash
   aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"
   ```

---

## 4. Mobile App Build & Release (Expo EAS)

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Configure credentials:
   ```bash
   cd mobile
   eas login
   eas build:configure
   ```
3. Build Android production APK / AAB:
   ```bash
   eas build --platform android --profile production
   ```
4. Build iOS production IPA:
   ```bash
   eas build --platform ios --profile production
   ```
5. Submit directly to stores:
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```
