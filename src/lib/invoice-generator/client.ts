// Invoice Generator API client
// Docs: https://invoice-generator.com/developers

const INVOICE_GENERATOR_API = 'https://invoice-generator.com'

function getApiKey(): string {
  const apiKey = process.env.INVOICE_GENERATOR_API_KEY
  if (!apiKey) {
    throw new Error('INVOICE_GENERATOR_API_KEY environment variable is not set')
  }
  return apiKey
}

export interface InvoiceItem {
  name: string
  quantity: number
  unit_cost: number
}

export interface InvoicePayload {
  from: string
  to: string
  number: string
  date: string
  due_date: string
  items: InvoiceItem[]
  fields?: {
    tax?: string
  }
  tax?: number
  terms?: string
  notes_title?: string
  notes?: string
}

/**
 * Generate an invoice PDF using invoice-generator.com API
 * @param payload - The invoice data
 * @returns PDF buffer
 */
export async function generateInvoicePdf(payload: InvoicePayload): Promise<Buffer> {
  const apiKey = getApiKey()

  const response = await fetch(INVOICE_GENERATOR_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Invoice generator API error: ${response.status} - ${error}`)
  }

  return Buffer.from(await response.arrayBuffer())
}
