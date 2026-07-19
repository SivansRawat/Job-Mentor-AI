"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function evaluateSpeechAnswer(base64Audio, question) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const prompt = `
    You are an expert communication coach and hiring manager.
    Analyze the user's audio response answering the following interview question:
    Question: "${question}"

    Analyze the user's spoken answer (provided in the audio part of this request). Evaluate:
    1. Content completeness and accuracy (based on their industry and standard hiring expectations).
    2. Delivery factors:
       - Speaking speed (Words Per Minute, and whether it's too fast, optimal, or too slow).
       - Counts of filler words (e.g., "um", "uh", "ah", "like", "you know").
       - Tone and clarity.

    Return the response in ONLY the following JSON format:
    {
      "transcript": "Full text transcription of what the user said",
      "quizScore": number (0 to 100 representing content accuracy score),
      "deliveryScore": number (0 to 100 representing articulation/delivery quality score),
      "fillerWords": number (count of filler words),
      "speakingSpeed": "Optimal (~130 wpm)" or "Too fast" or "Too slow",
      "explanation": "Detailed breakdown of the content score and delivery score.",
      "improvementTip": "One or two actionable, encouraging sentences for improvement."
    }

    IMPORTANT: Return ONLY raw JSON. No additional text, notes, or markdown formatting (no \`\`\`json blocks).
  `;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Audio,
          mimeType: "audio/webm",
        },
      },
      prompt,
    ]);

    const text = result.response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const evaluation = JSON.parse(cleanedText);

    // Save the assessment to the database
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: evaluation.quizScore,
        category: "Speech",
        questions: [
          {
            question: question,
            answer: "Verbal answer submitted via voice",
            userAnswer: evaluation.transcript,
            isCorrect: evaluation.quizScore >= 70,
            explanation: evaluation.explanation,
          },
        ],
        improvementTip: evaluation.improvementTip,
        deliveryScore: evaluation.deliveryScore,
        fillerWords: evaluation.fillerWords,
        speakingSpeed: evaluation.speakingSpeed,
        transcript: evaluation.transcript,
      },
    });

    return {
      success: true,
      assessmentId: assessment.id,
      evaluation,
    };
  } catch (error) {
    console.error("Error evaluating speech response:", error);
    throw new Error("Failed to analyze voice recording. Make sure your microphone was clear.");
  }
}
