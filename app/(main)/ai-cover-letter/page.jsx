import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

export const metadata = {
  title: "AI Cover Letter Generator",
  description: "Create highly targeted, professional cover letters tailored to specific job roles and hiring managers.",
  keywords: ["AI Cover Letter", "Cover Letter Generator", "Job Application Letters"],
  openGraph: {
    title: "AI Cover Letter Generator | AI Job Mentor",
    description: "Create highly targeted, professional cover letters tailored to specific job roles and hiring managers.",
  },
};

export default async function CoverLetterPage() {
  const coverLetters = await getCoverLetters();

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">My Cover Letters</h1>
        <Link href="/ai-cover-letter/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      <CoverLetterList coverLetters={coverLetters} />
    </div>
  );
}
