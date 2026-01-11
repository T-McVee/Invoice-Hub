## ADDED Requirements

### Requirement: Business Profile Configuration

The Settings page SHALL allow the user to configure their business profile information for use on invoices.

#### Scenario: View business profile section

- **WHEN** the user views the settings page
- **THEN** a "Business Profile" section is displayed
- **AND** it shows all configurable profile fields with their current values (or empty if not set)

#### Scenario: Configure user name

- **WHEN** the user enters their name in the Name field
- **AND** clicks save
- **THEN** the name is persisted
- **AND** a success message is displayed

#### Scenario: Configure business number

- **WHEN** the user enters a business number (e.g., ABN)
- **AND** clicks save
- **THEN** the business number is persisted

#### Scenario: Configure GST number

- **WHEN** the user enters a GST/tax registration number
- **AND** clicks save
- **THEN** the GST number is persisted

#### Scenario: Configure phone number

- **WHEN** the user enters a phone number
- **AND** clicks save
- **THEN** the phone number is persisted

#### Scenario: Configure email address

- **WHEN** the user enters an email address
- **AND** clicks save
- **THEN** the email address is persisted

#### Scenario: Validate email format

- **WHEN** the user enters an invalid email format
- **THEN** the system displays a validation error
- **AND** the save button is disabled

#### Scenario: Configure address

- **WHEN** the user enters their address (multiline text)
- **AND** clicks save
- **THEN** the address is persisted

#### Scenario: Configure payment details

- **WHEN** the user enters payment details (multiline text, e.g., bank account information)
- **AND** clicks save
- **THEN** the payment details are persisted

#### Scenario: Configure tax rate

- **WHEN** the user enters a tax rate percentage
- **AND** clicks save
- **THEN** the tax rate is persisted

#### Scenario: Validate tax rate

- **WHEN** the user enters an invalid tax rate (negative, over 100, or non-numeric)
- **THEN** the system displays a validation error
- **AND** the save button is disabled

#### Scenario: Configure payment terms

- **WHEN** the user enters payment terms (e.g., "Net 30", "Due within 14 days")
- **AND** clicks save
- **THEN** the payment terms are persisted

#### Scenario: View last updated timestamp

- **WHEN** the user views the business profile section
- **AND** the profile has been previously saved
- **THEN** the last updated timestamp is displayed

### Requirement: Next Invoice Number Configuration

The Settings page SHALL allow the user to configure the next invoice number, which auto-increments after each invoice is created but can be manually overridden.

#### Scenario: View next invoice number

- **WHEN** the user views the settings page
- **THEN** the current next invoice number is displayed
- **AND** the field defaults to 1 if never set

#### Scenario: Set next invoice number

- **WHEN** the user enters a positive integer for the next invoice number
- **AND** clicks save
- **THEN** the next invoice number is persisted

#### Scenario: Override next invoice number

- **WHEN** the user manually changes the next invoice number to a different value
- **AND** clicks save
- **THEN** the new value replaces the previous value
- **AND** subsequent invoices will use this number as the starting point

#### Scenario: Validate next invoice number

- **WHEN** the user enters an invalid value (zero, negative, non-integer, or non-numeric)
- **THEN** the system displays a validation error
- **AND** the save button is disabled

#### Scenario: Auto-increment after invoice creation

- **WHEN** an invoice is successfully created
- **THEN** the next invoice number is automatically incremented by 1

## MODIFIED Requirements

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
- **AND** the "Hourly Rate" section is displayed
- **AND** the "Business Profile" section is displayed
