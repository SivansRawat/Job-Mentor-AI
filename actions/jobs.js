"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateTextWithFallback } from "@/lib/ai-provider";

function matchKeywords(text, searchTerm) {
  if (!searchTerm || !text) return true;
  const cleanTerm = searchTerm.toLowerCase().replace(/[-_/]/g, " ").trim();
  const cleanText = text.toLowerCase().replace(/[-_/]/g, " ").trim();
  const tokens = cleanTerm.split(/\s+/).filter((t) => t.length > 2);
  if (tokens.length === 0) return true;
  return tokens.some((token) => cleanText.includes(token));
}

function matchesLocation(jobLocation, filterLocation) {
  if (!filterLocation || filterLocation === "All") return true;
  const jobLoc = (jobLocation || "").toLowerCase();
  const filter = filterLocation.toLowerCase();

  if (filter === "remote") {
    return (
      jobLoc.includes("remote") ||
      jobLoc.includes("worldwide") ||
      jobLoc.includes("anywhere") ||
      jobLoc.includes("global") ||
      jobLoc === ""
    );
  }
  if (filter === "usa" || filter === "us" || filter.includes("america")) {
    return (
      jobLoc.includes("us") ||
      jobLoc.includes("usa") ||
      jobLoc.includes("united states") ||
      jobLoc.includes("america") ||
      jobLoc.includes("remote") ||
      jobLoc.includes("worldwide")
    );
  }
  if (filter === "europe" || filter === "eu") {
    return (
      jobLoc.includes("europe") ||
      jobLoc.includes("uk") ||
      jobLoc.includes("united kingdom") ||
      jobLoc.includes("germany") ||
      jobLoc.includes("france") ||
      jobLoc.includes("remote") ||
      jobLoc.includes("worldwide")
    );
  }
  if (filter === "asia" || filter.includes("india")) {
    return (
      jobLoc.includes("asia") ||
      jobLoc.includes("india") ||
      jobLoc.includes("singapore") ||
      jobLoc.includes("japan") ||
      jobLoc.includes("remote") ||
      jobLoc.includes("worldwide")
    );
  }
  return (
    jobLoc.includes(filter) ||
    jobLoc.includes("remote") ||
    jobLoc.includes("worldwide")
  );
}

async function fetchRealJobsFromAPIs(searchTerm) {
  const realJobs = [];

  // 1. Fetch live jobs from Remotive API
  try {
    const query = searchTerm ? encodeURIComponent(searchTerm) : "software";
    const remotiveUrl = `https://remotive.com/api/remote-jobs?search=${query}&limit=30`;
    const res = await fetch(remotiveUrl, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.jobs && Array.isArray(data.jobs)) {
        data.jobs.forEach((item, idx) => {
          const title = item.title || "";
          const company = item.company_name || "";
          const category = item.category || "";

          if (
            matchKeywords(title, searchTerm) ||
            matchKeywords(company, searchTerm) ||
            matchKeywords(category, searchTerm)
          ) {
            realJobs.push({
              id: `remotive-${item.id || idx}`,
              title,
              company,
              location: item.candidate_required_location || "Remote",
              jobType: item.job_type ? item.job_type.replace(/_/g, " ") : "Full-Time",
              salaryRange: item.salary || "$110k - $160k / yr",
              matchScore: Math.floor(Math.random() * (98 - 88 + 1)) + 88,
              postedAgo: item.publication_date ? item.publication_date.split("T")[0] : "Recently posted",
              experienceLevel: "Mid-Senior",
              requiredSkills: item.tags && item.tags.length > 0 ? item.tags.slice(0, 4) : ["Tech", "Remote", "Engineering"],
              description: item.description ? item.description.replace(/<[^>]+>/g, "").slice(0, 180) + "..." : "Real live job posting.",
              directApplyUrl: item.url,
              companyLogo: item.company_logo || null,
              isLivePosting: true,
            });
          }
        });
      }
    }
  } catch (e) {
    console.error("Remotive fetch error:", e.message);
  }

  // 2. Fetch live jobs from Jobicy API
  try {
    const jobicyUrl = `https://jobicy.com/api/v2/remote-jobs?count=20`;
    const res = await fetch(jobicyUrl, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.jobs && Array.isArray(data.jobs)) {
        data.jobs.forEach((item, idx) => {
          const title = item.jobTitle || item.title || "";
          const category = item.jobCategory || "";

          if (
            matchKeywords(title, searchTerm) ||
            matchKeywords(category, searchTerm)
          ) {
            realJobs.push({
              id: `jobicy-${item.id || idx}`,
              title: title || "Specialist",
              company: item.companyName || "Hiring Company",
              location: item.jobGeo || "Remote",
              jobType: item.jobType?.[0] || "Full-Time",
              salaryRange: item.annualSalaryMin ? `$${item.annualSalaryMin.toLocaleString()} - $${item.annualSalaryMax?.toLocaleString()} / yr` : "Competitive Salary",
              matchScore: Math.floor(Math.random() * (98 - 85 + 1)) + 85,
              postedAgo: item.pubDate ? item.pubDate.split(" ")[0] : "Recently posted",
              experienceLevel: item.jobLevel || "Mid-Senior",
              requiredSkills: [category || "Engineering", "Technology", "Remote"],
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

export async function getJobPostings({ role = "", location = "All", jobType = "All" } = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const targetRole = role || user.industry || "Software Engineer";

  try {
    // 1. Fetch REAL live job postings matching keywords
    let liveJobs = await fetchRealJobsFromAPIs(targetRole);

    // Apply smart location filter
    if (location && location !== "All") {
      liveJobs = liveJobs.filter((j) => matchesLocation(j.location, location));
    }

    // Apply jobType filter
    if (jobType && jobType !== "All") {
      const typeLower = jobType.toLowerCase();
      liveJobs = liveJobs.filter((j) => j.jobType.toLowerCase().includes(typeLower));
    }

    // 2. Generate specific AI role listings if live API results are fewer than 4
    if (liveJobs.length < 4) {
      const userSkills = user.skills?.join(", ") || "JavaScript, React, Node.js, Python";
      const prompt = `
        Generate 6 highly relevant, real-world job openings for the SPECIFIC search role: "${targetRole}".
        Candidate Details:
        - Industry: ${user.industry}
        - Experience Level: ${user.experience || 3} years
        - Skills: ${userSkills}
        - Location: ${location === "All" ? "Remote / Worldwide" : location}

        Requirements:
        1. Job titles MUST be directly relevant to "${targetRole}" (e.g. Senior ${targetRole}, Lead ${targetRole}, Staff ${targetRole}, Principal ${targetRole}).
        2. Companies MUST be real tech/industry companies hiring for this role (e.g. Stripe, Vercel, Datadog, OpenAI, Microsoft, Google, AWS, GitHub, Atlassian).
        3. Match scores should be between 88% and 98%.

        Return ONLY a valid JSON array of objects without markdown wrappers (no \`\`\`json):
        [
          {
            "id": "job-ai-1",
            "title": "string (Targeted Job Title matching ${targetRole})",
            "company": "string (Real Hiring Company Name)",
            "location": "string (e.g. ${location === "All" ? "Remote" : location})",
            "jobType": "Full-Time" | "Remote" | "Contract",
            "salaryRange": "string (e.g. $130k - $170k / yr)",
            "matchScore": number (between 88 and 98),
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
        console.error("AI targeted role generation error:", err);
      }
    }

    // Filter final result set again by location & type
    if (location && location !== "All") {
      liveJobs = liveJobs.filter((j) => matchesLocation(j.location, location));
    }

    // Attach direct application links and search shortcuts
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
