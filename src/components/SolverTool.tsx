import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calculator, Image, BookOpen, ChevronRight, CheckCircle2, Lightbulb, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function SolverTool() {
  const [problem, setProblem] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSolve = async () => {
    if (!problem.trim() && !selectedImage) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: problem || "Explain the problem in the attached photo sheet.",
          subject,
          image: selectedImage,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.text);
      } else {
        setResult(`⚠️ **Error solving problem:** ${data.error || "Please verify your server config."}`);
      }
    } catch (err: any) {
      setResult(`❌ **Connection error:** ${err.message || "Failed to contact academic server."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        setSelectedImage({
          data: base64String,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const resetSolver = () => {
    setProblem("");
    setResult(null);
    setSelectedImage(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto overflow-y-auto h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] no-scrollbar select-text">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-lg shadow-purple-500/5">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
            Step-by-Step Solver
          </h2>
          <p className="text-xs text-slate-400">
            Get comprehensive, clear explanations for math equations, physics puzzles, and science questions.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 bg-[#111122]/40 border border-slate-900 rounded-2xl p-5 md:p-6"
          >
            {/* Subject Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Domain / Subject
              </label>
              <div className="flex flex-wrap gap-2">
                {["Mathematics", "Physics", "Chemistry", "Biology", "Other"].map((sub) => {
                  const isSelected = subject === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => setSubject(sub)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 border ${
                        isSelected
                          ? "bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-sm"
                          : "bg-slate-950/60 text-slate-400 border-slate-900 hover:text-slate-300 hover:bg-slate-950"
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Problem text input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Describe the problem
              </label>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Type your algebraic equation, calculus limits, forces diagrams, or science question..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Attached sheet container */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={triggerFileSelect}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedImage
                      ? "bg-purple-600/10 text-purple-300 border-purple-500/40"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <Image className="w-4 h-4" />
                  <span>{selectedImage ? "Image Attached" : "Attach Diagram/Photo"}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedImage && (
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <button
                onClick={handleSolve}
                disabled={(!problem.trim() && !selectedImage) || isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-purple-600/20 border border-purple-500/20 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing formula...</span>
                  </>
                ) : (
                  <>
                    <span>Deconstruct & Solve</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {selectedImage && (
              <div className="mt-4 max-w-xs border border-purple-500/20 rounded-xl overflow-hidden shadow-inner bg-slate-950">
                <img
                  src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`}
                  alt="Problem screenshot preview"
                  className="w-full h-auto"
                />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="solver-result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5 bg-[#121224]/60 border border-purple-500/25 rounded-2xl p-5 md:p-6"
          >
            <div className="flex items-center justify-between border-b border-purple-950/40 pb-4">
              <div className="flex items-center gap-2 text-purple-400">
                <BookOpen className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide uppercase">Tutor Analysis & Walkthrough</span>
              </div>
              <button
                onClick={resetSolver}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-semibold transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Solve Another</span>
              </button>
            </div>

            {/* Custom styled columns using markdown components */}
            <div className="markdown-body select-text text-slate-200 text-sm leading-relaxed space-y-4">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>

            <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-xl flex items-start gap-3 mt-6">
              <Lightbulb className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wide">Tutor Tip</h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Don't just look at the final solution! Walk through the logic steps yourself to ensure you understand the mechanism. True mastery comes from active recall.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Screen Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#090912]/80 backdrop-blur-sm flex items-center justify-center p-6 z-30">
          <div className="text-center space-y-4 max-w-sm">
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">Deconstructing Concept...</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Akama AI is identifying parameters, mapping equations, and compiling step-by-step mathematical reasoning.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
