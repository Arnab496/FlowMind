import type {
  InvoiceRecord,
  PurchaseOrder,
  ReconciliationReport,
  UploadedDocInput,
  VendorEmailDraft,
} from '../types.ts';

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    poNumber: 'PO-2026-041',
    vendorName: 'Apex Industrial Supply Co.',
    vendorEmail: 'billing@apexindustrial.example',
    issueDate: '2026-10-28',
    expectedDeliveryDate: '2026-11-04',
    currency: 'USD',
    lineItems: [
      {
        sku: 'BRG-440',
        description: 'Precision Steel Bearings (Box of 25)',
        quantity: 40,
        unitPrice: 120.0,
        total: 4800.0,
      },
      {
        sku: 'LUB-90',
        description: 'Synthetic Hydraulic Fluid (20L Drum)',
        quantity: 12,
        unitPrice: 185.0,
        total: 2220.0,
      },
    ],
    totalAmount: 7020.0,
    status: 'Open',
  },
  {
    poNumber: 'PO-2026-042',
    vendorName: 'Northstar Packaging Ltd.',
    vendorEmail: 'ar@northstarpack.example',
    issueDate: '2026-11-01',
    expectedDeliveryDate: '2026-11-08',
    currency: 'USD',
    lineItems: [
      {
        sku: 'BOX-M12',
        description: 'Corrugated Shipping Cartons 18x12x12 (Bundle of 50)',
        quantity: 60,
        unitPrice: 64.0,
        total: 3840.0,
      },
      {
        sku: 'TPE-04',
        description: 'Reinforced Gummed Paper Tape (Case of 10)',
        quantity: 15,
        unitPrice: 48.0,
        total: 720.0,
      },
    ],
    totalAmount: 4560.0,
    status: 'Open',
  },
  {
    poNumber: 'PO-2026-043',
    vendorName: 'Meridian Cloud & IT Services',
    vendorEmail: 'accounts@meridianit.example',
    issueDate: '2026-11-02',
    expectedDeliveryDate: '2026-11-05',
    currency: 'USD',
    lineItems: [
      {
        sku: 'SRV-RACK',
        description: 'Managed Colocation Rack & Backup Bandwidth (Monthly)',
        quantity: 2,
        unitPrice: 1450.0,
        total: 2900.0,
      },
    ],
    totalAmount: 2900.0,
    status: 'Fulfilled',
  },
  {
    poNumber: 'PO-2026-044',
    vendorName: 'Vanguard Logistics Freight',
    vendorEmail: 'invoices@vanguardfreight.example',
    issueDate: '2026-11-06',
    expectedDeliveryDate: '2026-11-12',
    currency: 'USD',
    lineItems: [
      {
        sku: 'FRT-LTL',
        description: 'Regional LTL Pallet Freight (Chicago to Detroit)',
        quantity: 8,
        unitPrice: 310.0,
        total: 2480.0,
      },
      {
        sku: 'FSC-01',
        description: 'Standard Fuel Surcharge Allocation',
        quantity: 1,
        unitPrice: 220.0,
        total: 220.0,
      },
    ],
    totalAmount: 2700.0,
    status: 'Open',
  },
];

