export function entriesToMarkdown(entries, type) {
  if (!entries?.length) return "";

  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const dateRange = entry.current
          ? `${entry.startDate} - Present`
          : `${entry.startDate} - ${entry.endDate}`;

        let titleHeader = `${entry.title} @ ${entry.organization}`;
        if (type === "Education") {
          const degreeInfo = [entry.degree || entry.title, entry.fieldOfStudy].filter(Boolean).join(" in ");
          titleHeader = `${degreeInfo} @ ${entry.organization}`;
        } else if (type === "Projects") {
          titleHeader = entry.projectUrl ? `[${entry.title}](${entry.projectUrl})` : entry.title;
        }

        let extraLine = "";
        if (type === "Projects" && entry.techStack) {
          extraLine = `\n*Tech Stack: ${entry.techStack}*\n`;
        }

        return `### ${titleHeader}\n*${dateRange}*${extraLine}\n\n${entry.description}`;
      })
      .join("\n\n")
  );
}
export function parseResumeMarkdown(markdown) {
  if (!markdown || typeof markdown !== "string") {
    return {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    };
  }

  const contactInfo = {};
  let summary = "";
  let skills = "";
  const experience = [];
  const education = [];
  const projects = [];

  // Parse Contact Info
  const emailMatch = markdown.match(/📧\s*([^\s|<]+)|mailto:([^\s|>)]+)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) contactInfo.email = emailMatch[1] || emailMatch[2] || emailMatch[3] || "";

  const mobileMatch = markdown.match(/📱\s*([^\n|<|]+)|(\+?[0-9()\s-]{8,20})/);
  if (mobileMatch) contactInfo.mobile = (mobileMatch[1] || mobileMatch[2] || "").trim();

  const linkedinMatch = markdown.match(/💼\s*\[LinkedIn\]\(([^)]+)\)|(https?:\/\/(www\.)?linkedin\.com\/[^\s|)]+)/);
  if (linkedinMatch) contactInfo.linkedin = linkedinMatch[1] || linkedinMatch[2] || "";

  const twitterMatch = markdown.match(/🐦\s*\[Twitter\]\(([^)]+)\)|(https?:\/\/(www\.)?(twitter|x)\.com\/[^\s|)]+)/);
  if (twitterMatch) contactInfo.twitter = twitterMatch[1] || twitterMatch[2] || "";

  // Split into sections by H2
  const sections = markdown.split(/^##\s+/m);

  sections.forEach((section) => {
    const lines = section.trim().split("\n");
    const heading = lines[0]?.trim()?.toLowerCase() || "";
    const body = lines.slice(1).join("\n").trim();

    if (heading.includes("summary")) {
      summary = body;
    } else if (heading.includes("skills")) {
      skills = body
        .replace(/<[^>]+>/g, "")
        .replace(/`([^`]+)`/g, "$1")
        .trim();
    } else if (heading.includes("experience") || heading.includes("work")) {
      parseEntries(body, experience, "experience");
    } else if (heading.includes("education")) {
      parseEntries(body, education, "education");
    } else if (heading.includes("project")) {
      parseEntries(body, projects, "project");
    }
  });

  return { contactInfo, summary, skills, experience, education, projects };
}

function parseEntries(bodyText, targetArray, type) {
  if (!bodyText) return;
  const items = bodyText.split(/^###\s+/m).filter(Boolean);

  items.forEach((item) => {
    const lines = item.trim().split("\n");
    const titleHeader = lines[0]?.trim() || "";
    let startDate = "";
    let endDate = "";
    let current = false;
    let techStack = "";
    let projectUrl = "";
    let degree = "";
    let fieldOfStudy = "";
    let title = titleHeader;
    let organization = "";

    const linkMatch = titleHeader.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      title = linkMatch[1];
      projectUrl = linkMatch[2];
    }

    if (title.includes(" @ ")) {
      const parts = title.split(" @ ");
      title = parts[0].trim();
      organization = parts[1]?.trim() || "";
    }

    if (type === "education" && title.includes(" in ")) {
      const degParts = title.split(" in ");
      degree = degParts[0].trim();
      fieldOfStudy = degParts[1]?.trim() || "";
    }

    const descLines = [];
    lines.slice(1).forEach((line) => {
      const trimmed = line.trim();
      const dateMatch = trimmed.match(/([A-Za-z]{3,9}\s*\d{4}|\d{4})\s*[-–—]\s*(Present|[A-Za-z]{3,9}\s*\d{4}|\d{4})/i);
      if (dateMatch) {
        startDate = dateMatch[1];
        if (dateMatch[2].toLowerCase() === "present") {
          current = true;
        } else {
          endDate = dateMatch[2];
        }
      } else if (trimmed.toLowerCase().startsWith("*tech stack:") || trimmed.toLowerCase().startsWith("tech stack:")) {
        techStack = trimmed.replace(/\*?tech stack:\s*/i, "").replace(/\*/g, "").trim();
      } else if (trimmed) {
        descLines.push(trimmed);
      }
    });

    targetArray.push({
      title: degree || title,
      organization,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      current,
      techStack,
      projectUrl,
      description: descLines.join("\n"),
    });
  });
}
