import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Sign Up",
  description: "Create a free AI Job Mentor account to start optimizing your resume, practicing mock interviews, and tailoring cover letters.",
};

export default function Page() {
  return <SignUp />;
}
