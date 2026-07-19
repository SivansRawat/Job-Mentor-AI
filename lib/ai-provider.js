import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Executes an AI text generation prompt with automatic fallback across providers:
 * 1. Gemini (gemini-2.5-flash)
 * 2. Groq (llama-3.3-70b-versatile via GROQ_API_KEY)
 * 3. OpenAI (gpt-4o-mini via OPENAI_API_KEY)
 *
 * @param {Object} params
 * @param {string} params.prompt Main user prompt
 * @param {string} [params.systemInstruction] Optional system instruction
 * @param {Array} [params.contents] Optional full chat contents array
 * @returns {Promise<string>} The generated text response
 */
export async function generateTextWithFallback({ prompt, systemInstruction = "", contents = null }) {
  const errors = [];

  // --- Provider 1: Gemini ---
  if (process.env.GEMINI_API_KEY) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const requestObj = {};
      if (contents && contents.length > 0) {
        requestObj.contents = contents;
      } else {
        requestObj.contents = [{ role: "user", parts: [{ text: prompt }] }];
      }
      if (systemInstruction) {
        requestObj.systemInstruction = systemInstruction;
      }

      const result = await model.generateContent(requestObj);
      const text = result.response.text();
      if (text) return text;
    } catch (err) {
      console.warn("⚠️ Gemini API failed or rate-limited. Trying Groq fallback...", err.message);
      errors.push(`Gemini: ${err.message}`);
    }
  }

  // --- Provider 2: Groq ---
  if (process.env.GROQ_API_KEY) {
    try {
      const messages = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      if (contents && contents.length > 0) {
        contents.forEach((c) => {
          messages.push({
            role: c.role === "user" ? "user" : "assistant",
            content: c.parts?.map((p) => p.text).join("\n") || "",
          });
        });
      } else {
        messages.push({ role: "user", content: prompt });
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          console.log("✅ Successfully generated response using Groq fallback (llama-3.3-70b-versatile).");
          return text;
        }
      } else {
        const errText = await response.text();
        console.warn("⚠️ Groq API failed. Trying OpenAI fallback...", errText);
        errors.push(`Groq: ${errText}`);
      }
    } catch (err) {
      console.warn("⚠️ Groq API connection error:", err.message);
      errors.push(`Groq: ${err.message}`);
    }
  }

  // --- Provider 3: OpenAI ---
  if (process.env.OPENAI_API_KEY) {
    try {
      const messages = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      if (contents && contents.length > 0) {
        contents.forEach((c) => {
          messages.push({
            role: c.role === "user" ? "user" : "assistant",
            content: c.parts?.map((p) => p.text).join("\n") || "",
          });
        });
      } else {
        messages.push({ role: "user", content: prompt });
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          console.log("✅ Successfully generated response using OpenAI fallback (gpt-4o-mini).");
          return text;
        }
      } else {
        const errText = await response.text();
        errors.push(`OpenAI: ${errText}`);
      }
    } catch (err) {
      console.warn("⚠️ OpenAI API connection error:", err.message);
      errors.push(`OpenAI: ${err.message}`);
    }
  }

  throw new Error(`All AI providers failed or rate-limited. Details: ${errors.join(" | ") || "No API keys configured."}`);
}
