import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { files, attackVector } = await req.json();
    
    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: "Invalid files payload" }, { status: 400 });
    }

    let isVulnerable = false;
    let vulnerabilityReport = "";

    // Find the backend webhook file (or check all backend files)
    const backendFiles = files.filter((f: any) => f.name.includes('backend') || f.name.toLowerCase().includes('webhook') || f.name.toLowerCase().includes('api'));

    const codeToScan = backendFiles.map((f: any) => f.content).join('\n');

    if (attackVector === "signature") {
      const hasHmac = codeToScan.includes('crypto.createHmac') || codeToScan.includes('hmac');
      const hasSignatureHeader = codeToScan.includes('x-razorpay-signature');
      
      if (!hasHmac || !hasSignatureHeader) {
        isVulnerable = true;
        vulnerabilityReport = "[FATAL] Webhook Signature Mismatch: Unauthorized access attempt detected. Missing crypto.createHmac verification.";
      }
    } else if (attackVector === "idempotency") {
      const hasIdempotency = codeToScan.toLowerCase().includes('idempotency') || codeToScan.includes('x-idempotency-key');
      if (!hasIdempotency) {
        isVulnerable = true;
        vulnerabilityReport = "[FATAL] Missing Idempotency Key: Network timeout caused duplicate order creation.";
      }
    } else if (attackVector === "currency") {
       // Just simulate vulnerability if it doesn't do strict math validation
       const hasMathCheck = codeToScan.includes('Math.round') || codeToScan.includes('Number.isInteger');
       if (!hasMathCheck) {
          isVulnerable = true;
          vulnerabilityReport = "[FATAL] Currency Decimal Manipulation: Fractional cents accepted without rounding validation.";
       }
    }

    // Default to a generic failure if the attack vector wasn't specific but we still want to test auto-heal
    if (!isVulnerable && attackVector === "signature" && !codeToScan) {
        isVulnerable = true;
        vulnerabilityReport = "[FATAL] Webhook Signature Mismatch: Unauthorized access attempt detected.";
    }

    if (isVulnerable) {
      return NextResponse.json({ 
        status: "failed", 
        vulnerability: vulnerabilityReport 
      });
    }

    return NextResponse.json({ status: "passed" });

  } catch (error: any) {
    console.error("Audit Error:", error);
    return NextResponse.json({ error: error.message || "Audit failed" }, { status: 500 });
  }
}
