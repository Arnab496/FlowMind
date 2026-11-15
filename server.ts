import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const CURRENT_OPERATIONS_DATE = '2026-11-15';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface IncomingDoc {
  id: string;
  fileName: string;
  mimeType: string;
  rawText?: string;
  base64Data?: string;
}

interface ExistingPO {
  poNumber: string;
  vendorName: string;
  vendorEmail: string;
  issueDate: string;
  currency: string;
  totalAmount: number;
  lineItems: Array<{
    sku: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

interface ExistingInvoiceSummary {
  invoiceNumber: string;
  vendorName: string;
  poNumber: string | null;
  totalAmount: number;
  issueDate: string;
  batchId: string;
  ownerDecision: string;
}

const batchResponseSchema = {
  type: Type.OBJECT,
  properties: {
    batchId: { type: Type.STRING },
    extractedInvoices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          docId: { type: Type.STRING },
          fileName: { type: Type.STRING },
          invoiceNumber: { type: Type.STRING },
          vendorName: { type: Type.STRING },
          vendorEmail: { type: Type.STRING },
          poNumber: { type: Type.STRING, nullable: true },
          issueDate: { type: Type.STRING },
          dueDate: { type: Type.STRING },
          currency: { type: Type.STRING },
          paymentTerms: { type: Type.STRING },
          subtotal: { type: Type.NUMBER },
          tax: { type: Type.NUMBER },
          totalAmount: { type: Type.NUMBER },
          extractedRawTextSummary: { type: Type.STRING },
          lineItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sku: { type: Type.STRING },
                description: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                unitPrice: { type: Type.NUMBER },
                total: { type: Type.NUMBER },
              },
              required: ['sku', 'description', 'quantity', 'unitPrice', 'total'],
            },
          },
          verificationStatus: {
            type: Type.STRING,
            description: 'One of: Matched, Discrepancy, Duplicate, Unmatched PO',
          },
          paymentPriority: {
            type: Type.STRING,
            description: 'One of: Urgent, Scheduled, Hold, Blocked',
          },
          daysUntilDue: { type: Type.INTEGER },
          anomalies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  description:
                    'One of: CLEAN_MATCH, DUPLICATE_INVOICE, PRICE_VARIANCE, QUANTITY_MISMATCH, UNMATCHED_PO, OVERDUE_RISK',
                },
                severity: {
                  type: Type.STRING,
                  description: 'One of: High, Medium, Low',
                },
                field: { type: Type.STRING },
                expectedValue: { type: Type.STRING },
                actualValue: { type: Type.STRING },
                varianceAmount: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
              },
              required: [
                'category',
                'severity',
                'field',
                'expectedValue',
                'actualValue',
                'varianceAmount',
                'explanation',
              ],
            },
          },
        },
        required: [
          'docId',
          'fileName',
          'invoiceNumber',
          'vendorName',
          'vendorEmail',
          'issueDate',
          'dueDate',
          'currency',
          'paymentTerms',
          'subtotal',
          'tax',
          'totalAmount',
          'extractedRawTextSummary',
          'lineItems',
          'verificationStatus',
          'paymentPriority',
          'daysUntilDue',
          'anomalies',
        ],
      },
    },
    vendorEmailDrafts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          docId: { type: Type.STRING },
          invoiceNumber: { type: Type.STRING },
          vendorName: { type: Type.STRING },
          recipientEmail: { type: Type.STRING },
          subject: { type: Type.STRING },
          body: { type: Type.STRING },
          reason: { type: Type.STRING },
          riskLevel: {
            type: Type.STRING,
            description: 'One of: High, Medium, Low',
          },
        },
        required: [
          'docId',
          'invoiceNumber',
          'vendorName',
          'recipientEmail',
          'subject',
          'body',
          'reason',
          'riskLevel',
        ],
      },
    },
    executiveSummary: { type: Type.STRING },
    recommendedActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    agentTraces: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          agentName: { type: Type.STRING },
          responsibility: { type: Type.STRING },
          summary: { type: Type.STRING },
          itemsProcessed: { type: Type.INTEGER },
          findingsCount: { type: Type.INTEGER },
        },
        required: [
          'agentName',
          'responsibility',
          'summary',
          'itemsProcessed',
          'findingsCount',
        ],
      },
    },
  },
  required: [
    'batchId',
    'extractedInvoices',
    'vendorEmailDrafts',
    'executiveSummary',
    'recommendedActions',
    'agentTraces',
  ],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'flowmind-operations-engine' });
  });

  app.post('/api/contact', (req, res) => {
    const {
      fullName,
      workEmail,
      companyName,
      monthlyVolume,
      notes,
    }: {
      fullName?: string;
      workEmail?: string;
      companyName?: string;
      monthlyVolume?: string;
      notes?: string;
    } = req.body ?? {};

    if (!fullName?.trim() || !companyName?.trim()) {
      res.status(400).json({ error: 'Full name and company name are required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!workEmail || !emailRegex.test(workEmail.trim())) {
      res.status(400).json({ error: 'Please provide a valid work email address.' });
      return;
    }

    const referenceId = `FM-${Date.now().toString().slice(-6)}`;
    res.json({
      ok: true,
      referenceId,
      receivedAt: new Date().toISOString(),
      summary: {
        fullName: fullName.trim(),
        workEmail: workEmail.trim(),
        companyName: companyName.trim(),
        monthlyVolume: monthlyVolume || '100-500 invoices/month',
        notes: notes?.trim() || '',
      },
    });
  });

  app.post('/api/agents/process-batch', async (req, res) => {
    const startTime = Date.now();
    try {
      const {
        documents,
        purchaseOrders,
        existingInvoices,
        batchId,
      }: {
        documents: IncomingDoc[];
        purchaseOrders: ExistingPO[];
        existingInvoices: ExistingInvoiceSummary[];
        batchId?: string;
      } = req.body;

      if (!Array.isArray(documents) || documents.length === 0) {
        res.status(400).json({ error: 'At least one invoice document is required.' });
        return;
      }

      const ai = getGeminiClient();
      const targetBatchId =
        batchId ||
        `BATCH-${CURRENT_OPERATIONS_DATE.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      const systemContextText = `You are FLOWMIND, a 6-agent autonomous business operations pipeline coordinating:
1. Finance Agent: Extract structured invoice fields (invoiceNumber, vendorName, vendorEmail, poNumber, issueDate, dueDate, currency, paymentTerms, lineItems, subtotal, tax, totalAmount) from every uploaded document.
2. Procurement Agent: Match each invoice against the active Purchase Orders list below by poNumber, vendorName, and line-item SKU/description.
3. Verification Agent: Detect:
   - DUPLICATE_INVOICE: if invoiceNumber + vendorName matches an existing ledger invoice OR another document in this same batch.
   - QUANTITY_MISMATCH: if any invoiced line item quantity differs from the matched PO line item quantity.
   - PRICE_VARIANCE: if any invoiced line item unitPrice differs from the matched PO line item unitPrice.
   - UNMATCHED_PO: if poNumber is missing or does not exist in active Purchase Orders.
   - OVERDUE_RISK: if dueDate is before or within 5 days of current date (${CURRENT_OPERATIONS_DATE}).
   Calculate exact dollar varianceAmount for every discrepancy.
   Set verificationStatus strictly to one of: "Matched", "Discrepancy", "Duplicate", "Unmatched PO".
4. Planning Agent: Compute daysUntilDue relative to ${CURRENT_OPERATIONS_DATE} (YYYY-MM-DD). Set paymentPriority strictly to:
   - "Blocked" for Duplicate invoices
   - "Hold" for Discrepancy or Unmatched PO invoices
   - "Urgent" for Matched invoices due within 5 days or overdue
   - "Scheduled" for Matched invoices due in > 5 days
5. Communication Agent: Draft concise, professional vendor emails ONLY for invoices that have Discrepancy, Duplicate, or Unmatched PO issues. Address them from "Elena Vance, Operations Director", include exact invoice/PO numbers, SKU variances, and dollar figures.
6. Supervisor Agent: Produce an accurate executiveSummary, 2-4 concrete recommendedActions for the business owner, and agentTraces covering all 6 agents in exact order: "Finance Agent", "Procurement Agent", "Verification Agent", "Planning Agent", "Communication Agent", "Supervisor Agent".

Batch ID: ${targetBatchId}
Current Date: ${CURRENT_OPERATIONS_DATE}

ACTIVE PURCHASE ORDERS:
${JSON.stringify(purchaseOrders, null, 2)}

EXISTING INVOICE LEDGER (check here for duplicates):
${JSON.stringify(existingInvoices, null, 2)}

UPLOADED DOCUMENTS TO PROCESS (${documents.length} total):`;

      parts.push({ text: systemContextText });

      for (const doc of documents) {
        parts.push({
          text: `\n--- DOCUMENT START: docId="${doc.id}", fileName="${doc.fileName}", mimeType="${doc.mimeType}" ---`,
        });
        if (doc.base64Data && (doc.mimeType.startsWith('image/') || doc.mimeType === 'application/pdf')) {
          parts.push({
            inlineData: {
              mimeType: doc.mimeType,
              data: doc.base64Data,
            },
          });
        }
        if (doc.rawText) {
          parts.push({ text: doc.rawText });
        }
        parts.push({ text: `--- DOCUMENT END: docId="${doc.id}" ---\n` });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: { parts },
        config: {
          systemInstruction:
            'You are a precision financial operations auditor. Never invent PO numbers or dollar amounts not present in the documents or PO ledger. Ensure line item totals and variance amounts are mathematically exact. Return valid JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: batchResponseSchema,
        },
      });

      const rawJson = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawJson);
      const elapsedMs = Date.now() - startTime;

      res.json({
        ...parsed,
        processingTimeMs: elapsedMs,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to process invoice batch.';
      console.error('Batch processing error:', error);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/agents/draft-email', async (req, res) => {
    try {
      const {
        invoice,
        instruction,
      }: {
        invoice: {
          invoiceNumber: string;
          vendorName: string;
          vendorEmail: string;
          poNumber: string | null;
          totalAmount: number;
          anomalies: Array<{ category: string; explanation: string; varianceAmount: number }>;
        };
        instruction: string;
      } = req.body;

      const ai = getGeminiClient();
      const prompt = `Revise or draft a vendor communication email on behalf of Elena Vance, Operations Director.
Invoice: ${invoice.invoiceNumber} (${invoice.vendorName}, PO: ${invoice.poNumber ?? 'None'}, Total: $${invoice.totalAmount.toFixed(2)})
Findings: ${JSON.stringify(invoice.anomalies)}
Owner instruction: ${instruction || 'Keep tone firm, polite, and request a revised invoice or credit memo within 3 business days.'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
            },
            required: ['subject', 'body'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to draft vendor email.';
      console.error('Email draft error:', error);
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FLOWMIND server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
