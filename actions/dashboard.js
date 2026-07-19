"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateTextWithFallback } from "@/lib/ai-provider";

export const generateAIInsights = async (industry, targetRole = "") => {
  const roleContext = targetRole ? `focusing specifically on the role of "${targetRole}" within the` : "";
  
  const prompt = `
    Analyze the current job market state ${roleContext} ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2"],
      "recommendedSkills": ["skill1", "skill2"],
      "roadmap": {
        "days30": ["action item 1", "action item 2"],
        "days60": ["action item 1", "action item 2"],
        "days90": ["action item 1", "action item 2"]
      }
    }

    IMPORTANT: Return ONLY the JSON object. No markdown wrapping tags (no \`\`\`json).
    Include at least 5 common roles for salary ranges (in USD per year, e.g. 85000).
    Growth rate should be a percentage number (e.g. 14.5).
    Include at least 5 skills, trends, and action roadmap items.
  `;

  const text = await generateTextWithFallback({ prompt });
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  return JSON.parse(cleanedText);
};

export async function fetchCustomRoleInsights(targetRole) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) return { success: false, error: "User not found" };

    const insights = await generateAIInsights(user.industry, targetRole);

    return {
      success: true,
      insights,
    };
  } catch (error) {
    console.error("Error fetching custom role insights:", error);
    return { success: false, error: error.message || "Failed to fetch role insights." };
  }
}

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist, generate baseline insights
  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const { roadmap, ...insightData } = insights;

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insightData,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      ...industryInsight,
      roadmap: insights.roadmap || null,
    };
  }

  return user.industryInsight;
}
