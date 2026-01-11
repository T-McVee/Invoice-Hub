# Dashboard Metrics

## ADDED Requirements

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
