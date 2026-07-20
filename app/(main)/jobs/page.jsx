import { getJobPostings } from "@/actions/jobs";
import JobList from "./_components/job-list";

export const metadata = {
  title: "Job Openings | AI Job Mentor",
  description: "Explore AI-matched job openings across LinkedIn, Indeed, Wellfound, Google Jobs, Glassdoor, and RemoteOK.",
};

export default async function JobsPage() {
  const result = await getJobPostings();
  const initialPostings = result.success ? result.postings : [];
  const initialRole = result.role || "";

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold gradient-title tracking-tight">
          🎯 Job Openings & Direct Apply
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Discover active job postings matched to your target role and skills. Apply directly across top platforms including LinkedIn, Indeed, Wellfound, Google Jobs, and Glassdoor.
        </p>
      </div>

      <JobList initialPostings={initialPostings} initialRole={initialRole} />
    </div>
  );
}
