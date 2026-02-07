# client-management Specification Delta

## MODIFIED Requirements

### Requirement: Client Recipient Management

The system SHALL allow storing detailed contact information for each client.

#### Scenario: Manage Contacts
- **GIVEN** an existing client
- **WHEN** the admin adds a contact
- **THEN** the contact must include Name, Email, and Role ('approver', 'billing', or 'both')
- **AND** the admin can designate the contact as "Primary Approver", "Primary Billing", or both

#### Scenario: Set Primary Approver
- **GIVEN** a client has multiple contacts
- **WHEN** the admin marks a contact as Primary Approver
- **THEN** the contact's role must be `approver` or `both`
- **AND** `isPrimaryApprover` is automatically unset on any other contact for that client

#### Scenario: Set Primary Billing
- **GIVEN** a client has multiple contacts
- **WHEN** the admin marks a contact as Primary Billing
- **THEN** the contact's role must be `billing` or `both`
- **AND** `isPrimaryBilling` is automatically unset on any other contact for that client

#### Scenario: Primary Approver Required
- **GIVEN** a client has contacts with role `approver` or `both`
- **THEN** exactly one must be designated as Primary Approver
- **AND** the UI prevents saving the client without a Primary Approver if approver/both contacts exist

#### Scenario: Primary Billing Required
- **GIVEN** a client has contacts with role `billing` or `both`
- **THEN** exactly one must be designated as Primary Billing
- **AND** the UI prevents saving the client without a Primary Billing if billing/both contacts exist

#### Scenario: Role-based checkbox visibility
- **GIVEN** a contact with role `approver`
- **THEN** only the "Primary Approver" checkbox is enabled
- **GIVEN** a contact with role `billing`
- **THEN** only the "Primary Billing" checkbox is enabled
- **GIVEN** a contact with role `both`
- **THEN** both "Primary Approver" and "Primary Billing" checkboxes are enabled
