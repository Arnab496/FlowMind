import { Menu, Upload } from 'lucide-react';
import { useState } from 'react';
import { DiscrepanciesCommsView } from './components/DiscrepanciesCommsView.tsx';
import { InvoicesUploadView } from './components/InvoicesUploadView.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { OverviewView } from './components/OverviewView.tsx';
import { PurchaseOrdersView } from './components/PurchaseOrdersView.tsx';
import { ReconciliationReportView } from './components/ReconciliationReportView.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import {
  INITIAL_EMAIL_DRAFTS,
  INITIAL_INVOICES,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_RECONCILIATION_REPORT,
} from './data/seedData.ts';
import type {
  AgentExecutionTrace,
  AgentRole,
  AnomalyCategory,
  InvoiceRecord,
  PaymentPriority,
  PurchaseOrder,
  ReconciliationReport,
  UploadedDocInput,
  VendorEmailDraft,
  VerificationStatus,
  WorkspaceTab,
} from './types.ts';

const TAB_LABELS: Record<WorkspaceTab, string> = {
  overview: 'Overview',
  invoices: 'Invoices & Upload',
  'purchase-orders': 'Purchase Orders',
  discrepancies: 'Discrepancies & Comms',
  reconciliation: 'Reconciliation Report',
};

const AGENT_RESPONSIBILITIES: Record<AgentRole, string> = {
  'Finance Agent': 'Processes invoices and payment records',
  'Procurement Agent': 'Analyses purchase orders and vendor quotations',
  'Verification Agent': 'Detects inconsistencies and duplicate invoices',
  'Planning Agent': 'Identifies pending payments and deadlines',
  'Communication Agent': 'Drafts vendor emails',
  'Supervisor Agent': 'Coordinates tasks and approves high-risk actions',
};

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('landing');
  const [preloadSampleCount, setPreloadSampleCount] = useState(0);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(
    INITIAL_PURCHASE_ORDERS
  );
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [emails, setEmails] = useState<VendorEmailDraft[]>(INITIAL_EMAIL_DRAFTS);
  const [report, setReport] = useState<ReconciliationReport>(
    INITIAL_RECONCILIATION_REPORT
  );

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    INITIAL_INVOICES[1]?.id || null
  );
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [batchError, setBatchError] = useState<string | null>(null);

  function handleDecideInvoice(
    invoiceId: string,
    decision: 'Approved' | 'Held' | 'Rejected'
  ) {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              ownerDecision: decision,
              decisionTimestamp: new Date().toISOString(),
            }
          : inv
      )
    );
  }

  function handleUpdateEmail(emailId: string, updates: Partial<VendorEmailDraft>) {
    setEmails((prev) =>
      prev.map((email) => (email.id === emailId ? { ...email, ...updates } : email))
    );
  }

  function handleApproveEmail(emailId: string) {
    setEmails((prev) =>
      prev.map((email) =>
        email.id === emailId
          ? {
              ...email,
              status: 'Approved & Sent',
              sentAt: new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            }
          : email
      )
    );
  }

  function handleDiscardEmail(emailId: string) {
    setEmails((prev) =>
      prev.map((email) =>
        email.id === emailId ? { ...email, status: 'Discarded' } : email
      )
    );
  }

  function handleAddPurchaseOrder(po: PurchaseOrder) {
    setPurchaseOrders((prev) => [po, ...prev]);
  }

  function handleSignOffReport() {
    setReport((prev) => ({
      ...prev,
      supervisorSignOffStatus: 'Signed Off',
      signedOffAt: new Date().toISOString(),
    }));
  }

  async function handleRunBatch(docs: UploadedDocInput[]) {
    setIsProcessingBatch(true);
    setBatchError(null);

    const stageLabels = [
      'Finance Agent extracting invoice fields...',
      'Procurement Agent matching purchase orders...',
      'Verification Agent checking duplicates & variances...',
      'Planning Agent checking payment deadlines...',
      'Communication & Supervisor Agents finalizing report...',
    ];

    let stageIndex = 0;
    setProcessingStage(stageLabels[0]);
    const interval = window.setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, stageLabels.length - 1);
      setProcessingStage(stageLabels[stageIndex]);
    }, 1400);

    try {
      const response = await fetch('/api/agents/process-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: docs,
          purchaseOrders,
          existingInvoices: invoices.map((inv) => ({
            invoiceNumber: inv.invoiceNumber,
            vendorName: inv.vendorName,
            poNumber: inv.poNumber,
            totalAmount: inv.totalAmount,
            issueDate: inv.issueDate,
            batchId: inv.batchId,
            ownerDecision: inv.ownerDecision,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Batch processing failed.');
      }

      const batchId: string = data.batchId || `BATCH-${Date.now()}`;
      const newInvoices: InvoiceRecord[] = (data.extractedInvoices || []).map(
        (ext: {
          docId: string;
          fileName: string;
          invoiceNumber: string;
          vendorName: string;
          vendorEmail: string;
          poNumber?: string | null;
          issueDate: string;
          dueDate: string;
          currency: string;
          paymentTerms: string;
          subtotal: number;
          tax: number;
          totalAmount: number;
          extractedRawTextSummary: string;
          lineItems: Array<{
            sku: string;
            description: string;
            quantity: number;
            unitPrice: number;
            total: number;
          }>;
          verificationStatus: VerificationStatus;
          paymentPriority: PaymentPriority;
          daysUntilDue: number;
          anomalies: Array<{
            category: AnomalyCategory;
            severity: 'High' | 'Medium' | 'Low';
            field: string;
            expectedValue: string;
            actualValue: string;
            varianceAmount: number;
            explanation: string;
          }>;
        }, idx: number) => {
          const matchingInput = docs.find((d) => d.id === ext.docId) || docs[idx];
          return {
            id: `inv-${Date.now()}-${idx}`,
            invoiceNumber: ext.invoiceNumber,
            vendorName: ext.vendorName,
            vendorEmail: ext.vendorEmail,
            poNumber: ext.poNumber ?? null,
            issueDate: ext.issueDate,
            dueDate: ext.dueDate,
            currency: ext.currency || 'USD',
            lineItems: ext.lineItems || [],
            subtotal: Number(ext.subtotal) || 0,
            tax: Number(ext.tax) || 0,
            totalAmount: Number(ext.totalAmount) || 0,
            paymentTerms: ext.paymentTerms || 'Net 15',
            rawFileName: ext.fileName || matchingInput?.fileName || 'invoice.txt',
            rawText:
              matchingInput?.rawText ||
              ext.extractedRawTextSummary ||
              'Extracted from uploaded binary document.',
            verificationStatus: ext.verificationStatus || 'Discrepancy',
            anomalies: (ext.anomalies || []).map((a, aIdx) => ({
              ...a,
              id: `anom-${Date.now()}-${idx}-${aIdx}`,
            })),
            paymentPriority: ext.paymentPriority || 'Hold',
            daysUntilDue: typeof ext.daysUntilDue === 'number' ? ext.daysUntilDue : 7,
            ownerDecision: 'Pending',
            batchId,
          };
        }
      );

      const newEmails: VendorEmailDraft[] = (data.vendorEmailDrafts || []).map(
        (
          draft: {
            docId: string;
            invoiceNumber: string;
            vendorName: string;
            recipientEmail: string;
            subject: string;
            body: string;
            reason: string;
            riskLevel: 'High' | 'Medium' | 'Low';
          },
          idx: number
        ) => {
          const matchedInv =
            newInvoices.find((inv) => inv.invoiceNumber === draft.invoiceNumber) ||
            newInvoices[idx];
          return {
            id: `email-${Date.now()}-${idx}`,
            invoiceId: matchedInv?.id || `inv-${idx}`,
            invoiceNumber: draft.invoiceNumber,
            vendorName: draft.vendorName,
            recipientEmail: draft.recipientEmail,
            subject: draft.subject,
            body: draft.body,
            reason: draft.reason,
            riskLevel: draft.riskLevel || 'High',
            status: 'Pending Approval',
          };
        }
      );

      const agentTraces: AgentExecutionTrace[] = (data.agentTraces || []).map(
        (trace: {
          agentName: AgentRole;
          responsibility?: string;
          summary: string;
          itemsProcessed: number;
          findingsCount: number;
        }) => ({
          agentName: trace.agentName,
          responsibility:
            trace.responsibility ||
            AGENT_RESPONSIBILITIES[trace.agentName] ||
            'Automated operations task',
          status: 'Completed',
          summary: trace.summary,
          itemsProcessed: trace.itemsProcessed || newInvoices.length,
          findingsCount: trace.findingsCount || 0,
          durationMs: data.processingTimeMs
            ? Math.round(data.processingTimeMs / 6)
            : 320,
        })
      );

      const totalInvoicedAmount = newInvoices.reduce(
        (sum, inv) => sum + inv.totalAmount,
        0
      );
      const approvedPayableAmount = newInvoices
        .filter((inv) => inv.verificationStatus === 'Matched')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      const duplicateSavings = newInvoices
        .filter((inv) => inv.verificationStatus === 'Duplicate')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      const varianceDetectedAmount = newInvoices.reduce(
        (sum, inv) =>
          sum +
          inv.anomalies
            .filter((a) => a.category !== 'DUPLICATE_INVOICE')
            .reduce((aSum, a) => aSum + (a.varianceAmount || 0), 0),
        0
      );

      const nextReport: ReconciliationReport = {
        batchId,
        generatedAt: new Date().toISOString(),
        executiveSummary:
          data.executiveSummary ||
          `Processed ${newInvoices.length} uploaded vendor invoices totaling $${totalInvoicedAmount.toFixed(2)}.`,
        totalInvoicesReviewed: newInvoices.length,
        totalInvoicedAmount,
        approvedPayableAmount,
        heldOrBlockedAmount: totalInvoicedAmount - approvedPayableAmount,
        duplicateSavings,
        varianceDetectedAmount,
        recommendedActions: data.recommendedActions || [],
        agentTraces,
        supervisorSignOffStatus: 'Awaiting Owner Approval',
      };

      setInvoices((prev) => [...newInvoices, ...prev]);
      setEmails((prev) => [...newEmails, ...prev]);
      setReport(nextReport);
      if (newInvoices[0]) {
        setSelectedInvoiceId(newInvoices[0].id);
      }
    } catch (err: unknown) {
      setBatchError(
        err instanceof Error
          ? err.message
          : 'Failed to process batch through FLOWMIND agents.'
      );
    } finally {
      window.clearInterval(interval);
      setIsProcessingBatch(false);
      setProcessingStage('');
    }
  }

  const pendingApprovalsCount = invoices.filter(
    (inv) => inv.ownerDecision === 'Pending'
  ).length;
  const pendingEmailsCount = emails.filter(
    (e) => e.status === 'Pending Approval'
  ).length;

  if (viewMode === 'landing') {
    return (
      <LandingPage
        onOpenWorkspace={() => setViewMode('workspace')}
        onRunSampleWorkflow={() => {
          setPreloadSampleCount((c) => c + 1);
          setActiveTab('invoices');
          setViewMode('workspace');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onBackToLanding={() => setViewMode('landing')}
        counts={{
          pendingApprovals: pendingApprovalsCount,
          invoices: invoices.length,
          purchaseOrders: purchaseOrders.length,
          pendingEmails: pendingEmailsCount,
        }}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Clean Single-Row Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm whitespace-nowrap truncate">
              <span className="text-slate-500 font-medium">Operations</span>
              <span className="text-slate-300" aria-hidden="true">
                /
              </span>
              <h1 className="font-semibold text-slate-900 truncate">
                {TAB_LABELS[activeTab]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Invoices
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewView
              invoices={invoices}
              emails={emails}
              report={report}
              onNavigate={setActiveTab}
              onDecideInvoice={handleDecideInvoice}
              onSelectInvoice={setSelectedInvoiceId}
              onApproveEmail={handleApproveEmail}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesUploadView
              invoices={invoices}
              purchaseOrders={purchaseOrders}
              selectedInvoiceId={selectedInvoiceId}
              onSelectInvoice={setSelectedInvoiceId}
              onRunBatch={handleRunBatch}
              isProcessingBatch={isProcessingBatch}
              processingStage={processingStage}
              batchError={batchError}
              onDecideInvoice={handleDecideInvoice}
              preloadSampleCount={preloadSampleCount}
            />
          )}

          {activeTab === 'purchase-orders' && (
            <PurchaseOrdersView
              purchaseOrders={purchaseOrders}
              invoices={invoices}
              onAddPurchaseOrder={handleAddPurchaseOrder}
            />
          )}

          {activeTab === 'discrepancies' && (
            <DiscrepanciesCommsView
              invoices={invoices}
              emails={emails}
              onUpdateEmail={handleUpdateEmail}
              onApproveEmail={handleApproveEmail}
              onDiscardEmail={handleDiscardEmail}
            />
          )}

          {activeTab === 'reconciliation' && (
            <ReconciliationReportView
              report={report}
              invoices={invoices}
              emails={emails}
              onSignOffReport={handleSignOffReport}
            />
          )}
        </main>
      </div>
    </div>
  );
}
