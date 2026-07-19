import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resend } from "resend";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

export const generateIndustryInsights = inngest.createFunction(
  { id: "generate-industry-insights", name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // Run every Sunday at midnight
  async ({ event, step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

      const res = await step.ai.wrap(
        "gemini",
        async (p) => {
          return await model.generateContent(p);
        },
        prompt
      );

      const text = res.response.candidates[0].content.parts[0].text || "";
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

      const insights = JSON.parse(cleanedText);

      await step.run(`Update ${industry} insights`, async () => {
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });
    }
  }
);

export const sendWeeklyDigest = inngest.createFunction(
  { id: "send-weekly-digest", name: "Send Weekly Digest" },
  { cron: "0 9 * * 1" }, // Run every Monday at 9 AM
  async ({ step }) => {
    const users = await step.run("Fetch users", async () => {
      return await db.user.findMany({
        where: {
          NOT: {
            industry: null,
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          industry: true,
        },
      });
    });

    for (const user of users) {
      const insight = await step.run(`Fetch insights for ${user.email}`, async () => {
        return await db.industryInsight.findUnique({
          where: { industry: user.industry },
        });
      });

      if (!insight) continue;

      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4f46e5; text-align: center;">Weekly JobMentorAI Digest 🚀</h2>
          <p>Hi ${user.name || "there"},</p>
          <p>Here is your weekly job market pulse report for the <strong>${user.industry}</strong> industry.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Market At A Glance</h3>
            <p>📈 <strong>Growth Rate:</strong> ${insight.growthRate}%</p>
            <p>🎯 <strong>Demand Level:</strong> ${insight.demandLevel}</p>
            <p>💡 <strong>Market Outlook:</strong> ${insight.marketOutlook}</p>
          </div>

          <h3 style="color: #1f2937;">Trending Skills to Acquire</h3>
          <ul style="padding-left: 20px; color: #4b5563;">
            ${insight.topSkills.slice(0, 5).map(skill => `<li>${skill}</li>`).join("")}
          </ul>

          <h3 style="color: #1f2937;">Median Salaries for Core Roles</h3>
          <ul style="padding-left: 20px; color: #4b5563;">
            ${insight.salaryRanges.slice(0, 3).map(r => `<li><strong>${r.role}:</strong> $${r.median.toLocaleString()}</li>`).join("")}
          </ul>

          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
            You are receiving this because you signed up for JobMentorAI updates.
          </div>
        </div>
      `;

      await step.run(`Send email to ${user.email}`, async () => {
        if (!process.env.RESEND_API_KEY) {
          console.warn("RESEND_API_KEY is not defined. Skipping email dispatch.");
          return { skipped: true, reason: "No API Key" };
        }

        try {
          return await resend.emails.send({
            from: "JobMentorAI <onboarding@resend.dev>",
            to: user.email,
            subject: `Weekly Career Pulse - ${user.industry}`,
            html: emailHtml,
          });
        } catch (error) {
          console.error(`Failed to send email to ${user.email}:`, error);
          throw error;
        }
      });
    }
  }
);
