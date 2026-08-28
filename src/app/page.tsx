"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Code, Play, CheckCircle, Loader2, Copy, FileCode2, AlertTriangle, ShieldCheck, Zap, Trash2, Clock } from "lucide-react";

export default function Home() {
  const [currentView, setCurrentView] = useState<"copilot" | "snippets">("copilot");
  
  const [prompt, setPrompt] = useState("");
  const [stack, setStack] = useState("Next.js (React) + Node.js SDK");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState("code"); 
  const [activeFile, setActiveFile] = useState(0);
  
  // Chaos Engine State
  const [isHealed, setIsHealed] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Snippets State
  const [savedSnippets, setSavedSnippets] = useState<any[]>([]);

  const logsEndRef = useRef<HTMLDivElement>(null);

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
      setIsGenerating(false);
    }
  };

  const simulateChaos = async () => {
    if (!result || isSimulating) return;
    setIsSimulating(true);
    setActiveTab("code");
    
    const sequence = [
      { text: "[SYSTEM] Initiating Chaos payload (Simulating Network Drop during Webhook)...", delay: 800 },
      { text: `[CRASH] FATAL ERROR 500: ${result.simulatedError || "Webhook signature missing"}`, delay: 1200 },
      { text: "[AGENT] Intercepting stack trace... Missing Idempotency Key detected.", delay: 1000 },
      { text: "[AGENT] Rewriting integration architecture to enforce Razorpay best practices...", delay: 1500 },
      { text: "HEAL", delay: 100 }, 
      { text: "[SUCCESS] Architecture healed. Webhook retry successful. Application is stable.", delay: 500 }
    ];

    setLogs([]);
    
    for (const step of sequence) {
      if (step.text === "HEAL") {
        setIsHealed(true);
        continue;
      }
      await new Promise((r) => setTimeout(r, step.delay));
      setLogs((prev) => [...prev, step.text]);
    }
    
    setIsSimulating(false);
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
            My Snippets
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Ultimate Developer Experience Platform</div>
          <div style={{ display: "flex", gap: "12px" }}>
            <span className="badge badge-success" style={{ gap: "6px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", boxShadow: "0 0 6px currentColor" }}></div>
              Agent Online
            </span>
          </div>
        </header>

        <div className="content-area">
          {currentView === "copilot" ? (
            <>
              <header style={{ marginBottom: "40px" }}>
                <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>Integration Copilot</h1>
                <p style={{ fontSize: "16px" }}>Describe your integration. The AI will read the docs and write the code for you.</p>
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
                      <option>HTML/Vanilla JS + PHP</option>
                    </select>
                  </div>
                </div>

                <textarea 
                  placeholder="e.g. Build a Razorpay subscription checkout flow for a SaaS product..."
                  style={{ width: "100%", height: "120px", padding: "16px", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.4)", border: "1px solid var(--border-color)", color: "white", fontSize: "15px", resize: "vertical", marginBottom: "24px", outline: "none", transition: "all 0.2s" }}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !prompt}
                    style={{ padding: "12px 24px", fontSize: "15px" }}
                  >
                    {isGenerating ? <><Loader2 size={18} className="animate-spin" /> Compiling Integration...</> : <><Zap size={18} fill="currentColor" /> Generate Code</>}
                  </button>
                </div>
              </div>

              {result && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", animation: "fadeIn 0.5s ease" }}>
                  {/* Code Viewer / Preview */}
                  <div className="card" style={{ padding: 0, overflow: 'hidden', border: isHealed ? "1px solid var(--success-color)" : "1px solid var(--border-color)", transition: "all 0.5s ease", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", backgroundColor: "rgba(0,0,0,0.4)" }}>
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
                        Live Sandbox
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
                        <div style={{ flex: 1, position: "relative" }}>
                          <button onClick={() => copyToClipboard(currentFiles[activeFile].content)} className="btn btn-secondary" style={{ position: "absolute", top: "16px", right: "16px", padding: "6px 12px", fontSize: "12px", borderRadius: "6px" }}>
                            {copied ? <CheckCircle size={14} color="var(--success-color)" /> : <Copy size={14} />} 
                            {copied ? "Copied!" : "Copy"}
                          </button>
                          <pre style={{ margin: 0, padding: "24px", overflowX: "auto", fontSize: "14px", lineHeight: "1.6", color: isHealed ? "#7ee787" : "#e6edf3", minHeight: "450px", transition: "color 0.5s ease", fontFamily: "var(--font-mono)" }} dangerouslySetInnerHTML={{ __html: highlightCode(currentFiles?.[activeFile]?.content) }}>
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff", backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
                        <div style={{ width: "360px", background: "white", padding: "40px 32px", borderRadius: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", color: "#111827", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                          <div style={{ width: "56px", height: "56px", background: "#000000", borderRadius: "14px", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Zap size={28} color="#ffffff" fill="#ffffff" />
                          </div>
                          <h3 style={{ margin: "0 0 12px 0", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px" }}>Razorpay Checkout</h3>
                          <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "32px", lineHeight: "1.5" }}>Live simulation of the generated component.</p>
                          <button style={{ width: "100%", background: "#000000", color: "white", border: "none", padding: "16px", borderRadius: "8px", fontWeight: "600", fontSize: "16px", cursor: "pointer", transition: "transform 0.1s, box-shadow 0.2s" }} onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"} onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"} onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)"} onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}>
                            Pay ₹999.00
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chaos Engine Panel */}
                  <div className="card" style={{ display: "flex", flexDirection: "column", background: "linear-gradient(180deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%)" }}>
                    <h3 style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 12px 0", fontSize: "16px" }}>
                      <AlertTriangle size={18} color="var(--error-color)" /> Chaos Engine
                    </h3>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: "1.5" }}>
                      Inject synthetic failures to test the resilience of the generated architecture.
                    </p>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--error-color)", border: "1px solid rgba(239, 68, 68, 0.3)", width: "100%", justifyContent: "center", padding: "14px", borderRadius: "8px", fontWeight: 600, cursor: (isSimulating || isHealed) ? "not-allowed" : "pointer", opacity: (isSimulating || isHealed) ? 0.5 : 1, transition: "all 0.2s" }}
                      onClick={simulateChaos}
                      disabled={isSimulating || isHealed}
                    >
                      {isSimulating ? <><Loader2 size={18} className="animate-spin" style={{ marginRight: "8px" }} /> Injecting Payload...</> : "Inject Failure Payload"}
                    </button>

                    <div style={{ flex: 1, backgroundColor: "#000000", borderRadius: "8px", padding: "16px", marginTop: "24px", fontFamily: "var(--font-mono)", fontSize: "13px", overflowY: "auto", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px", minHeight: "220px", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)" }}>
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
                <h1 style={{ fontSize: "32px", letterSpacing: "-0.5px", marginBottom: "8px" }}>My Snippets</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>Access your previously generated integration architectures.</p>
              </header>

              {savedSnippets.length === 0 ? (
                <div style={{ padding: "80px", textAlign: "center", background: "rgba(0,0,0,0.2)", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                  <FileCode2 size={48} color="var(--text-secondary)" style={{ margin: "0 auto 20px", opacity: 0.3 }} />
                  <h3 style={{ marginBottom: "12px", fontSize: "20px" }}>No snippets saved yet</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Generate your first integration in the Copilot to see it here.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" }}>
                  {savedSnippets.map((snippet) => (
                    <div 
                      key={snippet.id} 
                      className="card" 
                      onClick={() => loadSnippet(snippet)}
                      style={{ cursor: "pointer", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 500 }}>
                          <Code size={14} /> {snippet.stack.split(" ")[0]}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "13px" }}>
                          <Clock size={14} /> {snippet.date}
                        </div>
                      </div>
                      
                      <h3 style={{ fontSize: "18px", marginBottom: "16px", lineHeight: "1.4" }}>
                        "{snippet.prompt.length > 65 ? snippet.prompt.substring(0, 65) + "..." : snippet.prompt}"
                      </h3>
                      
                      <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "28px", flex: 1, lineHeight: "1.6" }}>
                        {snippet.result.plan || "Integration files generated successfully."}
                      </p>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
                        <span style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>{snippet.result.files.length} Files</span>
                        <button 
                          onClick={(e) => deleteSnippet(snippet.id, e)}
                          className="btn btn-secondary"
                          style={{ padding: "8px", borderRadius: "8px", color: "var(--text-secondary)" }}
                          title="Delete Snippet"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
