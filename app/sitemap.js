export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://job-mentor-ai.vercel.app";

  const routes = [
    "",
    "/jobs",
    "/interview",
    "/interview/mock",
    "/interview/speech",
    "/resume",
    "/ai-cover-letter",
    "/ai-cover-letter/new",
    "/advisor",
    "/onboarding",
    "/dashboard",
    "/sign-in",
    "/sign-up",
  ];

  const currentDate = new Date().toISOString();

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "" || route === "/jobs" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/jobs" || route === "/interview" || route === "/resume" ? 0.8 : 0.6,
  }));
}
