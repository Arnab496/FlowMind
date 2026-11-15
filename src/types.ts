export type AnomalyCategory =
  | 'CLEAN_MATCH'
  | 'DUPLICATE_INVOICE'
  | 'PRICE_VARIANCE'
  | 'QUANTITY_MISMATCH'
  | 'UNMATCHED_PO'
  | 'OVERDUE_RISK';

export type VerificationStatus =
  | 'Matched'
  | 'Discrepancy'
  | 'Duplicate'
  | 'Unmatched PO';

export type PaymentPriority = 'Urgent' | 'Scheduled' | 'Hold' | 'Blocked';

export type OwnerDecision = 'Pending' | 'Approved' | 'Held' | 'Rejected';

export type AgentRole =
  | 'Finance Agent'
  | 'Procurement Agent'
  | 'Verification Agent'
  | 'Planning Agent'
  | 'Communication Agent'
  | 'Supervisor Agent';

export interface LineItem {
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  poNumber: string;
  vendorName: string;
  vendorEmail: string;
  issueDate: string;
  expectedDeliveryDate: string;
  currency: string;
  lineItems: LineItem[];
  totalAmount: number;
  status: 'Open' | 'Partially Matched' | 'Fulfilled';
}

export interface DiscrepancyDetail {
  id: string;
  category: AnomalyCategory;
  severity: 'High' | 'Medium' | 'Low';
  field: string;
  expectedValue: string;
  actualValue: string;
  varianceAmount: number;
  explanation: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  vendorEmail: string;
  poNumber: string | null;
  issueDate: string;
  dueDate: string;
  currency: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentTerms: string;
  rawFileName: string;
  rawText: string;
  verificationStatus: VerificationStatus;
  anomalies: DiscrepancyDetail[];
  paymentPriority: PaymentPriority;
  daysUntilDue: number;
  ownerDecision: OwnerDecision;
  decisionTimestamp?: string;
  batchId: string;
}

export interface VendorEmailDraft {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  vendorName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  reason: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  status: 'Pending Approval' | 'Approved & Sent' | 'Discarded';
  sentAt?: string;
}

export interface AgentExecutionTrace {
  agentName: AgentRole;
  responsibility: string;
  status: 'Completed' | 'Running' | 'Queued';
  summary: string;
  itemsProcessed: number;
  findingsCount: number;
  durationMs: number;
}

export interface ReconciliationReport {
  batchId: string;
  generatedAt: string;
  executiveSummary: string;
  totalInvoicesReviewed: number;
  totalInvoicedAmount: number;
  approvedPayableAmount: number;
  heldOrBlockedAmount: number;
  duplicateSavings: number;
  varianceDetectedAmount: number;
  recommendedActions: string[];
  agentTraces: AgentExecutionTrace[];
  supervisorSignOffStatus: 'Awaiting Owner Approval' | 'Signed Off';
  signedOffAt?: string;
}

export interface UploadedDocInput {
  id: string;
  fileName: string;
  mimeType: string;
  rawText?: string;
  base64Data?: string;
}

export type WorkspaceTab =
  | 'overview'
  | 'invoices'
  | 'purchase-orders'
  | 'discrepancies'
  | 'reconciliation';
