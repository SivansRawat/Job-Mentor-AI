export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://job-mentor-ai.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
