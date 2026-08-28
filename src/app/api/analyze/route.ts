import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('document') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No document provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
      You are an expert FinTech KYC and Underwriting analyst. Analyze the provided corporate document (it could be an Incorporation Certificate, PAN card, GST certificate, etc.).
      Extract the core company name, key individuals (directors, partners), and any Ultimate Beneficial Owners (UBOs) mentioned or implied.
      
      You must return the output STRICTLY in raw JSON format (no markdown blocks, no \`\`\`json) matching this exact schema:
      {
        "companyName": "extracted name",
        "entities": [
          { "id": "1", "name": "entity name", "type": "company or person", "role": "Director or UBO or Company" }
        ],
        "relationships": [
          { "source": "entity id", "target": "entity id", "label": "e.g. Owns 40% or Director of" }
        ],
        "flags": [
          "List any compliance warnings here, e.g. 'Foreign entity detected' or 'Missing PAN signature'"
        ]
      }
      Make sure the graph makes logical sense (individuals pointing to the company). If you cannot read the document, generate a plausible mock graph based on a hypothetical tech startup.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type || "image/jpeg"
                }
            }
        ]
    });

    const text = response.text;
    if (!text) {
        throw new Error("No text returned from Gemini");
    }
    
    // Clean up potential markdown formatting from the response
    const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const graphData = JSON.parse(jsonStr);

    return NextResponse.json(graphData);

  } catch (error: any) {
    console.error("KYC Analysis Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze document" }, { status: 500 });
  }
}
