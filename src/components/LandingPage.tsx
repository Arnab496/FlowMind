import { ArrowRight, Building2, CheckCircle2, Loader2, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface LandingPageProps {
  onOpenWorkspace: () => void;
  onRunSampleWorkflow: () => void;
}

const HERO_IMAGE_URL = '/src/assets/images/hero_operations_desk_1794763673280.jpg';
const WAREHOUSE_IMAGE_URL =
  '/src/assets/images/workflow_supply_warehouse_1794763671546.jpg';

const AGENTS = [
  {
    index: '01',
    name: 'Finance Agent',
    summary:
      'Extracts structured invoice numbers, vendor profiles, line-item SKUs, taxes, and payment terms from uploaded PDFs, images, and text documents.',
    span: 'lg:col-span-7',
  },
  {
    index: '02',
    name: 'Procurement Agent',
    summary:
      'Cross-checks every extracted line item against open purchase orders and contracted vendor rate cards.',
    span: 'lg:col-span-5',
  },
  {
    index: '03',
    name: 'Verification Agent',
    summary:
      'Flags duplicate invoice submissions across historical batches, catches unauthorized quantity additions, and isolates unit-price overbilling.',
    span: 'lg:col-span-5',
  },
  {
    index: '04',
    name: 'Planning Agent',
    summary:
      'Evaluates net payment terms against the operating calendar, elevates urgent deadlines, and isolates disputed items from cash disbursement.',
    span: 'lg:col-span-7',
  },
  {
    index: '05',
    name: 'Communication Agent',
    summary:
      'Drafts clear, itemized vendor discrepancy notices and duplicate-submission alerts citing exact purchase order figures.',
    span: 'lg:col-span-6',
  },
  {
    index: '06',
    name: 'Supervisor Agent',
    summary:
      'Synthesizes batch execution into an auditable financial reconciliation report and routes payments and external emails for owner sign-off.',
    span: 'lg:col-span-6',
  },
];

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Upload three vendor invoices',
    detail:
      'Drop PDFs, scanned images, or CSV/text invoices into the batch queue—including mixed suppliers and active PO references.',
  },
  {
    step: '02',
    title: 'Extract fields and match purchase orders',
    detail:
      'Finance and Procurement agents parse line items and reconcile quantities and unit rates against PO-2026-041 through PO-2026-044.',
  },
  {
    step: '03',
    title: 'Detect duplicates, variances, and deadlines',
    detail:
      'Verification and Planning agents block a $2,900.00 duplicate invoice, isolate a $1,140.00 unit-price and quantity overage, and prioritize due dates.',
  },
  {
    step: '04',
    title: 'Draft vendor emails and financial reconciliation',
    detail:
      'Communication and Supervisor agents prepare dispute notices and compile a structured reconciliation report with recommended actions.',
  },
  {
    step: '05',
    title: 'Business owner approves payments and communications',
    detail:
      'High-risk disbursements and external vendor emails never fire automatically—the owner reviews, edits, and approves in one queue.',
  },
];

const ARCHITECTURE_STACK = [
  { layer: 'Local LLM Inference', component: 'Qwen / Llama (Local-First Ready)', role: 'Private document reasoning & field extraction' },
  { layer: 'Agent Orchestration', component: 'LangGraph State Machine', role: 'Deterministic multi-agent handoffs & gating' },
  { layer: 'Document Parsing', component: 'Docling / PyMuPDF', role: 'Structured layout extraction from PDFs & scans' },
  { layer: 'Relational Ledger', component: 'PostgreSQL', role: 'Invoices, purchase orders, and audit history' },
  { layer: 'Semantic Memory', component: 'ChromaDB', role: 'Vendor history & duplicate similarity retrieval' },
  { layer: 'Application Tier', component: 'FastAPI + React', role: 'API orchestration & owner approval console' },
];

