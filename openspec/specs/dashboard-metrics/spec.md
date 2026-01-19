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

### Requirement: Hours Month-to-Date Display

The dashboard SHALL display the total hours tracked month-to-date across all Toggl projects for the authenticated workspace.

#### Scenario: Fresh data display
- **WHEN** the user views the dashboard
- **AND** cached data is missing or expired (>10 minutes old)
- **THEN** the system fetches hours from Toggl API
- **AND** displays the total hours for the current month
- **AND** caches the result for 10 minutes

#### Scenario: Cached data display
- **WHEN** the user views the dashboard
- **AND** valid cached data exists (<10 minutes old)
- **THEN** the system displays the cached hours
- **AND** does not call the Toggl API

#### Scenario: Stale fallback on API failure
- **WHEN** the Toggl API is unavailable
- **AND** stale cached data exists
- **THEN** the system displays the stale cached hours
- **AND** shows a visual indicator that data may be outdated
- **AND** includes the timestamp of when data was last refreshed

#### Scenario: Loading state
- **WHEN** the dashboard is loading hours data
- **AND** no cached data is available
- **THEN** the system displays a loading indicator in the hours card

#### Scenario: Error state without cache
- **WHEN** the Toggl API is unavailable
- **AND** no cached data exists
- **THEN** the system displays an error state in the hours card
- **AND** provides a retry option

### Requirement: Cached Metrics API

The system SHALL provide an API endpoint for retrieving cached dashboard metrics.

#### Scenario: Hours MTD endpoint response
- **WHEN** a GET request is made to `/api/metrics/hours-mtd`
- **THEN** the response includes:
  - `hours`: total hours as a number
  - `month`: the month in YYYY-MM format
  - `isStale`: boolean indicating if data is from stale cache
  - `cachedAt`: ISO timestamp of when data was cached

### Requirement: Server-Side Caching

The system SHALL cache Toggl API responses server-side to avoid rate limits.

#### Scenario: Cache TTL enforcement
- **WHEN** cached data is older than 10 minutes
- **THEN** the cache is considered expired
- **AND** a fresh API call is made on next request

#### Scenario: Cache persistence across requests
- **WHEN** multiple HTTP requests are made within the TTL window
- **THEN** all requests receive the same cached data
- **AND** only one Toggl API call is made

