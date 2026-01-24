-- Add portal token field to clients table
-- JWT token for client portal access (~45 day expiry)

ALTER TABLE [dbo].[clients] ADD [portalToken] NVARCHAR(1000) NULL;
