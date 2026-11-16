<div align="center">FlowMind
Autonomous AI-Powered Business Operations
Turn financial documents into actionable business decisions with coordinated AI agents.


</div> Overview
FlowMind is an AI-powered, multi-agent business operations platform designed to simplify invoice processing and financial workflows. It coordinates specialized agents to extract invoice information, compare invoices against purchase orders, identify discrepancies and duplicate submissions, prioritize payment obligations, and prepare vendor communications.

The platform brings these activities into a unified workspace with an executive overview and an auditable view of agent activity. A human operator can review findings and generated communications before taking action.
Project goal: Reduce repetitive finance and procurement work, improve visibility into invoice exceptions, and support faster, better-informed operational decisions.

 Key Features
- AI-powered invoice extraction — Extract structured invoice details and line items from supported PDF and image documents using the Gemini API.
- Purchase-order matching — Compare invoice details with purchase-order records, including vendor, PO number, SKU or description, quantity, unit price, and totals.
- Duplicate detection — Flag invoices that appear more than once in the existing invoice ledger or current processing batch.
- Discrepancy and anomaly detection — Identify price variances, quantity mismatches, missing or unmatched purchase orders, and overdue-payment risks.
- Payment prioritization — Classify invoices into actionable priority groups such as Urgent, Scheduled, Hold, and Blocked.
- Vendor email drafting — Generate professional draft emails to help resolve invoice discrepancies.
- Human-in-the-loop review — Keep people involved in reviewing important findings and approving consequential actions.
- Operations dashboard — Present invoice status, operational summaries, and recommendations in one workspace.
- Agent activity trace — Show the work and findings attributed to the specialized agents.
   Multi-Agent Workflow
FlowMind coordinates six specialized agents:
Agent	Responsibility
Finance Agent	Extracts invoice details, totals, dates, vendor information, and line items.
Procurement Agent	Matches invoices with the available purchase-order records.
Verification Agent	Checks for duplicates, price and quantity variances, and unmatched purchase orders.
Planning Agent	Evaluates due dates and assigns payment priorities.
Communication Agent	Prepares vendor email drafts for invoices that need clarification or correction.
Supervisor Agent	Consolidates results, produces recommendations, and records the agent execution trace.


Workflow at a glance
Invoice PDFs / Images
        │
        ▼
 Document Upload
        │
        ▼
 Gemini-Powered Extraction
        │
        ▼
 ┌───────────────────────────────────────────┐
 │             Multi-Agent Pipeline          │
 │                                           │
 │  Finance → Procurement → Verification     │
 │                 ↓                         │
 │  Planning → Communication → Supervisor   │
 └───────────────────────────────────────────┘
        │
        ▼
 Matching, Exceptions & Payment Priorities
        │
        ▼
 Executive Summary + Agent Activity Trace
        │
        ▼
 Human Review & Vendor Communication
 Application Modules
The repository's frontend is organized around the following workspace areas:
- Overview — High-level operational metrics and invoice status.
- Invoice Upload — Upload invoice documents and review extracted information.
- Purchase Orders — View purchase-order records used during matching.
- Discrepancies & Communications — Inspect exceptions and prepare vendor correspondence.
- Reconciliation Report — Review reconciliation results and agent activity.
 Technology Stack
Layer	Technologies
Frontend	React 19, TypeScript
Styling	Tailwind CSS
Icons & UI	Lucide React, Motion
Backend	Node.js, Express, TypeScript
AI integration	Google Gemini API (@google/genai)
Build tooling	Vite, TSX
Package manager	npm or Bun


 Project Structure
FlowMind/
├── src/
│   ├── components/
│   │   ├── DiscrepanciesCommsView.tsx
│   │   ├── InvoicesUploadView.tsx
│   │   ├── LandingPage.tsx
│   │   ├── OverviewView.tsx
│   │   ├── PurchaseOrdersView.tsx
│   │   ├── ReconciliationReportView.tsx
│   │   └── Sidebar.tsx
│   ├── data/
│   │   └── seedData.ts
│   ├── utils/
│   │   └── formatters.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── docs/
│   └── FlowMind-Presentation.pptx   # Add your project presentation here
├── .env.example
├── index.html
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
Getting Started
Prerequisites
Make sure you have the following installed:
- Node.js (Node.js 18 or later recommended; use a version compatible with the installed Vite release)
- npm (included with Node.js) or Bun
- A Gemini API key from Google AI Studio
1. Clone the repository
git clone https://github.com/Arnab496/FlowMind.git
cd FlowMind
2. Install dependencies
Using npm:
npm install
Or using Bun:
bun install
3. Configure environment variables
Create a local .env file from the example:

