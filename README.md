# FlowMind — Autonomous Business Operations

FlowMind is an autonomous multi-agent business operations platform for invoice extraction, purchase-order matching, duplicate and discrepancy detection, payment scheduling, automated vendor email correspondence, and financial reconciliation.

---

## 🌟 Key Features

- **Multi-Agent Orchestration**: Specialized autonomous agents working in harmony:
  - **Finance Agent**: Processes invoices, extracts line items, and tracks payment records.
  - **Procurement Agent**: Analyzes purchase orders and vendor quotations.
  - **Verification Agent**: Detects mathematical errors, line-item mismatches, and duplicate invoices.
  - **Planning Agent**: Prioritizes upcoming cash flow obligations, payment schedules, and settlement deadlines.
  - **Communication Agent**: Generates context-aware, professional vendor email drafts for discrepancy resolution.
  - **Supervisor Agent**: Synthesizes agent actions, enforces compliance, and requires human-in-the-loop sign-off on high-risk approvals.
- **Intelligent Invoice Extraction**: Leverages Google Gemini API for OCR and structured data parsing from documents and images.
- **Automated 2-Way / 3-Way Matching**: Cross-references invoices with purchase orders to spot variance in unit prices, quantities, and totals.
- **Discrepancy & Anomaly Detection**: Highlights price discrepancies, duplicate invoice submissions, missing PO numbers, and tax calculation mismatches.
- **Vendor Communication Hub**: Review, approve, and send auto-generated discrepancy emails directly to vendors.
- **Reconciliation Audit Trail**: Executive dashboard with end-to-end trace logs for every agent action and financial report.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Motion
- **Backend**: Node.js / Express, TypeScript, TSX
- **AI / LLM**: Google Gemini API (`@google/genai`)
- **Build Tool**: Vite

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **bun**
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Arnab496/FlowMind.git
   cd FlowMind
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key in `.env`:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) (or the port specified in terminal) in your browser.

---

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── DiscrepanciesCommsView.tsx   # Discrepancy resolution & email drafting
│   │   ├── InvoicesUploadView.tsx       # Document upload & invoice extraction
│   │   ├── LandingPage.tsx              # Interactive landing page & feature showcase
│   │   ├── OverviewView.tsx             # Operations dashboard & metric counters
│   │   ├── PurchaseOrdersView.tsx       # Purchase order records & status
│   │   ├── ReconciliationReportView.tsx # Audit log & reconciliation summaries
│   │   └── Sidebar.tsx                  # Workspace navigation
│   ├── data/
│   │   └── seedData.ts                  # Mock data for invoices, POs, and reports
│   ├── utils/
│   │   └── formatters.ts                # Formatting helpers (currencies, dates, statuses)
│   ├── types.ts                         # Type definitions for agents & financial records
│   ├── App.tsx                          # Root application & state management
│   └── main.tsx                         # Entry point
├── server.ts                            # Express API server with Gemini endpoints
├── metadata.json                        # Applet metadata
├── package.json                         # Dependencies and build scripts
└── vite.config.ts                       # Vite build configuration
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
