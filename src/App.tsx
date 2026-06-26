import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, Calculator, PenTool, Terminal, Sparkles, BookOpen, 
  HelpCircle, Star, Brain, ChevronRight, Activity, Clock, Award, Flame, Zap
} from "lucide-react";
import { WorkspaceTool, ChatMessage, SubjectId } from "./types";
import { SUBJECTS } from "./data";

// Tool components
import ChatTool from "./components/ChatTool";
import SolverTool from "./components/SolverTool";
import EssayTool from "./components/EssayTool";
import DebuggerTool from "./components/DebuggerTool";
import FlashcardTool from "./components/FlashcardTool";

export default function App() {
  const [activeTool, setActiveTool] = useState<WorkspaceTool>("chat");
  const [activeSubject, setActiveSubject] = useState<SubjectId>("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streak, setStreak] = useState(3);
  const [studyMinutes, setStudyMinutes] = useState(42);
  const [completionPercentage, setCompletionPercentage] = useState(68);

  // Motivational suggestions or study wisdom that cycles or displays dynamically
  const [studyWisdom, setStudyWisdom] = useState(
    "Spaced repetition improves retention by 40%. Generate study flashcards to study for tomorrow's vocabulary test!"
  );

  useEffect(() => {
    // Pick random study suggestions based on active tool changes
    const suggestions: Record<WorkspaceTool, string[]> = {
      chat: [
        "Ask Akama: 'Give me a practice question about quadratic formulas.'",
        "Stuck on a diagram? Drag and drop the homework screenshot directly into the chat!",
        "Struggling with a concept? Ask Akama to explain it in simple terms with an example."
      ],
      solver: [
        "Need step-by-step math advice? Paste your algebraic or trigonometric limits.",
        "Solve: 3x² + 5x - 2 = 0 to see a step-by-step breakdown with tutor comments.",
        "Paste physics forces diagrams descriptions to view resolved horizontal vectors."
      ],
      essay: [
        "Paste your literature thesis idea. Akama will give feedback on its analytical strength.",
        "Request an outline for a five-paragraph critical commentary about Romeo and Juliet.",
        "Add strict instructions such as APA citation parameters or formatting constraints."
      ],
      debugger: [
        "Debug code files by specifying programming language configurations.",
        "Click 'Load Sample Bug' to witness logic correction step-by-step.",
        "Ask Akama: 'Rewrite this recursive Fibonacci function in Python using memoization.'"
      ],
      flashcards: [
        "Study memory cards about biology cellular divisions or geography trivia.",
        "Tag cards as 'I Got It' or 'Still Learning' to refine study intervals.",
        "Reset scoring metrics at any moment to test active recall limits."
      ]
    };

    const toolSuggestions = suggestions[activeTool];
    const randomTip = toolSuggestions[Math.floor(Math.random() * toolSuggestions.length)];
    setStudyWisdom(randomTip);
  }, [activeTool]);

  return (
    <div className="w-full min-h-screen bg-[#09090b] text-zinc-100 flex flex-col md:flex-row font-sans overflow-x-hidden p-3 md:p-5 gap-4 md:gap-5 select-none">
      
      {/* Sidebar Navigation Widget */}
      <aside className="w-full md:w-64 bg-zinc-900 rounded-3xl border border-zinc-800/80 p-5 flex flex-col justify-between gap-6">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-indigo-600/30">
              🧠
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">Akama AI</h1>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Homework Suite</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-3 mb-1">
              Study Terminals
            </span>
            <button
              onClick={() => setActiveTool("chat")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all border ${
                activeTool === "chat"
                  ? "bg-zinc-800/65 text-white border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                  : "bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <MessageSquare className="w-4.5 h-4.5 text-indigo-400" />
              <span>Interactive Tutor Chat</span>
            </button>
            <button
              onClick={() => setActiveTool("solver")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all border ${
                activeTool === "solver"
                  ? "bg-zinc-800/65 text-white border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                  : "bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <Calculator className="w-4.5 h-4.5 text-purple-400" />
              <span>Step-by-Step Solver</span>
            </button>
            <button
              onClick={() => setActiveTool("essay")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all border ${
                activeTool === "essay"
                  ? "bg-zinc-800/65 text-white border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                  : "bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <PenTool className="w-4.5 h-4.5 text-rose-400" />
              <span>Writing & Essay Coach</span>
            </button>
            <button
              onClick={() => setActiveTool("debugger")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all border ${
                activeTool === "debugger"
                  ? "bg-zinc-800/65 text-white border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                  : "bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <Terminal className="w-4.5 h-4.5 text-cyan-400" />
              <span>Coding Debug Console</span>
            </button>
            <button
              onClick={() => setActiveTool("flashcards")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all border ${
                activeTool === "flashcards"
                  ? "bg-zinc-800/65 text-white border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                  : "bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <Sparkles className="w-4.5 h-4.5 text-amber-400" />
              <span>Active Study Flashcards</span>
            </button>
          </nav>
        </div>

        {/* Promo and Settings */}
        <div className="mt-auto hidden md:block">
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full filter blur-xl"></div>
            <p className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest mb-1.5">Study Buddy Pro</p>
            <p className="text-xs text-indigo-200/90 leading-relaxed mb-3">
              Unlimited uploads for equations diagrams & documents solving.
            </p>
            <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all">
              Activate Pro Mode
            </button>
          </div>
        </div>
      </aside>

      {/* Main Bento Grid Container */}
      <main className="flex-1 grid grid-cols-12 grid-rows-12 gap-4 min-h-0 select-text">
        
        {/* Main Workspace Terminal Component */}
        <div className="col-span-12 md:col-span-8 row-span-12 md:row-span-8 bg-zinc-900 rounded-3xl border border-zinc-800/80 flex flex-col overflow-hidden shadow-2xl relative">
          
          {/* Top Panel Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">terminal / workspace /</span>
              <span className="text-xs font-mono text-zinc-200 font-bold">{activeTool}.edu</span>
            </div>
            
            {/* Standard Mac-style buttons for pure aesthetics */}
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
            </div>
          </div>

          {/* Interactive Workspace Area */}
          <div className="flex-1 min-h-0">
            {activeTool === "chat" && (
              <ChatTool
                messages={messages}
                setMessages={setMessages}
                activeSubject={activeSubject}
                setActiveSubject={setActiveSubject}
              />
            )}
            {activeTool === "solver" && <SolverTool />}
            {activeTool === "essay" && <EssayTool />}
            {activeTool === "debugger" && <DebuggerTool />}
            {activeTool === "flashcards" && <FlashcardTool />}
          </div>
        </div>

        {/* Daily Study Status Widget */}
        <div className="col-span-12 md:col-span-4 row-span-12 md:row-span-4 bg-zinc-900 rounded-3xl border border-zinc-800/80 p-5 md:p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Session Progress</h3>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] rounded-full font-bold uppercase border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active
              </span>
            </div>
            
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold tracking-tight text-white">{studyMinutes}m</span>
              <span className="text-xs font-medium text-zinc-500">studied today</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
              Your daily streak is currently active. Review 5 more flashcards to achieve today's goal!
            </p>
          </div>

          {/* Sparkles micro-graph for aesthetics */}
          <div className="h-14 flex items-end gap-1.5 pt-4">
            <div className="w-full h-[20%] bg-zinc-800 rounded-lg hover:bg-zinc-750 transition-all cursor-pointer" title="Monday: 15m"></div>
            <div className="w-full h-[45%] bg-zinc-800 rounded-lg hover:bg-zinc-750 transition-all cursor-pointer" title="Tuesday: 32m"></div>
            <div className="w-full h-[25%] bg-zinc-800 rounded-lg hover:bg-zinc-750 transition-all cursor-pointer" title="Wednesday: 18m"></div>
            <div className="w-full h-[90%] bg-indigo-500/90 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer" title="Today: 42m"></div>
            <div className="w-full h-[35%] bg-zinc-800 rounded-lg hover:bg-zinc-750 transition-all cursor-pointer" title="Tomorrow Goal: 25m"></div>
          </div>
        </div>

        {/* AI Copilot Guidance Widget */}
        <div className="col-span-12 md:col-span-4 row-span-12 md:row-span-4 bg-indigo-600 rounded-3xl p-5 md:p-6 text-white flex flex-col justify-between shadow-xl relative overflow-hidden group">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 rounded-full filter blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform"></div>

          <div className="z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 animate-bounce" />
                <span>AI Tutor Suggestion</span>
              </h3>
            </div>
            
            <p className="text-sm md:text-base font-semibold leading-relaxed tracking-tight text-indigo-50 mt-1">
              "{studyWisdom}"
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-indigo-500/40 z-10 shrink-0">
            <span className="text-[10px] text-indigo-200 font-mono">Model: Gemini 3.5 Flash</span>
            <button 
              onClick={() => {
                // Instantly focus or execute the recommendation
                if (activeTool !== "flashcards") {
                  setActiveTool("flashcards");
                }
              }}
              className="bg-white hover:bg-zinc-100 text-indigo-600 font-bold py-1.5 px-3.5 rounded-xl text-xs transition-all shadow-md active:scale-95"
            >
              Learn Now
            </button>
          </div>
        </div>

        {/* System Load / Academic Strength Tracker Widget */}
        <div className="col-span-12 md:col-span-4 row-span-12 md:row-span-4 bg-zinc-900 rounded-3xl border border-zinc-800/80 p-5 md:p-6 flex flex-col justify-between shadow-lg">
          <div>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Study Metrics</h3>
            
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1 font-medium">
                  <span className="flex items-center gap-1">📐 Mathematics</span>
                  <span className="font-mono">80% mastered</span>
                </div>
                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                  <div className="bg-purple-500 h-full w-[80%] rounded-full shadow-[0_0_8px_rgba(168,85,247,0.3)]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1 font-medium">
                  <span className="flex items-center gap-1">🔬 Physics & Chemistry</span>
                  <span className="font-mono">55% mastered</span>
                </div>
                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                  <div className="bg-emerald-500 h-full w-[55%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1 font-medium">
                  <span className="flex items-center gap-1">💻 Computer Science</span>
                  <span className="font-mono">90% mastered</span>
                </div>
                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                  <div className="bg-cyan-500 h-full w-[90%] rounded-full shadow-[0_0_8px_rgba(6,182,212,0.3)]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-zinc-800/60 pt-3.5 mt-4 shrink-0">
            <div className="flex items-center gap-1">
              <Flame className="text-amber-500 w-4 h-4" />
              <span className="text-xs font-bold text-zinc-300">{streak} Day Streak</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="text-yellow-400 w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold text-zinc-300">Focus Mode</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
