"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  Sparkles,
  Loader2,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Clipboard,
  Import,
  ShieldCheck,
  Zap
} from "lucide-react";
import { tailorResumeATS } from "@/actions/resume-tailor";
import ReactMarkdown from "react-markdown";

export function ResumeTailor({ onImportMarkdown }) {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile && selectedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    setFile(selectedFile);
    toast.success(`Uploaded: ${selectedFile.name}`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleTailor = async () => {
    if (!file) {
      toast.error("Please upload your PDF resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please paste the target job description.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const base64PDF = reader.result.split(",")[1];
        const res = await tailorResumeATS(base64PDF, jobTitle, jobDescription);
        if (res.success) {
          setResult(res.result);
          toast.success("Resume tailored successfully!");
        } else {
          toast.error(res.error || "Failed to tailor resume.");
        }
      } catch (err) {
        console.error("Tailor error:", err);
        toast.error("An error occurred while tailoring resume.");
      } finally {
        setLoading(false);
      }
    };
  };

  const copyMarkdown = () => {
    if (result?.tailoredMarkdown) {
      navigator.clipboard.writeText(result.tailoredMarkdown);
      toast.success("Tailored markdown copied to clipboard!");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
      {/* Left Column: Upload & Options */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Target Role Tailor
            </CardTitle>
            <CardDescription>
              Upload your resume & target job description to get an authentic ATS-optimized version.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* PDF Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-2">
                {file ? (
                  <>
                    <FileText className="h-10 w-10 text-primary" />
                    <span className="text-sm font-semibold truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {isDragActive ? "Drop PDF here" : "Drag PDF or click to browse"}
                    </span>
                    <span className="text-xs text-muted-foreground">PDF format only</span>
                  </>
                )}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Target Job Title
                </label>
                <Input
                  placeholder="e.g. Senior Full-Stack Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Target Job Description
                </label>
                <Textarea
                  placeholder="Paste the target job description and requirements here..."
                  className="min-h-[140px] text-xs leading-normal"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Integrity Reminder */}
              <div className="flex items-center gap-2 p-2.5 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                <span>Strict Integrity: Rephrases & optimizes your real experience without fabricating fake history.</span>
              </div>

              <Button
                className="w-full mt-2 flex items-center justify-center gap-2"
                onClick={handleTailor}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Tailoring & Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Tailor Resume with AI
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Loading Screen / Output Results */}
      <div className="lg:col-span-2">
        {loading ? (
          <Card className="border-2 border-primary/30 bg-primary/5 shadow-2xl h-full min-h-[480px] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            {/* Laser Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />

            {/* Radar Pulse */}
            <div className="relative flex items-center justify-center my-6">
              <div className="absolute -inset-4 rounded-full border-2 border-primary/30 animate-ping opacity-75" />
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-tr from-primary/20 to-primary/40 border border-primary/50 flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap className="h-10 w-10 text-primary animate-pulse" />
              </div>
            </div>

            {/* Soundwave Bars */}
            <div className="flex items-center gap-1.5 h-10 my-4">
              <span className="w-1.5 bg-primary/60 rounded-full h-6 animate-bounce" style={{ animationDuration: "0.8s" }} />
              <span className="w-1.5 bg-primary/80 rounded-full h-10 animate-bounce" style={{ animationDuration: "1.1s" }} />
              <span className="w-1.5 bg-primary rounded-full h-8 animate-bounce" style={{ animationDuration: "0.7s" }} />
              <span className="w-1.5 bg-primary/90 rounded-full h-10 animate-bounce" style={{ animationDuration: "1.0s" }} />
              <span className="w-1.5 bg-primary/70 rounded-full h-5 animate-bounce" style={{ animationDuration: "0.9s" }} />
            </div>

            <h3 className="font-bold text-lg text-foreground tracking-tight flex items-center gap-2 mt-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              AI Resume Tailoring in Progress...
            </h3>

            <p className="text-xs text-muted-foreground max-w-sm mt-2 leading-relaxed">
              Extracting candidate achievements, cross-referencing target role requirements, and applying authentic keyword optimization...
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 animate-pulse">
                🔍 Extracting Experience
              </span>
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 animate-pulse" style={{ animationDelay: "200ms" }}>
                ⚡ Aligning Job Keywords
              </span>
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 animate-pulse" style={{ animationDelay: "400ms" }}>
                🛡️ Applying Integrity Guardrails
              </span>
            </div>
          </Card>
        ) : result ? (
          <Card className="border-2 border-primary/20 shadow-xl overflow-hidden space-y-6 p-6">
            {/* Header Score Boost Banner */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5 rounded-xl flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  ATS Match Score Boost
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-muted-foreground line-through">
                    {result.originalScore}%
                  </span>
                  <ArrowRight className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-extrabold text-green-500">
                    {result.newScore}% Match
                  </span>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs px-2.5 py-0.5">
                    +{(result.newScore - result.originalScore)}% Increased
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={copyMarkdown}>
                  <Clipboard className="h-4 w-4 mr-1" /> Copy Markdown
                </Button>
                {onImportMarkdown && (
                  <Button size="sm" onClick={() => onImportMarkdown(result.tailoredMarkdown)}>
                    <Import className="h-4 w-4 mr-1" /> Import into Builder
                  </Button>
                )}
              </div>
            </div>

            {/* Key Authentic Optimizations */}
            {result.keyOptimizations?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Authentic Enhancements Applied
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.keyOptimizations.map((opt, i) => (
                    <div key={i} className="text-xs bg-muted/40 p-2.5 rounded-lg border flex items-start gap-2">
                      <span className="text-green-500 font-bold">•</span>
                      <span className="text-foreground">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tailored Markdown Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tailored Resume Preview
              </h4>
              <div className="border rounded-xl p-6 bg-card text-card-foreground text-xs md:text-sm leading-relaxed max-h-[500px] overflow-y-auto space-y-3 font-sans">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold border-b pb-1 mb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-base font-bold text-primary border-b pb-1 mt-4 mb-2 uppercase tracking-wide" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-2 text-muted-foreground" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />
                  }}
                >
                  {result.tailoredMarkdown}
                </ReactMarkdown>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="border-2 border-dashed h-full min-h-[480px] flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-50 text-primary" />
            <p className="font-semibold text-base text-foreground">No Target Role Tailored Yet</p>
            <p className="text-xs max-w-sm mt-1 leading-relaxed">
              Upload your existing resume PDF, provide the target job title and description, and click Tailor to generate an authentically optimized, high-ATS resume.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
