## ADDED Requirements

### Requirement: Azure App Service Hosting

The system SHALL be deployed to Azure App Service as a Node.js application.

#### Scenario: Application accessible via Azure URL
- **WHEN** a user navigates to the App Service URL
- **THEN** the application loads and renders correctly

#### Scenario: API routes functional
- **WHEN** a request is made to an API endpoint
- **THEN** the server processes the request and returns a response

#### Scenario: Server-side rendering works
- **WHEN** a page with server components is requested
- **THEN** the page is rendered on the server and returned as HTML

### Requirement: Automated Deployment

The system SHALL be deployed automatically when changes are pushed to the main branch.

#### Scenario: Push triggers deployment
- **WHEN** code is pushed to the main branch on GitHub
- **THEN** GitHub Actions builds and deploys the application to Azure

#### Scenario: Build failure prevents deployment
- **WHEN** the build fails (lint errors, test failures, build errors)
- **THEN** the deployment is aborted and the current production version remains active

#### Scenario: Deployment status visible
- **WHEN** a deployment is triggered
- **THEN** the status is visible in GitHub Actions

### Requirement: Environment Configuration

The system SHALL use environment variables configured in Azure for sensitive configuration.

#### Scenario: Secrets not in source control
- **WHEN** reviewing the repository
- **THEN** no secrets (API keys, connection strings, JWT secrets) are present

#### Scenario: Environment variables available at runtime
- **WHEN** the application runs in Azure
- **THEN** all required environment variables are accessible via `process.env`
