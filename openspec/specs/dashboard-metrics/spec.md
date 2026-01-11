# dashboard-metrics Specification

## Purpose
TBD - created by archiving change add-hourly-rate-earnings. Update Purpose after archive.
## Requirements
### Requirement: Estimated Earnings Display

The dashboard SHALL display estimated month-to-date earnings in a dedicated card, calculated from tracked hours and the configured hourly rate.

#### Scenario: Earnings displayed when rate configured

- **WHEN** the user views the dashboard
- **AND** a global hourly rate is configured
- **THEN** the system displays a dedicated "Estimated Earnings" card
- **AND** shows earnings calculated as `hours × hourlyRate`

#### Scenario: Earnings not displayed when rate not configured

- **WHEN** the user views the dashboard
- **AND** no hourly rate has been configured
- **THEN** the earnings card displays a prompt to configure the hourly rate
- **AND** provides a link to the Settings page
- **AND** does not show an earnings value

#### Scenario: Earnings update with hours

- **WHEN** the hours month-to-date value updates
- **THEN** the estimated earnings recalculates automatically
- **AND** reflects the new hours multiplied by the current rate

### Requirement: Hourly Rate API

The system SHALL provide an API endpoint for managing the global hourly rate setting.

#### Scenario: Get hourly rate

- **WHEN** a GET request is made to `/api/settings/hourly-rate`
- **THEN** the response includes:
  - `rate`: the hourly rate as a number (or null if not configured)
  - `updatedAt`: ISO timestamp of last update (or null)

#### Scenario: Set hourly rate

- **WHEN** a PUT request is made to `/api/settings/hourly-rate` with a valid rate
- **THEN** the rate is persisted
- **AND** the response confirms the new rate value

#### Scenario: Reject invalid rate

- **WHEN** a PUT request is made with an invalid rate (negative or non-numeric)
- **THEN** the system returns a 400 error with validation message

### Requirement: Earnings MTD API

The system SHALL provide an API endpoint for retrieving estimated month-to-date earnings.

#### Scenario: Earnings endpoint response

- **WHEN** a GET request is made to `/api/metrics/earnings-mtd`
- **THEN** the response includes:
  - `earnings`: calculated earnings as a number (or null if rate not configured)
  - `hours`: total hours used in calculation
  - `hourlyRate`: the current hourly rate (or null if not configured)
  - `month`: the month in YYYY-MM format
  - `isStale`: boolean indicating if hours data is from stale cache
  - `cachedAt`: ISO timestamp of when hours data was cached

