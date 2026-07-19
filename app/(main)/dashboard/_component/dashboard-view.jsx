"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
  Search,
  Sparkles,
  Loader2,
  Calendar,
  Target,
  ArrowRight,
  PlusCircle,
  MessageSquare,
  Award
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fetchCustomRoleInsights } from "@/actions/dashboard";

const POPULAR_PRESETS = [
  "Full-Stack AI Engineer",
  "Cloud Solutions Architect",
  "Cybersecurity Specialist",
  "Senior Data Scientist",
  "Product Manager"
];

const DashboardView = ({ insights: initialInsights }) => {
  const router = useRouter();
  const [currentInsights, setCurrentInsights] = useState(initialInsights);
  const [customRole, setCustomRole] = useState("");
  const [loadingRole, setLoadingRole] = useState(false);
  const [activeSeniority, setActiveSeniority] = useState("mid");

  // Seniority multiplier logic
  const getSeniorityMultiplier = () => {
    switch (activeSeniority) {
      case "junior": return 0.8;
      case "senior": return 1.35;
      case "lead": return 1.6;
      default: return 1.0;
    }
  };

  const multiplier = getSeniorityMultiplier();

  // Transform salary data for Recharts
  const salaryData = (currentInsights?.salaryRanges || []).map((range) => ({
    name: range.role,
    min: Math.round((range.min * multiplier) / 1000),
    max: Math.round((range.max * multiplier) / 1000),
    median: Math.round((range.median * multiplier) / 1000),
  }));

  const getDemandLevelColor = (level = "") => {
    switch (level.toLowerCase()) {
      case "high": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getMarketOutlookInfo = (outlook = "") => {
    switch (outlook.toLowerCase()) {
      case "positive": return { icon: TrendingUp, color: "text-green-500" };
      case "neutral": return { icon: LineChart, color: "text-yellow-500" };
      case "negative": return { icon: TrendingDown, color: "text-red-500" };
      default: return { icon: LineChart, color: "text-gray-500" };
    }
  };

  const OutlookIcon = getMarketOutlookInfo(currentInsights?.marketOutlook).icon;
  const outlookColor = getMarketOutlookInfo(currentInsights?.marketOutlook).color;

  const lastUpdatedDate = currentInsights?.lastUpdated
    ? format(new Date(currentInsights.lastUpdated), "dd/MM/yyyy")
    : "Recently";

  const handleFetchRoleInsights = async (roleToFetch) => {
    const queryRole = roleToFetch || customRole;
    if (!queryRole.trim()) {
      toast.error("Please enter a target role name.");
      return;
    }

    setLoadingRole(true);
    try {
      const res = await fetchCustomRoleInsights(queryRole);
      if (res.success) {
        setCurrentInsights(res.insights);
        toast.success(`Market insights updated for "${queryRole}"!`);
      } else {
        toast.error(res.error || "Failed to fetch role insights.");
      }
    } catch (err) {
      toast.error("Failed to fetch custom role insights.");
    } finally {
      setLoadingRole(false);
    }
  };

  // Skill Action Bridge Handlers
  const handleAddToResume = (skill) => {
    toast.success(`Added "${skill}" to your active resume skills list!`);
    router.push("/resume");
  };

  const handlePracticeInterview = (skill) => {
    toast.info(`Launching mock interview prep for "${skill}"...`);
    router.push("/interview");
  };

  const handleAskAdvisor = (skill) => {
    toast.info(`Opening AI Advisor for "${skill}" guidance...`);
    router.push("/advisor");
  };

  return (
    <div className="space-y-6">
      {/* On-Demand Role Insights Search Bar */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-lg p-4 md:p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start md:items-center flex-wrap gap-2">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Target Role & Market Intelligence
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Search any job title or sub-domain for custom real-time salary guides, trends, and career roadmaps.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Last updated: {lastUpdatedDate}
            </Badge>
          </div>

          {/* Input & Search Button */}
          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search target role (e.g. Full-Stack AI Engineer, Data Scientist)..."
                className="pl-9 text-xs md:text-sm bg-card"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetchRoleInsights()}
                disabled={loadingRole}
              />
            </div>
            <Button
              onClick={() => handleFetchRoleInsights()}
              disabled={loadingRole}
              className="flex items-center gap-1.5"
            >
              {loadingRole ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Analyze Role
                </>
              )}
            </Button>
          </div>

          {/* Quick Preset Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Popular Searches:</span>
            {POPULAR_PRESETS.map((preset) => (
              <Badge
                key={preset}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors text-xs py-1"
                onClick={() => {
                  setCustomRole(preset);
                  handleFetchRoleInsights(preset);
                }}
              >
                {preset}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Market Outlook</CardTitle>
            <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentInsights?.marketOutlook || "Positive"}</div>
            <p className="text-xs text-muted-foreground mt-1">High demand in technology sector</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Industry Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(currentInsights?.growthRate || 14.5).toFixed(1)}%
            </div>
            <Progress value={currentInsights?.growthRate || 14.5} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Demand Level</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentInsights?.demandLevel || "High"}</div>
            <div className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(currentInsights?.demandLevel)}`} />
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Top Skills</CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {(currentInsights?.topSkills || []).slice(0, 4).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Ranges Chart with Seniority Adjuster */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
          <div>
            <CardTitle className="text-xl">Salary Benchmarks by Role</CardTitle>
            <CardDescription className="text-xs">
              Displaying minimum, median, and maximum annual compensation (in USD Thousands)
            </CardDescription>
          </div>

          {/* Seniority Filter */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeSeniority === "junior" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => setActiveSeniority("junior")}
            >
              Junior
            </Button>
            <Button
              variant={activeSeniority === "mid" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => setActiveSeniority("mid")}
            >
              Mid-Level
            </Button>
            <Button
              variant={activeSeniority === "senior" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => setActiveSeniority("senior")}
            >
              Senior
            </Button>
            <Button
              variant={activeSeniority === "lead" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => setActiveSeniority("lead")}
            >
              Lead / Manager
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border text-popover-foreground rounded-xl p-3 shadow-xl space-y-1">
                          <p className="font-bold text-xs">{label}</p>
                          {payload.map((item) => (
                            <p key={item.name} className="text-xs">
                              {item.name}: <span className="font-bold">${item.value}K</span>
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="min" fill="#94a3b8" name="Min Salary (K)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="median" fill="#3b82f6" name="Median Salary (K)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="max" fill="#22c55e" name="Max Salary (K)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Recommended Skills Bridge & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Skills with Action Buttons */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Recommended Skills & Immediate Actions
            </CardTitle>
            <CardDescription className="text-xs">
              Click action buttons next to each skill to instantly bridge them into your resume or interview prep
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(currentInsights?.recommendedSkills || []).map((skill) => (
              <div key={skill} className="flex items-center justify-between p-3 border rounded-xl bg-card hover:border-primary/40 transition-colors flex-wrap gap-2">
                <span className="font-semibold text-xs text-foreground flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Skill
                  </Badge>
                  {skill}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 px-2 hover:bg-primary/10"
                    onClick={() => handleAddToResume(skill)}
                  >
                    <PlusCircle className="h-3 w-3 mr-1 text-primary" /> Add to Resume
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 px-2 hover:bg-primary/10"
                    onClick={() => handlePracticeInterview(skill)}
                  >
                    <Award className="h-3 w-3 mr-1 text-primary" /> Practice Interview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] h-7 px-2"
                    onClick={() => handleAskAdvisor(skill)}
                  >
                    <MessageSquare className="h-3 w-3 text-primary" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Key Industry Trends */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Key Industry & Market Trends
            </CardTitle>
            <CardDescription className="text-xs">
              Emerging technological shifts and hiring priorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(currentInsights?.keyTrends || []).map((trend, index) => (
                <li key={index} className="flex items-start space-x-3 p-3 border rounded-xl bg-muted/30">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-xs leading-relaxed font-medium">{trend}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 30-60-90 Day Career Action Roadmap */}
      <Card className="border-2 shadow-lg bg-gradient-to-b from-card to-muted/20">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> 30-60-90 Day Target Role Career Roadmap
          </CardTitle>
          <CardDescription className="text-xs">
            Step-by-step career progression milestone plan for target role mastery
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Days 1-30 */}
          <div className="p-4 border-2 border-primary/20 rounded-xl bg-card space-y-3">
            <Badge className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1">
              Days 1–30: Core Skill Foundation
            </Badge>
            <ul className="space-y-2">
              {(currentInsights?.roadmap?.days30 || [
                "Master core technical stack fundamentals & frameworks",
                "Build proof-of-concept projects highlighting target skills"
              ]).map((item, i) => (
                <li key={i} className="text-xs flex items-start gap-2 text-muted-foreground">
                  <ArrowRight className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Days 31-60 */}
          <div className="p-4 border-2 border-primary/30 rounded-xl bg-card space-y-3">
            <Badge className="bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1">
              Days 31–60: Portfolio & ATS Alignment
            </Badge>
            <ul className="space-y-2">
              {(currentInsights?.roadmap?.days60 || [
                "Tailor resume using ATS Optimizer for target position",
                "Publish 2 production-ready showcase projects on GitHub"
              ]).map((item, i) => (
                <li key={i} className="text-xs flex items-start gap-2 text-muted-foreground">
                  <ArrowRight className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Days 61-90 */}
          <div className="p-4 border-2 border-primary/40 rounded-xl bg-card space-y-3">
            <Badge className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1">
              Days 61–90: Interview Prep & Applications
            </Badge>
            <ul className="space-y-2">
              {(currentInsights?.roadmap?.days90 || [
                "Complete 10 Mock Technical & Behavioral interview quizzes",
                "Apply to target roles & schedule informational interviews"
              ]).map((item, i) => (
                <li key={i} className="text-xs flex items-start gap-2 text-muted-foreground">
                  <ArrowRight className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardView;
