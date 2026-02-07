'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Client, Contact } from '@/types';
import { useInvalidateClients } from '@/lib/hooks';

interface ClientEditDialogProps {
  client: Client | null;
  open: boolean;
  onClose: () => void;
}

interface ContactFormState {
  name: string;
  email: string;
  role: Contact['role'];
  isPrimaryApprover: boolean;
  isPrimaryBilling: boolean;
}

interface FormState {
  name: string;
  togglProjectId: string;
  contacts: ContactFormState[];
  notes: string;
  billingAddress: string;
}

function getInitialFormState(client: Client | null): FormState {
  return {
    name: client?.name ?? '',
    togglProjectId: client?.togglProjectId ?? '',
    contacts:
      client?.contacts?.map((c) => ({
        name: c.name,
        email: c.email,
        role: c.role,
        isPrimaryApprover: c.isPrimaryApprover,
        isPrimaryBilling: c.isPrimaryBilling,
      })) ?? [],
    notes: client?.notes ?? '',
    billingAddress: client?.billingAddress ?? '',
  };
}

function validateContacts(contacts: ContactFormState[]): string | null {
  const approverContacts = contacts.filter((c) => c.role === 'approver' || c.role === 'both');
  const billingContacts = contacts.filter((c) => c.role === 'billing' || c.role === 'both');

  if (approverContacts.length > 0 && !approverContacts.some((c) => c.isPrimaryApprover)) {
    return 'A primary approver is required when approver contacts exist';
  }

  if (billingContacts.length > 0 && !billingContacts.some((c) => c.isPrimaryBilling)) {
    return 'A primary billing contact is required when billing contacts exist';
  }

  return null;
}

async function updateClient(id: string, data: Partial<Client>): Promise<{ client: Client }> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = await response.json();
    if (result.invalidEmails?.length > 0) {
      throw new Error(`${result.error}: ${result.invalidEmails.join(', ')}`);
    }
    throw new Error(result.error || 'Failed to update client');
  }

  return response.json();
}

const inputClass = `w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent`;

const roleOptions: { value: Contact['role']; label: string }[] = [
  { value: 'approver', label: 'Approver' },
  { value: 'billing', label: 'Billing' },
  { value: 'both', label: 'Both' },
];

