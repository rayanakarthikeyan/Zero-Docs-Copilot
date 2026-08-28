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
      1. You MUST use the official \`razorpay\` npm package in your Node.js backend code.
      2. You MUST demonstrate Razorpay best practices (e.g., verifying webhook signatures using \`crypto.createHmac\`, order creation before payment).
      
      You must generate the integration code, but also generate an "Auto-Healed" version of the code that handles extreme edge cases.
      
      Return STRICT raw JSON (no markdown blocks) matching this schema:
      {
        "plan": "A brief explanation of the integration",
        "files": [
          { 
            "name": "e.g., checkout.tsx",
            "language": "typescript",
            "content": "The standard naive implementation code (missing robust error handling)."
          }
        ],
        "simulatedError": "A realistic stack trace or log of what would happen if a chaotic edge case occurred (e.g. Webhook signature mismatch, 500 timeout).",
        "healedFiles": [
          {
            "name": "e.g., checkout.tsx",
            "language": "typescript",
            "content": "The robust, self-healed version of the code featuring idempotency keys, strict try-catch blocks, and webhook signature verification."
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