export const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv-seed-1',
    invoiceNumber: 'INV-2026-7710',
    vendorName: 'Meridian Cloud & IT Services',
    vendorEmail: 'accounts@meridianit.example',
    poNumber: 'PO-2026-043',
    issueDate: '2026-11-03',
    dueDate: '2026-11-14',
    currency: 'USD',
    lineItems: [
      {
        sku: 'SRV-RACK',
        description: 'Managed Colocation Rack & Backup Bandwidth (Monthly)',
        quantity: 2,
        unitPrice: 1450.0,
        total: 2900.0,
      },
    ],
    subtotal: 2900.0,
    tax: 0,
    totalAmount: 2900.0,
    paymentTerms: 'Net 11',
    rawFileName: 'meridian_nov_invoice.txt',
    rawText:
      'MERIDIAN CLOUD & IT SERVICES\nInvoice: INV-2026-7710\nPO Ref: PO-2026-043\nIssue Date: 2026-11-03 | Due Date: 2026-11-14\n2x Managed Colocation Rack & Backup Bandwidth @ $1,450.00 = $2,900.00\nTotal Due: $2,900.00 USD',
    verificationStatus: 'Matched',
    anomalies: [
      {
        id: 'anom-seed-0',
        category: 'OVERDUE_RISK',
        severity: 'Medium',
        field: 'dueDate',
        expectedValue: 'On or after 2026-11-15',
        actualValue: '2026-11-14 (1 day past due)',
        varianceAmount: 0,
        explanation:
          'Line items match PO-2026-043 accurately, but payment deadline passed 1 day ago on Nov 14, 2026.',
      },
    ],
    paymentPriority: 'Urgent',
    daysUntilDue: -1,
    ownerDecision: 'Approved',
    decisionTimestamp: '2026-11-14T16:40:00Z',
    batchId: 'BATCH-2026-1109',
  },
  {
    id: 'inv-seed-2',
    invoiceNumber: 'INV-2026-8841',
    vendorName: 'Apex Industrial Supply Co.',
    vendorEmail: 'billing@apexindustrial.example',
    poNumber: 'PO-2026-041',
    issueDate: '2026-11-05',
    dueDate: '2026-11-19',
    currency: 'USD',
    lineItems: [
      {
        sku: 'BRG-440',
        description: 'Precision Steel Bearings (Box of 25)',
        quantity: 45,
        unitPrice: 132.0,
        total: 5940.0,
      },
      {
        sku: 'LUB-90',
        description: 'Synthetic Hydraulic Fluid (20L Drum)',
        quantity: 12,
        unitPrice: 185.0,
        total: 2220.0,
      },
    ],
    subtotal: 8160.0,
    tax: 0,
    totalAmount: 8160.0,
    paymentTerms: 'Net 14',
    rawFileName: 'apex_inv_8841.txt',
    rawText:
      'APEX INDUSTRIAL SUPPLY CO.\nInvoice #: INV-2026-8841\nPurchase Order: PO-2026-041\nDate: 2026-11-05 | Due: 2026-11-19\n1) BRG-440 Precision Steel Bearings: Qty 45 @ $132.00 = $5,940.00\n2) LUB-90 Synthetic Hydraulic Fluid: Qty 12 @ $185.00 = $2,220.00\nTotal Amount Due: $8,160.00',
    verificationStatus: 'Discrepancy',
    anomalies: [
      {
        id: 'anom-seed-1',
        category: 'QUANTITY_MISMATCH',
        severity: 'High',
        field: 'BRG-440 quantity',
        expectedValue: '40 boxes',
        actualValue: '45 boxes',
        varianceAmount: 600.0,
        explanation:
          'Billed for 45 boxes of BRG-440 vs. 40 boxes ordered on PO-2026-041 (+5 units).',
      },
      {
        id: 'anom-seed-2',
        category: 'PRICE_VARIANCE',
        severity: 'High',
        field: 'BRG-440 unitPrice',
        expectedValue: '$120.00',
        actualValue: '$132.00',
        varianceAmount: 540.0,
        explanation:
          'Unit price billed at $132.00 (+10.0% above contracted PO rate of $120.00). Combined overbilling: $1,140.00.',
      },
    ],
    paymentPriority: 'Hold',
    daysUntilDue: 4,
    ownerDecision: 'Pending',
    batchId: 'BATCH-2026-1115',
  },
  {
    id: 'inv-seed-3',
    invoiceNumber: 'INV-2026-7710',
    vendorName: 'Meridian Cloud & IT Services',
    vendorEmail: 'accounts@meridianit.example',
    poNumber: 'PO-2026-043',
    issueDate: '2026-11-10',
    dueDate: '2026-11-20',
    currency: 'USD',
    lineItems: [
      {
        sku: 'SRV-RACK',
        description: 'Managed Colocation Rack & Backup Bandwidth (Monthly)',
        quantity: 2,
        unitPrice: 1450.0,
        total: 2900.0,
      },
    ],
    subtotal: 2900.0,
    tax: 0,
    totalAmount: 2900.0,
    paymentTerms: 'Net 10',
    rawFileName: 'meridian_reissue_7710.txt',
    rawText:
      'MERIDIAN CLOUD & IT SERVICES\nINVOICE: INV-2026-7710 (RE-SENT)\nPO: PO-2026-043\nDate: 2026-11-10 | Due: 2026-11-20\nManaged Colocation Rack & Backup Bandwidth: 2 x $1,450.00 = $2,900.00\nTotal Due: $2,900.00',
    verificationStatus: 'Duplicate',
    anomalies: [
      {
        id: 'anom-seed-3',
        category: 'DUPLICATE_INVOICE',
        severity: 'High',
        field: 'invoiceNumber',
        expectedValue: 'Unique invoice number',
        actualValue: 'INV-2026-7710 (already approved in BATCH-2026-1109)',
        varianceAmount: 2900.0,
        explanation:
          'Exact match on invoice number INV-2026-7710, vendor Meridian Cloud & IT Services, PO-2026-043, and $2,900.00 total.',
      },
    ],
    paymentPriority: 'Blocked',
    daysUntilDue: 5,
    ownerDecision: 'Pending',
    batchId: 'BATCH-2026-1115',
  },
  {
    id: 'inv-seed-4',
    invoiceNumber: 'INV-2026-5092',
    vendorName: 'Northstar Packaging Ltd.',
    vendorEmail: 'ar@northstarpack.example',
    poNumber: 'PO-2026-042',
    issueDate: '2026-11-08',
    dueDate: '2026-11-18',
    currency: 'USD',
    lineItems: [
      {
        sku: 'BOX-M12',
        description: 'Corrugated Shipping Cartons 18x12x12 (Bundle of 50)',
        quantity: 60,
        unitPrice: 64.0,
        total: 3840.0,
      },
      {
        sku: 'TPE-04',
        description: 'Reinforced Gummed Paper Tape (Case of 10)',
        quantity: 15,
        unitPrice: 48.0,
        total: 720.0,
      },
    ],
    subtotal: 4560.0,
    tax: 0,
    totalAmount: 4560.0,
    paymentTerms: 'Net 10',
    rawFileName: 'northstar_5092.txt',
    rawText:
      'NORTHSTAR PACKAGING LTD.\nInvoice No: INV-2026-5092\nPO Reference: PO-2026-042\nIssued: 2026-11-08 | Due: 2026-11-18\nBOX-M12 Cartons (50pk): 60 @ $64.00 = $3,840.00\nTPE-04 Paper Tape (10cs): 15 @ $48.00 = $720.00\nTotal: $4,560.00 USD',
    verificationStatus: 'Matched',
    anomalies: [],
    paymentPriority: 'Urgent',
    daysUntilDue: 3,
    ownerDecision: 'Pending',
    batchId: 'BATCH-2026-1115',
  },
];

