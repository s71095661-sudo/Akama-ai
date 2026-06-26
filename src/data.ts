import { SubjectConfig } from "./types";

export const SUBJECTS: SubjectConfig[] = [
  {
    id: "general",
    name: "General Helper",
    emoji: "🧠",
    color: "from-indigo-500 to-cyan-500",
    placeholder: "Ask anything you need help studying or understanding...",
    description: "General homework questions, vocabulary, or scheduling."
  },
  {
    id: "math",
    name: "Mathematics",
    emoji: "📐",
    color: "from-purple-500 to-indigo-500",
    placeholder: "Solve 3x² + 5x - 2 = 0, explain standard deviation, etc...",
    description: "Algebra, Calculus, Geometry, Trigonometry, Statistics."
  },
  {
    id: "science",
    name: "Science",
    emoji: "🔬",
    color: "from-emerald-500 to-teal-500",
    placeholder: "How does photosynthesis work? What is gravity? Explain covalent bonds...",
    description: "Physics, Chemistry, Biology, Earth Science."
  },
  {
    id: "essay",
    name: "Literature & Writing",
    emoji: "📚",
    color: "from-pink-500 to-rose-500",
    placeholder: "Analyze Hamlet's soliloquy, brainstorm essay ideas, outline a persuasive paper...",
    description: "Essays, critical reading, spelling, thesis statements."
  },
  {
    id: "code",
    name: "Computer Science",
    emoji: "💻",
    color: "from-cyan-500 to-blue-500",
    placeholder: "Help me write a binary search in Python, explain React props vs state...",
    description: "Programming, algorithms, web dev, debugging."
  },
  {
    id: "history",
    name: "History & Social",
    emoji: "🌍",
    color: "from-amber-500 to-orange-500",
    placeholder: "What caused the French Revolution? Outline the Roman Empire's rise...",
    description: "World history, geography, civics, sociology."
  },
  {
    id: "languages",
    name: "Languages",
    emoji: "🗣️",
    color: "from-teal-500 to-green-500",
    placeholder: "Translate 'Where is the library' into Spanish, explain French conjugations...",
    description: "Spanish, French, German, Japanese, language learning."
  },
  {
    id: "economics",
    name: "Economics",
    emoji: "📊",
    color: "from-violet-500 to-fuchsia-500",
    placeholder: "Explain supply and demand curves, what is inflation, define GDP...",
    description: "Microeconomics, macroeconomics, finance."
  }
];
