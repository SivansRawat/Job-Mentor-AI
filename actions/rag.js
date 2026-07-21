"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateTextWithFallback } from "@/lib/ai-provider";
import pdf from "pdf-parse";
import crypto from "crypto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

// Helper to chunk text on word boundaries
function chunkText(text, size = 800, overlap = 150) {
  const chunks = [];
  let start = 0;
  
  // Normalize whitespaces
  const cleanedText = text.replace(/\s+/g, " ").trim();

  while (start < cleanedText.length) {
    let end = start + size;
    if (end < cleanedText.length) {
      // Find nearest space to avoid cutting words
      const lastSpace = cleanedText.lastIndexOf(" ", end);
      if (lastSpace > start) {
        end = lastSpace;
      }
    }
    const chunk = cleanedText.slice(start, end).trim();
    if (chunk) {
      chunks.push(chunk);
    }
    start = end - overlap;
    if (start < 0) start = 0;
    if (end >= cleanedText.length) break;
  }
  return chunks;
}

export async function uploadAndEmbedDocument(base64File, fileName, fileType) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) return { success: false, error: "User not found" };

    let rawText = "";

    // 1. Parse content based on file type
    if (fileType === "application/pdf") {
      const buffer = Buffer.from(base64File, "base64");
      const parsedData = await pdf(buffer);
      rawText = parsedData.text || "";
    } else {
      // Decode plain text / markdown files directly
      rawText = Buffer.from(base64File, "base64").toString("utf-8");
    }

    if (!rawText.trim()) {
      return { success: false, error: "Could not extract any content from the document." };
    }

    // 2. Split document into overlapping chunks
    const chunks = chunkText(rawText, 800, 150);

    // 3. Embed and insert chunks in parallel to prevent Vercel 10s timeout
    const embedPromises = chunks.map(async (chunk) => {
      const embedResult = await embeddingModel.embedContent(chunk);
      const vector = embedResult.embedding.values.slice(0, 768);
      const vectorString = `[${vector.join(",")}]`;
      const chunkId = crypto.randomUUID();

      // Insert vector row into Neon pgvector column using raw SQL
      await db.$executeRawUnsafe(`
        INSERT INTO "DocumentChunk" (id, "userId", content, metadata, embedding, "createdAt")
        VALUES ($1, $2, $3, $4::jsonb, $5::vector, NOW())
      `, chunkId, user.id, chunk, JSON.stringify({ fileName }), vectorString);
    });

    await Promise.all(embedPromises);

    return {
      success: true,
      chunkCount: chunks.length,
    };
  } catch (error) {
    console.error("Error processing document RAG embeddings:", error);
    return { success: false, error: error.message || "Failed to embed document." };
  }
}

export async function clearAllDocuments() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) return { success: false, error: "User not found" };

    await db.documentChunk.deleteMany({
      where: { userId: user.id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting chunks:", error);
    return { success: false, error: error.message || "Failed to clear documents." };
  }
}

export async function chatAdvisor(userMessage, chatHistory = []) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) return { success: false, error: "User not found" };

    // 1. Generate vector embedding for the user message
    const embedResult = await embeddingModel.embedContent(userMessage);
    const queryVector = embedResult.embedding.values.slice(0, 768);
    const queryVectorString = `[${queryVector.join(",")}]`;

    // 2. Perform Cosine Similarity vector search on PostgreSQL pgvector column
    const matches = await db.$queryRawUnsafe(`
      SELECT content, metadata, 1 - (embedding <=> $1::vector) AS similarity
      FROM "DocumentChunk"
      WHERE "userId" = $2
      ORDER BY embedding <=> $1::vector ASC
      LIMIT 4
    `, queryVectorString, user.id);

    // 3. Extract matching text fragments to feed as context
    const context = matches && matches.length > 0 
      ? matches.map((m) => {
          const meta = typeof m.metadata === "string" ? JSON.parse(m.metadata) : m.metadata;
          return `[Source: ${meta?.fileName || "Unknown Document"}]\n${m.content}`;
        }).join("\n\n")
      : "No matching documents found in user profile.";

    // 4. Construct system instruction with contextual documents
    const systemPrompt = `
      You are an expert AI Career Coach and Personal Resume Advisor named JobMentorAI.
      You help the user optimize their career, prepare for interviews, audit skills, and outline resumes.

      Below is the context retrieved from the user's uploaded documents (like their resume, certification files, or job targets):
      ---
      ${context}
      ---

      Guidelines:
      1. Always prioritize answers based on the retrieved context above if applicable.
      2. If the user asks general questions or the context is irrelevant, give expert career advice.
      3. Maintain a friendly, supportive, and professional coaching tone.
      4. Highlight specific details from the retrieved documents to back up your guidance.
    `;

    // 5. Structure conversation elements for Gemini API call
    const contents = [
      ...chatHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      {
        role: "user",
        parts: [{ text: userMessage }],
      }
    ];

    const responseText = await generateTextWithFallback({
      prompt: userMessage,
      systemInstruction: systemPrompt,
      contents,
    });

    return {
      success: true,
      responseText,
    };
  } catch (error) {
    console.error("AI Advisor chat crash:", error);
    return { success: false, error: error.message || "Failed to process message." };
  }
}
