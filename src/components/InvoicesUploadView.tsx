import {
  AlertTriangle,
  CheckCircle2,
  FilePlus2,
  FileText,
  Loader2,
  Play,
  Search,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { SAMPLE_THREE_INVOICE_BATCH } from '../data/seedData.ts';
import type {
  InvoiceRecord,
  PurchaseOrder,
  UploadedDocInput,
  VerificationStatus,
} from '../types.ts';
import { anomalyCategoryLabel, formatCurrency, formatDate } from '../utils/formatters.ts';

interface InvoicesUploadViewProps {
  invoices: InvoiceRecord[];
  purchaseOrders: PurchaseOrder[];
  selectedInvoiceId: string | null;
  onSelectInvoice: (id: string | null) => void;
  onRunBatch: (docs: UploadedDocInput[]) => Promise<void>;
  isProcessingBatch: boolean;
  processingStage: string;
  batchError: string | null;
  onDecideInvoice: (invoiceId: string, decision: 'Approved' | 'Held' | 'Rejected') => void;
  preloadSampleCount?: number;
}

type FilterMode = 'All' | VerificationStatus | 'Pending';

export function InvoicesUploadView({
  invoices,
  purchaseOrders,
  selectedInvoiceId,
  onSelectInvoice,
  onRunBatch,
  isProcessingBatch,
  processingStage,
  batchError,
  onDecideInvoice,
  preloadSampleCount = 0,
}: InvoicesUploadViewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [queuedDocs, setQueuedDocs] = useState<UploadedDocInput[]>(() =>
    preloadSampleCount > 0 ? SAMPLE_THREE_INVOICE_BATCH.map((doc) => ({ ...doc })) : []
  );

  useEffect(() => {
    if (preloadSampleCount > 0) {
      setQueuedDocs(SAMPLE_THREE_INVOICE_BATCH.map((doc) => ({ ...doc })));
    }
  }, [preloadSampleCount]);
  const [isDragging, setIsDragging] = useState(false);
  const [showPasteForm, setShowPasteForm] = useState(false);
  const [pasteFileName, setPasteFileName] = useState('custom_vendor_invoice.txt');
  const [pasteText, setPasteText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterMode>('All');

  const selectedInvoice =
    invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0] || null;
  const matchedPO = selectedInvoice?.poNumber
    ? purchaseOrders.find((po) => po.poNumber === selectedInvoice.poNumber)
    : undefined;

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const nextDocs: UploadedDocInput[] = [];

    for (const file of Array.from(fileList)) {
      const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const isBinary =
        file.type === 'application/pdf' ||
        file.type.startsWith('image/') ||
        file.name.toLowerCase().endsWith('.pdf');

      if (isBinary) {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            const base64 = result.includes(',') ? result.split(',')[1] : result;
            resolve(base64);
          };
          reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
          reader.readAsDataURL(file);
        });
        nextDocs.push({
          id,
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
          base64Data,
        });
      } else {
        const rawText = await file.text();
        nextDocs.push({
          id,
          fileName: file.name,
          mimeType: file.type || 'text/plain',
          rawText,
        });
      }
    }

    setQueuedDocs((prev) => [...prev, ...nextDocs]);
  }

  function handleLoadSampleBatch() {
    setQueuedDocs(SAMPLE_THREE_INVOICE_BATCH.map((doc) => ({ ...doc })));
  }

  function handleAddPastedInvoice() {
    if (!pasteText.trim()) return;
    setQueuedDocs((prev) => [
      ...prev,
      {
        id: `paste-${Date.now()}`,
        fileName: pasteFileName.trim() || 'pasted_invoice.txt',
        mimeType: 'text/plain',
        rawText: pasteText.trim(),
      },
    ]);
    setPasteText('');
    setShowPasteForm(false);
  }

  async function handleExecutePipeline() {
    if (queuedDocs.length === 0 || isProcessingBatch) return;
    await onRunBatch(queuedDocs);
    setQueuedDocs([]);
  }

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      !searchQuery.trim() ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.poNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Pending') return inv.ownerDecision === 'Pending';
    return inv.verificationStatus === statusFilter;
  });

  return (
    <div className="space-y-8">
      {/* Batch Upload & Multi-Agent Execution Studio */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Upload &amp; Process Vendor Invoice Batch
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Drop PDF, image, CSV, or text invoices to run the 6-agent extraction, PO matching, and verification pipeline.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleLoadSampleBatch}
              disabled={isProcessingBatch}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <FilePlus2 className="w-3.5 h-3.5" />
              Load 3-Invoice Sample Batch
            </button>
            <button
              type="button"
              onClick={() => setShowPasteForm((prev) => !prev)}
              disabled={isProcessingBatch}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {showPasteForm ? 'Cancel Text Entry' : 'Paste Invoice Text'}
            </button>
          </div>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            void handleFilesSelected(e.dataTransfer.files);
          }}
          className={`border border-dashed rounded-xl px-6 py-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-600 bg-blue-50/50'
              : 'border-slate-300 bg-slate-50/60 hover:border-slate-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.csv,.json,.pdf,.png,.jpg,.jpeg"
            onChange={(e) => {
              void handleFilesSelected(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />
          <Upload className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="mt-2 text-sm font-medium text-slate-800">
            Drag and drop vendor invoices here, or{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-700 hover:text-blue-800 underline underline-offset-2"
            >
              browse files
            </button>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Supports PDF, PNG, JPG, TXT, CSV, and JSON documents
          </p>
        </div>

        {showPasteForm && (
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Document Filename
                </label>
                <input
                  type="text"
                  value={pasteFileName}
                  onChange={(e) => setPasteFileName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Raw Invoice Text
                </label>
                <textarea
                  rows={4}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste vendor name, invoice number, PO reference, due date, and line items..."
                  className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddPastedInvoice}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Add to Batch Queue
              </button>
            </div>
          </div>
        )}

        {queuedDocs.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-700">
                Staged Batch Queue ({queuedDocs.length}{' '}
                {queuedDocs.length === 1 ? 'document' : 'documents'})
              </span>
              <button
                type="button"
                onClick={() => void handleExecutePipeline()}
                disabled={isProcessingBatch}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {isProcessingBatch ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {processingStage || 'Processing Batch...'}
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Run Multi-Agent Pipeline
                  </>
                )}
              </button>
            </div>
            <div className="divide-y divide-slate-200 bg-white">
              {queuedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="px-4 py-3 flex items-center justify-between gap-4 text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate font-mono text-xs">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {doc.mimeType}
                        {doc.rawText ? ` · ${doc.rawText.slice(0, 88)}...` : ' · Binary attachment'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setQueuedDocs((prev) => prev.filter((item) => item.id !== doc.id))
                    }
                    disabled={isProcessingBatch}
                    aria-label={`Remove ${doc.fileName}`}
                    className="p-1.5 text-slate-400 hover:text-red-700 rounded transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {batchError && (
          <div
            role="alert"
            className="px-4 py-3 border border-red-200 bg-red-50 rounded-lg text-sm text-red-800 flex items-start gap-2.5"
          >
            <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <span>{batchError}</span>
          </div>
        )}
      </section>

      {/* Invoice Ledger Grid + Side-by-Side Detail */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Ledger Table */}
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900">Invoice Ledger</h2>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search invoice, vendor, PO..."
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
              {(['All', 'Matched', 'Discrepancy', 'Duplicate', 'Pending'] as FilterMode[]).map(
                (mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setStatusFilter(mode)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      statusFilter === mode
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                )
              )}
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-800">
                No invoices match the current filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
                className="mt-2 text-xs font-medium text-blue-700 hover:text-blue-800"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                    <th className="py-3 px-5">Invoice</th>
                    <th className="py-3 px-3">Vendor</th>
                    <th className="py-3 px-3">Due</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-3">Decision</th>
                    <th className="py-3 px-5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredInvoices.map((inv) => {
                    const isSelected = selectedInvoice?.id === inv.id;
                    return (
                      <tr
                        key={inv.id}
                        onClick={() => onSelectInvoice(inv.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-5 font-mono text-xs font-semibold text-slate-900 whitespace-nowrap">
                          {inv.invoiceNumber}
                          <div className="text-[11px] font-normal text-slate-500">
                            {inv.poNumber || 'No PO'}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-800 max-w-[170px] truncate">
                          {inv.vendorName}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums text-xs text-slate-600 whitespace-nowrap">
                          {formatDate(inv.dueDate)}
                        </td>
                        <td className="py-3 px-3 text-xs whitespace-nowrap">
                          {inv.verificationStatus === 'Matched' && (
                            <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Matched
                            </span>
                          )}
                          {inv.verificationStatus === 'Discrepancy' && (
                            <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Discrepancy
                            </span>
                          )}
                          {inv.verificationStatus === 'Duplicate' && (
                            <span className="inline-flex items-center gap-1 font-medium text-red-700">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Duplicate
                            </span>
                          )}
                          {inv.verificationStatus === 'Unmatched PO' && (
                            <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Unmatched PO
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-xs font-medium text-slate-700 whitespace-nowrap">
                          {inv.ownerDecision}
                        </td>
                        <td className="py-3 px-5 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                          {formatCurrency(inv.totalAmount, inv.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Invoice Extraction & Comparison Inspector */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          {selectedInvoice ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedInvoice.batchId} · {selectedInvoice.rawFileName}
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900 mt-1 font-mono">
                    {selectedInvoice.invoiceNumber}
                  </h3>
                  <p className="text-sm text-slate-600">{selectedInvoice.vendorName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Extracted Total</p>
                  <p className="text-xl font-semibold text-slate-900 font-mono tabular-nums">
                    {formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)}
                  </p>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Purchase Order</span>
                  <span className="font-mono font-medium text-slate-900">
                    {selectedInvoice.poNumber || 'None Referenced'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Payment Terms</span>
                  <span className="font-medium text-slate-900">
                    {selectedInvoice.paymentTerms}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Issue Date</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    {formatDate(selectedInvoice.issueDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Due Date</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    {formatDate(selectedInvoice.dueDate)}
                  </span>
                </div>
              </div>

              {/* Extracted Line Items */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">
                  Extracted Line Items
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <th className="py-2 px-3">SKU / Item</th>
                        <th className="py-2 px-2 text-right">Qty</th>
                        <th className="py-2 px-2 text-right">Unit</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedInvoice.lineItems.map((item, idx) => (
                        <tr key={`${item.sku}-${idx}`}>
                          <td className="py-2 px-3">
                            <span className="font-mono font-medium text-slate-900 block">
                              {item.sku}
                            </span>
                            <span className="text-slate-500">{item.description}</span>
                          </td>
                          <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-800">
                            {item.quantity}
                          </td>
                          <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-800">
                            {formatCurrency(item.unitPrice, selectedInvoice.currency)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums font-medium text-slate-900">
                            {formatCurrency(item.total, selectedInvoice.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Verification Findings */}
              {selectedInvoice.anomalies.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700">
                    Verification Findings
                  </h4>
                  <div className="border border-amber-200 bg-amber-50/50 rounded-lg divide-y divide-amber-200/70">
                    {selectedInvoice.anomalies.map((anom) => (
                      <div key={anom.id} className="p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900">
                            {anomalyCategoryLabel(anom.category)}
                          </span>
                          {anom.varianceAmount > 0 && (
                            <span className="font-mono tabular-nums font-semibold text-red-700">
                              +{formatCurrency(anom.varianceAmount)}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700">{anom.explanation}</p>
                        <p className="text-slate-500 font-mono">
                          Expected: {anom.expectedValue} · Billed: {anom.actualValue}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedPO && (
                <div className="text-xs text-slate-500 border-t border-slate-200 pt-3">
                  Matched PO Total:{' '}
                  <span className="font-mono tabular-nums font-medium text-slate-800">
                    {formatCurrency(matchedPO.totalAmount, matchedPO.currency)}
                  </span>{' '}
                  ({matchedPO.poNumber})
                </div>
              )}

              {/* Raw Source Preview */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-1.5">
                  Source Document Extract
                </h4>
                <pre className="p-3 text-[11px] font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {selectedInvoice.rawText}
                </pre>
              </div>

              {/* Owner Actions */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-500">
                  Owner Decision:{' '}
                  <strong className="text-slate-900">{selectedInvoice.ownerDecision}</strong>
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onDecideInvoice(selectedInvoice.id, 'Approved')}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Approve Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => onDecideInvoice(selectedInvoice.id, 'Held')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Hold
                  </button>
                  <button
                    type="button"
                    onClick={() => onDecideInvoice(selectedInvoice.id, 'Rejected')}
                    className="px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Select an invoice to inspect extracted fields.</p>
          )}
        </div>
      </section>
    </div>
  );
}
