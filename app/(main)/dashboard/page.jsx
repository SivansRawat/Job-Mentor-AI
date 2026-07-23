import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Career Dashboard",
  description: "Track your industry insights, salary trends, top skills, and custom 30-60-90 day career progression roadmap.",
  openGraph: {
    title: "Career Dashboard | AI Job Mentor",
    description: "Track your industry insights, salary trends, top skills, and custom 30-60-90 day career progression roadmap.",
  },
};

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  // If not onboarded, redirect to onboarding page
  // Skip this check if already on the onboarding page
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();

  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} />
    </div>
  );
}
