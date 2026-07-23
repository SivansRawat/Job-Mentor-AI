import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Sign In",
  description: "Sign in to your AI Job Mentor account to access your ATS resume builder, cover letters, and interview coaching.",
};

export default function Page() {
  return <SignIn />;
}
