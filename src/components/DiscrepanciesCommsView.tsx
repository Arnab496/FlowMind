import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Mail,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { InvoiceRecord, VendorEmailDraft } from '../types.ts';
import { anomalyCategoryLabel, formatCurrency } from '../utils/formatters.ts';

interface DiscrepanciesCommsViewProps {
  invoices: InvoiceRecord[];
  emails: VendorEmailDraft[];
  onUpdateEmail: (emailId: string, updates: Partial<VendorEmailDraft>) => void;
  onApproveEmail: (emailId: string) => void;
  onDiscardEmail: (emailId: string) => void;
}

export function DiscrepanciesCommsView({
  invoices,
  emails,
  onUpdateEmail,
  onApproveEmail,
  onDiscardEmail,
}: DiscrepanciesCommsViewProps) {
  const [selectedEmailId, setSelectedEmailId] = useState<string>(emails[0]?.id || '');
  const [refineInstruction, setRefineInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || emails[0] || null;
  const flaggedInvoices = invoices.filter((inv) => inv.anomalies.length > 0);

  async function handleRefineDraft() {
    if (!selectedEmail || isRefining) return;
    const relatedInvoice = invoices.find((inv) => inv.id === selectedEmail.invoiceId);
    setIsRefining(true);
    setRefineError(null);

    try {
      const response = await fetch('/api/agents/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice: {
            invoiceNumber: selectedEmail.invoiceNumber,
            vendorName: selectedEmail.vendorName,
            vendorEmail: selectedEmail.recipientEmail,
            poNumber: relatedInvoice?.poNumber || null,
            totalAmount: relatedInvoice?.totalAmount || 0,
            anomalies: relatedInvoice?.anomalies || [
              {
                category: 'DISCREPANCY',
                explanation: selectedEmail.reason,
                varianceAmount: 0,
              },
            ],
          },
          instruction:
            refineInstruction.trim() ||
            'Make the email concise, polite, and request a corrected invoice within 3 business days.',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to refine draft.');
      }

      onUpdateEmail(selectedEmail.id, {
        subject: data.subject || selectedEmail.subject,
        body: data.body || selectedEmail.body,
      });
      setRefineInstruction('');
    } catch (err: unknown) {
      setRefineError(err instanceof Error ? err.message : 'Unable to update email draft.');
    } finally {
      setIsRefining(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Anomaly Categorisation Ledger */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            Anomaly Categorisation Log
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Inconsistencies, duplicate submissions, and deadline risks identified by Verification and Planning agents.
          </p>
        </div>

        {flaggedInvoices.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
            <p className="mt-2 text-sm font-medium text-slate-900">
              No active discrepancies or anomalies detected.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                  <th className="py-3 px-6">Invoice / Vendor</th>
                  <th className="py-3 px-4">Anomaly Category</th>
                  <th className="py-3 px-4">Expected vs. Billed</th>
                  <th className="py-3 px-4">Explanation</th>
                  <th className="py-3 px-6 text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {flaggedInvoices.flatMap((inv) =>
                  inv.anomalies.map((anom) => (
                    <tr key={anom.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-slate-900 block">
                          {inv.invoiceNumber}
                        </span>
                        <span className="text-xs text-slate-500">{inv.vendorName}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            anom.severity === 'High' ? 'text-red-700' : 'text-amber-700'
                          }`}
                        >
                          {anom.severity === 'High' ? (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          {anomalyCategoryLabel(anom.category)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                        <div>Exp: {anom.expectedValue}</div>
                        <div className="text-slate-900 font-medium">Act: {anom.actualValue}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700 max-w-md">
                        {anom.explanation}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono tabular-nums text-xs font-semibold text-red-700 whitespace-nowrap">
                        {anom.varianceAmount > 0 ? formatCurrency(anom.varianceAmount) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Vendor Communication Drafts */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">
              Vendor Email Drafts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Requires owner approval before dispatch
            </p>
          </div>

          {emails.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-slate-500">
              No vendor communications drafted yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {emails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <button
                    key={email.id}
                    type="button"
                    onClick={() => setSelectedEmailId(email.id)}
                    className={`w-full text-left px-5 py-4 transition-colors ${
                      isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-900">
                        {email.invoiceNumber}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          email.status === 'Approved & Sent'
                            ? 'text-emerald-700'
                            : email.status === 'Discarded'
                              ? 'text-slate-400'
                              : 'text-amber-700'
                        }`}
                      >
                        {email.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 mt-1 truncate">
                      {email.vendorName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{email.reason}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          {selectedEmail ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Communication Draft · {selectedEmail.vendorName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Status: <strong className="text-slate-800">{selectedEmail.status}</strong>
                      {selectedEmail.sentAt && ` · Sent ${selectedEmail.sentAt}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedEmail.status === 'Pending Approval' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onDiscardEmail(selectedEmail.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg whitespace-nowrap shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Discard
                      </button>
                      <button
                        type="button"
                        onClick={() => onApproveEmail(selectedEmail.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Approve &amp; Send Email
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={selectedEmail.recipientEmail}
                    disabled={selectedEmail.status !== 'Pending Approval'}
                    onChange={(e) =>
                      onUpdateEmail(selectedEmail.id, { recipientEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-lg disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={selectedEmail.subject}
                    disabled={selectedEmail.status !== 'Pending Approval'}
                    onChange={(e) =>
                      onUpdateEmail(selectedEmail.id, { subject: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Body
                  </label>
                  <textarea
                    rows={11}
                    value={selectedEmail.body}
                    disabled={selectedEmail.status !== 'Pending Approval'}
                    onChange={(e) =>
                      onUpdateEmail(selectedEmail.id, { body: e.target.value })
                    }
                    className="w-full px-3 py-2.5 text-sm leading-relaxed bg-white border border-slate-200 rounded-lg disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {selectedEmail.status === 'Pending Approval' && (
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <label className="block text-xs font-medium text-slate-700">
                      Revise Draft via Communication Agent
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={refineInstruction}
                        onChange={(e) => setRefineInstruction(e.target.value)}
                        placeholder="e.g. Request a credit memo within 48 hours and cc accounting@company.com"
                        className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => void handleRefineDraft()}
                        disabled={isRefining}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        {isRefining ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        {isRefining ? 'Revising...' : 'Regenerate Draft'}
                      </button>
                    </div>
                    {refineError && (
                      <p className="text-xs text-red-700">{refineError}</p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Select a vendor email draft to review, edit, or dispatch.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
