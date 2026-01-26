# Tasks: Deploy App to Azure App Service

## 1. Next.js Configuration

- [x] 1.1 Add `output: 'standalone'` to next.config.ts
- [x] 1.2 Test local build with standalone output

## 2. Azure Resources

- [x] 2.1 Create App Service Web App (Node.js 22) using existing App Service Plan
- [x] 2.2 Configure environment variables in Application Settings

## 3. CI/CD Pipeline

- [x] 3.1 Create GitHub Actions workflow for Azure deployment
- [x] 3.2 Configure Azure publish profile as GitHub secret
- [x] 3.3 Test deployment by pushing to main

## 4. Verification

- [x] 4.1 Verify app loads in browser
- [x] 4.2 Verify API routes and database connectivity
- [x] 4.3 Verify auth (admin requires Microsoft login, portal uses JWT)