Windows PowerShell
Copy-Item .env.example .env
macOS / Linux
cp .env.example .env
Open .env and add your Gemini API key:
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
Keep your real API key private. Do not commit .env or expose the key in frontend code.
4. Run the development server
npm run dev
The Express server and Vite development middleware are started together. Open the local URL printed in your terminal (the default backend port is 3000):

http://localhost:3000
5. Create a production build
npm run build
The frontend production assets are generated in the dist/ directory. The repository also defines an npm start script for starting the server; check that your installed Node.js version supports the TypeScript entry point used by that script before deploying.
 Environment Variables
Variable	Required	Description
GEMINI_API_KEY	Yes, for AI features	API key used by the backend to call Google Gemini.
APP_URL	Optional in the current server implementation	Application URL configuration value shown in .env.example.


Never publish API keys, credentials, or private invoice documents in the repository.
Backend API
The Express server currently defines these endpoints:
Method	Endpoint	Purpose
GET	/api/health	Returns the service health status.
POST	/api/contact	Validates and accepts contact-form details.
POST	/api/agents/process-batch	Processes uploaded invoice documents against purchase orders and existing invoice records using Gemini.
POST	/api/agents/draft-email	Generates or revises a vendor email draft for an invoice issue.


For /api/agents/process-batch, the request includes invoice documents, purchase-order records, existing invoice summaries, and an optional batch ID. Document payloads may include extracted text and/or base64-encoded PDF or image data.
Project Presentation
The project presentation will be available here once the PowerPoint file has been uploaded to the repository.
<details>
<summary><strong>📥 View / download the FlowMind presentation</strong></summary>
Upload location: docs/FlowMind-Presentation.pptx

After uploading the file, this link will work:

[Download FlowMind Project Presentation (PPTX)](docs/FlowMind-Presentation.pptx)
</details>How to upload your PPT
1. Open the repository on GitHub.
2. Create a folder named docs if it does not already exist.
3. Upload your PowerPoint file into docs/.
4. Rename the file to FlowMind-Presentation.pptx (or update the link above to match its actual filename).
5. Commit the changes. The presentation link in this README will then work.
Screenshots
Add application screenshots to docs/screenshots/ and update the image paths below.
Dashboard	Invoice Processing
docs/screenshots/dashboard.png	docs/screenshots/invoice-processing.png


<!-- Uncomment after adding the screenshots:
![FlowMind Dashboard](docs/screenshots/dashboard.png)
![FlowMind Invoice Processing](docs/screenshots/invoice-processing.png)
-->🔮 Future Enhancements
Potential areas for future development include:
- Persistent database integration for invoices, purchase orders, vendors, and audit history.
- Role-based access control and approval workflows.
- More advanced configurable reconciliation rules.
- Exportable reconciliation reports (PDF and CSV).
- Notifications and scheduled payment reminders.
- Expanded audit, security, and monitoring capabilities.
- Automated testing and deployment pipelines.
⚠️ Important Notes
- AI-generated extraction and recommendations should be checked against the original financial documents.
- Treat generated vendor emails as drafts until an authorized person reviews and approves them.
- Do not use the demo or seed records as real financial records.
- Protect uploaded invoices and API credentials; financial documents may contain confidential information.
🤝 Contributing
Contributions, suggestions, and bug reports are welcome.
1. Fork the repository.
2. Create a feature branch: git checkout -b feature/your-feature.
3. Commit your changes: git commit -m "Add your feature".
4. Push the branch: git push origin feature/your-feature.
5. Open a Pull Request.
📄 License
This project is distributed under the MIT License, as indicated by the repository. If a LICENSE file is not yet present, add one to the repository so the license terms are explicit.
👨‍💻 Author
Arnab Sur
- GitHub: @Arnab496
- Project: FlowMind
- Live Demo: flowmind-ivory-delta.vercel.app
<div align="center">FlowMind — Smarter financial operations through coordinated AI.
</div>
