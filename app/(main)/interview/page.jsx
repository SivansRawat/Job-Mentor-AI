import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";

export const metadata = {
  title: "AI Interview Preparation",
  description: "Prepare for job interviews with custom quizzes, performance tracking, stats, and real-time AI feedback.",
  keywords: ["Interview Prep", "AI Interview Practice", "Mock Interview AI", "Interview Performance"],
  openGraph: {
    title: "AI Interview Preparation | AI Job Mentor",
    description: "Prepare for job interviews with custom quizzes, performance tracking, stats, and real-time AI feedback.",
  },
};

export default async function InterviewPrepPage() {
  const assessments = await getAssessments();

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">
          Interview Preparation
        </h1>
      </div>
      <div className="space-y-6">
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </div>
    </div>
  );
}
