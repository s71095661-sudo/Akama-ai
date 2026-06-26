import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowLeft, ArrowRight, RotateCw, Check, X, RefreshCw, Loader2, ListCollapse, Plus, HelpCircle } from "lucide-react";
import { Flashcard } from "../types";

export default function FlashcardTool() {
  const [topic, setTopic] = useState("");
  const [amount, setAmount] = useState(5);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Scoring
  const [score, setScore] = useState<Record<number, "know" | "dont-know">>({});

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setFlashcards([]);
    setScore({});
    setCurrentIndex(0);
    setIsFlipped(false);

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, amount }),
      });

      const data = await response.json();
      if (response.ok && data.flashcards) {
        setFlashcards(data.flashcards);
      } else {
        alert("Could not generate flashcards. Please verify backend connection and Secrets configuration.");
      }
    } catch (err: any) {
      alert(`Error reaching helper: ${err.message || "Unknown communication failure."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
      }, 150);
    }
  };

  const handleScore = (status: "know" | "dont-know") => {
    setScore((prev) => ({
      ...prev,
      [currentIndex]: status,
    }));
    // Auto advance if there are more
    if (currentIndex < flashcards.length - 1) {
      setTimeout(handleNext, 400);
    }
  };

  const resetSession = () => {
    setScore({});
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const scoreCount = Object.values(score).filter((v) => v === "know").length;
  const cardsFinished = Object.keys(score).length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto overflow-y-auto h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] no-scrollbar">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">AI Study Flashcards</h2>
            <p className="text-xs text-zinc-400">
              Generate interactive, structured memory triggers instantly about any exam topic.
            </p>
          </div>
        </div>
        {flashcards.length > 0 && (
          <button
            onClick={() => {
              setFlashcards([]);
              setTopic("");
            }}
            className="text-xs font-semibold px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg text-zinc-300 transition-all shrink-0"
          >
            Create New Deck
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {flashcards.length === 0 ? (
          <motion.div
            key="config-deck"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-lg mx-auto space-y-5"
          >
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Deck Configurator</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">What do you want to study?</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Krebs Cycle biology, French conditional tense, WWII timeline..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Number of flashcards</label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 8, 12].map((num) => {
                  const isSelected = amount === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAmount(num)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50"
                          : "bg-zinc-950/60 text-zinc-400 border-zinc-850 hover:text-zinc-300 hover:bg-zinc-950"
                      }`}
                    >
                      {num} Cards
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-850 disabled:text-zinc-600 disabled:border-zinc-800 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-indigo-600/20 border border-indigo-500/20 cursor-pointer pt-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Structuring memory deck...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Build Interactive Deck</span>
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="study-deck"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center space-y-6"
          >
            {/* Progress indicators */}
            <div className="w-full max-w-md flex items-center justify-between text-xs text-zinc-500 font-medium px-1">
              <span>Card {currentIndex + 1} of {flashcards.length}</span>
              <span>Score: {scoreCount} / {cardsFinished} known</span>
            </div>

            {/* Core Flashcard Flipper */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-md h-64 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center relative cursor-pointer select-none hover:border-indigo-500/40 transition-all shadow-lg select-text"
            >
              {/* Card status labels */}
              <div className="absolute top-4 left-4 text-[10px] font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-zinc-600" />
                <span>{isFlipped ? "ANSWER / DEFINITION" : "QUESTION / PHRASE"}</span>
              </div>

              <div className="absolute top-4 right-4 text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-zinc-600 animate-spin-slow" />
                <span>Tap to Flip</span>
              </div>

              {/* Flipped content holder */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={isFlipped ? "back" : "front"}
                  initial={{ opacity: 0, rotateY: isFlipped ? 30 : -30 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: isFlipped ? -30 : 30 }}
                  transition={{ duration: 0.2 }}
                  className="text-center px-4 max-w-sm"
                >
                  <p className={`text-base font-bold leading-relaxed ${isFlipped ? "text-indigo-300 font-medium text-sm sm:text-base" : "text-zinc-100"}`}>
                    {isFlipped ? flashcards[currentIndex].back : flashcards[currentIndex].front}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Scorings stamps */}
              {score[currentIndex] && (
                <div
                  className={`absolute bottom-4 right-4 px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                    score[currentIndex] === "know"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}
                >
                  {score[currentIndex] === "know" ? "I knew this!" : "Study needed"}
                </div>
              )}
            </div>

            {/* Score Buttons / Navigation Controllers */}
            <div className="w-full max-w-md flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScore("dont-know");
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    score[currentIndex] === "dont-know"
                      ? "bg-red-500/20 text-red-300 border-red-500/40"
                      : "bg-zinc-950 hover:bg-zinc-900 text-red-400 border-zinc-850 hover:border-red-500/20"
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span>Still Learning</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScore("know");
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    score[currentIndex] === "know"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-zinc-950 hover:bg-zinc-900 text-emerald-400 border-zinc-850 hover:border-emerald-500/20"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>I Got It!</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 px-1">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-2 bg-zinc-950 border border-zinc-850 rounded-xl hover:border-zinc-700 disabled:opacity-30 disabled:hover:border-zinc-850 text-zinc-300 transition-all flex items-center gap-1.5 text-xs font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>
                
                <button
                  onClick={resetSession}
                  className="p-2 text-zinc-500 hover:text-zinc-300 text-xs flex items-center gap-1 font-semibold"
                  title="Reset Scoring Attempts"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Score</span>
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === flashcards.length - 1}
                  className="p-2 bg-zinc-950 border border-zinc-850 rounded-xl hover:border-zinc-700 disabled:opacity-30 disabled:hover:border-zinc-850 text-zinc-300 transition-all flex items-center gap-1.5 text-xs font-semibold"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Screen Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-30">
          <div className="text-center space-y-4 max-w-sm">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">Generating Flashcards...</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Akama AI is extracting key learning modules, testing parameters, and coding questions and answers for flashcards.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
