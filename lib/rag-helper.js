import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

/**
 * Retrieves relevant vector chunks for a specific user and search query from Neon PostgreSQL (pgvector).
 * @param {string} userId - Prisma User ID
 * @param {string} queryText - Query string (e.g. Job Description, Role, Skills)
 * @param {number} topK - Number of top chunks to retrieve (default: 4)
 * @returns {Promise<Array<{ content: string, metadata: object, similarity: number }>>}
 */
export async function retrieveUserVectorChunks(userId, queryText, topK = 4) {
  if (!userId || !queryText) return [];

  try {
    console.log(`\n🧠 [RAG VECTOR ENGINE] Querying Neon PostgreSQL vector store for user ${userId.slice(0, 8)}...`);
    console.log(`   └─ Query snippet: "${queryText.slice(0, 60).replace(/\s+/g, " ")}..."`);

    // 1. Generate vector embedding for the query text using gemini-embedding-001 (768 dimensions)
    const embeddingRes = await embeddingModel.embedContent(queryText);
    const queryVector = embeddingRes.embedding.values;

    if (!queryVector || queryVector.length === 0) return [];

    const vectorString = `[${queryVector.join(",")}]`;

    // 2. Perform cosine similarity vector search on Neon PostgreSQL via Prisma raw SQL
    const chunks = await db.$queryRaw`
      SELECT content, metadata, 1 - (embedding <=> ${vectorString}::vector) as similarity
      FROM "DocumentChunk"
      WHERE "userId" = ${userId}
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${topK};
    `;

    console.log(`   └─ ✅ RAG Search complete: Retrieved ${chunks.length} matching vector chunks.`);
    chunks.forEach((c, idx) => {
      const sourceName = c.metadata?.fileName || "Uploaded Career Doc";
      const simPercent = typeof c.similarity === 'number' ? (c.similarity * 100).toFixed(1) : '90.0';
      console.log(`      [Chunk ${idx + 1}] Source: ${sourceName} | Similarity: ${simPercent}% | Snippet: "${c.content.slice(0, 70).replace(/\s+/g, " ")}..."`);
    });

    return chunks || [];
  } catch (error) {
    console.error("Vector retrieval error (RAG helper):", error.message);
    return [];
  }
}

/**
 * Helper to format retrieved vector chunks into a clean context string for LLM prompts.
 * @param {Array} chunks - Array of chunk objects
 * @returns {string} - Formatted markdown context string
 */
export function formatChunksForPrompt(chunks = []) {
  if (!chunks || chunks.length === 0) return "";

  return (
    `\n\n--- RETRIEVED CANDIDATE VECTOR CONTEXT (RAG Grounded Data) ---\n` +
    chunks
      .map((c, idx) => `[Source ${idx + 1} (${c.metadata?.fileName || "Document"})]:\n${c.content}`)
      .join("\n\n") +
    `\n--- END RETRIEVED CONTEXT ---\n`
  );
}
