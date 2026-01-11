# Admin Settings

## ADDED Requirements

### Requirement: Settings Page

The admin portal SHALL provide a Settings page for configuring application settings.

#### Scenario: Navigate to settings

- **WHEN** the user clicks "Settings" in the navigation menu
- **THEN** the settings page is displayed
- **AND** the URL is `/settings`

#### Scenario: Settings page layout

- **WHEN** the user views the settings page
- **THEN** the page displays configurable settings grouped by category
- **AND** each setting shows its current value

### Requirement: Hourly Rate Configuration

The Settings page SHALL allow the user to configure the global default hourly rate.

#### Scenario: View current hourly rate

- **WHEN** the user views the settings page
- **THEN** the current hourly rate is displayed (or "Not configured" if not set)
- **AND** the last updated timestamp is shown if the rate has been set

#### Scenario: Set hourly rate

- **WHEN** the user enters a valid hourly rate
- **AND** clicks save
- **THEN** the rate is persisted
- **AND** a success message is displayed

#### Scenario: Update existing hourly rate

- **WHEN** the user modifies the configured hourly rate
- **AND** clicks save
- **THEN** the new rate replaces the previous value
- **AND** the estimated earnings on the dashboard updates accordingly

#### Scenario: Validate hourly rate input

- **WHEN** the user enters an invalid rate (negative or non-numeric)
- **THEN** the system displays a validation error
- **AND** the save button is disabled

### Requirement: Settings Navigation

The admin navigation menu SHALL include a link to the Settings page.

#### Scenario: Settings link in navigation

- **WHEN** the user views any admin page
- **THEN** the navigation menu includes a "Settings" link
- **AND** the link navigates to `/settings`
