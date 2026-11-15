import { CheckCircle2, Download, Printer } from 'lucide-react';
import type { InvoiceRecord, ReconciliationReport, VendorEmailDraft } from '../types.ts';
import { exportReconciliationCsv, formatCurrency, formatDate } from '../utils/formatters.ts';

interface ReconciliationReportViewProps {
  report: ReconciliationReport;
  invoices: InvoiceRecord[];
  emails: VendorEmailDraft[];
  onSignOffReport: () => void;
}

export function ReconciliationReportView({
  report,
  invoices,
  emails,
  onSignOffReport,
}: ReconciliationReportViewProps) {
  const approvedTotal = invoices
    .filter((inv) => inv.ownerDecision === 'Approved')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const heldTotal = invoices
    .filter((inv) => inv.ownerDecision === 'Held')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const rejectedTotal = invoices
    .filter((inv) => inv.ownerDecision === 'Rejected')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const pendingTotal = invoices
    .filter((inv) => inv.ownerDecision === 'Pending')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const sentEmailsCount = emails.filter((e) => e.status === 'Approved & Sent').length;

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-slate-500">
            {report.batchId} · Generated {formatDate(report.generatedAt)} ·{' '}
            {report.supervisorSignOffStatus}
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-1">
            Financial Reconciliation Report
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            {report.executiveSummary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 no-print">
          <button
            type="button"
            onClick={() => exportReconciliationCsv(invoices, report)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
          {report.supervisorSignOffStatus !== 'Signed Off' ? (
            <button
              type="button"
              onClick={onSignOffReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sign Off Report
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg whitespace-nowrap shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Signed Off
            </span>
          )}
        </div>
      </div>

      {/* Financial Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Approved Disbursements</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700 font-mono tabular-nums">
            {formatCurrency(approvedTotal)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Authorized by business owner</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Pending Owner Review</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 font-mono tabular-nums">
            {formatCurrency(pendingTotal)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Awaiting payment or hold decision</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Held / Disputed Invoices</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700 font-mono tabular-nums">
            {formatCurrency(heldTotal)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {sentEmailsCount} vendor notice{sentEmailsCount === 1 ? '' : 's'} dispatched
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Duplicates Rejected</p>
          <p className="mt-2 text-2xl font-semibold text-red-700 font-mono tabular-nums">
            {formatCurrency(rejectedTotal)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Direct double-payment savings</p>
        </div>
      </div>

      {/* Supervisor Recommendations */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Supervisor Agent Action Plan
        </h3>
        <ol className="space-y-2.5 text-sm text-slate-700">
          {report.recommendedActions.map((action, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="font-mono text-xs font-semibold text-slate-500 mt-0.5">
                0{index + 1}.
              </span>
              <span>{action}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Full Reconciliation Audit Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">
            Invoice &amp; Decision Audit Trail
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="py-3 px-6">Batch</th>
                <th className="py-3 px-4">Invoice</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">PO Ref</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Owner Decision</th>
                <th className="py-3 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-6 font-mono text-slate-500 whitespace-nowrap">
                    {inv.batchId}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-800">{inv.vendorName}</td>
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {inv.poNumber || '—'}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                    {inv.verificationStatus}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {inv.ownerDecision}
                  </td>
                  <td className="py-3 px-6 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                    {formatCurrency(inv.totalAmount, inv.currency)}
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
