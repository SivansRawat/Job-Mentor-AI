"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Mic, Square, Sparkles, Volume2, Award, Zap, RefreshCw, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { evaluateSpeechAnswer } from "@/actions/speech";

const SAMPLE_QUESTIONS = [
  "Tell me about yourself and your professional background.",
  "Describe a challenging technical project you worked on and how you resolved the obstacles.",
  "How do you handle disagreements or conflicts within a development team?",
  "What are your greatest professional strengths, and how do they align with your role?",
  "Where do you see yourself in five years, and what are your career aspirations?"
];

export default function SpeechPracticePage() {
  const [currentQuestion, setCurrentQuestion] = useState(SAMPLE_QUESTIONS[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

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

  const startRecording = async () => {
    audioChunksRef.current = [];
    setEvaluation(null);
    setRecordingDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await uploadAndEvaluate(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started... Speak clearly into your mic.");
    } catch (err) {
      console.error("Microphone access error:", err);
      toast.error("Failed to access microphone. Please check your system settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks on the stream to release the mic
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const uploadAndEvaluate = async (audioBlob) => {
    setLoading(true);
    try {
      // Convert audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(",")[1];
        const res = await evaluateSpeechAnswer(base64Audio, currentQuestion);
        if (res.success) {
          setEvaluation(res.evaluation);
          toast.success("AI speech evaluation complete!");
        }
      };
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to analyze speech.");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center space-x-2">
        <Link href="/interview" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
          <ChevronLeft className="h-4 w-4" /> Back to Prep
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight gradient-title">
          🎙️ AI Speech Coach
        </h1>
        <p className="text-muted-foreground">
          Practice answering behavioral and technical questions verbally. Receive instant analytics on speaking speed, filler word usage, and content clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recording Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Select Question to Practice</CardTitle>
              <CardDescription>Click to change target prompts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                {SAMPLE_QUESTIONS.map((q, idx) => (
                  <Button
                    key={idx}
                    variant={currentQuestion === q ? "default" : "outline"}
                    className="justify-start text-left h-auto py-3 px-4 whitespace-normal"
                    onClick={() => {
                      if (!isRecording && !loading) {
                        setCurrentQuestion(q);
                        setEvaluation(null);
                      }
                    }}
                    disabled={isRecording || loading}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg overflow-hidden relative">
            <CardContent className="p-8 flex flex-col items-center justify-center space-y-6 min-h-[300px]">
              {isRecording && (
                <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
              )}
              
              <div className="text-center space-y-2 max-w-md">
                <span className="text-xs uppercase font-semibold text-muted-foreground tracking-widest">Active Question</span>
                <p className="font-semibold text-lg">{currentQuestion}</p>
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
                  <span className="text-xs text-muted-foreground">Click stop to send for analysis</span>
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
                  <span className="font-medium animate-pulse">AI is parsing your pronunciation and transcription...</span>
                  <span className="text-xs text-muted-foreground">This can take up to 10 seconds.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dynamic Analysis Report Card */}
        <div className="lg:col-span-1">
          {evaluation ? (
            <Card className="border-2 border-primary/20 shadow-xl overflow-hidden h-full">
              <CardHeader className="bg-muted/50 pb-4 border-b">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <CardTitle className="text-lg">Coach Report Card</CardTitle>
                </div>
                <CardDescription>Instant speech analytics</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Score Indicators */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="flex items-center gap-1"><Award className="h-4 w-4 text-yellow-500" /> Content Accuracy</span>
                      <span>{evaluation.quizScore}%</span>
                    </div>
                    <Progress value={evaluation.quizScore} className="h-2" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="flex items-center gap-1"><Zap className="h-4 w-4 text-blue-500" /> Delivery Quality</span>
                      <span>{evaluation.deliveryScore}%</span>
                    </div>
                    <Progress value={evaluation.deliveryScore} className="h-2" />
                  </div>
                </div>

                <hr />

                {/* Speech Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/40 rounded-lg p-3 text-center border">
                    <span className="text-xs text-muted-foreground block mb-1">Filler Words</span>
                    <span className="text-2xl font-bold text-red-500">{evaluation.fillerWords}</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">ums, ahs, likes</span>
                  </div>

                  <div className="bg-muted/40 rounded-lg p-3 text-center border">
                    <span className="text-xs text-muted-foreground block mb-1">Speaking Pace</span>
                    <span className="text-md font-bold block mt-1 leading-tight">{evaluation.speakingSpeed}</span>
                  </div>
                </div>

                <hr />

                {/* Coaching Text */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Volume2 className="h-3.5 w-3.5" /> Transcription
                    </span>
                    <p className="text-xs italic bg-muted/30 p-2.5 rounded border leading-relaxed max-h-32 overflow-y-auto">
                      "{evaluation.transcript}"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Evaluation Summary</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{evaluation.explanation}</p>
                  </div>

                  <div className="space-y-1 bg-primary/5 p-3 rounded-lg border border-primary/10">
                    <span className="text-xs font-bold text-primary block">Improvement Tip</span>
                    <p className="text-xs leading-relaxed mt-0.5">{evaluation.improvementTip}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4 flex items-center gap-1 text-xs"
                  onClick={() => setEvaluation(null)}
                >
                  <RefreshCw className="h-3 w-3" /> Practice Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-dashed h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <Mic className="h-10 w-10 mb-2 opacity-50" />
              <p className="font-semibold text-sm">No Active Report</p>
              <p className="text-xs max-w-[200px] mt-1 leading-normal">
                Choose a question and click start to run voice coaching.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
