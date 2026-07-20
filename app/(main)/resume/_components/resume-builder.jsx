"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
  Sparkles,
  Award,
  CheckCircle2,
  Eye,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { saveResume } from "@/actions/resume";
import { generateAISummary, suggestAISkills } from "@/actions/resume-generator";
import { EntryForm } from "./entry-form";
import { ResumePreview } from "./resume-preview";
import { ResumeTailor } from "./resume-tailor";
import { ResumeList } from "./resume-list";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";
import ATSScanner from "./ats-scanner";

export default function ResumeBuilder({ initialContent, resumeData }) {
  const [activeTab, setActiveTab] = useState(resumeData ? "dashboard" : "edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");

  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  // Watch form fields for live preview and strength calculations
  const formValues = watch();

  useEffect(() => {
    if (initialContent) setActiveTab("preview");
  }, [initialContent]);

  // Update preview content when form values change
  useEffect(() => {
    if (activeTab === "edit" || activeTab === "styled-preview") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValues, activeTab]);

  // Handle save result
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  // Calculate real-time Resume Strength score (0 to 100)
  const calculateStrengthScore = () => {
    let score = 0;
    const { contactInfo = {}, summary = "", skills = "", experience = [], education = [], projects = [] } = formValues;

    if (contactInfo.email && (contactInfo.mobile || contactInfo.linkedin)) score += 20;
    if (summary.trim().length > 30) score += 20;
    if (skills.trim().length > 10) score += 20;
    if (experience.length > 0) score += 20;
    if (education.length > 0 || projects.length > 0) score += 20;

    return score;
  };

  const strengthScore = calculateStrengthScore();

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const res = await generateAISummary({ role: "", industry: "" });
      if (res.success) {
        setValue("summary", res.summary);
        toast.success("Professional summary generated!");
      } else {
        toast.error(res.error || "Failed to generate summary.");
      }
    } catch (err) {
      toast.error("Failed to generate summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSuggestSkills = async () => {
    setIsSuggestingSkills(true);
    try {
      const res = await suggestAISkills({ role: "", industry: "" });
      if (res.success) {
        setValue("skills", res.skills);
        toast.success("Industry skills suggested!");
      } else {
        toast.error(res.error || "Failed to suggest skills.");
      }
    } catch (err) {
      toast.error("Failed to suggest skills.");
    } finally {
      setIsSuggestingSkills(false);
    }
  };

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo?.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo?.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo?.linkedin) parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo?.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

    return parts.length > 0
      ? `## <div align="center">${user?.fullName || "Candidate"}</div>\n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("styled-resume-pdf") || document.getElementById("resume-pdf");
      const opt = {
        margin: [4, 4, 4, 4],
        filename: `${user?.fullName?.replace(/\s+/g, "_") || "Resume"}_CV.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await html2pdf().set(opt).from(element).save();
      toast.success("1-Page PDF exported successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to export PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async () => {
    try {
      await saveResumeFn(previewContent);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleImportTailoredMarkdown = (markdown) => {
    setPreviewContent(markdown);
    setActiveTab("preview");
    toast.success("Tailored resume imported into your builder! Click 'Save Resume' to keep changes.");
  };

  return (
    <div data-color-mode="light" className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold gradient-title text-4xl md:text-5xl tracking-tight">
            📄 Resume Builder
          </h1>
          <p className="text-xs text-muted-foreground">
            Craft a tailored, ATS-ready resume with AI summary and skill generation.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="destructive" onClick={handleSubmit(onSubmit)} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Resume
              </>
            )}
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Resume Strength Meter Card */}
      <div className="bg-card border-2 p-4 rounded-xl shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs md:text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-primary" /> Resume Strength Score
          </span>
          <span className={`font-extrabold ${strengthScore >= 80 ? 'text-green-500' : strengthScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
            {strengthScore}% {strengthScore === 100 ? "🎉 Completed!" : "Complete"}
          </span>
        </div>
        <Progress value={strengthScore} className="h-2" />
        <div className="flex items-center justify-between text-[11px] text-muted-foreground flex-wrap gap-2 pt-1">
          <span>{strengthScore < 100 ? "💡 Tip: Add skills & work experience to reach 100%" : "✨ Your resume has all core sections completed!"}</span>
          <span className="flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3 text-green-500" /> ATS-Ready Structure
          </span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full max-w-3xl">
          <TabsTrigger value="dashboard">Saved Resume</TabsTrigger>
          <TabsTrigger value="edit">Form Editor</TabsTrigger>
          <TabsTrigger value="styled-preview">Styled Preview</TabsTrigger>
          <TabsTrigger value="tailor">Smart Tailor</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
          <TabsTrigger value="ats">ATS Audit</TabsTrigger>
        </TabsList>

        {/* Tab 0: Saved Resume Dashboard */}
        <TabsContent value="dashboard">
          <ResumeList resume={resumeData} onSelectEdit={() => setActiveTab("edit")} />
        </TabsContent>

        {/* Tab 1: Form Editor */}
        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-xl bg-muted/40">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Email</label>
                  <Input {...register("contactInfo.email")} type="email" placeholder="your@email.com" />
                  {errors.contactInfo?.email && (
                    <p className="text-xs text-red-500">{errors.contactInfo.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Mobile Number</label>
                  <Input {...register("contactInfo.mobile")} type="tel" placeholder="+1 234 567 8900" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">LinkedIn URL</label>
                  <Input {...register("contactInfo.linkedin")} type="url" placeholder="https://linkedin.com/in/your-profile" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Twitter / X Profile</label>
                  <Input {...register("contactInfo.twitter")} type="url" placeholder="https://twitter.com/your-handle" />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">Professional Summary</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="text-xs border-primary/30 text-primary hover:bg-primary/5"
                >
                  {isGeneratingSummary ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Drafting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" /> AI Generate Summary
                    </>
                  )}
                </Button>
              </div>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32 text-xs md:text-sm leading-relaxed"
                    placeholder="Write a compelling professional summary or click 'AI Generate Summary' above..."
                  />
                )}
              />
              {errors.summary && (
                <p className="text-xs text-red-500">{errors.summary.message}</p>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">Key Skills</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestSkills}
                  disabled={isSuggestingSkills}
                  className="text-xs border-primary/30 text-primary hover:bg-primary/5"
                >
                  {isSuggestingSkills ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Suggesting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" /> AI Suggest Skills
                    </>
                  )}
                </Button>
              </div>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-28 text-xs md:text-sm leading-relaxed"
                    placeholder="List key skills separated by commas (e.g. React.js, Node.js, Python, Leadership)..."
                  />
                )}
              />
              {errors.skills && (
                <p className="text-xs text-red-500">{errors.skills.message}</p>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm type="Experience" entries={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm type="Education" entries={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm type="Project" entries={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </form>
        </TabsContent>

        {/* Tab 2: Live Styled Resume Preview */}
        <TabsContent value="styled-preview">
          <ResumePreview formValues={formValues} user={user} />
        </TabsContent>

        {/* Tab 3: Smart Tailor */}
        <TabsContent value="tailor">
          <ResumeTailor onImportMarkdown={handleImportTailoredMarkdown} />
        </TabsContent>

        {/* Tab 3: Markdown View */}
        <TabsContent value="preview">
          {activeTab === "preview" && (
            <Button
              variant="link"
              type="button"
              className="mb-2"
              onClick={() => setResumeMode(resumeMode === "preview" ? "edit" : "preview")}
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4 mr-1" /> Edit Markdown
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4 mr-1" /> Show Preview
                </>
              )}
            </Button>
          )}

          {activeTab === "preview" && resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600/40 text-yellow-600 bg-yellow-500/5 rounded-lg mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs">
                You will lose custom edited markdown if you subsequently update form data.
              </span>
            </div>
          )}

          <div className="border rounded-xl overflow-hidden shadow-sm">
            <MDEditor value={previewContent} onChange={setPreviewContent} height={700} preview={resumeMode} />
          </div>

          <div className="hidden">
            <div id="resume-pdf">
              <MDEditor.Markdown source={previewContent} style={{ background: "white", color: "black" }} />
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: ATS Audit Scanner */}
        <TabsContent value="ats">
          <ATSScanner />
        </TabsContent>
      </Tabs>
    </div>
  );
}
