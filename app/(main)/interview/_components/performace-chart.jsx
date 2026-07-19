"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PerformanceChart({ assessments }) {
  const [activeSegment, setActiveSegment] = useState("technical");
  const [quizData, setQuizData] = useState([]);
  const [speechData, setSpeechData] = useState([]);
  const [radarData, setRadarData] = useState([]);

  useEffect(() => {
    if (!assessments?.length) return;

    // Filter Technical Quiz assessments
    const quizzes = assessments.filter((a) => a.category !== "Speech");
    const formattedQuizzes = quizzes.map((a) => ({
      date: format(new Date(a.createdAt), "MMM dd"),
      score: a.quizScore,
    }));
    setQuizData(formattedQuizzes);

    // Filter Speech assessments
    const speeches = assessments.filter((a) => a.category === "Speech");
    const formattedSpeeches = speeches.map((a) => ({
      date: format(new Date(a.createdAt), "MMM dd"),
      contentScore: a.quizScore,
      deliveryScore: a.deliveryScore || 0,
      fillerWords: a.fillerWords || 0,
    }));
    setSpeechData(formattedSpeeches);

    // Compute Radar stats from latest speech assessment if available, else defaults
    if (speeches.length > 0) {
      const latestSpeech = speeches[speeches.length - 1];
      const speedIndex = latestSpeech.speakingSpeed?.toLowerCase().includes("optimal") ? 100 : 60;
      const fillerIndex = Math.max(0, 100 - (latestSpeech.fillerWords || 0) * 12);
      
      setRadarData([
        { subject: "Content Accuracy", A: latestSpeech.quizScore, fullMark: 100 },
        { subject: "Voice Delivery", A: latestSpeech.deliveryScore || 0, fullMark: 100 },
        { subject: "Speech Pacing", A: speedIndex, fullMark: 100 },
        { subject: "Clarity (No Fillers)", A: fillerIndex, fullMark: 100 },
      ]);
    } else {
      setRadarData([
        { subject: "Content Accuracy", A: 0, fullMark: 100 },
        { subject: "Voice Delivery", A: 0, fullMark: 100 },
        { subject: "Speech Pacing", A: 0, fullMark: 100 },
        { subject: "Clarity (No Fillers)", A: 0, fullMark: 100 },
      ]);
    }
  }, [assessments]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart Section */}
      <Card className="lg:col-span-2 border shadow-md">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-4 space-y-2 md:space-y-0 border-b">
          <div>
            <CardTitle className="gradient-title text-3xl">
              Performance Analytics
            </CardTitle>
            <CardDescription>Visualized score trends over time</CardDescription>
          </div>
          <Tabs value={activeSegment} onValueChange={setActiveSegment}>
            <TabsList>
              <TabsTrigger value="technical">Technical Quiz</TabsTrigger>
              <TabsTrigger value="speech">Speech Coach</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-6">
          {activeSegment === "technical" ? (
            quizData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={quizData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload?.length) {
                          return (
                            <div className="bg-background border rounded-lg p-2.5 shadow-md">
                              <p className="text-xs text-muted-foreground mb-0.5">{payload[0].payload.date}</p>
                              <p className="text-sm font-bold text-primary">Score: {payload[0].value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                No technical quizzes taken yet.
              </div>
            )
          ) : speechData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={speechData}>
                  <defs>
                    <linearGradient id="colorContent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDelivery" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        return (
                          <div className="bg-background border rounded-lg p-2.5 shadow-md space-y-1">
                            <p className="text-xs text-muted-foreground mb-0.5">{payload[0].payload.date}</p>
                            <p className="text-xs font-semibold text-blue-500">Content Accuracy: {payload[0].value}%</p>
                            <p className="text-xs font-semibold text-purple-500">Delivery Quality: {payload[1]?.value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area
                    type="monotone"
                    name="Content Accuracy"
                    dataKey="contentScore"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorContent)"
                  />
                  <Area
                    type="monotone"
                    name="Delivery Quality"
                    dataKey="deliveryScore"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDelivery)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
              No speech practices recorded yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Radar Section */}
      <Card className="border shadow-md">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg">Speech Competence</CardTitle>
          <CardDescription>KPI analysis of latest verbal session</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 flex justify-center items-center h-[300px]">
          {speechData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid opacity={0.2} />
                <PolarAngleAxis dataKey="subject" stroke="#888888" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#888888" fontSize={8} />
                <Radar
                  name="Speaker Profile"
                  dataKey="A"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-xs text-muted-foreground p-6 leading-normal">
              Take a voice session to display your speaker profile metrics.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
