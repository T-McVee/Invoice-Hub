# Invoice Hub

Automate timesheet and invoice generation from Toggl Track time entries.

## Features

- **Admin Portal**: Manage clients, view timesheets/invoices, analytics
- **Client Portal**: Token-based access for clients to review and approve timesheets

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State**: TanStack Query
- **Database**: Azure SQL Database
- **Storage**: Azure Blob Storage
- **Email**: Resend

## Getting Started

### Prerequisites

1. **Azure CLI**: Install from [docs.microsoft.com/cli/azure/install-azure-cli](https://docs.microsoft.com/cli/azure/install-azure-cli)
2. **Database access**: Your Azure account must have a database user in the Azure SQL instance

### Database Setup (Local Development)

```bash
# 1. Login to Azure (for database authentication)
az login

# 2. Copy environment variables
cp .env.example .env.local

# 3. Update DATABASE_URL in .env.local with your server name

# 4. Generate Prisma client
npx prisma generate

# 5. Run migrations (if needed)
npx prisma migrate deploy
```

### Running the App

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (admin)/           # Admin portal routes (dashboard, timesheets, etc.)
│   ├── portal/[token]/    # Client portal (token-authenticated)
│   └── api/               # API routes
├── lib/                   # Shared utilities and services
│   ├── toggl/            # Toggl API integration
│   ├── invoice-generator/ # Invoice Generator API
│   └── email/            # Email service (Resend)
├── components/           # Shared UI components
└── types/               # Shared TypeScript types
```

## Documentation

See `openspec/project.md` for detailed project context and conventions.
