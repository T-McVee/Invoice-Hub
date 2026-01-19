'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { DollarSign, Loader2, Check, AlertCircle, Building2, Hash } from 'lucide-react';
import {
  hourlyRateSchema,
  emailSchema,
  taxRateSchema,
  nextInvoiceNumberSchema,
  businessProfileSchema,
} from '@/lib/settings/schemas';

// =============================================================================
// Types
// =============================================================================

interface HourlyRateResponse {
  rate: number | null;
  updatedAt: string | null;
}

interface BusinessProfileResponse {
  name: string | null;
  businessNumber: string | null;
  gstNumber: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  paymentDetails: string | null;
  taxRate: number | null;
  paymentTerms: string | null;
  nextInvoiceNumber: number;
  updatedAt: string | null;
}

// =============================================================================
// Query Keys
// =============================================================================

const HOURLY_RATE_QUERY_KEY = ['settings', 'hourly-rate'] as const;
const BUSINESS_PROFILE_QUERY_KEY = ['settings', 'business-profile'] as const;

// =============================================================================
// API Functions
// =============================================================================

async function fetchHourlyRate(): Promise<HourlyRateResponse> {
  const response = await fetch('/api/settings/hourly-rate');
  if (!response.ok) {
    throw new Error('Failed to fetch hourly rate');
  }
  return response.json();
}

async function updateHourlyRate(rate: number): Promise<HourlyRateResponse> {
  const response = await fetch('/api/settings/hourly-rate', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rate }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to update hourly rate');
  }

  return response.json();
}

async function fetchBusinessProfile(): Promise<BusinessProfileResponse> {
  const response = await fetch('/api/settings/business-profile');
  if (!response.ok) {
    throw new Error('Failed to fetch business profile');
  }
  return response.json();
}

async function updateBusinessProfile(
  data: Partial<BusinessProfileResponse>
): Promise<BusinessProfileResponse> {
  const response = await fetch('/api/settings/business-profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update business profile');
  }

  return response.json();
}

// =============================================================================
// Shared Components
// =============================================================================

