-- Add invoice number field to timesheets table
-- Sequential ID assigned on creation, becomes invoice number

ALTER TABLE [dbo].[timesheets] ADD [invoiceNumber] INT NULL;
