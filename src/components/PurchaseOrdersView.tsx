import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { InvoiceRecord, PurchaseOrder } from '../types.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

interface PurchaseOrdersViewProps {
  purchaseOrders: PurchaseOrder[];
  invoices: InvoiceRecord[];
  onAddPurchaseOrder: (po: PurchaseOrder) => void;
}

export function PurchaseOrdersView({
  purchaseOrders,
  invoices,
  onAddPurchaseOrder,
}: PurchaseOrdersViewProps) {
  const [selectedPoNumber, setSelectedPoNumber] = useState<string>(
    purchaseOrders[0]?.poNumber || ''
  );
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [poNumber, setPoNumber] = useState('PO-2026-045');
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [unitPrice, setUnitPrice] = useState('100');

  const selectedPO =
    purchaseOrders.find((po) => po.poNumber === selectedPoNumber) || purchaseOrders[0];
  const linkedInvoices = selectedPO
    ? invoices.filter((inv) => inv.poNumber === selectedPO.poNumber)
    : [];

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = Math.max(1, Number(quantity) || 1);
    const price = Math.max(0, Number(unitPrice) || 0);
    const total = qty * price;
    if (!poNumber.trim() || !vendorName.trim()) return;

    const newPO: PurchaseOrder = {
      poNumber: poNumber.trim(),
      vendorName: vendorName.trim(),
      vendorEmail: vendorEmail.trim() || 'accounts@vendor.example',
      issueDate: '2026-11-15',
      expectedDeliveryDate: '2026-11-22',
      currency: 'USD',
      lineItems: [
        {
          sku: sku.trim() || 'ITEM-001',
          description: description.trim() || 'Standard Contracted Supply',
          quantity: qty,
          unitPrice: price,
          total,
        },
      ],
      totalAmount: total,
      status: 'Open',
    };

    onAddPurchaseOrder(newPO);
    setSelectedPoNumber(newPO.poNumber);
    setShowCreateForm(false);
    setVendorName('');
    setVendorEmail('');
    setSku('');
    setDescription('');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Purchase Order Registry
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Baseline authorized SKUs, quantities, and unit rates used by Procurement and Verification agents.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          {showCreateForm ? 'Close Form' : 'New Purchase Order'}
        </button>
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-900">
            Register Purchase Order
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                PO Number
              </label>
              <input
                type="text"
                required
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Vendor Name
              </label>
              <input
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Summit Metals Corp."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Vendor Billing Email
              </label>
              <input
                type="email"
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
                placeholder="billing@summitmetals.example"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="ALU-204"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Item Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="6061 Aluminum Sheet"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Contracted Unit Price (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
            >
              Save Purchase Order
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="py-3 px-5">PO Number</th>
                <th className="py-3 px-3">Vendor</th>
                <th className="py-3 px-5 text-right">Authorized</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {purchaseOrders.map((po) => {
                const isSelected = selectedPO?.poNumber === po.poNumber;
                return (
                  <tr
                    key={po.poNumber}
                    onClick={() => setSelectedPoNumber(po.poNumber)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-900 whitespace-nowrap">
                      {po.poNumber}
                      <div className="text-[11px] font-normal text-slate-500">
                        {po.status}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-800">{po.vendorName}</td>
                    <td className="py-3.5 px-5 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                      {formatCurrency(po.totalAmount, po.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedPO && (
          <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-mono text-slate-500">
                  Issued {formatDate(selectedPO.issueDate)} · Expected{' '}
                  {formatDate(selectedPO.expectedDeliveryDate)}
                </p>
                <h3 className="text-lg font-semibold text-slate-900 mt-1 font-mono">
                  {selectedPO.poNumber}
                </h3>
                <p className="text-sm text-slate-600">
                  {selectedPO.vendorName} ·{' '}
                  <span className="font-mono text-xs">{selectedPO.vendorEmail}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Authorized PO Value</p>
                <p className="text-xl font-semibold text-slate-900 font-mono tabular-nums">
                  {formatCurrency(selectedPO.totalAmount, selectedPO.currency)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">
                Contracted Line Items
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500">
                      <th className="py-2.5 px-4">SKU</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate</th>
                      <th className="py-2.5 px-4 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {selectedPO.lineItems.map((item) => (
                      <tr key={item.sku}>
                        <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                          {item.sku}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{item.description}</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900">
                          {formatCurrency(item.unitPrice, selectedPO.currency)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {formatCurrency(item.total, selectedPO.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">
                Matched Invoices ({linkedInvoices.length})
              </h4>
              {linkedInvoices.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 border border-slate-200 rounded-lg px-4">
                  No vendor invoices matched against {selectedPO.poNumber} yet.
                </p>
              ) : (
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-200">
                  {linkedInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-mono font-semibold text-slate-900">
                          {inv.invoiceNumber}
                        </span>
                        <span className="mx-2 text-slate-300" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-slate-600">
                          {inv.verificationStatus} ({inv.ownerDecision})
                        </span>
                      </div>
                      <span className="font-mono tabular-nums font-semibold text-slate-900">
                        {formatCurrency(inv.totalAmount, inv.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
