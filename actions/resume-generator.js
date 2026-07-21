"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { generateTextWithFallback } from "@/lib/ai-provider";
import { retrieveUserVectorChunks, formatChunksForPrompt } from "@/lib/rag-helper";

export async function generateAISummary({ role, industry }) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    const targetIndustry = industry || user?.industry || "Software & Technology";
    const targetRole = role || "Professional";

    // RAG Vector Retrieval: Fetch candidate's top matching document chunks
    let ragContext = "";
    if (user) {
      const vectorChunks = await retrieveUserVectorChunks(user.id, `${targetRole} ${targetIndustry}`, 4);
      ragContext = formatChunksForPrompt(vectorChunks);
    }

    const prompt = `
      You are an expert resume strategist. Write a high-impact, professional 3-sentence summary for a ${targetRole} in the ${targetIndustry} industry.
      ${ragContext}
      
      Guidelines:
      1. Sentence 1: Strong title hook with years of domain focus and core competency.
      2. Sentence 2: Key technical strengths, tools, or methodologies mastered (incorporating retrieved candidate vector history if available).
      3. Sentence 3: Demonstrated value/results delivered to organizations (e.g. driving efficiency, scaling systems, optimizing outcomes).

      IMPORTANT: Return ONLY the raw 3-sentence summary text. No introductory filler, quotes, or markdown block tags.
    `;

    const summary = await generateTextWithFallback({ prompt });

    return {
      success: true,
      summary: summary.trim().replace(/^["']|["']$/g, ""),
    };
  } catch (error) {
    console.error("AI summary generation error:", error);
    return { success: false, error: error.message || "Failed to generate summary." };
  }
}

export async function suggestAISkills({ role, industry }) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    const targetIndustry = industry || user?.industry || "Software & Technology";
    const targetRole = role || "Professional";

    // RAG Vector Retrieval
    let ragContext = "";
    if (user) {
      const vectorChunks = await retrieveUserVectorChunks(user.id, `${targetRole} ${targetIndustry}`, 4);
      ragContext = formatChunksForPrompt(vectorChunks);
    }

    const prompt = `
      Provide a comma-separated list of the 12 most relevant, high-demand technical and core soft skills for a ${targetRole} in the ${targetIndustry} industry.
      ${ragContext}

      IMPORTANT: Return ONLY a clean comma-separated list of skill names (e.g., React.js, Node.js, TypeScript, PostgreSQL, System Architecture, Agile Leadership). No bullet points, numbering, or introductory text.
    `;

    const skillsText = await generateTextWithFallback({ prompt });

    return {
      success: true,
      skills: skillsText.trim().replace(/^["']|["']$/g, ""),
    };
  } catch (error) {
    console.error("AI skill suggestion error:", error);
    return { success: false, error: error.message || "Failed to suggest skills." };
  }
}
