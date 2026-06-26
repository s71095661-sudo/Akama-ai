import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Image, Trash2, Sparkles, X, ArrowRight, Loader2, Info } from "lucide-react";
import { ChatMessage, SubjectId } from "../types";
import { SUBJECTS } from "../data";
import ReactMarkdown from "react-markdown";

interface ChatToolProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  activeSubject: SubjectId;
  setActiveSubject: (id: SubjectId) => void;
}

export default function ChatTool({
  messages,
  setMessages,
  activeSubject,
  setActiveSubject,
}: ChatToolProps) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeSubjectConfig = SUBJECTS.find((s) => s.id === activeSubject) || SUBJECTS[0];

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedImage) return;

    const userMessageText = inputValue;
    setInputValue("");
    setIsLoading(true);

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessageText || "Analyzed attached image",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      subject: activeSubject,
      image: selectedImage || undefined,
    };

    // Store message
    const updatedHistory = [...messages, newUserMessage];
    setMessages(updatedHistory);
    setSelectedImage(null);

    // Scroll down
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    try {
      // Create chat history body (last 10 messages for context window stability)
      const chatHistory = updatedHistory
        .slice(-10)
        .map((msg) => ({ role: msg.role, content: msg.content }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newUserMessage.content,
          subject: activeSubject,
          history: chatHistory.slice(0, -1), // exclude current message
          image: newUserMessage.image,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const botMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "ai",
          content: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          subject: activeSubject,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "ai",
          content: `⚠️ **Server Error:** ${data.error || "Failed to fetch response. Please verify your GEMINI_API_KEY in the Secrets panel."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          subject: activeSubject,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "ai",
        content: `❌ **Connection Error:** ${err.message || "Could not connect to the assistant backend. Try restarting the development server."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        subject: activeSubject,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Convert uploaded image file to base64
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, WebP) for homework diagrams.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      setSelectedImage({
        data: base64String,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Drag and Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear the entire conversation history?")) {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-160px)]">
      {/* Subject selector ribbon */}
      <div className="flex gap-2 p-3 overflow-x-auto bg-[#141426] border-b border-indigo-950/40 no-scrollbar select-none">
        {SUBJECTS.map((sub) => {
          const isActive = activeSubject === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubject(sub.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 border ${
                isActive
                  ? "bg-indigo-600/30 text-indigo-200 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                  : "bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-300 hover:bg-slate-900/60"
              }`}
            >
              <span>{sub.emoji}</span>
              <span>{sub.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main chat window */}
      <div
        className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0 relative ${
          dragActive ? "border-2 border-dashed border-indigo-500 bg-indigo-950/20" : ""
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto py-12"
            >
              <div className="w-16 h-16 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-[0_0_20px_rgba(99,102,241,0.15)] animate-pulse">
                {activeSubjectConfig.emoji}
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">
                Study Session: {activeSubjectConfig.name}
              </h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                {activeSubjectConfig.description} Akama AI is ready. You can type your homework prompt or drag-and-drop a photo of your problem sheet!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <button
                  onClick={() => setInputValue(`Explain the main formula for ${activeSubjectConfig.name}`)}
                  className="p-3 text-left text-xs text-slate-300 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 rounded-xl hover:border-indigo-500/30 transition-all group flex items-center justify-between"
                >
                  <span>📝 Core formula explanation</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </button>
                <button
                  onClick={() => setInputValue(`How do I start studying ${activeSubjectConfig.name}? Give me a study tip.`)}
                  className="p-3 text-left text-xs text-slate-300 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 rounded-xl hover:border-indigo-500/30 transition-all group flex items-center justify-between"
                >
                  <span>💡 Study tips and tricks</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </button>
              </div>

              <div className="mt-8 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/20 border border-indigo-900/30 text-[11px] text-slate-400 max-w-sm">
                <Info className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                <span>Tip: Drag an image containing equations or study text into this workspace to upload it!</span>
              </div>
            </motion.div>
          ) : (
            messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${
                    msg.role === "user"
                      ? "bg-slate-800 border border-slate-700 text-indigo-400"
                      : "bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border border-indigo-500/30"
                  }`}
                >
                  {msg.role === "user" ? "S" : "🧠"}
                </div>

                {/* Bubble */}
                <div className="space-y-1.5">
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-slate-100 rounded-tr-none shadow-[0_4px_12px_rgba(99,102,241,0.15)]"
                        : "bg-[#18182a] border border-slate-800 text-slate-200 rounded-tl-none"
                    }`}
                  >
                    {/* User uploaded image display */}
                    {msg.image && (
                      <div className="mb-3 max-w-xs overflow-hidden rounded-lg border border-indigo-500/30">
                        <img
                          src={`data:${msg.image.mimeType};base64,${msg.image.data}`}
                          alt="Homework diagram attachment"
                          className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <div className="markdown-body select-text">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                  
                  {/* Timestamp and extra metadata */}
                  <div
                    className={`text-[10px] text-slate-500 flex items-center gap-1.5 px-1 ${
                      msg.role === "user" ? "justify-end" : ""
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.subject && msg.subject !== "general" && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-400/80 font-medium">
                          {SUBJECTS.find((s) => s.id === msg.subject)?.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {/* Loading Message Bubble */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 max-w-[80%]"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center text-white shrink-0 border border-indigo-500/30 shadow-md">
              🧠
            </div>
            <div className="bg-[#18182a] border border-slate-800 px-4 py-3.5 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm text-slate-400 text-xs">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Akama is studying the details and formulas...</span>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar and attachments tray */}
      <div className="p-4 bg-[#0d0d1a] border-t border-indigo-950/40 space-y-3">
        {/* Attachment Thumbnail View */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3 p-2 bg-[#16162d] border border-indigo-500/20 rounded-xl max-w-sm"
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                <img
                  src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`}
                  alt="Attachment preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">Attached diagram</p>
                <p className="text-[10px] text-slate-400">Ready to solve</p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons and Text Area input */}
        <div className="flex items-end gap-2.5">
          <div className="flex-1 bg-slate-950 border border-slate-800 focus-within:border-indigo-500/60 rounded-xl px-3 py-2.5 transition-all flex items-end gap-2 shadow-inner">
            <button
              onClick={triggerFileSelect}
              type="button"
              className={`p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200 transition-all shrink-0 ${
                selectedImage ? "text-indigo-400 hover:text-indigo-300" : ""
              }`}
              title="Attach Homework Photo / Image"
            >
              <Image className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={activeSubjectConfig.placeholder}
              rows={1}
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 border-none outline-none resize-none text-sm leading-relaxed py-1 min-h-[24px] max-h-[120px]"
              style={{ height: "auto" }}
            />
          </div>

          <div className="flex gap-1.5 shrink-0">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-3 bg-slate-900/60 border border-slate-800 hover:border-red-900/40 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-all"
                title="Clear Study History"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleSendMessage}
              disabled={(!inputValue.trim() && !selectedImage) || isLoading}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800/60 text-white rounded-xl transition-all shadow-md hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-500/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
