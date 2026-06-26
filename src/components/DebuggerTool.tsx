import React, { useState } from "react";
import { motion } from "motion/react";
import { Terminal, Bug, Play, Sparkles, Loader2, Code, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function DebuggerTool() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Python");
  const [errorMsg, setErrorMsg] = useState("");
  const [goal, setGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDebug = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          errorMsg,
          goal,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.text);
      } else {
        setResult(`⚠️ **Debugger error:** ${data.error || "Failed to analyze code segment."}`);
      }
    } catch (err: any) {
      setResult(`❌ **Connection error:** ${err.message || "Could not reach code analysis servers."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSampleCode = () => {
    setCode(`def find_average(numbers):
    total = 0
    for n in numbers:
        total += n
    return total / len(numbers)

# Throws an error when called empty
print(find_average([]))`);
    setLanguage("Python");
    setErrorMsg("ZeroDivisionError: division by zero");
    setGoal("Gracefully return 0 or None if the array list is completely empty instead of crashing.");
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto overflow-y-auto h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] no-scrollbar select-text">
      {/* Header Info */}
      <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/5">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Coding Debugger & Mentor</h2>
            <p className="text-xs text-zinc-400">
              Debug error stack traces, rewrite broken code snippets, and learn the architectural fixes.
            </p>
          </div>
        </div>
        <button
          onClick={loadSampleCode}
          className="text-xs font-semibold px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg text-indigo-400 transition-all shrink-0"
        >
          📂 Load Sample Bug
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input panels */}
        <div className="space-y-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-6 flex flex-col">
          <div className="flex items-center justify-between shrink-0">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Compiler Sandbox</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-300 font-semibold focus:border-indigo-500 outline-none"
              >
                {["Python", "JavaScript", "TypeScript", "Java", "C++", "HTML/CSS", "SQL"].map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 min-h-[220px] relative flex flex-col border border-zinc-850 bg-zinc-950 rounded-2xl overflow-hidden mt-1">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/40 border-b border-zinc-850 text-[11px] text-zinc-500 font-mono">
              <span>src/main.{language === "Python" ? "py" : language === "JavaScript" ? "js" : "ts"}</span>
              <button
                onClick={copyCodeToClipboard}
                className="p-1 hover:text-zinc-300 transition-colors flex items-center gap-1"
                title="Copy current code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your source code or buggy function lines here..."
              className="flex-1 p-4 bg-transparent text-zinc-200 font-mono text-xs leading-relaxed outline-none resize-none overflow-y-auto"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5 shrink-0">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 uppercase">Error Details / Stack Trace</label>
              <input
                type="text"
                value={errorMsg}
                onChange={(e) => setErrorMsg(e.target.value)}
                placeholder="e.g. TypeError or incorrect calculation output"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-700 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 uppercase">Intended Behavior / Goal</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What should the code do?"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-700 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleDebug}
            disabled={!code.trim() || isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-850 disabled:text-zinc-600 disabled:border-zinc-800 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-indigo-600/20 border border-indigo-500/20 cursor-pointer mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mentoring program...</span>
              </>
            ) : (
              <>
                <Bug className="w-4 h-4" />
                <span>Diagnose & Refactor</span>
              </>
            )}
          </button>
        </div>

        {/* Results / Mentor responses */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-6 flex flex-col min-h-[350px]">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-4 shrink-0">
            <Code className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Mentor Analysis Console</h3>
          </div>

          {result ? (
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="markdown-body select-text text-zinc-200 text-sm leading-relaxed space-y-4">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <Terminal className="w-10 h-10 text-zinc-850 mb-3" />
              <p className="text-xs font-semibold">Let's squash some bugs!</p>
              <p className="text-[11px] text-zinc-650 max-w-xs mt-1 leading-relaxed">
                Provide your code, the language selected, and the error. Akama AI will isolate logic flows, optimize execution time, and explain the correction!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