export const INITIAL_EMAIL_DRAFTS: VendorEmailDraft[] = [
  {
    id: 'email-seed-1',
    invoiceId: 'inv-seed-2',
    invoiceNumber: 'INV-2026-8841',
    vendorName: 'Apex Industrial Supply Co.',
    recipientEmail: 'billing@apexindustrial.example',
    subject: 'Discrepancy Notice: Invoice INV-2026-8841 vs. PO-2026-041 ($1,140.00 Variance)',
    body: `Hello Apex Industrial Billing Team,

We completed automated reconciliation on Invoice INV-2026-8841 (dated Nov 5, 2026) against Purchase Order PO-2026-041 and identified two variances that require clarification before we release payment:

1. Quantity variance on SKU BRG-440 (Precision Steel Bearings):
   - PO-2026-041 authorized: 40 boxes
   - Invoice INV-2026-8841 billed: 45 boxes (+5 boxes / $600.00 variance at PO rate)

2. Unit price variance on SKU BRG-440:
   - PO-2026-041 contracted rate: $120.00 per box
   - Invoice INV-2026-8841 billed rate: $132.00 per box (+$12.00/box)

Total billed variance against PO-2026-041 is $1,140.00 ($8,160.00 invoiced vs. $7,020.00 authorized). Payment is currently on hold pending either a revised credit memo for $1,140.00 or a signed delivery receipt authorizing the additional 5 boxes.

Best regards,
Elena Vance
Operations Director`,
    reason: 'Quantity (+5 units) and unit price (+$12.00/unit) variance against PO-2026-041',
    riskLevel: 'High',
    status: 'Pending Approval',
  },
  {
    id: 'email-seed-2',
    invoiceId: 'inv-seed-3',
    invoiceNumber: 'INV-2026-7710',
    vendorName: 'Meridian Cloud & IT Services',
    recipientEmail: 'accounts@meridianit.example',
    subject: 'Duplicate Invoice Alert: INV-2026-7710 Already Approved for Payment',
    body: `Hello Meridian Accounts Team,

Our verification system flagged the Nov 10, 2026 submission of Invoice INV-2026-7710 ($2,900.00 referencing PO-2026-043) as a duplicate of Invoice INV-2026-7710 originally dated Nov 3, 2026.

The original invoice has already been approved under batch BATCH-2026-1109. We have blocked the duplicate entry from our payment queue to prevent double disbursement. Please confirm if this was an automated resend or if a separate service period requires a distinct invoice number.

Best regards,
Elena Vance
Operations Director`,
    reason: 'Duplicate invoice number INV-2026-7710 matching approved record for $2,900.00',
    riskLevel: 'High',
    status: 'Pending Approval',
  },
];

