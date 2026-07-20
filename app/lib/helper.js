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
