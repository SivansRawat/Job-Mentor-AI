import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";

export const metadata = {
  title: "AI Resume Builder & ATS Tailor",
  description: "Build an ATS-optimized resume, tailor experience bullets for targeted job descriptions, and evaluate ATS keyword scores.",
  keywords: ["ATS Resume Builder", "AI Resume Optimization", "Resume Tailor", "ATS Keyword Matcher"],
  openGraph: {
    title: "AI Resume Builder & ATS Tailor | AI Job Mentor",
    description: "Build an ATS-optimized resume, tailor experience bullets for targeted job descriptions, and evaluate ATS keyword scores.",
  },
};

export default async function ResumePage() {
  const resume = await getResume();

  return (
    <div className="container mx-auto py-6">
      <ResumeBuilder initialContent={resume?.content} resumeData={resume} />
    </div>
  );
}
