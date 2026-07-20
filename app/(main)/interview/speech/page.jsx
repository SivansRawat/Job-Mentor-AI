"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Mic,
  Square,
  Sparkles,
  Volume2,
  Award,
  Zap,
  RefreshCw,
  ChevronLeft,
  MessageSquare,
  Play,
  CheckCircle2,
  Lightbulb,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { evaluateSpeechAnswer, generateSpeechQuestions } from "@/actions/speech";

const INITIAL_QUESTIONS = [
  "Tell me about yourself and your professional background.",
  "Describe a challenging technical project you worked on and how you resolved the obstacles.",
  "How do you handle disagreements or conflicts within a development team?",
  "What are your greatest professional strengths, and how do they align with your role?",
  "Where do you see yourself in five years, and what are your career aspirations?"
];

const CATEGORIES = [
  { id: "Behavioral", label: "Behavioral (STAR)" },
  { id: "Technical", label: "Technical Deep Dive" },
  { id: "Leadership", label: "Leadership & Conflict" },
  { id: "Problem Solving", label: "Problem Solving" },
  { id: "Custom", label: "Custom Question" },
];

export default function SpeechPracticePage() {
  const [activeCategory, setActiveCategory] = useState("Behavioral");
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [currentQuestion, setCurrentQuestion] = useState(INITIAL_QUESTIONS[0]);
  const [customQuestionInput, setCustomQuestionInput] = useState("");
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Handle timer ticks during recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 120) {
            stopRecording();
            toast.info("Recording reached the 2-minute limit.");
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const handleFetchCategoryQuestions = async (catId) => {
    setActiveCategory(catId);
    if (catId === "Custom") return;

    setIsGeneratingQuestions(true);
    try {
      const res = await generateSpeechQuestions({ category: catId });
      if (res.success && res.questions?.length > 0) {
        setQuestions(res.questions);
        setCurrentQuestion(res.questions[0]);
        toast.success(`Generated 5 AI ${catId} questions!`);
      } else {
        toast.error(res.error || "Failed to generate questions.");
      }
    } catch (err) {
      toast.error("Failed to generate AI questions.");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleApplyCustomQuestion = () => {
    if (!customQuestionInput.trim()) {
      toast.error("Please enter a valid interview question.");
      return;
    }
    setCurrentQuestion(customQuestionInput.trim());
    setEvaluation(null);
    toast.success("Custom question set!");
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    setEvaluation(null);
    setAudioUrl(null);
    setRecordingDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let mimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const localUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localUrl);
        await uploadAndEvaluate(audioBlob, mimeType);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started... Speak clearly into your mic.");
    } catch (err) {
      console.error("Microphone access error:", err);
      toast.error("Failed to access microphone. Please check system permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const uploadAndEvaluate = async (audioBlob, mimeType) => {
    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      try {
        const base64Audio = reader.result.split(",")[1];
        const res = await evaluateSpeechAnswer(base64Audio, currentQuestion, mimeType);
        if (res.success) {
          setEvaluation(res.evaluation);
          toast.success("AI speech evaluation complete!");
        } else {
          toast.error(res.error || "Failed to analyze speech response.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        toast.error(err.message || "Failed to analyze speech.");
      } finally {
        setLoading(false);
      }
    };
  };

  const formatDuration = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center space-x-2">
        <Link href="/interview" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
          <ChevronLeft className="h-4 w-4" /> Back to Prep
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight gradient-title">
            🎙️ AI Multimodal Speech Coach
          </h1>
          <p className="text-sm text-muted-foreground">
            Master spoken interview responses with real-time audio analysis, filler word counts, pacing metrics, and audio playback.
          </p>
        </div>

        <Button
          onClick={() => handleFetchCategoryQuestions(activeCategory)}
          disabled={isGeneratingQuestions || activeCategory === "Custom"}
          variant="outline"
          className="gap-2 shrink-0 border-primary/30 text-primary hover:bg-primary/10"
        >
          {isGeneratingQuestions ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-primary" /> AI Refresh Questions
            </>
          )}
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleFetchCategoryQuestions(cat.id)}
            className="rounded-full text-xs shrink-0"
            disabled={isRecording || loading}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Questions & Audio Recorder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question List Card */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Select Voice Interview Prompt
              </CardTitle>
              <CardDescription className="text-xs">
                {activeCategory === "Custom"
                  ? "Enter a custom question below to practice"
                  : `Showing ${activeCategory} practice prompts`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeCategory === "Custom" ? (
                <div className="flex gap-2">
                  <Input
                    value={customQuestionInput}
                    onChange={(e) => setCustomQuestionInput(e.target.value)}
                    placeholder="Enter custom interview question (e.g. How do you implement a binary search tree?)..."
                    className="text-xs md:text-sm"
                  />
                  <Button onClick={handleApplyCustomQuestion} size="sm" className="shrink-0 gap-1">
                    <Plus className="h-4 w-4" /> Apply
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {questions.map((q, idx) => (
                    <Button
                      key={idx}
                      variant={currentQuestion === q ? "default" : "outline"}
                      className="justify-start text-left h-auto py-3 px-4 whitespace-normal text-xs md:text-sm"
                      onClick={() => {
                        if (!isRecording && !loading) {
                          setCurrentQuestion(q);
                          setEvaluation(null);
                        }
                      }}
                      disabled={isRecording || loading}
                    >
                      <span className="font-bold mr-2 text-primary">{idx + 1}.</span> {q}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audio Recorder Stage */}
          <Card className="border-2 shadow-lg overflow-hidden relative bg-card">
            <CardContent className="p-8 flex flex-col items-center justify-center space-y-6 min-h-[280px]">
              {isRecording && (
                <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
              )}

              <div className="text-center space-y-2 max-w-lg">
                <span className="text-xs uppercase font-semibold text-muted-foreground tracking-widest">Active Question</span>
                <p className="font-bold text-base md:text-lg text-foreground">{currentQuestion}</p>
              </div>

              {isRecording ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex items-center space-x-2 text-red-500 font-mono text-xl animate-pulse">
                    <span className="h-3.5 w-3.5 bg-red-600 rounded-full animate-ping" />
                    <span>{formatDuration(recordingDuration)}</span>
                  </div>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="rounded-full h-16 w-16 p-0 shadow-lg hover:scale-105 transition-transform"
                    onClick={stopRecording}
                  >
                    <Square className="h-6 w-6" />
                  </Button>
                  <span className="text-xs text-muted-foreground">Click stop to submit response for AI analysis</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <Button
                    variant="default"
                    size="lg"
                    className="rounded-full h-20 w-20 p-0 shadow-xl bg-primary hover:bg-primary/95 text-primary-foreground hover:scale-105 transition-transform"
                    onClick={startRecording}
                    disabled={loading}
                  >
                    <Mic className="h-8 w-8" />
                  </Button>
                  <span className="text-sm font-semibold">Start Speaking</span>
                  <span className="text-xs text-muted-foreground">Up to 2 minutes response limit</span>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center space-y-3 z-10 backdrop-blur-sm">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <span className="font-medium animate-pulse">AI is parsing your speech articulation & filler words...</span>
                  <span className="text-xs text-muted-foreground">Analyzing audio response...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Analytics & Recorded Audio Player */}
        <div className="lg:col-span-1">
          {evaluation ? (
            <Card className="border-2 border-primary/30 shadow-xl overflow-hidden h-full flex flex-col justify-between">
              <CardHeader className="bg-muted/50 pb-3 border-b">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <CardTitle className="text-lg">Coach Report Card</CardTitle>
                </div>
                <CardDescription className="text-xs">Instant speech analytics & audio review</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5 flex-1">
                {/* Audio Playback Player */}
                {audioUrl && (
                  <div className="space-y-1.5 bg-muted/40 p-3 rounded-lg border">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Play className="h-3.5 w-3.5 text-primary" /> Listen to Your Voice Recording
                    </span>
                    <audio src={audioUrl} controls className="w-full h-9 rounded" />
                  </div>
                )}

                {/* Score Indicators */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-yellow-500" /> Content Accuracy</span>
                      <span>{evaluation.quizScore}%</span>
                    </div>
                    <Progress value={evaluation.quizScore} className="h-2" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-blue-500" /> Delivery Quality</span>
                      <span>{evaluation.deliveryScore}%</span>
                    </div>
                    <Progress value={evaluation.deliveryScore} className="h-2" />
                  </div>
                </div>

                <hr />

                {/* Speech Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/40 rounded-lg p-3 text-center border">
                    <span className="text-xs text-muted-foreground block mb-0.5">Filler Words</span>
                    <span className="text-2xl font-extrabold text-red-500">{evaluation.fillerWords}</span>
                    <span className="text-[10px] text-muted-foreground block">ums, ahs, likes</span>
                  </div>

                  <div className="bg-muted/40 rounded-lg p-3 text-center border">
                    <span className="text-xs text-muted-foreground block mb-0.5">Speaking Pace</span>
                    <span className="text-xs font-bold block mt-1 leading-tight text-foreground">{evaluation.speakingSpeed}</span>
                  </div>
                </div>

                <hr />

                {/* Coaching Insights */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Volume2 className="h-3.5 w-3.5" /> Transcription
                    </span>
                    <p className="text-xs italic bg-muted/30 p-2.5 rounded border leading-relaxed max-h-28 overflow-y-auto">
                      "{evaluation.transcript}"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Evaluation Summary</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{evaluation.explanation}</p>
                  </div>

                  <div className="space-y-1 bg-primary/5 p-3 rounded-lg border border-primary/15">
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      <Lightbulb className="h-3.5 w-3.5" /> Improvement Tip
                    </span>
                    <p className="text-xs leading-relaxed mt-0.5 text-foreground/90">{evaluation.improvementTip}</p>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t bg-muted/20">
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-1 text-xs"
                  onClick={() => {
                    setEvaluation(null);
                    setAudioUrl(null);
                  }}
                >
                  <RefreshCw className="h-3 w-3" /> Practice Another Prompt
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="border-2 border-dashed h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <Mic className="h-10 w-10 mb-2 opacity-40 text-primary" />
              <p className="font-semibold text-sm">No Active Report</p>
              <p className="text-xs max-w-[200px] mt-1 leading-normal">
                Choose a prompt and click Start Speaking to receive instant speech coaching & filler word analytics.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
