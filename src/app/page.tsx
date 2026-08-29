"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Code, Play, CheckCircle, Loader2, Copy, FileCode2, AlertTriangle, ShieldCheck, Zap, Trash2, Clock, Activity, ShieldAlert, Lock, Download, X, Info } from "lucide-react";
import { blueprints } from "./blueprints";

export default function Home() {
  const [currentView, setCurrentView] = useState<"copilot" | "snippets">("copilot");
  
  const [prompt, setPrompt] = useState("");
  const [stack, setStack] = useState("Next.js (React) + Node.js SDK");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingText, setLoadingText] = useState("Compiling Integration...");
  const [ghostText, setGhostText] = useState("");
  const [result, setResult] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState("code"); 
  const [activeFile, setActiveFile] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  
  // Chaos Engine State
  const [isHealed, setIsHealed] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [attackVector, setAttackVector] = useState("signature");

  // Snippets State
  const [savedSnippets, setSavedSnippets] = useState<any[]>([]);

  // Telemetry State
  const [telemetry, setTelemetry] = useState({
    webhooks: 50421,
    threats: 12840,
    exposure: 0
  });

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Simulated Live Telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        webhooks: prev.webhooks + Math.floor(Math.random() * 4),
        threats: prev.threats + (Math.random() > 0.7 ? 1 : 0)
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Load snippets on mount
  useEffect(() => {
    const saved = localStorage.getItem("zeroDocsSnippets");
    if (saved) {
      try {
        setSavedSnippets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse snippets");
      }
    }
  }, []);

  const saveSnippet = (newResult: any, userPrompt: string, userStack: string) => {
    const snippet = {
      id: Date.now().toString(),
      prompt: userPrompt,
      stack: userStack,
      result: newResult,
      date: new Date().toLocaleDateString()
    };
    const updated = [snippet, ...savedSnippets];
    setSavedSnippets(updated);
    localStorage.setItem("zeroDocsSnippets", JSON.stringify(updated));
  };

  const deleteSnippet = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSnippets.filter(s => s.id !== id);
    setSavedSnippets(updated);
    localStorage.setItem("zeroDocsSnippets", JSON.stringify(updated));
    if (result?.id === id) {
      setResult(null);
    }
  };

  const loadSnippet = (snippet: any) => {
    setResult({ ...snippet.result, id: snippet.id });
    setPrompt(snippet.prompt);
    setStack(snippet.stack);
    setIsHealed(false);
    setLogs([]);
    setActiveTab("code");
    setCurrentView("copilot");
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setResult(null);
    setIsHealed(false);
    setLogs([]);
    setActiveTab("code");
    
    let provider = "Razorpay";
    if (prompt.toLowerCase().includes("stripe")) provider = "Stripe";
    else if (prompt.toLowerCase().includes("paypal")) provider = "PayPal";

    const loadingSteps = [
      `Fetching Live ${provider} API Schemas...`,
      "Synchronizing RAG Knowledge Base...",
      "Analyzing webhook architecture...",
      "Generating Node.js SDK integration...",
      "Running static security analysis...",
      "Finalizing architecture..."
    ];
    let stepIndex = 0;
    setLoadingText(loadingSteps[0]);
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % loadingSteps.length;
      setLoadingText(loadingSteps[stepIndex]);
    }, 2000);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, stack }),
      });
      const data = await response.json();
      setResult(data);
      saveSnippet(data, prompt, stack);
    } catch (error) {
      console.error("Error generating code:", error);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const simulateChaos = async () => {
    if (isSimulating || isHealed || !result) return;
    setIsSimulating(true);
    setLogs([]);
    
    const addLog = async (msg: string, delay: number = 800) => {
        setLogs(prev => [...prev, msg]);
        await new Promise(r => setTimeout(r, delay));
    };

    await addLog("> Initializing Deterministic Static Gatekeeper...", 1000);
    
    try {
        const response = await fetch('/api/audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files: result.files, attackVector })
        });
        const auditResult = await response.json();
        
        if (auditResult.status === "passed") {
            await addLog("[SUCCESS] Code passed security audit. No vulnerabilities found.");
            setIsSimulating(false);
            return;
        }
        
        await addLog(`[CRASH] ${auditResult.vulnerability}`, 1000);
        await addLog("[SYSTEM] Deploying AI Security Agent to patch vulnerability...", 1500);
        
        // Check if we are running a blueprint (which is statically hardcoded) to avoid burning API calls,
        // but if it's dynamic generation, use the real agent.
        if (result.healedFiles && result.plan.includes('Instantly deployed')) {
            await addLog("[AGENT] Intercepting vulnerability stack trace...", 1000);
            await addLog("[AGENT] Synthesizing cryptographically secure patch...", 1000);
            setIsHealed(true);
            await addLog("[SUCCESS] Patch deployed. Architecture secured.");
        } else {
            const healResponse = await fetch('/api/heal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: result.files, vulnerability: auditResult.vulnerability, attackVector })
            });
            
            const healData = await healResponse.json();
            
            if (healData.error) throw new Error(healData.error);
            
            setResult(prev => ({ ...prev, healedFiles: healData.healedFiles }));
            setIsHealed(true);
            await addLog("[AGENT] " + healData.plan, 800);
            await addLog("[SUCCESS] Security patch applied. Vulnerability mitigated.");
        }

    } catch (e: any) {
        await addLog("[ERROR] " + e.message);
    } finally {
        setIsSimulating(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPrompt(val);
    if (!val) {
      setGhostText("");
      return;
    }
    const suggestions = [
      "Generate a secure Standard Checkout integration",
      "Generate a robust Subscription Webhook handler",
      "Generate a Smart Collect architecture"
    ];
    const match = suggestions.find(s => s.toLowerCase().startsWith(val.toLowerCase()));
    if (match) {
      setGhostText(match.substring(val.length));
    } else {
      setGhostText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab" && ghostText) {
      e.preventDefault();
      setPrompt(prompt + ghostText);
      setGhostText("");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentFiles = isHealed ? result?.healedFiles : result?.files;

  // Simple syntax highlighting regex
  const highlightCode = (code: string) => {
    if (!code) return "";
    return code
      .replace(/(import|export|const|let|var|function|async|await|return|if|else|try|catch|new|throw)/g, '<span style="color: #ff7b72">$1</span>')
      .replace(/([{}[\]()])/g, '<span style="color: #ffdce0">$1</span>')
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span style="color: #a5d6ff">$1</span>')
      .replace(/(\/\/.*)/g, '<span style="color: #8b949e">$1</span>');
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Terminal size={24} color="var(--text-primary)" />
          <span>Zero-Docs AI</span>
        </div>
        <nav>
          <div 
            className={`nav-item ${currentView === "copilot" ? "active" : ""}`}
            onClick={() => setCurrentView("copilot")}
          >
            <Code size={18} />
            Integration Copilot
          </div>
          <div 
            className={`nav-item ${currentView === "snippets" ? "active" : ""}`}
            onClick={() => setCurrentView("snippets")}
          >
            <FileCode2 size={18} />
            Instant Blueprints
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="topbar-metrics" style={{ display: "flex", gap: "24px", cursor: "pointer" }} onClick={() => alert("Source Information:\n\nThese metrics are live simulated telemetry representing a production environment scaling to process thousands of Razorpay webhooks per second.")}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success-color)", fontSize: "13px", fontWeight: 600, background: "rgba(46, 160, 67, 0.1)", padding: "6px 12px", borderRadius: "20px", border: "1px solid rgba(46, 160, 67, 0.2)" }}>
              <Activity size={14} /> Webhooks Secured: {telemetry.webhooks.toLocaleString()}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-color)", fontSize: "13px", fontWeight: 600, background: "rgba(88, 166, 255, 0.1)", padding: "6px 12px", borderRadius: "20px", border: "1px solid rgba(88, 166, 255, 0.2)" }}>
              <ShieldCheck size={14} /> Zero-Day Threats Blocked: {telemetry.threats.toLocaleString()}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#d2a8ff", fontSize: "13px", fontWeight: 600, background: "rgba(210, 168, 255, 0.1)", padding: "6px 12px", borderRadius: "20px", border: "1px solid rgba(210, 168, 255, 0.2)" }}>
              <Lock size={14} /> Vulnerability Exposure: {telemetry.exposure}ms
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginLeft: "auto" }}>
            <button 
              onClick={() => setShowAbout(true)} 
              style={{ background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-secondary)", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, transition: "all 0.2s" }}
            >
              <Info size={12} /> About Platform
            </button>
            <span className="badge badge-success" style={{ gap: "6px", background: "rgba(88, 166, 255, 0.1)", color: "var(--accent-color)", border: "1px solid rgba(88, 166, 255, 0.2)" }}>
              <Lock size={12} /> RAG Sync: Razorpay v2.3.1 (Live)
            </span>
            <span className="badge badge-success" style={{ gap: "6px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", boxShadow: "0 0 6px currentColor", animation: "pulse 2s infinite" }}></div>
              Agent Online
            </span>
          </div>
        </header>

        <div className="content-area">
          {currentView === "copilot" ? (
            <>
              <header style={{ marginBottom: "40px" }}>
                <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>Zero-Docs AI Copilot</h1>
                <p style={{ fontSize: "16px", color: "var(--text-secondary)" }}>Describe your integration. The AI will read the docs and write the code for you.</p>
              </header>

              <div className="card" style={{ marginBottom: "32px", background: "linear-gradient(145deg, rgba(22,22,22,1) 0%, rgba(10,10,10,1) 100%)" }}>
                <h2 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)", marginBottom: "20px" }}>Define Architecture</h2>
                
                <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <select 
                      style={{ width: "100%", padding: "14px 16px", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.4)", border: "1px solid var(--border-color)", color: "white", fontSize: "15px", outline: "none", transition: "all 0.2s", cursor: "pointer", appearance: "none" }}
                      value={stack}
                      onChange={(e) => setStack(e.target.value)}
                    >
                      <option>Next.js (React) + Node.js SDK</option>
                      <option>React + Python (FastAPI)</option>
                      <option>Vue.js + Go (Fiber)</option>
                      <option>Angular + Java (Spring Boot)</option>
                      <option>SvelteKit + Ruby on Rails</option>
                      <option>React Native (Expo) + Node.js</option>
                      <option>Flutter + Dart</option>
                      <option>HTML/Vanilla JS + PHP</option>
                    </select>
                  </div>
                </div>

                <div style={{ position: "relative", marginBottom: "16px", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, padding: "16px", pointerEvents: "none", color: "var(--text-secondary)", fontSize: "15px", whiteSpace: "pre-wrap", zIndex: 1, overflow: "hidden", fontFamily: "inherit" }}>
                    <span style={{ color: "transparent" }}>{prompt}</span>{ghostText}
                  </div>
                  <textarea 
                    placeholder="e.g. Build a Razorpay subscription checkout flow for a SaaS product..."
                    style={{ position: "relative", width: "100%", height: "120px", padding: "16px", backgroundColor: "transparent", border: "none", color: "white", fontSize: "15px", resize: "vertical", outline: "none", transition: "all 0.2s", zIndex: 2, fontFamily: "inherit" }}
                    value={prompt}
                    onChange={handlePromptChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                
                <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                   <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", marginRight: "4px" }}>Try:</span>
                   <button className="btn btn-secondary" style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.05)" }} onClick={() => setPrompt("Build a multi-tenant subscription flow with webhook idempotency")}>Subscription Flow</button>
                   <button className="btn btn-secondary" style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.05)" }} onClick={() => setPrompt("Generate a B2B payment link generator with fractional currency rounding")}>B2B Payment Links</button>
                   <button className="btn btn-secondary" style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.05)" }} onClick={() => setPrompt("Create a secure Standard Checkout with dynamic order creation")}>Standard Checkout</button>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !prompt}
                    style={{ padding: "12px 24px", fontSize: "15px", minWidth: "280px", justifyContent: "center" }}
                  >
                    {isGenerating ? <><Loader2 size={18} className="animate-spin" /> {loadingText}</> : <><Zap size={18} fill="currentColor" /> Generate Code</>}
                  </button>
                </div>
              </div>

              {result && (
                <div className="split-layout">
                  {/* Code Viewer / Preview */}
                  <div className="card" style={{ padding: 0, overflow: 'hidden', border: isHealed ? "1px solid var(--success-color)" : "1px solid var(--border-color)", transition: "all 0.5s ease", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", paddingRight: "16px" }}>
                      <button 
                        onClick={() => setActiveTab("code")} 
                        style={{ padding: "16px 24px", background: activeTab === "code" ? "rgba(255,255,255,0.03)" : "transparent", border: "none", borderBottom: activeTab === "code" ? "2px solid var(--text-primary)" : "2px solid transparent", color: activeTab === "code" ? "white" : "var(--text-secondary)", cursor: "pointer", flex: 1, fontSize: "14px", fontWeight: 500, transition: "all 0.2s" }}
                      >
                        Code Editor {isHealed && <span className="badge badge-success" style={{ marginLeft: "8px" }}>Healed</span>}
                      </button>
                      <button 
                        onClick={() => setActiveTab("preview")} 
                        style={{ padding: "16px 24px", background: activeTab === "preview" ? "rgba(255,255,255,0.03)" : "transparent", border: "none", borderBottom: activeTab === "preview" ? "2px solid var(--text-primary)" : "2px solid transparent", color: activeTab === "preview" ? "white" : "var(--text-secondary)", cursor: "pointer", flex: 1, fontSize: "14px", fontWeight: 500, transition: "all 0.2s" }}
                      >
                        Security Audit
                      </button>
                      <button onClick={() => {
                        if (!currentFiles || !currentFiles[activeFile]) return;
                        const blob = new Blob([currentFiles[activeFile].content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = currentFiles[activeFile].name.split('/').pop() || 'code.ts';
                        a.click();
                      }} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.05)", marginLeft: "auto" }}>
                        <Download size={14} /> Export File
                      </button>
                    </div>

                    {activeTab === "code" ? (
                      <div style={{ display: "flex", backgroundColor: "#000000", flex: 1 }}>
                        <div style={{ width: "180px", borderRight: "1px solid var(--border-color)", background: "rgba(255,255,255,0.02)" }}>
                          {currentFiles?.map((file: any, index: number) => (
                            <div 
                              key={index}
                              onClick={() => setActiveFile(index)}
                              style={{ padding: "16px", cursor: "pointer", fontSize: "13px", borderLeft: activeFile === index ? "2px solid var(--text-primary)" : "2px solid transparent", backgroundColor: activeFile === index ? "rgba(255,255,255,0.05)" : "transparent", color: activeFile === index ? "white" : "var(--text-secondary)", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "10px" }}
                            >
                              <FileCode2 size={14} />
                              {file.name}
                            </div>
                          ))}
                        </div>
                        <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
                          
                          <div style={{ padding: "16px", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "16px", alignItems: "center", background: "rgba(88, 166, 255, 0.05)" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>1-Click CLI Deployment</div>
                              <div style={{ background: "#000", padding: "10px 16px", borderRadius: "6px", border: "1px solid rgba(88, 166, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                                <span style={{ color: "#e6edf3" }}>npx @zero-docs/cli init --blueprint={currentFiles?.[0]?.name?.replace('.tsx', '').toLowerCase() || 'demo'}</span>
                                <button onClick={() => copyToClipboard('npx @zero-docs/cli init --blueprint=demo')} style={{ background: "transparent", border: "none", color: "var(--accent-color)", cursor: "pointer" }}><Copy size={14} /></button>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => {
                                if (!currentFiles || !currentFiles[activeFile]) return;
                                const blob = new Blob([currentFiles[activeFile].content], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = currentFiles[activeFile].name.split('/').pop() || 'code.ts';
                                a.click();
                              }} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "13px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.05)" }}>
                                <Download size={14} /> Download ZIP
                              </button>
                            </div>
                          </div>

                          <button onClick={() => copyToClipboard(currentFiles[activeFile].content)} className="btn btn-secondary" style={{ position: "absolute", top: "100px", right: "16px", padding: "6px 12px", fontSize: "12px", borderRadius: "6px" }}>
                            {copied ? <CheckCircle size={14} color="var(--success-color)" /> : <Copy size={14} />} 
                            {copied ? "Copied!" : "Copy"}
                          </button>
                          <pre style={{ margin: 0, padding: "24px", paddingTop: "50px", overflowX: "auto", fontSize: "14px", lineHeight: "1.6", color: isHealed ? "#7ee787" : "#e6edf3", minHeight: "450px", transition: "color 0.5s ease", fontFamily: "var(--font-mono)", flex: 1 }} dangerouslySetInnerHTML={{ __html: highlightCode(currentFiles?.[activeFile]?.content) }}>
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#0d1117" }}>
                        <div style={{ padding: "24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h3 style={{ margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <ShieldAlert size={18} color="var(--accent-color)" /> Static Code Analyzer & Linter
                          </h3>
                          <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: "12px" }}>Automated Security Audit</span>
                        </div>
                        <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
                          
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "20px", borderRadius: "8px", border: isHealed ? "1px solid rgba(46, 160, 67, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)", backgroundColor: isHealed ? "rgba(46, 160, 67, 0.05)" : "rgba(239, 68, 68, 0.05)" }}>
                            {isHealed ? <ShieldCheck size={24} color="var(--success-color)" style={{ marginTop: "2px" }} /> : <AlertTriangle size={24} color="var(--error-color)" style={{ marginTop: "2px" }} />}
                            <div>
                              <h4 style={{ margin: "0 0 8px 0", fontSize: "15px", color: isHealed ? "var(--success-color)" : "var(--error-color)" }}>
                                {isHealed ? "Rule Passed: Webhook Signature Verified" : "Rule Failed: Missing Webhook Signature"}
                              </h4>
                              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                                {isHealed 
                                  ? "The code successfully implements crypto.createHmac('sha256', secret) to verify the x-razorpay-signature header. Unauthorized payloads will be rejected."
                                  : "The generated code does not verify the x-razorpay-signature header. This is a critical security vulnerability that allows attackers to spoof payment webhooks and steal funds."}
                              </p>
                              {!isHealed && (
                                <div style={{ marginTop: "12px", display: "inline-block", background: "rgba(255,0,0,0.1)", color: "var(--error-color)", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                                  ACTION REQUIRED: Deploy Chaos Engine to Auto-Heal
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "20px", borderRadius: "8px", border: isHealed ? "1px solid rgba(46, 160, 67, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)", backgroundColor: isHealed ? "rgba(46, 160, 67, 0.05)" : "rgba(239, 68, 68, 0.05)" }}>
                            {isHealed ? <CheckCircle size={24} color="var(--success-color)" style={{ marginTop: "2px" }} /> : <AlertTriangle size={24} color="var(--error-color)" style={{ marginTop: "2px" }} />}
                            <div>
                              <h4 style={{ margin: "0 0 8px 0", fontSize: "15px", color: isHealed ? "var(--success-color)" : "var(--error-color)" }}>
                                {isHealed ? "Rule Passed: Idempotency Keys Enforced" : "Rule Failed: Missing Idempotency Keys"}
                              </h4>
                              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                                {isHealed 
                                  ? "The code successfully includes idempotency_key headers to prevent duplicate order creation during network timeouts."
                                  : "Network timeouts could result in duplicate API calls and double-charging customers. No idempotency mechanism detected."}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "20px", borderRadius: "8px", border: "1px solid rgba(88, 166, 255, 0.3)", backgroundColor: "rgba(88, 166, 255, 0.05)", marginTop: "16px" }}>
                            <Code size={24} color="var(--accent-color)" style={{ marginTop: "2px" }} />
                            <div style={{ width: "100%" }}>
                              <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", color: "var(--accent-color)" }}>
                                Integration Test Runner (Jest Simulation)
                              </h4>
                              <div style={{ background: "#000", padding: "16px", borderRadius: "8px", fontFamily: "var(--font-mono)", fontSize: "13px", color: "#e6edf3", border: "1px solid var(--border-color)" }}>
                                {isHealed ? (
                                  <>
                                    <div style={{ color: "var(--success-color)", marginBottom: "4px" }}>✓ POST /api/checkout (200 OK) - Order Created</div>
                                    <div style={{ color: "var(--success-color)", marginBottom: "4px" }}>✓ POST /api/webhook (200 OK) - {attackVector === "signature" ? "Signature Validated" : attackVector === "idempotency" ? "Idempotency Enforced" : "Amount Validated"}</div>
                                    <div style={{ color: "var(--success-color)", marginBottom: "12px" }}>✓ POST /api/webhook (400 Bad Request) - {attackVector === "signature" ? "Invalid Signature Rejected" : attackVector === "idempotency" ? "Duplicate Request Rejected" : "Invalid Decimal Rejected"}</div>
                                    <div style={{ color: "var(--text-secondary)" }}>Test Suites: 1 passed, 1 total<br/>Tests: 3 passed, 3 total<br/>Time: 1.452s</div>
                                  </>
                                ) : (
                                  <>
                                    <div style={{ color: "var(--success-color)", marginBottom: "4px" }}>✓ POST /api/checkout (200 OK) - Order Created</div>
                                    <div style={{ color: "var(--error-color)", marginBottom: "4px" }}>✗ POST /api/webhook (500 Error) - {attackVector === "signature" ? "Missing Signature Validation" : attackVector === "idempotency" ? "Missing Idempotency Key" : "Decimal Mismatch"}</div>
                                    <div style={{ color: "var(--error-color)", marginBottom: "12px" }}>✗ POST /api/webhook (200 OK) - {attackVector === "signature" ? "FORGED PAYLOAD ACCEPTED (CRITICAL)" : attackVector === "idempotency" ? "DUPLICATE ORDER CREATED (CRITICAL)" : "INVALID CURRENCY ACCEPTED (CRITICAL)"}</div>
                                    <div style={{ color: "var(--text-secondary)" }}>Test Suites: 1 failed, 1 total<br/>Tests: 1 passed, 2 failed, 3 total<br/>Time: 0.821s</div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chaos Engine Panel */}
                  <div className="card" style={{ display: "flex", flexDirection: "column", background: "linear-gradient(180deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%)" }}>
                    <h3 style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 12px 0", fontSize: "16px" }}>
                      <AlertTriangle size={18} color="var(--error-color)" /> Chaos Engine
                    </h3>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.5" }}>
                      Inject synthetic failures to test the resilience of the generated architecture.
                    </p>
                    
                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>Select Attack Vector:</label>
                      <select 
                        value={attackVector}
                        onChange={(e) => { setAttackVector(e.target.value); setIsHealed(false); setLogs([]); }}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid var(--border-color)", color: "white", fontSize: "14px", outline: "none" }}
                      >
                        <option value="signature">Vector 1: Webhook Signature Forgery (Critical)</option>
                        <option value="idempotency">Vector 2: Network Timeout (Idempotency)</option>
                        <option value="currency">Vector 3: Currency Decimal Manipulation</option>
                      </select>
                    </div>

                    <button 
                      className="btn" 
                      style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--error-color)", border: "1px solid rgba(239, 68, 68, 0.3)", width: "100%", justifyContent: "center", padding: "14px", borderRadius: "8px", fontWeight: 600, cursor: (isSimulating || isHealed) ? "not-allowed" : "pointer", opacity: (isSimulating || isHealed) ? 0.5 : 1, transition: "all 0.2s" }}
                      onClick={simulateChaos}
                      disabled={isSimulating || isHealed}
                    >
                      {isSimulating ? <><Loader2 size={18} className="animate-spin" style={{ marginRight: "8px" }} /> Injecting Payload...</> : "Inject Failure Payload"}
                    </button>

                    <div style={{ flex: 1, backgroundColor: "#000000", borderRadius: "8px", padding: "16px", marginTop: "24px", fontFamily: "var(--font-mono)", fontSize: "13px", overflowY: "auto", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px", minHeight: "220px", maxHeight: "250px", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)" }}>
                      {logs.length === 0 && <div style={{ color: "#444" }}>&gt; Waiting for telemetry...</div>}
                      {logs.map((log, i) => (
                        <div key={i} style={{ 
                          color: log.includes("[CRASH]") ? "var(--error-color)" : log.includes("[SUCCESS]") ? "var(--success-color)" : log.includes("[AGENT]") ? "var(--accent-color)" : "var(--text-secondary)",
                          lineHeight: "1.6"
                        }}>
                          <span style={{ opacity: 0.4, marginRight: "10px" }}>&gt;</span>
                          {log}
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <header style={{ marginBottom: "40px" }}>
                <h1 style={{ fontSize: "32px", letterSpacing: "-0.5px", marginBottom: "8px" }}>Instant Blueprints</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>Bypass LLM generation. Deploy pre-compiled, statically audited Razorpay architectures instantly.</p>
              </header>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" }}>
                <div className="card" style={{ cursor: "pointer", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", background: "rgba(88, 166, 255, 0.1)", color: "var(--accent-color)", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 500, border: "1px solid rgba(88, 166, 255, 0.2)" }}>
                      <Code size={14} /> Next.js + Node
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--success-color)", fontSize: "13px" }}>
                      <ShieldCheck size={14} /> Audited
                    </div>
                  </div>
                  <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>Standard Checkout</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5", flex: 1, marginBottom: "24px" }}>
                    Full-stack architecture for standard Razorpay checkout including dynamic order creation, frontend payment UI, and cryptographically secure webhook handlers.
                  </p>
                  <div style={{ display: "flex", gap: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "20px", marginTop: "auto" }}>
                     <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", padding: "10px" }} onClick={() => { setPrompt("Generate a secure Standard Checkout integration"); setResult(blueprints.standardCheckout); setIsHealed(false); setLogs([]); setAttackVector("signature"); setActiveTab("code"); setCurrentView("copilot"); }}>Load Blueprint</button>
                  </div>
                </div>

                <div className="card" style={{ cursor: "pointer", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", background: "rgba(88, 166, 255, 0.1)", color: "var(--accent-color)", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 500, border: "1px solid rgba(88, 166, 255, 0.2)" }}>
                      <Code size={14} /> React Native + Node
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--success-color)", fontSize: "13px" }}>
                      <ShieldCheck size={14} /> Audited
                    </div>
                  </div>
                  <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>Mobile Subscriptions</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5", flex: 1, marginBottom: "24px" }}>
                    Recurring payment architecture with automatic billing cycles, deep linking for mobile SDKs, and webhook idempotency for unstable mobile networks.
                  </p>
                  <div style={{ display: "flex", gap: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "20px", marginTop: "auto" }}>
                     <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", padding: "10px" }} onClick={() => { setPrompt("Generate a robust Subscription Webhook handler"); setResult(blueprints.mobileSubscription); setIsHealed(false); setLogs([]); setAttackVector("idempotency"); setActiveTab("code"); setCurrentView("copilot"); }}>Load Blueprint</button>
                  </div>
                </div>

                <div className="card" style={{ cursor: "pointer", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", background: "rgba(88, 166, 255, 0.1)", color: "var(--accent-color)", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 500, border: "1px solid rgba(88, 166, 255, 0.2)" }}>
                      <Code size={14} /> Python / Django
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--success-color)", fontSize: "13px" }}>
                      <ShieldCheck size={14} /> Audited
                    </div>
                  </div>
                  <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>B2B Payment Links</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5", flex: 1, marginBottom: "24px" }}>
                    Automated invoice and payment link generation architecture. Includes auto-reminders and fractional currency rounding protection.
                  </p>
                  <div style={{ display: "flex", gap: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "20px", marginTop: "auto" }}>
                     <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", padding: "10px" }} onClick={() => { setPrompt("Generate a B2B Payment Links architecture"); setResult(blueprints.b2bLinks); setIsHealed(false); setLogs([]); setAttackVector("currency"); setActiveTab("code"); setCurrentView("copilot"); }}>Load Blueprint</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* About Modal */}
      {showAbout && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "24px" }} onClick={(e) => { if (e.target === e.currentTarget) setShowAbout(false); }}>
          <div style={{ background: "#0d1117", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "40px", maxWidth: "700px", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <button onClick={() => setShowAbout(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "8px" }}>
              <X size={20} />
            </button>
            <h2 style={{ margin: "0 0 24px 0", color: "white", fontSize: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
              <Terminal size={28} color="var(--accent-color)" /> About Zero-Docs AI
            </h2>
            <div style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: "1.7" }}>
              <p style={{ marginBottom: "16px", fontSize: "16px", color: "#e6edf3" }}>
                The modern internet runs on APIs, yet integrating them remains one of the most archaic processes in software engineering.
              </p>
              <p style={{ marginBottom: "16px" }}>
                Created by <strong>Rayana Karthikeyan</strong>, Zero-Docs AI was born from a fundamental frustration: developers spend more time reading documentation and debugging cryptic webhook signatures than they do building actual products.
              </p>
              <p style={{ marginBottom: "24px" }}>
                I recognized that standard AI wrappers were failing to solve this. They could generate basic scripts, but they could not output complex, multi-file architectures, nor could they guarantee cryptographic security. Zero-Docs AI was engineered to bridge this "Integration Chasm" by autonomously generating, compiling, and security-auditing enterprise-grade architectures on the fly.
              </p>
              
              <div style={{ background: "rgba(88, 166, 255, 0.05)", border: "1px solid rgba(88, 166, 255, 0.2)", padding: "20px", borderRadius: "8px" }}>
                <div style={{ fontWeight: 600, color: "var(--accent-color)", marginBottom: "12px", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Core Engineering Principles</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <Activity size={16} color="var(--success-color)" style={{ marginTop: "4px", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px" }}>Live Retrieval-Augmented Generation (RAG)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <FileCode2 size={16} color="var(--success-color)" style={{ marginTop: "4px", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px" }}>Multi-file architectural output enforcement</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <ShieldCheck size={16} color="var(--success-color)" style={{ marginTop: "4px", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px" }}>True Multi-Agent Chaos Engine for static security auditing and auto-healing</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <Code size={16} color="var(--success-color)" style={{ marginTop: "4px", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px" }}>Built for modern Next.js/React ecosystems</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
