import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Azure SDK - vi.mock is hoisted, so we use vi.hoisted to create stable mocks
const { mockUpload, mockDownload, mockDeleteIfExists, mockExists, mockGetBlockBlobClient } =
  vi.hoisted(() => {
    const mockUpload = vi.fn()
    const mockDownload = vi.fn()
    const mockDeleteIfExists = vi.fn()
    const mockExists = vi.fn()
    const mockGetBlockBlobClient = vi.fn()

    return { mockUpload, mockDownload, mockDeleteIfExists, mockExists, mockGetBlockBlobClient }
  })

vi.mock('@azure/storage-blob', () => {
  const mockBlockBlobClient = {
    upload: mockUpload,
    download: mockDownload,
    deleteIfExists: mockDeleteIfExists,
    exists: mockExists,
    url: 'https://storage.blob.core.windows.net/container/test-blob.pdf',
  }

  mockGetBlockBlobClient.mockReturnValue(mockBlockBlobClient)

  return {
    BlobServiceClient: {
      fromConnectionString: vi.fn().mockReturnValue({
        getContainerClient: vi.fn().mockReturnValue({
          getBlockBlobClient: mockGetBlockBlobClient,
        }),
      }),
    },
  }
})

// Mock environment variables
vi.stubEnv(
  'AZURE_STORAGE_CONNECTION_STRING',
  'DefaultEndpointsProtocol=https;AccountName=test;AccountKey=key;EndpointSuffix=core.windows.net'
)
vi.stubEnv('AZURE_STORAGE_CONTAINER', 'test-container')

// Import after mocks are set
import { uploadPdf, downloadPdf, deletePdf, blobExists, getTimesheetBlobPath } from './client'

describe('blob/client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('uploadPdf', () => {
    it('uploads a PDF buffer and returns URL', async () => {
      mockUpload.mockResolvedValueOnce({})

      const buffer = Buffer.from('test pdf content')
      const result = await uploadPdf(buffer, 'timesheets/client-123/2024-01.pdf')

      expect(mockUpload).toHaveBeenCalledWith(buffer, buffer.length, {
        blobHTTPHeaders: {
          blobContentType: 'application/pdf',
        },
      })
      expect(result.url).toBe('https://storage.blob.core.windows.net/container/test-blob.pdf')
      expect(result.blobName).toBe('timesheets/client-123/2024-01.pdf')
    })

    it('throws error if upload fails', async () => {
      mockUpload.mockRejectedValueOnce(new Error('Upload failed'))

      const buffer = Buffer.from('test pdf content')
      await expect(uploadPdf(buffer, 'test.pdf')).rejects.toThrow('Upload failed')
    })
  })

  describe('downloadPdf', () => {
    it('downloads and returns PDF as buffer', async () => {
      const chunks = [Buffer.from('chunk1'), Buffer.from('chunk2')]
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          for (const chunk of chunks) {
            yield chunk
          }
        },
      }
      mockDownload.mockResolvedValueOnce({
        readableStreamBody: mockStream,
      })

      const result = await downloadPdf('test.pdf')

      expect(result).toEqual(Buffer.concat(chunks))
    })

    it('throws error if no readable stream body', async () => {
      mockDownload.mockResolvedValueOnce({
        readableStreamBody: null,
      })

      await expect(downloadPdf('test.pdf')).rejects.toThrow('No readable stream body')
    })
  })

  describe('deletePdf', () => {
    it('returns true when blob is deleted', async () => {
      mockDeleteIfExists.mockResolvedValueOnce({ succeeded: true })

      const result = await deletePdf('test.pdf')

      expect(result).toBe(true)
    })

    it('returns false when blob did not exist', async () => {
      mockDeleteIfExists.mockResolvedValueOnce({ succeeded: false })

      const result = await deletePdf('test.pdf')

      expect(result).toBe(false)
    })
  })

  describe('blobExists', () => {
    it('returns true when blob exists', async () => {
      mockExists.mockResolvedValueOnce(true)

      const result = await blobExists('test.pdf')

      expect(result).toBe(true)
    })

    it('returns false when blob does not exist', async () => {
      mockExists.mockResolvedValueOnce(false)

      const result = await blobExists('test.pdf')

      expect(result).toBe(false)
    })
  })

  describe('getTimesheetBlobPath', () => {
    it('generates correct blob path', () => {
      const result = getTimesheetBlobPath('client-123', '2024-01')

      expect(result).toBe('timesheets/client-123/2024-01.pdf')
    })
  })
})
