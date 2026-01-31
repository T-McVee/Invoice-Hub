// Invoice Generator Service Module
// Compiles invoice data and generates PDF via invoice-generator.com

import { generateInvoicePdf, InvoicePayload } from './client'
import { getBusinessProfile, getHourlyRate } from '@/lib/settings'
import { uploadPdf, getInvoiceBlobPath } from '@/lib/blob/client'

// Re-export client types
export { InvoicePayload, InvoiceItem } from './client'

export interface InvoiceData {
  invoiceNumber: string
  month: string // YYYY-MM format
  totalHours: number
  client: {
    id: string
    name: string
  }
}

export interface GeneratedInvoice {
  invoiceNumber: string
  amount: number
  pdfUrl: string
  blobPath: string
}

/**
 * Format a date for invoice display (e.g., "27 01 2026")
 */
function formatInvoiceDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

/**
 * Format month for invoice description (e.g., "January 2026")
 */
function formatMonthDisplay(month: string): string {
  const [year, monthNum] = month.split('-').map(Number)
  const date = new Date(year, monthNum - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/**
 * Build the "from" field for the invoice (business details)
 */
function buildFromField(profile: {
  name: string | null
  businessNumber: string | null
  gstNumber: string | null
  phone: string | null
  email: string | null
  address: string | null
}): string {
  const parts: string[] = []

  if (profile.name) parts.push(profile.name)
  if (profile.businessNumber) parts.push(`Business Number: ${profile.businessNumber}`)
  if (profile.gstNumber) parts.push(`GST Number: ${profile.gstNumber}`)
  if (profile.phone) parts.push(profile.phone)
  if (profile.email) parts.push(profile.email)
  if (profile.address) parts.push(profile.address)

  return parts.join('\n')
}

/**
 * Generate an invoice for an approved timesheet
 */
export async function generateInvoice(data: InvoiceData): Promise<GeneratedInvoice> {
  // Fetch business settings in parallel
  const [businessProfile, hourlyRateSetting] = await Promise.all([
    getBusinessProfile(),
    getHourlyRate(),
  ])

  // Validate required settings
  if (!hourlyRateSetting.rate) {
    throw new Error('Hourly rate not configured')
  }

  if (!businessProfile.name) {
    throw new Error('Business name not configured')
  }

  // Calculate invoice amount
  const amount = data.totalHours * hourlyRateSetting.rate

  // Calculate dates
  const invoiceDate = new Date()
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + (businessProfile.paymentTermsDays ?? 14))

  // Build invoice payload
  const payload: InvoicePayload = {
    from: buildFromField(businessProfile),
    to: data.client.name,
    number: data.invoiceNumber,
    date: formatInvoiceDate(invoiceDate),
    due_date: formatInvoiceDate(dueDate),
    items: [
      {
        name: `Website development services for ${formatMonthDisplay(data.month)}`,
        quantity: 1,
        unit_cost: amount,
      },
    ],
  }

  // Add tax if configured
  if (businessProfile.taxRate !== null && businessProfile.taxRate > 0) {
    payload.fields = { tax: '%' }
    payload.tax = businessProfile.taxRate
  }

  // Add payment terms
  if (businessProfile.paymentTermsDays) {
    payload.terms = `Payment due within ${businessProfile.paymentTermsDays} days`
  }

  // Add payment details as notes
  if (businessProfile.paymentDetails) {
    payload.notes_title = 'Payment Details'
    payload.notes = businessProfile.paymentDetails
  }

  // Generate PDF
  const pdfBuffer = await generateInvoicePdf(payload)

  // Upload to blob storage
  const blobPath = getInvoiceBlobPath(data.client.id, data.invoiceNumber)
  const uploadResult = await uploadPdf(pdfBuffer, blobPath)

  return {
    invoiceNumber: data.invoiceNumber,
    amount,
    pdfUrl: uploadResult.url,
    blobPath,
  }
}
