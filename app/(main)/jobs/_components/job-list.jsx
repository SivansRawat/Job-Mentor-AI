"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Briefcase,
  MapPin,
  DollarSign,
  ExternalLink,
  Sparkles,
  Search,
  Building2,
  Clock,
  CheckCircle2,
  ChevronDown,
  Globe,
  Loader2,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { getJobPostings } from "@/actions/jobs";

export default function JobList({ initialPostings = [], initialRole = "" }) {
  const [postings, setPostings] = useState(initialPostings);
  const [searchRole, setSearchRole] = useState(initialRole);
  const [locationFilter, setLocationFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await getJobPostings({
        role: searchRole,
        location: locationFilter,
        jobType: typeFilter,
      });

      if (res.success) {
        setPostings(res.postings);
        toast.success(`Found ${res.postings.length} matching job openings!`);
      } else {
        toast.error(res.error || "Failed to search jobs.");
      }
    } catch (err) {
      toast.error("Failed to search jobs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Filters */}
      <form onSubmit={handleSearch} className="bg-card border-2 p-4 md:p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
              placeholder="Search job title (e.g. Full-Stack Developer, AI Architect, Product Manager)..."
              className="pl-9 text-xs md:text-sm h-10"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="h-10 px-6 gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Find Job Openings
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 text-xs border-t">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-muted-foreground flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Filters:
            </span>
            {["All", "Remote", "US / NA", "Asia / India", "Europe"].map((loc) => (
              <Button
                key={loc}
                type="button"
                variant={locationFilter === loc ? "default" : "outline"}
                size="sm"
                onClick={() => setLocationFilter(loc)}
                className="h-7 text-xs rounded-full"
              >
                {loc}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {["All", "Full-Time", "Remote", "Contract"].map((t) => (
              <Button
                key={t}
                type="button"
                variant={typeFilter === t ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTypeFilter(t)}
                className="h-7 text-xs"
              >
                {t}
              </Button>
            ))}
          </div>
        </div>
      </form>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {postings.map((job) => (
          <Card key={job.id} className="border-2 hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
            <CardHeader className="space-y-2 pb-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <CardTitle className="text-base md:text-lg font-bold text-foreground hover:text-primary transition-colors">
                    {job.title}
                  </CardTitle>
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" /> {job.company}
                  </p>
                </div>

                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs font-bold shrink-0">
                  <Sparkles className="h-3 w-3 mr-1" /> {job.matchScore}% Match
                </Badge>
              </div>

              {/* Meta details */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap pt-1">
                <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                  <MapPin className="h-3 w-3 text-primary" /> {job.location}
                </span>
                <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                  <DollarSign className="h-3 w-3 text-green-500" /> {job.salaryRange}
                </span>
                <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                  <Clock className="h-3 w-3" /> {job.postedAgo}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                {job.description}
              </p>

              {/* Skills Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {job.requiredSkills?.map((skill, i) => (
                  <span key={i} className="bg-primary/5 border border-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>

            <CardFooter className="border-t bg-muted/20 pt-3 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-mono">
                {job.experienceLevel || "Mid-Senior"} Level
              </span>

              {/* Apply Direct Multi-Platform Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <span>Apply Direct</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem asChild>
                    <a
                      href={job.applyLinks?.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span className="flex items-center gap-2">💼 Apply on LinkedIn</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <a
                      href={job.applyLinks?.indeed}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span className="flex items-center gap-2">🔍 Apply on Indeed</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <a
                      href={job.applyLinks?.wellfound}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span className="flex items-center gap-2">🚀 Apply on Wellfound</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <a
                      href={job.applyLinks?.googleJobs}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span className="flex items-center gap-2">🌐 Google Jobs Search</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <a
                      href={job.applyLinks?.glassdoor}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span className="flex items-center gap-2">📊 View on Glassdoor</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <a
                      href={job.applyLinks?.remoteok}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span className="flex items-center gap-2">💻 Check RemoteOK</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
