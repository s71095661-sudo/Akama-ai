export type SubjectId = "general" | "math" | "science" | "essay" | "code" | "history" | "languages" | "economics";

export interface SubjectConfig {
  id: SubjectId;
  name: string;
  emoji: string;
  color: string;
  placeholder: string;
  description: string;
}

export type WorkspaceTool = "chat" | "solver" | "essay" | "debugger" | "flashcards";

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
  subject?: SubjectId;
  image?: {
    data: string; // base64
    mimeType: string;
  };
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface SolverResult {
  text: string;
}

export interface EssayResult {
  text: string;
}

export interface DebugResult {
  text: string;
}
