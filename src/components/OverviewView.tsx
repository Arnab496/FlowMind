import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import type {
  InvoiceRecord,
  ReconciliationReport,
  VendorEmailDraft,
  WorkspaceTab,
} from '../types.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

interface OverviewViewProps {
  invoices: InvoiceRecord[];
  emails: VendorEmailDraft[];
  report: ReconciliationReport;
  onNavigate: (tab: WorkspaceTab) => void;
  onDecideInvoice: (invoiceId: string, decision: 'Approved' | 'Held' | 'Rejected') => void;
  onSelectInvoice: (invoiceId: string) => void;
  onApproveEmail: (emailId: string) => void;
}

export function OverviewView({
  invoices,
  emails,
  report,
  onNavigate,
  onDecideInvoice,
  onSelectInvoice,
  onApproveEmail,
}: OverviewViewProps) {
  const pendingInvoices = invoices.filter((inv) => inv.ownerDecision === 'Pending');
  const pendingEmails = emails.filter((e) => e.status === 'Pending Approval');
  const approvedTotal = invoices
    .filter((inv) => inv.ownerDecision === 'Approved')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const readyForPaymentTotal = invoices
    .filter((inv) => inv.verificationStatus === 'Matched' && inv.ownerDecision === 'Pending')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const blockedOrVarianceTotal = invoices
    .filter((inv) => inv.verificationStatus !== 'Matched')
    .reduce(
      (sum, inv) =>
        sum +
        inv.anomalies.reduce((aSum, anomaly) => aSum + (anomaly.varianceAmount || 0), 0),
      0
    );

  return (
    <div className="space-y-8">
      {/* 4-Column KPI Strip */}
      <section aria-label="Operational metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Invoices in Ledger</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 font-mono tabular-nums">
            {invoices.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {pendingInvoices.length} awaiting owner decision
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Verified Ready to Pay</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700 font-mono tabular-nums">
            {formatCurrency(readyForPaymentTotal + approvedTotal)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatCurrency(approvedTotal)} approved · {formatCurrency(readyForPaymentTotal)} queued
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Discrepancies &amp; Duplicates Caught</p>
          <p className="mt-2 text-2xl font-semibold text-red-700 font-mono tabular-nums">
            {formatCurrency(blockedOrVarianceTotal)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Prevented overbilling &amp; double disbursement
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Vendor Emails Pending</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700 font-mono tabular-nums">
            {pendingEmails.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Drafted for discrepancy &amp; duplicate resolution
          </p>
        </div>
      </section>

      {/* Owner Approval Queue */}
      <section className="bg-white border border-slate-200 rounded-xl">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Owner Approval Queue
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              High-risk payments and external vendor communications queued by Supervisor Agent
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('invoices')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
          >
            Open full ledger
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {pendingInvoices.length === 0 && pendingEmails.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="mt-3 text-sm font-medium text-slate-900">
              All pending payments and vendor communications have been reviewed.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Upload a new vendor invoice batch or review the signed reconciliation report.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {pendingInvoices.map((inv) => {
              const isClean = inv.verificationStatus === 'Matched';
              const isDuplicate = inv.verificationStatus === 'Duplicate';
              return (
                <div
                  key={inv.id}
                  className="px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectInvoice(inv.id);
                          onNavigate('invoices');
                        }}
                        className="font-mono text-sm font-semibold text-slate-900 hover:text-blue-700"
                      >
                        {inv.invoiceNumber}
                      </button>
                      <span className="text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        {inv.vendorName}
                      </span>
                      <span className="text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {inv.poNumber || 'No PO'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      {isClean && (
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Matched PO &amp; Pricing
                        </span>
                      )}
                      {inv.verificationStatus === 'Discrepancy' && (
                        <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {inv.anomalies.map((a) => a.explanation).join(' ')}
                        </span>
                      )}
                      {isDuplicate && (
                        <span className="inline-flex items-center gap-1 font-medium text-red-700">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {inv.anomalies[0]?.explanation || 'Duplicate invoice submission detected'}
                        </span>
                      )}
                      <span className="text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500 font-mono tabular-nums">
                        <Clock className="w-3.5 h-3.5" />
                        Due {formatDate(inv.dueDate)} (
                        {inv.daysUntilDue < 0
                          ? `${Math.abs(inv.daysUntilDue)}d overdue`
                          : `${inv.daysUntilDue}d left`}
                        )
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <span className="font-mono tabular-nums text-base font-semibold text-slate-900 mr-2">
                      {formatCurrency(inv.totalAmount, inv.currency)}
                    </span>
                    {isClean ? (
                      <button
                        type="button"
                        onClick={() => onDecideInvoice(inv.id, 'Approved')}
                        className="px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        Approve Payment
                      </button>
                    ) : isDuplicate ? (
                      <button
                        type="button"
                        onClick={() => onDecideInvoice(inv.id, 'Rejected')}
                        className="px-3.5 py-2 text-xs font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        Confirm Reject Duplicate
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onDecideInvoice(inv.id, 'Held')}
                          className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                        >
                          Hold Payment
                        </button>
                        <button
                          type="button"
                          onClick={() => onDecideInvoice(inv.id, 'Approved')}
                          className="px-3.5 py-2 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                        >
                          Override &amp; Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {pendingEmails.map((email) => (
              <div
                key={email.id}
                className="px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-blue-700 shrink-0" />
                    <span className="font-semibold text-slate-900">{email.subject}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    To: <span className="font-mono">{email.recipientEmail}</span>
                    <span className="mx-2" aria-hidden="true">
                      ·
                    </span>
                    {email.reason}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate('discrepancies')}
                    className="px-3.5 py-2 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Review Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => onApproveEmail(email.id)}
                    className="px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Approve &amp; Send
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Multi-Agent Coordination Architecture */}
      <section className="bg-white border border-slate-200 rounded-xl">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Multi-Agent Coordination Trace
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Latest batch execution ({report.batchId} · {formatDate(report.generatedAt)})
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('reconciliation')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
          >
            View reconciliation report
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                <th className="py-3 px-6">Agent</th>
                <th className="py-3 px-4">Responsibility</th>
                <th className="py-3 px-4">Execution Summary</th>
                <th className="py-3 px-4 text-right">Processed</th>
                <th className="py-3 px-6 text-right">Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {report.agentTraces.map((trace) => (
                <tr key={trace.agentName} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-6 font-semibold text-slate-900 whitespace-nowrap">
                    {trace.agentName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {trace.responsibility}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-md">{trace.summary}</td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                    {trace.itemsProcessed}
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono tabular-nums text-slate-900 font-medium">
                    {trace.findingsCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
