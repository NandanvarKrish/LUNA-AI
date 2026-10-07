import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import type { Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI client with telemetry user-agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PERSONA_PROMPTS: Record<string, string> = {
  luna: `You are LUNA, a luminous, intelligent, and perceptive AI companion. 
Your presence is calm, articulate, perceptive, and deeply capable. You illuminate complex topics with clarity and elegance.
When answering, be insightful, structured, and helpful. Use clean Markdown with headers, bullet points, and code formatting when appropriate.
You possess a warm, celestial aura without being theatrical. Never identify as anything other than LUNA.`,

  architect: `You are LUNA in Architecture & Code mode.
You are a principal software architect and systems engineer. 
You provide rock-solid, production-ready code, elegant architectural patterns, thorough edge-case analysis, and performance considerations.
Default to modern TypeScript, modular components, and defensive engineering. Always explain trade-offs clearly.`,

  creative: `You are LUNA in Creative Muse mode.
You excel at evocative writing, visionary world-building, creative ideation, poetic metaphors, and compelling storytelling.
Craft vivid imagery, resonant concepts, and engaging prose while preserving elegance and narrative rhythm.`,

  thinker: `You are LUNA in Deep Reasoning mode.
Break problems down from first principles. Consider hidden assumptions, non-obvious second-order effects, systemic interactions, and counterfactuals.
Structure arguments systematically with premise, logic, and synthesis.`,

  zen: `You are LUNA in Zen Mindfulness mode.
Respond with distilled clarity, calm spaciousness, and thoughtful brevity.
Help the user strip away noise, focus on what matters most, and cultivate mindful perspective.`,
};

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    app: 'LUNA-AI',
    model: 'gemini-3.8-flash',
    hasKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Streaming Chat Endpoint via Server-Sent Events (SSE)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages = [],
      persona = 'luna',
      temperature = 0.7,
      enableSearch = false,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on the server environment.',
      });
    }

    const systemInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.luna;

    // Convert messages to GenAI contents format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    // Configure tools if search is enabled
    const config: Record<string, unknown> = {
      systemInstruction,
      temperature: typeof temperature === 'number' ? Math.max(0, Math.min(2, temperature)) : 0.7,
    };

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: config,
    });

    for await (const chunk of responseStream) {
      const text = chunk.text || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: unknown) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  }
});

// Single-shot Analysis / Insight Endpoint
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { content, task = 'deep-analysis' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required for analysis' });
    }

    const taskPrompts: Record<string, string> = {
      'deep-analysis': 'Analyze the following content thoroughly. Provide: 1. Core Summary, 2. Key Insights & Dimensions, 3. Critical Critique/Edge Cases, 4. Actionable Next Steps.',
      'summarize': 'Provide an executive summary, main takeaways in bullet points, and key conclusions.',
      'action-items': 'Extract all actionable tasks, responsibilities, and next steps with priority tags (High, Medium, Low).',
      'code-review': 'Review the following code for architecture, performance bottlenecks, security vulnerabilities, and code quality improvements.',
    };

    const promptText = `${taskPrompts[task] || taskPrompts['deep-analysis']}\n\nContent:\n${content}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: PERSONA_PROMPTS.luna,
      },
    });

    res.json({
      result: response.text || '',
    });
  } catch (error: unknown) {
    console.error('Analyze error:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    res.status(500).json({ error: message });
  }
});

// Spark suggestions endpoint
app.post('/api/sparks', async (req: Request, res: Response) => {
  try {
    const { context = '' } = req.body;
    const prompt = `Given the user's ongoing conversation context: "${context}", generate 4 diverse, intriguing, highly relevant follow-up questions or creative prompts that the user might want to ask next. Return ONLY a JSON array of 4 short strings. Example format: ["Question 1", "Question 2", "Question 3", "Question 4"]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ sparks: Array.isArray(parsed) ? parsed : [] });
  } catch (_e) {
    res.json({
      sparks: [
        'Explore the philosophical implications',
        'Provide a concrete code implementation',
        'What are the strongest counterarguments?',
        'Break this down into an actionable step-by-step roadmap',
      ],
    });
  }
});

// Start server with Vite middleware in development or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`✨ LUNA-AI server listening on http://0.0.0.0:${port} [${isProduction ? 'PROD' : 'DEV'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
