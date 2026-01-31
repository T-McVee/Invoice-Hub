// Azure Blob Storage client for PDF persistence
// Docs: https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-typescript-get-started

import { BlobServiceClient, ContainerClient } from '@azure/storage-blob'

function getStorageConnectionString(): string {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is not set')
  }
  return connectionString
}

function getContainerName(): string {
  const containerName = process.env.AZURE_STORAGE_CONTAINER
  if (!containerName) {
    throw new Error('AZURE_STORAGE_CONTAINER environment variable is not set')
  }
  return containerName
}

function getContainerClient(): ContainerClient {
  const connectionString = getStorageConnectionString()
  const containerName = getContainerName()
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  return blobServiceClient.getContainerClient(containerName)
}

export interface UploadResult {
  url: string
  blobName: string
}

/**
 * Upload a PDF buffer to Azure Blob Storage
 * @param buffer - The PDF file buffer
 * @param blobPath - The path/name for the blob (e.g., "timesheets/client-id/2024-01.pdf")
 * @returns The URL and blob name of the uploaded file
 */
export async function uploadPdf(buffer: Buffer, blobPath: string): Promise<UploadResult> {
  const containerClient = getContainerClient()
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath)

  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: {
      blobContentType: 'application/pdf',
    },
  })

  return {
    url: blockBlobClient.url,
    blobName: blobPath,
  }
}

/**
 * Download a PDF from Azure Blob Storage
 * @param blobPath - The path/name of the blob to download
 * @returns The PDF file as a Buffer
 */
export async function downloadPdf(blobPath: string): Promise<Buffer> {
  const containerClient = getContainerClient()
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath)

  const downloadResponse = await blockBlobClient.download(0)

  if (!downloadResponse.readableStreamBody) {
    throw new Error('No readable stream body in download response')
  }

  // Convert stream to buffer
  const chunks: Buffer[] = []
  for await (const chunk of downloadResponse.readableStreamBody) {
    chunks.push(Buffer.from(chunk))
  }

  return Buffer.concat(chunks)
}

/**
 * Delete a PDF from Azure Blob Storage
 * @param blobPath - The path/name of the blob to delete
 * @returns true if deleted, false if blob didn't exist
 */
export async function deletePdf(blobPath: string): Promise<boolean> {
  const containerClient = getContainerClient()
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath)

  const response = await blockBlobClient.deleteIfExists()
  return response.succeeded
}

/**
 * Check if a blob exists in Azure Blob Storage
 * @param blobPath - The path/name of the blob to check
 * @returns true if exists, false otherwise
 */
export async function blobExists(blobPath: string): Promise<boolean> {
  const containerClient = getContainerClient()
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath)
  return blockBlobClient.exists()
}

/**
 * Generate the blob path for a timesheet PDF
 * @param clientId - The client's UUID
 * @param month - The month in YYYY-MM format
 * @returns The blob path (e.g., "timesheets/abc-123/2024-01.pdf")
 */
export function getTimesheetBlobPath(clientId: string, month: string): string {
  return `timesheets/${clientId}/${month}.pdf`
}

/**
 * Generate the blob path for an invoice PDF
 * @param clientId - The client's UUID
 * @param timesheetId - The timesheet ID (used as invoice number)
 * @returns The blob path (e.g., "invoices/abc-123/1234.pdf")
 */
export function getInvoiceBlobPath(clientId: string, timesheetId: number): string {
  return `invoices/${clientId}/${timesheetId}.pdf`
}
