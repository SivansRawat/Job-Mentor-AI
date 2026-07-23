import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUserOnboardingStatus } from "@/actions/user";

export const metadata = {
  title: "Career Onboarding & Setup",
  description: "Set up your industry, specialization, experience level, and career goals to personalize your AI career coaching experience.",
  openGraph: {
    title: "Career Onboarding & Setup | AI Job Mentor",
    description: "Set up your industry, specialization, experience level, and career goals to personalize your AI career coaching experience.",
  },
};

export default async function OnboardingPage() {
  // Check if user is already onboarded
  const { isOnboarded } = await getUserOnboardingStatus();

  if (isOnboarded) {
    redirect("/dashboard");
  }

  return (
    <main>
      <OnboardingForm industries={industries} />
    </main>
  );
}