export const INITIAL_RECONCILIATION_REPORT: ReconciliationReport = {
  batchId: 'BATCH-2026-1115',
  generatedAt: '2026-11-15T09:14:00Z',
  executiveSummary:
    'Processed 3 vendor invoices totaling $15,620.00 against active purchase orders. Verified 1 clean match ($4,560.00 due in 3 days), placed 1 invoice on hold for a $1,140.00 quantity and unit-price overbilling against PO-2026-041, and blocked 1 duplicate submission ($2,900.00) already approved in a prior batch.',
  totalInvoicesReviewed: 3,
  totalInvoicedAmount: 15620.0,
  approvedPayableAmount: 4560.0,
  heldOrBlockedAmount: 11060.0,
  duplicateSavings: 2900.0,
  varianceDetectedAmount: 1140.0,
  recommendedActions: [
    'Approve $4,560.00 disbursement for Northstar Packaging Ltd. (INV-2026-5092) before the Nov 18, 2026 deadline.',
    'Approve and dispatch discrepancy inquiry to Apex Industrial Supply Co. regarding the $1,140.00 overage on INV-2026-8841.',
    'Confirm rejection of duplicate Invoice INV-2026-7710 from Meridian Cloud & IT Services ($2,900.00 prevented double payment).',
  ],
  agentTraces: [
    {
      agentName: 'Finance Agent',
      responsibility: 'Processes invoices and payment records',
      status: 'Completed',
      summary:
        'Extracted line items, tax, totals, and payment terms from 3 uploaded vendor invoices ($15,620.00 gross).',
      itemsProcessed: 3,
      findingsCount: 3,
      durationMs: 410,
    },
    {
      agentName: 'Procurement Agent',
      responsibility: 'Analyses purchase orders and vendor quotations',
      status: 'Completed',
      summary:
        'Matched all 3 invoices against active PO-2026-041, PO-2026-042, and PO-2026-043 line-item schedules.',
      itemsProcessed: 3,
      findingsCount: 3,
      durationMs: 320,
    },
    {
      agentName: 'Verification Agent',
      responsibility: 'Detects inconsistencies and duplicate invoices',
      status: 'Completed',
      summary:
        'Flagged 1 duplicate invoice ($2,900.00) and 2 line-item variances on BRG-440 (+5 units, +$12/unit = $1,140.00).',
      itemsProcessed: 3,
      findingsCount: 3,
      durationMs: 380,
    },
    {
      agentName: 'Planning Agent',
      responsibility: 'Identifies pending payments and deadlines',
      status: 'Completed',
      summary:
        'Prioritized INV-2026-5092 ($4,560.00) as Urgent (due Nov 18); isolated disputed and duplicate items from cash-out queue.',
      itemsProcessed: 4,
      findingsCount: 2,
      durationMs: 210,
    },
    {
      agentName: 'Communication Agent',
      responsibility: 'Drafts vendor emails',
      status: 'Completed',
      summary:
        'Prepared 2 dispute and duplicate-notification drafts for Apex Industrial Supply Co. and Meridian Cloud & IT Services.',
      itemsProcessed: 2,
      findingsCount: 2,
      durationMs: 490,
    },
    {
      agentName: 'Supervisor Agent',
      responsibility: 'Coordinates tasks and approves high-risk actions',
      status: 'Completed',
      summary:
        'Compiled Financial Reconciliation Report BATCH-2026-1115 and routed 3 payment decisions and 2 external emails for owner approval.',
      itemsProcessed: 3,
      findingsCount: 5,
      durationMs: 270,
    },
  ],
  supervisorSignOffStatus: 'Awaiting Owner Approval',
};

