"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdf from "pdf-parse";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function scanResumeATS(base64PDF, jobTitle, jobDescription) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!base64PDF) {
    throw new Error("No resume file uploaded.");
  }
  if (!jobDescription) {
    throw new Error("Please provide a target job description to match against.");
  }

  try {
    // 1. Decode base64 PDF into a binary buffer
    const buffer = Buffer.from(base64PDF, "base64");

    // 2. Parse text from PDF
    const parsedData = await pdf(buffer);
    const resumeText = parsedData.text || "";

    if (!resumeText.trim()) {
      throw new Error("We couldn't extract any text from this PDF. Make sure it's not scanned as an image.");
    }

    // 3. Compile prompt for Gemini
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

    // 4. Generate report from Gemini
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    const evaluation = JSON.parse(cleanedText);

    return {
      success: true,
      evaluation,
    };
  } catch (error) {
    console.error("ATS scanner server action error:", error);
    throw new Error(error.message || "Failed to analyze resume. Please try a different PDF formatting.");
  }
}
