"use server";

import { auth } from "@clerk/nextjs/server";
import { generateTextWithFallback } from "@/lib/ai-provider";
import pdf from "pdf-parse";

export async function scanResumeATS(base64PDF, jobTitle, jobDescription) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    if (!base64PDF) {
      return { success: false, error: "No resume file uploaded." };
    }
    if (!jobDescription) {
      return { success: false, error: "Please provide a target job description to match against." };
    }

    // 1. Decode base64 PDF into a binary buffer
    const buffer = Buffer.from(base64PDF, "base64");

    // 2. Parse text from PDF
    const parsedData = await pdf(buffer);
    const resumeText = parsedData.text || "";

    if (!resumeText.trim()) {
      return { success: false, error: "We couldn't extract any text from this PDF. Make sure it's not scanned as an image." };
    }

    // 3. Compile prompt for Gemini / Fallback LLM
    const prompt = `
      You are an expert corporate Recruiter and an Applicant Tracking System (ATS) parsing specialist.
      Evaluate the candidate's resume text against the target job requirements:

      Target Job Title: "${jobTitle || "Not specified"}"
      Target Job Description:
      "${jobDescription}"

      Candidate Resume Text:
      "${resumeText}"

      Perform a rigorous ATS audit and return the response in ONLY the following JSON structure:
      {
        "score": number (integer between 0 and 100 representing ATS match compatibility),
        "missingKeywords": ["string", "string"], (essential skills, languages, or tools present in the job description but absent/underrepresented in the resume)
        "formattingWarnings": ["string"], (issues like non-standard headers, complex tables, columns, or missing core sections)
        "strengths": ["string"], (strong points where the resume matches the job description perfectly)
        "recommendations": ["string"], (clear, actionable list of modifications to improve formatting or keywords)
        "bulletPointRewrite": "string" (a specific sample rewrite of one resume bullet point customized to match this job description using action verbs and metrics)
      }

      IMPORTANT: Return ONLY the JSON object. Do not wrap it in markdown block tags (no \`\`\`json). Output a single clean string.
    `;

    // 4. Generate report using multi-provider fallback engine
    const text = await generateTextWithFallback({ prompt });
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    const evaluation = JSON.parse(cleanedText);

    return {
      success: true,
      evaluation,
    };
  } catch (error) {
    console.error("ATS scanner server action error:", error);
    return { success: false, error: error.message || "Failed to analyze resume. Please try a different PDF formatting." };
  }
}
