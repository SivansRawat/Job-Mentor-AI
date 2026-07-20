"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateTextWithFallback } from "@/lib/ai-provider";

export async function getJobPostings({ role = "", location = "Remote", jobType = "All" } = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const targetRole = role || user.industry || "Software Engineer";
  const userSkills = user.skills?.join(", ") || "JavaScript, React, Node.js";

  const prompt = `
    Generate 6 highly relevant, realistic job openings for a "${targetRole}" position in the "${user.industry}" industry.
    Candidate Profile:
    - Experience Level: ${user.experience || 2} years
    - Top Skills: ${userSkills}
    - Location Filter: ${location}
    - Job Type Filter: ${jobType}

    Return ONLY a valid JSON array of objects without markdown code block wrappers (no \`\`\`json).
    Each object must have the following exact schema:
    [
      {
        "id": "job-1",
        "title": "string (Job Title)",
        "company": "string (Company Name)",
        "location": "string (e.g. Remote, San Francisco CA, New York NY, London UK)",
        "jobType": "Full-Time" | "Remote" | "Contract",
        "salaryRange": "string (e.g. $120k - $150k / yr)",
        "matchScore": number (between 82 and 98),
        "postedAgo": "string (e.g. 2 days ago)",
        "experienceLevel": "string (e.g. Mid-Senior)",
        "requiredSkills": ["skill1", "skill2", "skill3"],
        "description": "string (2 sentence overview of key role responsibilities)"
      }
    ]
  `;

  try {
    const rawContent = await generateTextWithFallback({ prompt });
    const cleanedText = rawContent.replace(/```(?:json)?\n?/g, "").trim();
    const postings = JSON.parse(cleanedText);

    // Attach platform-specific application search URLs
    const formattedPostings = postings.map((job, idx) => {
      const qTitleCompany = encodeURIComponent(`${job.title} ${job.company}`);
      const qTitle = encodeURIComponent(job.title);

      return {
        ...job,
        id: job.id || `job-${idx + 1}`,
        applyLinks: {
          linkedin: `https://www.linkedin.com/jobs/search/?keywords=${qTitleCompany}`,
          indeed: `https://www.indeed.com/jobs?q=${qTitleCompany}`,
          wellfound: `https://wellfound.com/jobs?q=${qTitle}`,
          googleJobs: `https://www.google.com/search?q=${qTitleCompany}+jobs+apply`,
          glassdoor: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${qTitle}`,
          remoteok: `https://remoteok.com/remote-jobs?q=${qTitle}`,
        },
      };
    });

    return {
      success: true,
      role: targetRole,
      postings: formattedPostings,
    };
  } catch (error) {
    console.error("Error fetching job postings:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch job postings",
      postings: [],
    };
  }
}