function FormField({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  prefix,
  suffix,
  multiline,
  rows = 3,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  type?: 'text' | 'number' | 'email';
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const baseClasses = `
    w-full py-2 rounded-lg border bg-background
    text-foreground placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
    transition-colors
    ${error ? 'border-destructive focus:ring-destructive/50 focus:border-destructive' : 'border-border'}
  `;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {prefix}
          </span>
        )}
        {multiline ? (
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={`${baseClasses} px-4 resize-none`}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${baseClasses} ${prefix ? 'pl-7' : 'pl-4'} ${suffix ? 'pr-8' : 'pr-4'}`}
          />
        )}
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// Hourly Rate Card Component
// =============================================================================

function HourlyRateCard() {
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: HOURLY_RATE_QUERY_KEY,
    queryFn: fetchHourlyRate,
  });

  const mutation = useMutation({
    mutationFn: updateHourlyRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOURLY_RATE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['metrics', 'earnings-mtd'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  // Sync form state with server data on initial load
  useEffect(() => {
    if (data?.rate !== null && data?.rate !== undefined) {
      setInputValue(data.rate.toString()); // eslint-disable-line
    }
  }, [data?.rate]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setValidationError(null);

    if (value !== '') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        setValidationError('Please enter a valid number');
        return;
      }
      const result = hourlyRateSchema.safeParse(numValue);
      if (!result.success) {
        setValidationError(result.error.issues?.[0]?.message ?? 'Invalid value');
      }
    }
  };

  const handleSave = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) {
      setValidationError('Please enter a valid number');
      return;
    }
    const result = hourlyRateSchema.safeParse(numValue);
    if (!result.success) {
      setValidationError(result.error.issues?.[0]?.message ?? 'Invalid value');
      return;
    }
    mutation.mutate(numValue);
  };

  const isValid = inputValue !== '' && !validationError && !isNaN(parseFloat(inputValue));
  const hasChanged = data?.rate?.toString() !== inputValue;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Hourly Rate</h2>
            <p className="text-sm text-muted-foreground">
              Default rate for calculating estimated earnings
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error instanceof Error ? error.message : 'Failed to load'}</span>
          </div>
        ) : (
          <>
            <FormField
              id="hourly-rate"
              label="Rate per hour"
              value={inputValue}
              onChange={handleInputChange}
              error={validationError}
              type="number"
              placeholder="0.00"
              prefix="$"
            />

            {data?.updatedAt && (
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(data.updatedAt).toLocaleString()}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={!isValid || !hasChanged || mutation.isPending}
                className="min-w-[100px]"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : showSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  'Save'
                )}
              </Button>
              {mutation.isError && (
                <p className="text-sm text-destructive">
                  {mutation.error instanceof Error ? mutation.error.message : 'Failed to save'}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Business Profile Card Component
// =============================================================================

interface BusinessProfileFormState {
  name: string;
  businessNumber: string;
  gstNumber: string;
  phone: string;
  email: string;
  address: string;
  paymentDetails: string;
  taxRate: string;
  paymentTerms: string;
  nextInvoiceNumber: string;
}

const initialFormState: BusinessProfileFormState = {
  name: '',
  businessNumber: '',
  gstNumber: '',
  phone: '',
  email: '',
  address: '',
  paymentDetails: '',
  taxRate: '',
  paymentTerms: '',
  nextInvoiceNumber: '1',
};

function BusinessProfileCard() {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<BusinessProfileFormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof BusinessProfileFormState, string>>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: BUSINESS_PROFILE_QUERY_KEY,
    queryFn: fetchBusinessProfile,
  });

  const mutation = useMutation({
    mutationFn: updateBusinessProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUSINESS_PROFILE_QUERY_KEY });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  // Sync form state with server data on initial load
  useEffect(() => {
    if (data) {
      // eslint-disable-next-line
      setFormState({
        name: data.name ?? '',
        businessNumber: data.businessNumber ?? '',
        gstNumber: data.gstNumber ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        address: data.address ?? '',
        paymentDetails: data.paymentDetails ?? '',
        taxRate: data.taxRate !== null ? data.taxRate.toString() : '',
        paymentTerms: data.paymentTerms ?? '',
        nextInvoiceNumber: data.nextInvoiceNumber.toString(),
      });
    }
  }, [data]);

  const validateField = (field: keyof BusinessProfileFormState, value: string): string | null => {
    switch (field) {
      case 'email':
        if (value && value.trim() !== '') {
          const result = emailSchema.safeParse(value);
          if (!result.success) {
            return result.error.issues[0]?.message ?? 'Invalid email';
          }
        }
        return null;

      case 'taxRate':
        if (value && value.trim() !== '') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            return 'Please enter a valid number';
          }
          const result = taxRateSchema.safeParse(numValue);
          if (!result.success) {
            return result.error.issues[0]?.message ?? 'Invalid tax rate';
          }
        }
        return null;

      case 'nextInvoiceNumber':
        if (value && value.trim() !== '') {
          const numValue = parseInt(value, 10);
          if (isNaN(numValue) || numValue.toString() !== value.trim()) {
            return 'Please enter a whole number';
          }
          const result = nextInvoiceNumberSchema.safeParse(numValue);
          if (!result.success) {
            return result.error.issues[0]?.message ?? 'Invalid invoice number';
          }
        } else {
          return 'Invoice number is required';
        }
        return null;

      default:
        return null;
    }
  };

  const handleChange = (field: keyof BusinessProfileFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));

    // Validate on change
    const error = validateField(field, value);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleSave = () => {
    const newErrors: Partial<Record<keyof BusinessProfileFormState, string>> = {};

    // Pre-validate number conversions (Zod expects numbers, form has strings)
    let taxRateValue: number | undefined = undefined;
    if (formState.taxRate && formState.taxRate.trim() !== '') {
      taxRateValue = parseFloat(formState.taxRate);
      if (isNaN(taxRateValue)) {
        newErrors.taxRate = 'Please enter a valid number';
      }
    }

    let nextInvoiceNumberValue: number | undefined = undefined;
    if (formState.nextInvoiceNumber && formState.nextInvoiceNumber.trim() !== '') {
      const parsed = parseInt(formState.nextInvoiceNumber, 10);
      if (isNaN(parsed) || parsed.toString() !== formState.nextInvoiceNumber.trim()) {
        newErrors.nextInvoiceNumber = 'Please enter a whole number';
      } else {
        nextInvoiceNumberValue = parsed;
      }
    } else {
      newErrors.nextInvoiceNumber = 'Invoice number is required';
    }

    // If number conversions failed, show errors and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Build data object for Zod validation
    const dataToValidate = {
      name: formState.name || undefined,
      businessNumber: formState.businessNumber || undefined,
      gstNumber: formState.gstNumber || undefined,
      phone: formState.phone || undefined,
      email: formState.email, // emailSchema handles empty string
      address: formState.address || undefined,
      paymentDetails: formState.paymentDetails || undefined,
      taxRate: taxRateValue,
      paymentTerms: formState.paymentTerms || undefined,
      nextInvoiceNumber: nextInvoiceNumberValue,
    };

    // Validate with Zod schema
    const result = businessProfileSchema.safeParse(dataToValidate);

    if (!result.success) {
      // Map Zod errors to form field errors
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof BusinessProfileFormState;
        if (field && !newErrors[field]) {
          newErrors[field] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    // Validation passed - clear errors and submit
    setErrors({});

    // Prepare data for API (convert empty strings to null)
    const updateData: Partial<BusinessProfileResponse> = {
      name: formState.name || null,
      businessNumber: formState.businessNumber || null,
      gstNumber: formState.gstNumber || null,
      phone: formState.phone || null,
      email: formState.email || null,
      address: formState.address || null,
      paymentDetails: formState.paymentDetails || null,
      taxRate: taxRateValue ?? null,
      paymentTerms: formState.paymentTerms || null,
      nextInvoiceNumber: nextInvoiceNumberValue!,
    };

    mutation.mutate(updateData);
  };

  const hasErrors = Object.values(errors).some((e) => e !== null && e !== undefined);

  // Check if form has changed from original data
  const hasChanged = data
    ? formState.name !== (data.name ?? '') ||
      formState.businessNumber !== (data.businessNumber ?? '') ||
      formState.gstNumber !== (data.gstNumber ?? '') ||
      formState.phone !== (data.phone ?? '') ||
      formState.email !== (data.email ?? '') ||
      formState.address !== (data.address ?? '') ||
      formState.paymentDetails !== (data.paymentDetails ?? '') ||
      formState.taxRate !== (data.taxRate !== null ? data.taxRate.toString() : '') ||
      formState.paymentTerms !== (data.paymentTerms ?? '') ||
      formState.nextInvoiceNumber !== data.nextInvoiceNumber.toString()
    : false;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Business Profile</h2>
            <p className="text-sm text-muted-foreground">Your business details for invoices</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error instanceof Error ? error.message : 'Failed to load'}</span>
          </div>
        ) : (
          <>
            {/* Contact Information */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="name"
                label="Name"
                value={formState.name}
                onChange={(v) => handleChange('name', v)}
                placeholder="Your name or business name"
              />
              <FormField
                id="email"
                label="Email"
                value={formState.email}
                onChange={(v) => handleChange('email', v)}
                error={errors.email}
                type="email"
                placeholder="your@email.com"
              />
              <FormField
                id="phone"
                label="Phone"
                value={formState.phone}
                onChange={(v) => handleChange('phone', v)}
                placeholder="+1 (555) 000-0000"
              />
              <FormField
                id="businessNumber"
                label="Business Number"
                value={formState.businessNumber}
                onChange={(v) => handleChange('businessNumber', v)}
                placeholder="ABN, EIN, etc."
              />
              <FormField
                id="gstNumber"
                label="GST Number"
                value={formState.gstNumber}
                onChange={(v) => handleChange('gstNumber', v)}
                placeholder="Tax registration number"
              />
            </div>

            {/* Address */}
            <FormField
              id="address"
              label="Address"
              value={formState.address}
              onChange={(v) => handleChange('address', v)}
              placeholder="Your business address"
              multiline
              rows={3}
            />

            {/* Payment Details */}
            <FormField
              id="paymentDetails"
              label="Payment Details"
              value={formState.paymentDetails}
              onChange={(v) => handleChange('paymentDetails', v)}
              placeholder="Bank account details, payment instructions, etc."
              multiline
              rows={4}
            />

            {/* Financial Settings */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="taxRate"
                label="Tax Rate"
                value={formState.taxRate}
                onChange={(v) => handleChange('taxRate', v)}
                error={errors.taxRate}
                type="number"
                placeholder="10"
                suffix="%"
              />
              <FormField
                id="paymentTerms"
                label="Payment Terms"
                value={formState.paymentTerms}
                onChange={(v) => handleChange('paymentTerms', v)}
                placeholder="Net 30, Due on receipt, etc."
              />
            </div>

            {data?.updatedAt && (
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(data.updatedAt).toLocaleString()}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={hasErrors || !hasChanged || mutation.isPending}
                className="min-w-[100px]"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : showSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  'Save'
                )}
              </Button>
              {mutation.isError && (
                <p className="text-sm text-destructive">
                  {mutation.error instanceof Error ? mutation.error.message : 'Failed to save'}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Invoice Number Card Component
// =============================================================================

function InvoiceNumberCard() {
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState('1');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: BUSINESS_PROFILE_QUERY_KEY,
    queryFn: fetchBusinessProfile,
  });

  const mutation = useMutation({
    mutationFn: updateBusinessProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUSINESS_PROFILE_QUERY_KEY });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  // Sync form state with server data on initial load
  useEffect(() => {
    if (data?.nextInvoiceNumber !== undefined) {
      setInputValue(data.nextInvoiceNumber.toString()); // eslint-disable-line
    }
  }, [data?.nextInvoiceNumber]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setValidationError(null);

    if (value !== '') {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue.toString() !== value.trim()) {
        setValidationError('Please enter a whole number');
        return;
      }
      const result = nextInvoiceNumberSchema.safeParse(numValue);
      if (!result.success) {
        setValidationError(result.error.issues?.[0]?.message ?? 'Invalid value');
      }
    } else {
      setValidationError('Invoice number is required');
    }
  };

  const handleSave = () => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue)) {
      setValidationError('Please enter a whole number');
      return;
    }
    const result = nextInvoiceNumberSchema.safeParse(numValue);
    if (!result.success) {
      setValidationError(result.error.issues?.[0]?.message ?? 'Invalid value');
      return;
    }
    mutation.mutate({ nextInvoiceNumber: numValue });
  };

  const isValid = inputValue !== '' && !validationError;
  const hasChanged = data?.nextInvoiceNumber?.toString() !== inputValue;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Hash className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Next Invoice Number</h2>
            <p className="text-sm text-muted-foreground">Auto-increments after each invoice</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error instanceof Error ? error.message : 'Failed to load'}</span>
          </div>
        ) : (
          <>
            <FormField
              id="next-invoice-number"
              label="Invoice Number"
              value={inputValue}
              onChange={handleInputChange}
              error={validationError}
              type="number"
              placeholder="1"
              prefix="#"
            />

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={!isValid || !hasChanged || mutation.isPending}
                className="min-w-[100px]"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : showSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  'Save'
                )}
              </Button>
              {mutation.isError && (
                <p className="text-sm text-destructive">
                  {mutation.error instanceof Error ? mutation.error.message : 'Failed to save'}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Main Settings Page
// =============================================================================

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Configure your application preferences</p>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6 max-w-2xl">
        <HourlyRateCard />
        <BusinessProfileCard />
        <InvoiceNumberCard />
      </div>
    </div>
  );
}
