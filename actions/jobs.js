"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateTextWithFallback } from "@/lib/ai-provider";

async function fetchRealJobsFromAPIs(searchTerm) {
  const realJobs = [];

  // 1. Fetch live jobs from Remotive API
  try {
    const query = searchTerm ? encodeURIComponent(searchTerm) : "software";
    const remotiveUrl = `https://remotive.com/api/remote-jobs?search=${query}&limit=20`;
    const res = await fetch(remotiveUrl, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.jobs && Array.isArray(data.jobs)) {
        data.jobs.forEach((item, idx) => {
          realJobs.push({
            id: `remotive-${item.id || idx}`,
            title: item.title,
            company: item.company_name,
            location: item.candidate_required_location || "Remote",
            jobType: item.job_type ? item.job_type.replace(/_/g, " ") : "Full-Time",
            salaryRange: item.salary || "Market Competitive Salary",
            matchScore: Math.floor(Math.random() * (98 - 86 + 1)) + 86,
            postedAgo: item.publication_date ? item.publication_date.split("T")[0] : "Recently posted",
            experienceLevel: "Mid-Senior",
            requiredSkills: item.tags && item.tags.length > 0 ? item.tags.slice(0, 4) : ["Software", "Remote", "Engineering"],
            description: item.description ? item.description.replace(/<[^>]+>/g, "").slice(0, 180) + "..." : "Real live job posting.",
            directApplyUrl: item.url,
            companyLogo: item.company_logo || null,
            isLivePosting: true,
          });
        });
      }
    }
  } catch (e) {
    console.error("Remotive fetch error:", e.message);
  }

  // 2. Fetch live jobs from Jobicy API
  try {
    const jobicyUrl = `https://jobicy.com/api/v2/remote-jobs?count=15`;
    const res = await fetch(jobicyUrl, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.jobs && Array.isArray(data.jobs)) {
        data.jobs.forEach((item, idx) => {
          const title = item.jobTitle || item.title || "";
          if (!searchTerm || title.toLowerCase().includes(searchTerm.toLowerCase()) || item.jobCategory?.toLowerCase()?.includes(searchTerm.toLowerCase())) {
            realJobs.push({
              id: `jobicy-${item.id || idx}`,
              title: title || "Software Specialist",
              company: item.companyName || "Hiring Company",
              location: item.jobGeo || "Remote",
              jobType: item.jobType?.[0] || "Full-Time",
              salaryRange: item.annualSalaryMin ? `$${item.annualSalaryMin.toLocaleString()} - $${item.annualSalaryMax?.toLocaleString()} / yr` : "Competitive Salary",
              matchScore: Math.floor(Math.random() * (98 - 85 + 1)) + 85,
              postedAgo: item.pubDate ? item.pubDate.split(" ")[0] : "Recently posted",
              experienceLevel: item.jobLevel || "Mid-Senior",
              requiredSkills: [item.jobCategory || "Engineering", "Technology", "Remote"],
              description: item.jobExcerpt ? item.jobExcerpt.replace(/<[^>]+>/g, "").slice(0, 180) + "..." : "Real live job posting.",
              directApplyUrl: item.url,
              companyLogo: item.companyLogo || null,
              isLivePosting: true,
            });
          }
        });
      }
    }
  } catch (e) {
    console.error("Jobicy fetch error:", e.message);
  }

  return realJobs;
}

export async function getJobPostings({ role = "", location = "Remote", jobType = "All" } = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const targetRole = role || user.industry || "Software Engineer";
  
  try {
    // 1. Fetch REAL live job postings from Remotive & Jobicy APIs
    let liveJobs = await fetchRealJobsFromAPIs(role || targetRole);

    // Apply location & jobType client filter if specified
    if (location !== "All" && location !== "Remote") {
      const locLower = location.toLowerCase();
      liveJobs = liveJobs.filter(j => j.location.toLowerCase().includes(locLower));
    }

    if (jobType !== "All") {
      const typeLower = jobType.toLowerCase();
      liveJobs = liveJobs.filter(j => j.jobType.toLowerCase().includes(typeLower));
    }

    // 2. If API results are fewer than 4, fallback to AI generator to ensure rich list
    if (liveJobs.length < 4) {
      const userSkills = user.skills?.join(", ") || "JavaScript, React, Node.js";
      const prompt = `
        Generate 6 highly realistic, high-quality job openings for a "${targetRole}" position in the "${user.industry}" industry.
        Candidate Profile:
        - Experience Level: ${user.experience || 2} years
        - Top Skills: ${userSkills}
        - Location Filter: ${location}

        Return ONLY a valid JSON array of objects without markdown code block wrappers (no \`\`\`json):
        [
          {
            "id": "job-ai-1",
            "title": "string (Job Title)",
            "company": "string (Real Hiring Company Name e.g. Stripe, Vercel, Datadog)",
            "location": "string (e.g. Remote, San Francisco CA)",
            "jobType": "Full-Time" | "Remote" | "Contract",
            "salaryRange": "string (e.g. $130k - $160k / yr)",
            "matchScore": number (between 85 and 98),
            "postedAgo": "string (e.g. 1 day ago)",
            "experienceLevel": "string (e.g. Mid-Senior)",
            "requiredSkills": ["skill1", "skill2", "skill3"],
            "description": "string (2 sentence role summary)",
            "directApplyUrl": "string"
          }
        ]
      `;

      try {
        const rawContent = await generateTextWithFallback({ prompt });
        const cleanedText = rawContent.replace(/```(?:json)?\n?/g, "").trim();
        const aiPostings = JSON.parse(cleanedText);
        liveJobs = [...liveJobs, ...aiPostings];
      } catch (err) {
        console.error("AI fallback error:", err);
      }
    }

    // Attach platform-specific apply links to every posting
    const formattedPostings = liveJobs.slice(0, 12).map((job, idx) => {
      const qTitleCompany = encodeURIComponent(`${job.title} ${job.company}`);
      const qTitle = encodeURIComponent(job.title);

      const directUrl = job.directApplyUrl || `https://www.linkedin.com/jobs/search/?keywords=${qTitleCompany}`;

      return {
        ...job,
        id: job.id || `job-${idx + 1}`,
        directApplyUrl: directUrl,
        applyLinks: {
          direct: directUrl,
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
    console.error("Error in getJobPostings:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch job postings",
      postings: [],
    };
  }
}
