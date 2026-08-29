import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { prompt, stack } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemPrompt = `
      You are an elite Developer Advocate and AI coding assistant for Razorpay.
      The developer requested: "${prompt}" using "${stack}".
      
      CRITICAL INSTRUCTIONS:
      1. You MUST use the official \`razorpay\` npm package.
      2. The naive "unhealed" code MUST be missing webhook signature verification (a common AI hallucination).
      3. The "healed" code MUST strictly implement: \`crypto.createHmac('sha256', secret).update(body).digest('hex')\` for webhook verification.
      4. The "healed" code MUST include \`idempotency_key\` headers where applicable.
      
      Return STRICT raw JSON (no markdown blocks) matching this schema:
      {
        "plan": "A brief explanation of the integration",
        "files": [
          { 
            "name": "api/webhook/route.ts",
            "language": "typescript",
            "content": "The naive implementation (NO signature verification)."
          }
        ],
        "simulatedError": "[FATAL] Webhook Signature Mismatch: Unauthorized access attempt detected.",
        "healedFiles": [
          {
            "name": "api/webhook/route.ts",
            "language": "typescript",
            "content": "The robust, self-healed version featuring crypto.createHmac verification and strict try-catch."
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [systemPrompt]
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    
    const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Code Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate code" }, { status: 500 });
  }
}
