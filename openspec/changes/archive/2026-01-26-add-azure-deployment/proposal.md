# Change: Deploy App to Azure App Service

## Why

The application needs to be deployed to a production environment. Azure App Service is the target platform (as specified in project.md), and deployment is required to:
- Enable Easy Auth testing and activation
- Make the app accessible to clients via the portal
- Establish CI/CD pipeline for ongoing development

## What Changes

- Create Azure App Service Web App resource
- Configure Next.js for standalone deployment
- Set up GitHub Actions CI/CD pipeline
- Configure environment variables in Azure
- Connect to existing Azure SQL Database and Blob Storage

## Impact

- **Affected specs**: New `deployment` capability
- **Affected code**:
  - `next.config.ts` - Add standalone output mode
  - `.github/workflows/` - New CI/CD workflow
- **Azure resources**:
  - App Service Web App (using existing shared App Service Plan)
- **Environment**: Production env vars configured in Azure
