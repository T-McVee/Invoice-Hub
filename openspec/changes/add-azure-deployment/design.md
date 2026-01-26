# Design: Azure App Service Deployment

## Context

Invoice Hub is a Next.js application that needs to be deployed to Azure App Service. The app uses server-side features (API routes, server components) so requires a Node.js hosting environment, not static export.

**Constraints**:
- Azure App Service (per project.md)
- Minimize ongoing costs (free/basic tier where possible)
- GitHub repository for source control
- Next.js with App Router and API routes

## Goals / Non-Goals

**Goals**:
- Automated deployment on push to main branch
- Production environment with all required env vars
- Next.js running in standalone mode for optimal Azure performance

**Non-Goals**:
- Staging/preview environments (can add later)
- Blue-green deployments
- Custom domain setup (can add later)

## Decisions

### 1. Use Standalone Output Mode

**Decision**: Configure Next.js with `output: 'standalone'` for deployment.

**Why**:
- Creates minimal, self-contained deployment
- Includes only necessary node_modules
- Recommended for Docker/containerized environments
- Works well with Azure App Service

### 2. GitHub Actions for CI/CD

**Decision**: Use GitHub Actions with Azure Web App Deploy action.

**Why**:
- Repository already on GitHub
- Free for public repos, generous limits for private
- Native Azure integration via `azure/webapps-deploy` action
- Simple workflow file in repo

**Alternatives considered**:
- Azure DevOps Pipelines: More setup, separate service
- Manual deployment: Not sustainable for ongoing development

### 3. Linux App Service Plan

**Decision**: Use Linux-based App Service Plan with Node.js 20.

**Why**:
- Better Node.js performance than Windows
- Lower cost at same tier
- Standard for modern Node.js apps

### 4. Environment Variables via Azure Portal

**Decision**: Configure secrets in Azure Portal (Application Settings), not in workflow files.

**Why**:
- Secrets never in source control
- Easy to update without redeployment
- Azure Key Vault integration available if needed later

## App Service Configuration

| Setting | Value |
|---------|-------|
| Runtime | Node.js 20 LTS |
| OS | Linux |
| Plan | Basic B1 (can scale later) |
| Startup Command | `node .next/standalone/server.js` |

## Required Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Azure SQL connection string |
| `TOGGL_API_TOKEN` | Toggl Track API token |
| `TOGGL_WORKSPACE_ID` | Toggl workspace ID |
| `AZURE_STORAGE_CONNECTION_STRING` | Blob storage connection |
| `AZURE_STORAGE_CONTAINER` | Container name |
| `JWT_SECRET` | Portal token signing secret |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Cold start latency | Basic tier has always-on; can upgrade if needed |
| Build time in CI | Cache node_modules and .next/cache |
| Cost | Start with Basic B1 (~$13/month), scale as needed |

## Migration Plan

1. Configure `next.config.ts` for standalone output
2. Create GitHub Actions workflow
3. Create Azure resources (App Service Plan + Web App)
4. Configure environment variables in Azure
5. Push to main to trigger first deployment
6. Verify deployment and test Easy Auth

## Open Questions

- Confirm Azure subscription and resource group to use
