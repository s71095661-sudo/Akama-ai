import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser configuration with size limits for base64 image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Lazy initializer for Gemini client to prevent crashes if key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please check your secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -------------------- API ENDPOINTS --------------------

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 1. General chat with Akama AI (supports optional image)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, subject, history, image } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGeminiClient();

    // Setup custom system instructions based on the selected subject
    let subjectInstruction = "";
    if (subject && subject !== "general") {
      subjectInstruction = `The student is currently working on the subject: "${subject}". Tailor your explanation to relate to this subject, showing appropriate formulas, notation, or terminology where relevant.`;
    }

    const systemInstruction = `You are "Akama AI", an exceptionally supportive, encouraging, and intelligent personal homework assistant and tutor. 
Your goal is to help students learn, understand, and build confidence, NOT just give them the final answers directly.
- Walk through problems step-by-step when appropriate.
- Explain the underlying concepts in clear, easy-to-understand terms.
- For math/science, write out equations cleanly and explain what each variable stands for.
- Use bullet points, bold text, and numbered steps to make your answers beautiful and highly readable.
- Be supportive, warm, and friendly.
${subjectInstruction}`;

    // Prepare parts
    const parts: any[] = [];
    
    // Add image if present
    if (image && image.data && image.mimeType) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data, // base64 string
        },
      });
    }

    // Prepare history and current context
    // We can simulate a conversation by concatenating the history into a single structured prompt for simplicity and consistency with inline images.
    let fullPrompt = "";
    if (history && Array.isArray(history) && history.length > 0) {
      fullPrompt += "Previous conversation context:\n";
      history.forEach((h: any) => {
        const roleName = h.role === "user" ? "Student" : "Akama AI";
        fullPrompt += `${roleName}: ${h.content}\n`;
      });
      fullPrompt += "\nNew request:\n";
    }

    fullPrompt += message;
    parts.push({ text: fullPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "An error occurred while generating response" });
  }
});

// 2. Step-by-Step homework solver
app.post("/api/solve", async (req, res) => {
  try {
    const { problem, subject, image } = req.body;
    
    if (!problem) {
      return res.status(400).json({ error: "Problem description is required" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a specialist Academic Tutor. The student has submitted a homework problem to solve.
Analyze the problem, identify the core concept being tested, and provide a highly structured step-by-step breakdown.
Format your response into the following sections:
1. **Core Concept**: Explain what principle or idea is being used to solve this problem.
2. **Step-by-Step Walkthrough**: Provide clean, numbered steps. Show any formulas used. Explain each step clearly so a student can reproduce the logic.
3. **Final Solution**: State the final outcome clearly.
4. **Practice Tips**: Provide a short piece of advice or a small hint for solving similar problems on their own.

Do not just write code or equations without comments. Explain the thinking behind each step.`;

    const parts: any[] = [];
    if (image && image.data && image.mimeType) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    parts.push({ text: `Subject: ${subject || "General Study"}\nProblem: ${problem}` });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/solve:", error);
    res.status(500).json({ error: error.message || "An error occurred while solving the problem" });
  }
});

// 3. Essay writing assistant
app.post("/api/essay", async (req, res) => {
  try {
    const { topic, thesis, currentDraft, instructions } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const ai = getGeminiClient();

    const prompt = `Topic: ${topic}
${thesis ? `Student's Thesis Idea: ${thesis}` : ""}
${instructions ? `Specific Instructions: ${instructions}` : ""}
${currentDraft ? `Current Draft:\n--- START DRAFT ---\n${currentDraft}\n--- END DRAFT ---` : ""}`;

    const systemInstruction = `You are an expert Writing Coach and English literature professor.
Your role is to help the student refine their thesis, brainstorm arguments, plan their essay structure, or provide detailed constructive feedback on their draft.
Do NOT write the essay for them. Instead, structure your response as:
- **Thesis Feedback & Strength**: Rate the thesis idea (if provided) and suggest 2-3 ways to make it more specific, argumentative, or clear.
- **Recommended Outline**: Provide a structured five-paragraph or standard essay outline (Introduction, Body Paragraph 1/2/3 with key evidence ideas, and Conclusion).
- **Draft Assessment (if draft provided)**: Identify strengths and key areas for improvement (transition phrases, sentence variety, citation styles, or clarity).
- **Strong Vocabulary Boosters**: Offer 5-6 higher-level academic words or idioms related to the topic that the student can incorporate.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/essay:", error);
    res.status(500).json({ error: error.message || "An error occurred while generating essay guidance" });
  }
});

// 4. Code Debugger & Explanation Console
app.post("/api/debug", async (req, res) => {
  try {
    const { code, language, errorMsg, goal } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code content is required" });
    }

    const ai = getGeminiClient();

    const prompt = `Programming Language: ${language || "Auto-detect"}
Goal of the Code: ${goal || "Not specified"}
Error Message or Issue: ${errorMsg || "Not specified"}
Code:
\`\`\`
${code}
\`\`\``;

    const systemInstruction = `You are a Senior Software Engineer and coding mentor.
Analyze the student's code to find logic bugs, syntax issues, or performance problems.
Respond in a beautiful format with:
- **The Issue**: State clearly what went wrong or why the bug occurred (explain the conceptual error).
- **The Solution Code**: Provide the corrected, clean version of the code. Add standard comments to make it educational.
- **Step-by-Step Fixes**: Explain precisely what changes you made.
- **Learning Takeaway**: Explain a programming pattern or best practice that helps them avoid this error in the future.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/debug:", error);
    res.status(500).json({ error: error.message || "An error occurred while analyzing the code" });
  }
});

// 5. Interactive Flashcard Generator
app.post("/api/flashcards", async (req, res) => {
  try {
    const { topic, amount } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const ai = getGeminiClient();
    const count = Math.min(Math.max(Number(amount) || 5, 3), 15); // limit between 3 and 15

    const prompt = `Generate exactly ${count} educational flashcards about: "${topic}". Make sure the information is concise, factual, and highly relevant for standard exam study.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a specialized study-aid generator. You create accurate, concise, and highly effective learning flashcards containing a question or key term on the front, and a clear, detailed answer or definition on the back.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: {
                type: Type.STRING,
                description: "The term, question, or problem on the front of the flashcard.",
              },
              back: {
                type: Type.STRING,
                description: "The definition, explanation, answer, or solution on the back of the flashcard.",
              },
            },
            required: ["front", "back"],
          },
        },
      },
    });

    const text = response.text || "[]";
    const flashcards = JSON.parse(text);
    res.json({ flashcards });
  } catch (error: any) {
    console.error("Error in /api/flashcards:", error);
    res.status(500).json({ error: error.message || "An error occurred while generating flashcards" });
  }
});

// -------------------- VITE MIDDLEWARE SETUP --------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Akama AI Server running on port ${PORT}`);
  });
}

startServer();
