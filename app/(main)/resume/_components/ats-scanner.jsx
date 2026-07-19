"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Upload, FileText, AlertTriangle, CheckCircle2, 
  Sparkles, RefreshCw, Loader2, Clipboard, ArrowRight 
} from "lucide-react";
import { scanResumeATS } from "@/actions/resume-scanner";

export default function ATSScanner() {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  // File Dropzone configuration
  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile?.type !== "application/pdf") {
      toast.error("Please upload a PDF file only.");
      return;
    }
    setFile(selectedFile);
    toast.success(`Selected file: ${selectedFile.name}`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleScan = async () => {
    if (!file) {
      toast.error("Please drag & drop or click to upload your PDF resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please paste the target job description to match against.");
      return;
    }

    setLoading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64PDF = reader.result.split(",")[1];
        const res = await scanResumeATS(base64PDF, jobTitle, jobDescription);
        if (res.success) {
          setReport(res.evaluation);
          toast.success("Resume scanned successfully!");
        }
      };
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
      {/* Upload Zone & Form */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Upload Resume</CardTitle>
            <CardDescription>Drag and drop your PDF resume</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
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
                      {isDragActive ? "Drop the PDF here" : "Drag PDF or click to browse"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PDF format only (Max 5MB)
                    </span>
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
                  placeholder="e.g. Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Job Description
                </label>
                <Textarea
                  placeholder="Paste the responsibilities and requirements of the target position..."
                  className="min-h-[150px] text-xs leading-normal"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                className="w-full mt-4 flex items-center justify-center gap-2"
                onClick={handleScan}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scanning & Critiquing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Audit with AI
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Output Section */}
      <div className="lg:col-span-2">
        {report ? (
          <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4 border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">ATS Match Audit Report</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => setReport(null)}>
                  <RefreshCw className="h-3 w-3 mr-1" /> Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Score bar */}
              <div className="bg-muted/30 border p-4 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-muted-foreground">ATS Compatibility Score</span>
                  <p className="text-xs text-muted-foreground">Aim for 80%+ to match standard resume parsers</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className={`text-4xl font-extrabold ${report.score >= 80 ? 'text-green-500' : report.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {report.score}%
                  </span>
                </div>
              </div>
              <Progress value={report.score} className="h-2" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Missing keywords */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" /> Missing Key Terms
                  </span>
                  {report.missingKeywords?.length > 0 ? (
                    <ul className="space-y-1.5">
                      {report.missingKeywords.map((word, i) => (
                        <li key={i} className="text-xs flex items-center gap-2 bg-yellow-500/5 px-2.5 py-1.5 rounded border border-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                          <ArrowRight className="h-3 w-3" /> {word}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">No missing keywords found!</p>
                  )}
                </div>

                {/* Formatting Warnings */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-red-500" /> Formatting Caveats
                  </span>
                  {report.formattingWarnings?.length > 0 ? (
                    <ul className="space-y-1.5">
                      {report.formattingWarnings.map((warn, i) => (
                        <li key={i} className="text-xs flex items-center gap-2 bg-red-500/5 px-2.5 py-1.5 rounded border border-red-500/10 text-red-600 dark:text-red-400">
                          <ArrowRight className="h-3 w-3" /> {warn}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground text-green-500 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resume is formatting compliant!
                    </p>
                  )}
                </div>
              </div>

              <hr />

              {/* Strengths & Recommendations */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase block">Strengths</span>
                  <div className="grid grid-cols-1 gap-2">
                    {report.strengths?.map((str, i) => (
                      <p key={i} className="text-xs flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> {str}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase block">Actionable Enhancements</span>
                  <div className="grid grid-cols-1 gap-2">
                    {report.recommendations?.map((rec, i) => (
                      <p key={i} className="text-xs flex items-center gap-2 text-muted-foreground">
                        <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" /> {rec}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <hr />

              {/* AI Bullet Point Rewrite */}
              {report.bulletPointRewrite && (
                <div className="space-y-2 bg-primary/5 p-4 rounded-xl border border-primary/10 relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> Sample Bullet Point Rewrite
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-primary"
                      onClick={() => copyToClipboard(report.bulletPointRewrite)}
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground font-mono bg-muted/40 p-2.5 rounded border">
                    "{report.bulletPointRewrite}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-dashed h-full min-h-[450px] flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-55" />
            <p className="font-semibold text-base">No Scan Performed</p>
            <p className="text-xs max-w-sm mt-1 leading-relaxed">
              Upload your PDF resume, specify the targeted job title and description, and click audit to scan for keyword density and formatting layout compliance.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