export function ClientEditDialog({ client, open, onClose }: ClientEditDialogProps) {
  const [formState, setFormState] = useState<FormState>(() => getInitialFormState(client));
  const [validationError, setValidationError] = useState<string | null>(null);

  const clientId = client?.id ?? null;
  const lastClientIdRef = useRef<string | null>(clientId);

  if (clientId !== lastClientIdRef.current) {
    lastClientIdRef.current = clientId;
    setFormState(getInitialFormState(client));
    setValidationError(null);
  }

  const invalidateClients = useInvalidateClients();

  const mutation = useMutation({
    mutationFn: (data: Partial<Client>) => updateClient(client!.id, data),
    onSuccess: () => {
      invalidateClients();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    const activeContacts = formState.contacts.filter((c) => c.name.trim() && c.email.trim());
    const error = validateContacts(activeContacts);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);

    mutation.mutate({
      name: formState.name,
      togglProjectId: formState.togglProjectId || null,
      contacts: activeContacts.map((c) => ({
        id: '',
        clientId: client.id,
        ...c,
      })),
      notes: formState.notes || null,
      billingAddress: formState.billingAddress || null,
    });
  };

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const addContact = () => {
    updateField('contacts', [
      ...formState.contacts,
      {
        name: '',
        email: '',
        role: 'approver' as const,
        isPrimaryApprover: false,
        isPrimaryBilling: false,
      },
    ]);
  };

  const removeContact = (index: number) => {
    updateField(
      'contacts',
      formState.contacts.filter((_, i) => i !== index)
    );
  };

  const updateContact = (index: number, updates: Partial<ContactFormState>) => {
    const newContacts = [...formState.contacts];
    const contact = { ...newContacts[index], ...updates };

    // Clear irrelevant primary flags when role changes
    if (updates.role !== undefined) {
      if (updates.role === 'approver') contact.isPrimaryBilling = false;
      if (updates.role === 'billing') contact.isPrimaryApprover = false;
    }

    // When setting a primary flag, unset it on others
    if (updates.isPrimaryApprover) {
      newContacts.forEach((c, i) => {
        if (i !== index) newContacts[i] = { ...c, isPrimaryApprover: false };
      });
    }
    if (updates.isPrimaryBilling) {
      newContacts.forEach((c, i) => {
        if (i !== index) newContacts[i] = { ...c, isPrimaryBilling: false };
      });
    }

    newContacts[index] = contact;
    updateField('contacts', newContacts);
  };

  if (!open || !client) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative glass rounded-2xl w-full max-w-lg mx-auto my-[5vh] max-h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Edit Client</h2>
            <p className="text-sm text-muted-foreground mt-1">Update client details and contacts</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Client Name</label>
              <input
                type="text"
                value={formState.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter client name"
                className={inputClass}
                required
              />
            </div>

            {/* Toggl Project ID */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Toggl Project ID
                <span className="text-muted-foreground font-normal ml-1">(for timesheets)</span>
              </label>
              <input
                type="text"
                value={formState.togglProjectId}
                onChange={(e) => updateField('togglProjectId', e.target.value)}
                placeholder="e.g., 123456789"
                className={inputClass}
              />
            </div>

            {/* Billing Address */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Billing Address
              </label>
              <textarea
                value={formState.billingAddress}
                onChange={(e) => updateField('billingAddress', e.target.value)}
                placeholder="Address to appear on invoices..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50
                           text-foreground placeholder:text-muted-foreground resize-none
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* Contacts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Contacts</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addContact}
                  className="text-primary hover:text-primary/80 gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {formState.contacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground/60 italic py-2">No contacts added</p>
                ) : (
                  formState.contacts.map((contact, index) => {
                    const canBeApprover = contact.role === 'approver' || contact.role === 'both';
                    const canBeBilling = contact.role === 'billing' || contact.role === 'both';

                    return (
                      <div key={index} className="rounded-xl border border-border/50 p-3 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => updateContact(index, { name: e.target.value })}
                            placeholder="Name"
                            className={`flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/50
                                       text-foreground placeholder:text-muted-foreground text-sm
                                       focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeContact(index)}
                            className="text-muted-foreground hover:text-destructive flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => updateContact(index, { email: e.target.value })}
                            placeholder="email@example.com"
                            className={`flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/50
                                       text-foreground placeholder:text-muted-foreground text-sm
                                       focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent`}
                          />
                          <select
                            value={contact.role}
                            onChange={(e) =>
                              updateContact(index, { role: e.target.value as Contact['role'] })
                            }
                            className={`px-3 py-2 rounded-lg bg-muted/50 border border-border/50
                                       text-foreground text-sm
                                       focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent`}
                          >
                            {roleOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-4 px-1">
                          <label
                            className={`flex items-center gap-2 text-xs ${canBeApprover ? 'text-foreground' : 'text-muted-foreground/40'}`}
                          >
                            <input
                              type="checkbox"
                              checked={contact.isPrimaryApprover}
                              onChange={(e) =>
                                updateContact(index, { isPrimaryApprover: e.target.checked })
                              }
                              disabled={!canBeApprover}
                              className="rounded"
                            />
                            Primary Approver
                          </label>
                          <label
                            className={`flex items-center gap-2 text-xs ${canBeBilling ? 'text-foreground' : 'text-muted-foreground/40'}`}
                          >
                            <input
                              type="checkbox"
                              checked={contact.isPrimaryBilling}
                              onChange={(e) =>
                                updateContact(index, { isPrimaryBilling: e.target.checked })
                              }
                              disabled={!canBeBilling}
                              className="rounded"
                            />
                            Primary Billing
                          </label>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
              <textarea
                value={formState.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Optional notes about this client..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50
                           text-foreground placeholder:text-muted-foreground resize-none
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
              <p className="text-sm text-amber-600 dark:text-amber-400">{validationError}</p>
            </div>
          )}

          {/* Mutation error */}
          {mutation.isError && (
            <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm text-destructive">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : 'Failed to update client'}
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 bg-muted/30 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending || !formState.name.trim()}
            className="flex-1 gap-2"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
