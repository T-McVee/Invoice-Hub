import { describe, it, expect } from 'vitest';
import { buildInvoiceReadyEmail } from './invoice-ready';

const pdfBuffer = Buffer.from('fake-pdf-content');

describe('buildInvoiceReadyEmail', () => {
  it('builds email with correct subject', () => {
    const email = buildInvoiceReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      invoiceNumber: '42',
      month: '2026-01',
      pdfBuffer,
    });

    expect(email.subject).toBe('Invoice #42 - January 2026');
  });

  it('addresses TO to primary contact', () => {
    const email = buildInvoiceReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      invoiceNumber: '42',
      month: '2026-01',
      pdfBuffer,
    });

    expect(email.to).toBe('alice@example.com');
  });

  it('includes CC contacts when provided', () => {
    const email = buildInvoiceReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      cc: ['bob@example.com', 'carol@example.com'],
      invoiceNumber: '42',
      month: '2026-01',
      pdfBuffer,
    });

    expect(email.cc).toEqual(['bob@example.com', 'carol@example.com']);
  });

  it('omits CC when empty', () => {
    const email = buildInvoiceReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      cc: [],
      invoiceNumber: '42',
      month: '2026-01',
      pdfBuffer,
    });

    expect(email.cc).toBeUndefined();
  });

  it('greets primary contact by name', () => {
    const email = buildInvoiceReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      invoiceNumber: '42',
      month: '2026-01',
      pdfBuffer,
    });

    expect(email.text).toMatch(/^Hi Alice,/);
    expect(email.html).toContain('Hi Alice,');
  });

  it('attaches PDF with correctly formatted filename', () => {
    const email = buildInvoiceReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      invoiceNumber: '42',
      month: '2026-01',
      pdfBuffer,
    });

    expect(email.attachments).toHaveLength(1);
    expect(email.attachments![0].filename).toBe('invoice-42-jan-2026.pdf');
    expect(email.attachments![0].content).toBe(pdfBuffer);
  });

  it('formats filename correctly for other months', () => {
    const email = buildInvoiceReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      invoiceNumber: '7',
      month: '2025-12',
      pdfBuffer,
    });

    expect(email.attachments![0].filename).toBe('invoice-7-dec-2025.pdf');
    expect(email.subject).toBe('Invoice #7 - December 2025');
  });

  it('includes invoice number in text body', () => {
    const email = buildInvoiceReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      invoiceNumber: '42',
      month: '2026-01',
      pdfBuffer,
    });

    expect(email.text).toContain('invoice #42');
    expect(email.text).toContain('January 2026');
  });
});
