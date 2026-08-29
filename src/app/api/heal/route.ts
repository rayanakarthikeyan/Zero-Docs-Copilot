import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { files, vulnerability, attackVector } = await req.json();
    
    if (!files || !vulnerability) {
      return NextResponse.json({ error: "Missing required payload" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemPrompt = `
      You are an elite Security Healer Agent for Razorpay integrations.
      The previous agent generated the following architecture, but it failed a static security audit.
      
      Vulnerability Detected: ${vulnerability}
      Target Attack Vector: ${attackVector}
      
      Original Code:
      ${JSON.stringify(files, null, 2)}
      
      CRITICAL INSTRUCTIONS:
      1. Analyze the original code and the vulnerability.
      2. Rewrite the specific files needed to fix this vulnerability.
         - If signature forgery, strictly implement: \`crypto.createHmac('sha256', secret).update(body).digest('hex')\` and compare it with the \`x-razorpay-signature\` header.
         - If idempotency, implement \`x-idempotency-key\` checks.
         - If currency, ensure strict Math.round validation.
      3. Return ALL 3 files (the frontend, backend create-order, and backend webhook), with the required security patches applied to the backend.
      
      Return STRICT raw JSON (no markdown blocks) matching this schema exactly:
      {
        "plan": "Explain exactly how you healed the vulnerability",
        "healedFiles": [
          { "name": "...", "language": "typescript", "content": "..." },
          { "name": "...", "language": "typescript", "content": "..." },
          { "name": "...", "language": "typescript", "content": "..." }
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
    console.error("Auto-Heal Error:", error);
    return NextResponse.json({ error: error.message || "Failed to auto-heal code" }, { status: 500 });
  }
}
