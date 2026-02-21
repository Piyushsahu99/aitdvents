# AITD Events Platform - GCP Deployment Guide

## Prerequisites

1. **Google Cloud Platform Account**
   - Create a GCP account at https://cloud.google.com
   - Enable billing on your project
   - Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install

2. **Required GCP APIs**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **Supabase Project**
   - Create a Supabase project at https://supabase.com
   - Note down your Project URL and Anon Key

## Quick Start Deployment

### 1. Initial Setup

```bash
# Set your GCP project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Set your region
export REGION="us-central1"
gcloud config set run/region $REGION
```

### 2. Configure Environment Variables

Create a `.env.production` file (do NOT commit this to git):

```env
VITE_APP_URL=https://your-domain.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_NAME=AITD Events Platform
NODE_ENV=production
```

### 3. Build and Deploy with Docker

```bash
# Build the Docker image locally
docker build \
  --build-arg VITE_APP_URL="https://your-domain.com" \
  --build-arg VITE_SUPABASE_URL="https://your-project.supabase.co" \
  --build-arg VITE_SUPABASE_ANON_KEY="your-supabase-anon-key" \
  -t gcr.io/$PROJECT_ID/aitd-events:latest .

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/aitd-events:latest

# Deploy to Cloud Run
gcloud run deploy aitd-events-platform \
  --image gcr.io/$PROJECT_ID/aitd-events:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080
```

### 4. Automated CI/CD with Cloud Build

#### Setup Cloud Build Trigger

1. **Connect Repository**
   ```bash
   # Connect your GitHub/GitLab repository to Cloud Build
   gcloud beta builds triggers create github \
     --repo-name=aitdvents \
     --repo-owner=your-github-username \
     --branch-pattern="^main$" \
     --build-config=cloudbuild.yaml
   ```

2. **Configure Substitution Variables**
   
   In the GCP Console (Cloud Build > Triggers):
   - Go to your trigger settings
   - Add substitution variables:
     - `_REGION`: `us-central1`
     - `_VITE_APP_URL`: `https://your-domain.com`
     - `_VITE_SUPABASE_URL`: `https://your-project.supabase.co`
     - `_VITE_SUPABASE_ANON_KEY`: `your-supabase-anon-key`

3. **Trigger Build**
   ```bash
   # Manual trigger
   gcloud builds submit --config=cloudbuild.yaml

   # Or push to main branch for automatic deployment
   git push origin main
   ```

## Custom Domain Setup

### 1. Map Custom Domain to Cloud Run

```bash
# Add domain mapping
gcloud run domain-mappings create \
  --service aitd-events-platform \
  --domain your-domain.com \
  --region $REGION
```

### 2. Update DNS Records

Add the DNS records shown in the output to your domain provider:
- Type: A
- Name: @
- Value: (provided by Cloud Run)

### 3. SSL Certificate

Cloud Run automatically provisions SSL certificates for custom domains.

## Environment-Specific Configurations

### Development Environment

```bash
npm run dev
```

### Staging Environment

```bash
# Deploy to staging
gcloud run deploy aitd-events-staging \
  --image gcr.io/$PROJECT_ID/aitd-events:staging \
  --region $REGION
```

### Production Environment

Follow the deployment steps above with production environment variables.

## Monitoring and Logging

### View Logs

```bash
# Stream logs
gcloud run services logs tail aitd-events-platform --region $REGION

# View logs in Console
https://console.cloud.google.com/run/detail/$REGION/aitd-events-platform/logs
```

### Set Up Alerts

1. Go to Cloud Monitoring
2. Create uptime checks for your service
3. Set up alert policies for:
   - High error rates
   - Increased latency
   - Service downtime

## Scaling Configuration

### Auto-scaling Settings

```bash
gcloud run services update aitd-events-platform \
  --min-instances 1 \
  --max-instances 20 \
  --concurrency 80 \
  --cpu 2 \
  --memory 1Gi \
  --region $REGION
```

### Cost Optimization

- **Development**: min-instances=0, max-instances=2
- **Production**: min-instances=1, max-instances=10

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Secret Management**: Use Google Secret Manager for sensitive data
3. **IAM Permissions**: Follow principle of least privilege
4. **HTTPS**: Always use HTTPS (automatic with Cloud Run)
5. **CORS**: Configure properly in Supabase

## Troubleshooting

### Build Failures

```bash
# Check build logs
gcloud builds list
gcloud builds log [BUILD_ID]
```

### Deployment Issues

```bash
# Check service status
gcloud run services describe aitd-events-platform --region $REGION

# Check revisions
gcloud run revisions list --service aitd-events-platform --region $REGION
```

### Container Won't Start

1. Check logs for errors
2. Verify environment variables are set correctly
3. Ensure port 8080 is exposed
4. Test Docker image locally:
   ```bash
   docker run -p 8080:8080 gcr.io/$PROJECT_ID/aitd-events:latest
   ```

## Rollback

```bash
# List revisions
gcloud run revisions list --service aitd-events-platform --region $REGION

# Rollback to previous revision
gcloud run services update-traffic aitd-events-platform \
  --to-revisions [REVISION_NAME]=100 \
  --region $REGION
```

## Cost Estimation

**Cloud Run Pricing** (approximate):
- **Compute**: $0.00002400 per vCPU-second
- **Memory**: $0.00000250 per GiB-second
- **Requests**: $0.40 per million requests

**Example Monthly Cost** (light traffic):
- 100,000 requests/month
- Average 200ms response time
- 512Mi memory, 1 vCPU
- **Estimated**: $5-15/month

## Support and Resources

- **GCP Documentation**: https://cloud.google.com/run/docs
- **Cloud Build**: https://cloud.google.com/build/docs
- **Supabase Docs**: https://supabase.com/docs
- **Project Repository**: [Your Repo URL]

## Update Checklist

Before deploying:
- [ ] Update environment variables
- [ ] Test build locally
- [ ] Update Supabase migrations
- [ ] Test in staging environment
- [ ] Update documentation
- [ ] Tag release in git
- [ ] Deploy to production
- [ ] Monitor logs and metrics
- [ ] Update DNS if needed

---

**Last Updated**: 2026-02-21
**Version**: 1.0.0
