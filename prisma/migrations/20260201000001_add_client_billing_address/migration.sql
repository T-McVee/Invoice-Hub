-- Add billing address field to clients table
-- Multi-line address for invoice "To" field

ALTER TABLE [dbo].[clients] ADD [billingAddress] NVARCHAR(MAX) NULL;
