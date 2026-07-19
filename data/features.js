import {
  BrainCircuit,
  Briefcase,
  LineChart,
  ScrollText,
  Zap,
  Mic,
  MessageSquare,
  Sparkles,
  Target,
  Award
} from "lucide-react";

export const features = [
  {
    icon: <Zap className="w-10 h-10 mb-4 text-primary" />,
    title: "Smart AI Resume Tailor & ATS Optimizer",
    description:
      "Upload your resume & job spec to authentically tailor bullet points and boost ATS match scores to 90%+ without lying.",
  },
  {
    icon: <Mic className="w-10 h-10 mb-4 text-primary" />,
    title: "Multimodal Voice Speech Coach",
    description:
      "Practice speaking interview answers out loud with cross-browser audio analysis, pacing (WPM) tracking, and filler word counts.",
  },
  {
    icon: <MessageSquare className="w-10 h-10 mb-4 text-primary" />,
    title: "AI Career Advisor (RAG & Vector Search)",
    description:
      "Upload your career PDFs and chat with an AI advisor grounded in your documents using pgvector similarity search.",
  },
  {
    icon: <LineChart className="w-10 h-10 mb-4 text-primary" />,
    title: "Role Intelligence & 30-60-90 Roadmap",
    description:
      "Search any job title for on-demand salary guides, skill action bridges, and 30-60-90 day career action plans.",
  },
  {
    icon: <Award className="w-10 h-10 mb-4 text-primary" />,
    title: "Technical Mock Interview Simulator",
    description:
      "Practice role-specific technical quizzes, test your knowledge, and receive instant AI feedback and improvement tips.",
  },
  {
    icon: <ScrollText className="w-10 h-10 mb-4 text-primary" />,
    title: "Intelligent Cover Letter Copywriter",
    description:
      "Generate personalized, high-converting cover letters formatted in business markdown matching target job descriptions.",
  },
];
