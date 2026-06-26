import React, { useState } from "react";
import { motion } from "motion/react";
import { PenTool, CheckCircle2, FileText, ChevronRight, Loader2, Sparkles, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function EssayTool() {
  const [topic, setTopic] = useState("");
  const [thesis, setThesis] = useState("");
  const [instructions, setInstructions] = useState("");
  const [currentDraft, setCurrentDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerateOutline = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          thesis,
          instructions,
          currentDraft,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.text);
      } else {
        setResult(`⚠️ **Feedback Error:** ${data.error || "Failed to analyze draft."}`);
      }
    } catch (err: any) {
      setResult(`❌ **Connection error:** ${err.message || "Could not reach writing assistant server."}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto overflow-y-auto h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] no-scrollbar select-text">
      {/* Header Info */}
      <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-500/5">
          <PenTool className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-100">Literature & Writing Coach</h2>
          <p className="text-xs text-zinc-400">
            Outline thesis statements, check writing flows, restructure arguments, and learn vocabulary pointers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Form Controls */}
        <div className="space-y-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-6">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Essay Blueprint</h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Topic / Essay Prompt *</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Symbolism of water in Hamlet"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Thesis Argument (Optional)</label>
            <textarea
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="e.g. Shakespeare uses water to symbolize the slow unraveling of sanity and spiritual cleansing..."
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500/60 rounded-xl px-4 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Special Guidelines / Length (Optional)</label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Standard 5-paragraph format, strict APA style advice"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Your Current Draft (Optional)</label>
            <textarea
              value={currentDraft}
              onChange={(e) => setCurrentDraft(e.target.value)}
              placeholder="Paste your paragraph or full draft to receive structural and grammar assessment..."
              rows={5}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500/60 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all leading-relaxed"
            />
          </div>

          <button
            onClick={handleGenerateOutline}
            disabled={!topic.trim() || isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-850 disabled:text-zinc-600 disabled:border-zinc-800 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-indigo-600/20 border border-indigo-500/20 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Critiquing structure...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze & Guide My Writing</span>
              </>
            )}
          </button>
        </div>

        {/* Coach Response Panels */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-6 flex flex-col min-h-[350px]">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-4 shrink-0">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Feedback & Blueprint</h3>
          </div>

          {result ? (
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="markdown-body select-text text-zinc-200 text-sm leading-relaxed space-y-4">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <Sparkles className="w-10 h-10 text-zinc-700 mb-3 animate-pulse" />
              <p className="text-xs font-semibold">Ready to draft your perfect essay?</p>
              <p className="text-[11px] text-zinc-600 max-w-xs mt-1 leading-relaxed">
                Provide an essay topic or active paragraph on the left. The AI coach will instantly design structured outlines, check assertions, and provide academic keywords!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
