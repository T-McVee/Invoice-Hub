# Tasks: Add Dashboard Timesheet Creation

## 1. Data Layer

- [x] 1.1 Create database schema for timesheets table
- [x] 1.2 Add mock client data for MVP testing (or env-based config)

## 2. Toggl Integration

- [x] 2.1 Implement Toggl API client with authentication
- [x] 2.2 Add method to fetch time entries for a date range and project
- [x] 2.3 Add method to fetch/generate detailed timesheet PDF from Toggl

## 3. API Endpoint

- [x] 3.1 Create `POST /api/timesheets` endpoint
- [x] 3.2 Validate request (client ID, month in YYYY-MM format)
- [x] 3.3 Call Toggl API to fetch time entries and PDF
- [x] 3.4 Store timesheet record with PDF URL and total hours
- [x] 3.5 Return created timesheet data

## 4. Dashboard UI

- [x] 4.1 Create month picker component (year + month selection)
- [x] 4.2 Create client selector dropdown component
- [x] 4.3 Create "Create Timesheet" form combining both selectors
- [x] 4.4 Add form submission with loading state
- [x] 4.5 Display success/error feedback after creation
- [x] 4.6 Show recently created timesheet summary on dashboard
