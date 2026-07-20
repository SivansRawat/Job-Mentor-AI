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
  ChevronDown,
  Loader2,
  Filter,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { getJobPostings } from "@/actions/jobs";

export default function JobList({ initialPostings = [], initialRole = "" }) {
  const [postings, setPostings] = useState(initialPostings);
  const [searchRole, setSearchRole] = useState(initialRole);
  const [locationFilter, setLocationFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(false);

  const fetchPostingsWith = async (targetRole, loc, type) => {
    setIsLoading(true);
    try {
      const res = await getJobPostings({
        role: targetRole,
        location: loc,
        jobType: type,
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

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchPostingsWith(searchRole, locationFilter, typeFilter);
  };

  const handleLocationChange = (loc) => {
    setLocationFilter(loc);
    fetchPostingsWith(searchRole, loc, typeFilter);
  };

  const handleTypeChange = (type) => {
    setTypeFilter(type);
    fetchPostingsWith(searchRole, locationFilter, type);
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
              placeholder="Search job title (e.g. Software Engineer, AI Developer, Data Scientist, Product Manager)..."
              className="pl-9 text-xs md:text-sm h-10"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="h-10 px-6 gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search Live Jobs
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 text-xs border-t">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-muted-foreground flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Region:
            </span>
            {["All", "Remote", "USA", "Europe", "Asia"].map((loc) => (
              <Button
                key={loc}
                type="button"
                variant={locationFilter === loc ? "default" : "outline"}
                size="sm"
                onClick={() => handleLocationChange(loc)}
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
                onClick={() => handleTypeChange(t)}
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
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base md:text-lg font-bold text-foreground hover:text-primary transition-colors">
                      {job.title}
                    </CardTitle>
                    {job.isLivePosting && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold py-0 px-2 flex items-center gap-1">
                        <Zap className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500 animate-pulse" /> Live Opening
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" /> {job.company}
                  </p>
                </div>

                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold shrink-0">
                  <Sparkles className="h-3 w-3 mr-1" /> {job.matchScore}% Match
                </Badge>
              </div>

              {/* Meta details */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap pt-1">
                <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                  <MapPin className="h-3 w-3 text-primary" /> {job.location}
                </span>
                <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                  <DollarSign className="h-3 w-3 text-emerald-500" /> {job.salaryRange}
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

            <CardFooter className="border-t bg-muted/20 pt-3 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] text-muted-foreground font-mono">
                {job.jobType || "Full-Time"}
              </span>

              <div className="flex items-center space-x-2">
                {/* Direct Live Application Link */}
                <a
                  href={job.directApplyUrl || job.applyLinks?.direct || job.applyLinks?.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs">
                    <span>Apply Direct</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>

                {/* More Platforms Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1.5 px-2.5">
                      <span>More Platforms</span>
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
                        <span className="flex items-center gap-2">💼 LinkedIn Jobs</span>
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
                        <span className="flex items-center gap-2">🔍 Indeed Jobs</span>
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
                        <span className="flex items-center gap-2">🚀 Wellfound / AngelList</span>
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
                        <span className="flex items-center gap-2">📊 Glassdoor Search</span>
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
                        <span className="flex items-center gap-2">💻 RemoteOK Search</span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
