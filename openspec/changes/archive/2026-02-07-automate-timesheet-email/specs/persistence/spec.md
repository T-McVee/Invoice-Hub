# persistence Specification Delta

## MODIFIED Requirements

### Requirement: Client Repository

The system SHALL store persistent data for clients and their contacts.

#### Scenario: Contact Schema Update
- **GIVEN** the `Contact` model
- **THEN** it must include an `isPrimaryApprover` boolean field (defaulting to false)
- **AND** it must include an `isPrimaryBilling` boolean field (defaulting to false)

#### Scenario: Primary Approver Uniqueness
- **GIVEN** a client with multiple contacts
- **WHEN** a contact is set as `isPrimaryApprover=true`
- **THEN** at most one contact per client can have `isPrimaryApprover=true`
- **AND** the contact's role must be `approver` or `both`

#### Scenario: Primary Billing Uniqueness
- **GIVEN** a client with multiple contacts
- **WHEN** a contact is set as `isPrimaryBilling=true`
- **THEN** at most one contact per client can have `isPrimaryBilling=true`
- **AND** the contact's role must be `billing` or `both`
