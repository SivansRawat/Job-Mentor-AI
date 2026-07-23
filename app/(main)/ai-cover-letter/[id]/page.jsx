import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCoverLetter } from "@/actions/cover-letter";
import CoverLetterPreview from "../_components/cover-letter-preview";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const coverLetter = await getCoverLetter(id);

  const title = coverLetter?.jobTitle
    ? `${coverLetter.jobTitle} at ${coverLetter.companyName || "Company"}`
    : "Cover Letter Details";

  return {
    title,
    description: `Tailored cover letter for ${coverLetter?.jobTitle || "target role"} position at ${coverLetter?.companyName || "company"}.`,
    openGraph: {
      title: `${title} | AI Job Mentor`,
      description: `Tailored cover letter for ${coverLetter?.jobTitle || "target role"} position at ${coverLetter?.companyName || "company"}.`,
    },
  };
}

export default async function EditCoverLetterPage({ params }) {
  const { id } = await params;
  const coverLetter = await getCoverLetter(id);

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-2">
        <Link href="/ai-cover-letter">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>

        <h1 className="text-6xl font-bold gradient-title mb-6">
          {coverLetter?.jobTitle} at {coverLetter?.companyName}
        </h1>
      </div>

      <CoverLetterPreview content={coverLetter?.content} />
    </div>
  );
}
