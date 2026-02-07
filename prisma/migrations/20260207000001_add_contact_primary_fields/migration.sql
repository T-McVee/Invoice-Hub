-- Add isPrimaryApprover and isPrimaryBilling fields to contacts table
-- These enable independent primary designation per role scope

ALTER TABLE [dbo].[contacts] ADD [isPrimaryApprover] BIT NOT NULL CONSTRAINT [DF_contacts_isPrimaryApprover] DEFAULT 0;
ALTER TABLE [dbo].[contacts] ADD [isPrimaryBilling] BIT NOT NULL CONSTRAINT [DF_contacts_isPrimaryBilling] DEFAULT 0;