export function LandingPage({
  onOpenWorkspace,
  onRunSampleWorkflow,
}: LandingPageProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [heroImgError, setHeroImgError] = useState(false);
  const [warehouseImgError, setWarehouseImgError] = useState(false);

  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [monthlyVolume, setMonthlyVolume] = useState('100-500 invoices/month');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !companyName.trim()) {
      setFormError('Please enter your name and company name.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(workEmail.trim())) {
      setFormError('Please enter a valid work email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          workEmail,
          companyName,
          monthlyVolume,
          notes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not submit inquiry.');
      }

      setSubmittedRef(data.referenceId || 'FM-RECEIVED');
      setFullName('');
      setWorkEmail('');
      setCompanyName('');
      setNotes('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Unable to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-[1320px] mx-auto h-16 px-6 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
          >
            FLOWMIND
          </a>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600"
          >
            <a
              href="#architecture"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Architecture
            </a>
            <a
              href="#workflow"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Workflow
            </a>
            <a
              href="#impact"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Impact
            </a>
            <a
              href="#contact"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Contact
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenWorkspace}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            >
              Open Workspace
            </button>
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-3">
            <a
              href="#architecture"
              onClick={() => setMobileNavOpen(false)}
              className="block text-sm font-medium text-slate-700"
            >
              Architecture
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileNavOpen(false)}
              className="block text-sm font-medium text-slate-700"
            >
              Workflow
            </a>
            <a
              href="#impact"
              onClick={() => setMobileNavOpen(false)}
              className="block text-sm font-medium text-slate-700"
            >
              Impact
            </a>
            <a
              href="#contact"
              onClick={() => setMobileNavOpen(false)}
              className="block text-sm font-medium text-slate-700"
            >
              Contact
            </a>
          </div>
        )}
      </header>

      <main id="top" className="flex-1">
        {/* Hero Split */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-[1320px] mx-auto px-6 py-14 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
                <div className="space-y-5">
                  <p className="text-xs font-medium text-slate-500">
                    Autonomous Business Operations · Local-First Multi-Agent Platform
                  </p>
                  <h1
                    style={{
                      fontSize: 'clamp(2.25rem, 3.8vw, 3.5rem)',
                      textWrap: 'balance',
                    }}
                    className="font-bold tracking-tight text-slate-900 leading-[1.1]"
                  >
                    Reconcile vendor invoices, purchase orders, and payments in one workflow.
                  </h1>
                  <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                    Small businesses lose hours every week cross-checking PDFs, spreadsheets, and email threads. FLOWMIND coordinates six specialized agents to extract invoice fields, match purchase orders, block duplicates, draft vendor disputes, and prepare reconciliation reports for owner approval.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={onOpenWorkspace}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Launch Live Workspace
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href="#workflow"
                    className="text-sm font-medium text-slate-700 hover:text-slate-900 underline underline-offset-4 whitespace-nowrap shrink-0"
                  >
                    See 3-invoice workflow
                  </a>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="h-full min-h-[300px] lg:min-h-[400px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  {!heroImgError ? (
                    <img
                      src={HERO_IMAGE_URL}
                      alt="Operations director reviewing purchase orders and financial reconciliation charts"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-100">
                      <Building2 className="w-10 h-10 text-slate-400" />
                      <p className="mt-3 text-sm font-medium text-slate-700">
                        FLOWMIND Operations Control Desk
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full-Width 4-Column Quantified Strip */}
            <div className="mt-14 pt-10 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <p className="text-2xl font-semibold text-slate-900 font-mono tabular-nums">
                  6 Agents
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Coordinated Finance, Procurement, Verification, Planning, Comms, and Supervisor roles
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 font-mono tabular-nums">
                  100% Gated
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Disbursements and vendor emails always require explicit business owner sign-off
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 font-mono tabular-nums">
                  Line-Item Precision
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  SKU-level quantity, unit price, and duplicate checks against active purchase orders
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 font-mono tabular-nums">
                  Local-First Stack
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Designed for private Qwen/Llama inference, LangGraph, PostgreSQL, and QLoRA tuning
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Multi-Agent Architecture & Stack */}
        <section id="architecture" className="max-w-[1320px] mx-auto px-6 py-16 lg:py-20 space-y-12">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-medium text-blue-700">Agent Architecture</p>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Six specialized agents, one auditable operations ledger
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Rather than relying on a single unverified prompt, FLOWMIND separates extraction, PO matching, anomaly detection, deadline planning, vendor drafting, and risk approval into discrete stages.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {AGENTS.map((agent) => (
              <div
                key={agent.index}
                className={`${agent.span} bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4`}
              >
                <div>
                  <span className="font-mono text-xs font-medium text-slate-400">
                    {agent.index}
                  </span>
                  <h3 className="mt-1.5 text-lg font-semibold text-slate-900">
                    {agent.name}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{agent.summary}</p>
              </div>
            ))}
          </div>

          {/* Local-First Stack & QLoRA Fine-Tuning Matrix */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Reference Architecture &amp; QLoRA Fine-Tuning Targets
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Built to run on private infrastructure with domain-adapted adapters for invoice extraction, classification, PO matching, and anomaly categorisation.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                    <th className="py-3 px-6">System Layer</th>
                    <th className="py-3 px-4">Technology</th>
                    <th className="py-3 px-6">Operational Responsibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ARCHITECTURE_STACK.map((row) => (
                    <tr key={row.layer}>
                      <td className="py-3.5 px-6 font-medium text-slate-900 whitespace-nowrap">
                        {row.layer}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-800 whitespace-nowrap">
                        {row.component}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">{row.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 3: Example Workflow */}
        <section id="workflow" className="bg-white border-y border-slate-200">
          <div className="max-w-[1320px] mx-auto px-6 py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <p className="text-xs font-medium text-blue-700">Example Workflow</p>
                  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                    From three raw vendor invoices to signed reconciliation
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Test the complete pipeline right now in the live workspace with pre-loaded purchase orders and a 3-invoice batch containing a duplicate submission, a unit-price discrepancy, and a clean match.
                  </p>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3]">
                  {!warehouseImgError ? (
                    <img
                      src={WAREHOUSE_IMAGE_URL}
                      alt="Small business warehouse logistics and inventory fulfillment floor"
                      referrerPolicy="no-referrer"
                      onError={() => setWarehouseImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-6 text-sm text-slate-500">
                      Supply Operations &amp; Receiving
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
                <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
                  {WORKFLOW_STEPS.map((item) => (
                    <div key={item.step} className="py-5 flex items-start gap-5">
                      <span className="font-mono text-sm font-semibold text-blue-700 shrink-0 mt-0.5">
                        {item.step}
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={onRunSampleWorkflow}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Run 3-Invoice Workflow Live
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-500">
                    Opens the live workspace with 3 sample invoices staged for extraction
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Proof / Operational Outcomes */}
        <section id="impact" className="max-w-[1320px] mx-auto px-6 py-16 lg:py-20 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-medium text-blue-700">Measured Impact</p>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Built for finance teams managing real supplier variance
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <article className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  $14,820 overbilling caught in 90 days
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  &ldquo;Before deploying automated PO line-item verification, small unit-price increases on recurring hardware shipments slipped straight through accounts payable. Catching a 10% rate variance and two duplicate re-submissions in our first month paid for the workflow immediately.&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
                <span className="font-semibold text-slate-900">Marcus Halvorsen</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>Operations Controller, Great Lakes Precision Supply</span>
              </div>
            </article>

            <article className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  11.5 hours saved weekly on AP close
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  &ldquo;Our office manager used to spend every Thursday afternoon reconciling freight bills against purchase orders and writing vendor follow-ups. Now the discrepancy emails are pre-drafted with exact SKU math and waiting in one approval screen.&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
                <span className="font-semibold text-slate-900">Priya Nair</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>Managing Partner, Northstar Distribution Group</span>
              </div>
            </article>
          </div>
        </section>

        {/* Section 5: Interactive Lead Capture / Deployment Request */}
        <section id="contact" className="bg-white border-t border-slate-200">
          <div className="max-w-[1320px] mx-auto px-6 py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5 space-y-4">
                <p className="text-xs font-medium text-blue-700">Deployment Inquiry</p>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                  Deploy FLOWMIND on your invoice &amp; PO stack
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Request a local-first deployment blueprint tailored to your accounting software, email gateway, and monthly vendor invoice volume.
                </p>
                <div className="pt-2 space-y-2 text-sm text-slate-700">
                  <p>Includes QLoRA extraction schema mapping</p>
                  <p>PostgreSQL &amp; ChromaDB local deployment guide</p>
                  <p>Email &amp; accounting API integration checklist</p>
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-6 lg:p-8">
                {submittedRef ? (
                  <div className="py-6 space-y-4">
                    <div className="flex items-center gap-2.5 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5" />
                      <h3 className="text-base font-semibold text-slate-900">
                        Deployment Request Received
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      Your operations blueprint request has been logged under reference{' '}
                      <span className="font-mono font-semibold text-slate-900">
                        {submittedRef}
                      </span>
                      . You can explore the live multi-agent workspace immediately while our team reviews your stack.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={onOpenWorkspace}
                        className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        Open Live Workspace
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubmittedRef(null)}
                        className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-200 bg-white hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        Submit Another Request
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={(e) => void handleContactSubmit(e)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="fm-full-name"
                          className="block text-xs font-medium text-slate-700 mb-1"
                        >
                          Full Name
                        </label>
                        <input
                          id="fm-full-name"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Elena Vance"
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="fm-work-email"
                          className="block text-xs font-medium text-slate-700 mb-1"
                        >
                          Work Email
                        </label>
                        <input
                          id="fm-work-email"
                          type="email"
                          required
                          value={workEmail}
                          onChange={(e) => setWorkEmail(e.target.value)}
                          placeholder="elena@company.com"
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="fm-company"
                          className="block text-xs font-medium text-slate-700 mb-1"
                        >
                          Company Name
                        </label>
                        <input
                          id="fm-company"
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Great Lakes Supply Co."
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="fm-volume"
                          className="block text-xs font-medium text-slate-700 mb-1"
                        >
                          Monthly Invoice Volume
                        </label>
                        <select
                          id="fm-volume"
                          value={monthlyVolume}
                          onChange={(e) => setMonthlyVolume(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="Under 100 invoices/month">Under 100 invoices/month</option>
                          <option value="100-500 invoices/month">100–500 invoices/month</option>
                          <option value="500-2,000 invoices/month">500–2,000 invoices/month</option>
                          <option value="2,000+ invoices/month">2,000+ invoices/month</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="fm-notes"
                        className="block text-xs font-medium text-slate-700 mb-1"
                      >
                        Current Accounting &amp; Email Stack (Optional)
                      </label>
                      <textarea
                        id="fm-notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. QuickBooks Online, Gmail workspace, PDF vendor invoices..."
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    {formError && (
                      <p role="alert" className="text-xs font-medium text-red-700">
                        {formError}
                      </p>
                    )}

                    <div className="pt-1 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSubmitting ? 'Submitting...' : 'Request Deployment Blueprint'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-[1320px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 tracking-tight">FLOWMIND</span>
            <span aria-hidden="true">·</span>
            <span>Autonomous Business Operations Platform</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#architecture" className="hover:text-slate-900">
              Architecture
            </a>
            <a href="#workflow" className="hover:text-slate-900">
              Workflow
            </a>
            <a href="#impact" className="hover:text-slate-900">
              Impact
            </a>
            <button
              type="button"
              onClick={onOpenWorkspace}
              className="font-medium text-blue-700 hover:text-blue-800"
            >
              Open Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
