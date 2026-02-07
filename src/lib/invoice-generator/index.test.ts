import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create hoisted mocks
const { mockGenerateInvoicePdf, mockUploadPdf, mockGetInvoiceBlobPath } = vi.hoisted(() => ({
  mockGenerateInvoicePdf: vi.fn(),
  mockUploadPdf: vi.fn(),
  mockGetInvoiceBlobPath: vi.fn(),
}));

// Mock external services
vi.mock('./client', () => ({
  generateInvoicePdf: mockGenerateInvoicePdf,
}));

// Mock blob client with both path formats
vi.mock('@/lib/blob/client', () => ({
  uploadPdf: mockUploadPdf,
  getInvoiceBlobPath: mockGetInvoiceBlobPath,
}));

vi.mock('../blob/client', () => ({
  uploadPdf: mockUploadPdf,
  getInvoiceBlobPath: mockGetInvoiceBlobPath,
}));

import { setHourlyRate, setBusinessProfile } from '@/lib/settings';
import { generateInvoice, buildToField } from './index';

describe('invoice-generator', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-27'));

    // Set up mocks
    mockGenerateInvoicePdf.mockResolvedValue(Buffer.from('pdf-content'));
    mockGetInvoiceBlobPath.mockReturnValue('invoices/client-123/1234.pdf');
    mockUploadPdf.mockResolvedValue({
      url: 'https://storage.blob.core.windows.net/container/invoices/client-123/1234.pdf',
      blobName: 'invoices/client-123/1234.pdf',
    });

    // Set up business settings using real settings module (with mocked Prisma)
    await setHourlyRate(100);
    await setBusinessProfile({
      name: 'My Business',
      businessNumber: 'BN123',
      gstNumber: 'GST456',
      phone: '555-1234',
      email: 'billing@mybiz.com',
      address: '123 Main St',
      paymentDetails: 'Bank: 12-3456-7890123-00',
      taxRate: 15,
      paymentTermsDays: 14,
      nextInvoiceNumber: 1,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockInvoiceData = {
    invoiceNumber: '1234',
    month: '2026-01',
    totalHours: 40,
    client: {
      id: 'client-123',
      name: 'Acme Corp',
    },
  };

  describe('generateInvoice', () => {
    it('generates invoice with correct amount', async () => {
      const result = await generateInvoice(mockInvoiceData);

      expect(result.invoiceNumber).toBe('1234');
      expect(result.amount).toBe(4000); // 40 hours × $100
      expect(result.pdfUrl).toBe(
        'https://storage.blob.core.windows.net/container/invoices/client-123/1234.pdf'
      );
      expect(result.blobPath).toBe('invoices/client-123/1234.pdf');
    });

    it('calls generateInvoicePdf with correct payload', async () => {
      await generateInvoice(mockInvoiceData);

      expect(mockGenerateInvoicePdf).toHaveBeenCalledWith({
        from: 'My Business\nBusiness Number: BN123\nGST Number: GST456\n\n555-1234\nbilling@mybiz.com\n\n123 Main St',
        to: 'Acme Corp',
        number: '1234',
        date: '27 01 2026',
        due_date: '10 02 2026', // 14 days later
        items: [
          {
            name: 'Website development services for January 2026',
            quantity: 1,
            unit_cost: 4000,
          },
        ],
        fields: { tax: '%' },
        tax: 15,
        terms: 'Payment due within 14 days',
        notes_title: 'Payment Details',
        notes: 'Bank: 12-3456-7890123-00',
      });
    });

    it('uploads PDF to blob storage', async () => {
      await generateInvoice(mockInvoiceData);

      expect(mockGetInvoiceBlobPath).toHaveBeenCalledWith('client-123', '1234');
      expect(mockUploadPdf).toHaveBeenCalledWith(
        Buffer.from('pdf-content'),
        'invoices/client-123/1234.pdf'
      );
    });

    it('throws error when hourly rate not configured', async () => {
      await setHourlyRate(0); // Rate of 0 means not configured

      await expect(generateInvoice(mockInvoiceData)).rejects.toThrow('Hourly rate not configured');
    });

    it('throws error when business name not configured', async () => {
      await setBusinessProfile({ name: null });

      await expect(generateInvoice(mockInvoiceData)).rejects.toThrow(
        'Business name not configured'
      );
    });

    it('includes billing address in to field when provided', async () => {
      const dataWithAddress = {
        ...mockInvoiceData,
        client: {
          id: 'client-123',
          name: 'Acme Corp',
          billingAddress: '123 Business St\nSydney NSW 2000',
        },
      };

      await generateInvoice(dataWithAddress);

      expect(mockGenerateInvoicePdf).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'Acme Corp\n123 Business St\nSydney NSW 2000',
        })
      );
    });
  });

  describe('buildToField', () => {
    it('returns just name when no billing address', () => {
      const result = buildToField({ name: 'Acme Corp' });
      expect(result).toBe('Acme Corp');
    });

    it('returns just name when billing address is null', () => {
      const result = buildToField({ name: 'Acme Corp', billingAddress: null });
      expect(result).toBe('Acme Corp');
    });

    it('returns just name when billing address is empty', () => {
      const result = buildToField({ name: 'Acme Corp', billingAddress: '' });
      expect(result).toBe('Acme Corp');
    });

    it('returns name with billing address on separate lines', () => {
      const result = buildToField({
        name: 'Acme Corp',
        billingAddress: '123 Business St\nSydney NSW 2000',
      });
      expect(result).toBe('Acme Corp\n123 Business St\nSydney NSW 2000');
    });
  });
});
