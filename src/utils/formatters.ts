import type { AnomalyCategory, InvoiceRecord, ReconciliationReport } from '../types.ts';

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const parsed = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function anomalyCategoryLabel(category: AnomalyCategory): string {
  switch (category) {
    case 'CLEAN_MATCH':
      return 'Clean PO Match';
    case 'DUPLICATE_INVOICE':
      return 'Duplicate Invoice';
    case 'PRICE_VARIANCE':
      return 'Unit Price Variance';
    case 'QUANTITY_MISMATCH':
      return 'Quantity Mismatch';
    case 'UNMATCHED_PO':
      return 'Unmatched Purchase Order';
    case 'OVERDUE_RISK':
      return 'Payment Deadline Risk';
    default:
      return category;
  }
}

export function exportReconciliationCsv(
  invoices: InvoiceRecord[],
  report: ReconciliationReport
): void {
  const headers = [
    'Batch ID',
    'Invoice Number',
    'Vendor Name',
    'PO Number',
    'Issue Date',
    'Due Date',
    'Total Amount',
    'Verification Status',
    'Payment Priority',
    'Owner Decision',
    'Anomalies',
  ];

  const rows = invoices.map((inv) => [
    inv.batchId,
    inv.invoiceNumber,
    `"${inv.vendorName.replace(/"/g, '""')}"`,
    inv.poNumber || 'NONE',
    inv.issueDate,
    inv.dueDate,
    inv.totalAmount.toFixed(2),
    inv.verificationStatus,
    inv.paymentPriority,
    inv.ownerDecision,
    `"${inv.anomalies.map((a) => `${a.category}: ${a.explanation}`).join('; ').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `flowmind-reconciliation-${report.batchId.toLowerCase()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