export const SAMPLE_THREE_INVOICE_BATCH: UploadedDocInput[] = [
  {
    id: 'sample-doc-1',
    fileName: 'vanguard_freight_inv_9904.txt',
    mimeType: 'text/plain',
    rawText: `VANGUARD LOGISTICS FREIGHT
Invoice Number: INV-2026-9904
Vendor Email: invoices@vanguardfreight.example
Purchase Order Reference: PO-2026-044
Issue Date: 2026-11-12
Due Date: 2026-11-17
Payment Terms: Net 5
Currency: USD

Line Items:
1. FRT-LTL | Regional LTL Pallet Freight (Chicago to Detroit) | Qty: 10 | Unit Price: $345.00 | Line Total: $3,450.00
2. FSC-01 | Standard Fuel Surcharge Allocation | Qty: 1 | Unit Price: $220.00 | Line Total: $220.00

Subtotal: $3,670.00
Tax: $0.00
Total Amount Due: $3,670.00`,
  },
  {
    id: 'sample-doc-2',
    fileName: 'northstar_duplicate_5092.txt',
    mimeType: 'text/plain',
    rawText: `NORTHSTAR PACKAGING LTD.
Invoice Number: INV-2026-5092
Vendor Email: ar@northstarpack.example
Purchase Order Reference: PO-2026-042
Issue Date: 2026-11-14
Due Date: 2026-11-24
Payment Terms: Net 10
Currency: USD

Line Items:
1. BOX-M12 | Corrugated Shipping Cartons 18x12x12 (Bundle of 50) | Qty: 60 | Unit Price: $64.00 | Line Total: $3,840.00
2. TPE-04 | Reinforced Gummed Paper Tape (Case of 10) | Qty: 15 | Unit Price: $48.00 | Line Total: $720.00

Subtotal: $4,560.00
Tax: $0.00
Total Amount Due: $4,560.00`,
  },
  {
    id: 'sample-doc-3',
    fileName: 'apex_lubricants_inv_8899.txt',
    mimeType: 'text/plain',
    rawText: `APEX INDUSTRIAL SUPPLY CO.
Invoice Number: INV-2026-8899
Vendor Email: billing@apexindustrial.example
Purchase Order Reference: PO-2026-041
Issue Date: 2026-11-13
Due Date: 2026-11-28
Payment Terms: Net 15
Currency: USD

Line Items:
1. LUB-90 | Synthetic Hydraulic Fluid (20L Drum) | Qty: 12 | Unit Price: $185.00 | Line Total: $2,220.00

Subtotal: $2,220.00
Tax: $0.00
Total Amount Due: $2,220.00`,
  },
];
