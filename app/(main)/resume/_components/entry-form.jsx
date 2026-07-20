// app/resume/_components/entry-form.jsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { entrySchema } from "@/app/lib/schema";
import { Sparkles, PlusCircle, X, Pencil, Save, Loader2, Link2, Code2, GraduationCap, Building2, Briefcase } from "lucide-react";
import { improveWithAI } from "@/actions/resume";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = parse(dateString, "yyyy-MM", new Date());
    if (isNaN(date.getTime())) return dateString;
    return format(date, "MMM yyyy");
  } catch (e) {
    return dateString;
  }
};

const DEGREE_OPTIONS = [
  "B.Tech (Bachelor of Technology)",
  "M.Tech (Master of Technology)",
  "B.C.A. (Bachelor of Computer Applications)",
  "M.C.A. (Master of Computer Applications)",
  "B.S. / B.Sc. (Bachelor of Science)",
  "M.S. / M.Sc. (Master of Science)",
  "B.B.A. (Bachelor of Business Administration)",
  "M.B.A. (Master of Business Administration)",
  "Diploma / Certification",
  "High School / Secondary",
  "Other / Custom Degree",
];

const BRANCH_OPTIONS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Artificial Intelligence & Data Science",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration & Management",
  "Finance & Accounting",
  "Cybersecurity & Networking",
  "Other / Custom Branch",
];

export function EntryForm({ type, entries = [], onChange }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const {
    register,
    handleSubmit: handleValidation,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
      degree: "",
      fieldOfStudy: "",
      techStack: "",
      projectUrl: "",
    },
  });

  const current = watch("current");
  const isEducation = type?.toLowerCase() === "education";
  const isProject = type?.toLowerCase() === "project" || type?.toLowerCase() === "projects";

  const handleAdd = handleValidation((data) => {
    const formattedEntry = {
      ...data,
      title: isEducation ? (data.degree || data.title) : data.title,
      startDate: formatDisplayDate(data.startDate) || data.startDate,
      endDate: data.current ? "" : (formatDisplayDate(data.endDate) || data.endDate),
      startDateRaw: data.startDate,
      endDateRaw: data.endDate,
    };

    if (editingIndex !== null) {
      const updated = [...entries];
      updated[editingIndex] = formattedEntry;
      onChange(updated);
      toast.success(`${type} entry updated!`);
    } else {
      onChange([...entries, formattedEntry]);
      toast.success(`${type} entry added!`);
    }

    resetForm();
  });

  const resetForm = () => {
    reset({
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
      degree: "",
      fieldOfStudy: "",
      techStack: "",
      projectUrl: "",
    });
    setEditingIndex(null);
    setIsAdding(false);
  };

  const handleEdit = (index) => {
    const item = entries[index];
    setEditingIndex(index);
    setIsAdding(true);
    reset({
      title: item.title || "",
      organization: item.organization || "",
      startDate: item.startDateRaw || item.startDate || "",
      endDate: item.endDateRaw || item.endDate || "",
      description: item.description || "",
      current: item.current || false,
      degree: item.degree || item.title || "",
      fieldOfStudy: item.fieldOfStudy || "",
      techStack: item.techStack || "",
      projectUrl: item.projectUrl || "",
    });
  };

  const handleDelete = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onChange(newEntries);
    toast.success("Entry removed");
  };

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
    error: improveError,
  } = useFetch(improveWithAI);

  useEffect(() => {
    if (improvedContent && !isImproving) {
      setValue("description", improvedContent);
      toast.success("Description improved with AI!");
    }
    if (improveError) {
      toast.error(improveError.message || "Failed to improve description");
    }
  }, [improvedContent, improveError, isImproving, setValue]);

  const handleImproveDescription = async () => {
    const description = watch("description");
    if (!description) {
      toast.error("Please enter a description first");
      return;
    }

    await improveWithAIFn({
      current: description,
      type: type.toLowerCase(),
    });
  };

  return (
    <div className="space-y-4">
      {/* List of Existing Entries with Edit/Delete Buttons */}
      <div className="space-y-3">
        {entries.map((item, index) => (
          <Card key={index} className="border bg-card shadow-xs hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                {isEducation ? (
                  <>
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span>{item.degree || item.title} {item.fieldOfStudy ? `in ${item.fieldOfStudy}` : ""}</span>
                    <span className="text-xs text-muted-foreground font-normal">@ {item.organization}</span>
                  </>
                ) : isProject ? (
                  <>
                    <Code2 className="h-4 w-4 text-primary" />
                    <span>{item.title}</span>
                    {item.organization && <span className="text-xs text-muted-foreground font-normal">@ {item.organization}</span>}
                  </>
                ) : (
                  <>
                    <Briefcase className="h-4 w-4 text-primary" />
                    <span>{item.title}</span>
                    <span className="text-xs text-muted-foreground font-normal">@ {item.organization}</span>
                  </>
                )}
              </CardTitle>

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => handleEdit(index)}
                  title="Edit entry"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => handleDelete(index)}
                  title="Delete entry"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>
                  {item.current
                    ? `${item.startDate} - Present`
                    : `${item.startDate} - ${item.endDate}`}
                </span>
                {item.techStack && (
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-mono text-[10px]">
                    {item.techStack}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs whitespace-pre-wrap leading-relaxed text-foreground/90">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Card for Adding or Editing */}
      {isAdding && (
        <Card className="border-2 border-primary/30 shadow-md bg-muted/20">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              {editingIndex !== null ? <Pencil className="h-4 w-4 text-primary" /> : <PlusCircle className="h-4 w-4 text-primary" />}
              {editingIndex !== null ? `Edit ${type} Entry` : `Add ${type}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* EDUCATION SPECIFIC FIELDS */}
            {isEducation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Degree / Course</label>
                    <select
                      className="w-full h-10 px-3 py-2 text-xs md:text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={watch("degree") || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setValue("degree", val);
                        setValue("title", val);
                      }}
                    >
                      <option value="">Select Degree / Qualification</option>
                      {DEGREE_OPTIONS.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <Input
                      placeholder="Or enter custom Degree / Qualification..."
                      {...register("degree")}
                      onChange={(e) => {
                        setValue("degree", e.target.value);
                        setValue("title", e.target.value);
                      }}
                      className="mt-1 text-xs"
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Field of Study / Branch</label>
                    <select
                      className="w-full h-10 px-3 py-2 text-xs md:text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={watch("fieldOfStudy") || ""}
                      onChange={(e) => setValue("fieldOfStudy", e.target.value)}
                    >
                      <option value="">Select Branch / Specialization</option>
                      {BRANCH_OPTIONS.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <Input
                      placeholder="Or enter custom Branch / Specialization..."
                      {...register("fieldOfStudy")}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">School / College / University</label>
                  <Input
                    placeholder="College / University / School Name"
                    {...register("organization")}
                  />
                  {errors.organization && (
                    <p className="text-xs text-red-500">{errors.organization.message}</p>
                  )}
                </div>
              </div>
            ) : isProject ? (
              /* PROJECT SPECIFIC FIELDS */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Project Title</label>
                    <Input
                      placeholder="e.g. AI Resume Builder & ATS Scanner"
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500">{errors.title.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Organization / Context (Optional)</label>
                    <Input
                      placeholder="e.g. Personal Project, Client Work, Hackathon"
                      {...register("organization")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Technologies Used (Tech Stack)</label>
                    <Input
                      placeholder="e.g. Next.js, React, Node.js, PostgreSQL, Tailwind"
                      {...register("techStack")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Project Link / Repo URL (Optional)</label>
                    <Input
                      type="url"
                      placeholder="https://github.com/yourusername/project"
                      {...register("projectUrl")}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* EXPERIENCE SPECIFIC FIELDS */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Job Title / Role</label>
                  <Input
                    placeholder="e.g. Senior Full-Stack Engineer"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Company / Organization</label>
                  <Input
                    placeholder="e.g. Google, TechCorp Inc."
                    {...register("organization")}
                  />
                  {errors.organization && (
                    <p className="text-xs text-red-500">{errors.organization.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* DATES */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Start Date</label>
                <Input
                  type="month"
                  {...register("startDate")}
                />
                {errors.startDate && (
                  <p className="text-xs text-red-500">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">End Date</label>
                <Input
                  type="month"
                  {...register("endDate")}
                  disabled={current}
                />
                {errors.endDate && (
                  <p className="text-xs text-red-500">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`current-${type}`}
                {...register("current")}
                onChange={(e) => {
                  setValue("current", e.target.checked);
                  if (e.target.checked) {
                    setValue("endDate", "");
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor={`current-${type}`} className="text-xs font-medium cursor-pointer">
                Currently {isEducation ? "Enrolled" : "Working / Active"}
              </label>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-muted-foreground">
                  {isEducation ? "Education Details & Achievements" : isProject ? "Key Highlights & Contributions" : "Key Responsibilities & Achievements"}
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleImproveDescription}
                  disabled={isImproving || !watch("description")}
                  className="h-7 text-xs text-primary hover:bg-primary/10"
                >
                  {isImproving ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Improving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" /> Improve with AI
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                placeholder={
                  isEducation
                    ? "Mention relevant coursework, GPA/Percentage, academic honors, or activities..."
                    : isProject
                    ? "Highlight key features built, performance improvements, and tech stack implementation details..."
                    : "Describe key accomplishments using action verbs and quantifiable results..."
                }
                className="h-28 text-xs md:text-sm leading-relaxed"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-2 bg-muted/40 py-3 px-6 rounded-b-xl border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetForm}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleAdd}>
              {editingIndex !== null ? (
                <>
                  <Save className="h-3.5 w-3.5 mr-1.5" /> Save Changes
                </>
              ) : (
                <>
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" /> Add {type}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isAdding && (
        <Button
          className="w-full border-dashed"
          variant="outline"
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
        >
          <PlusCircle className="h-4 w-4 mr-2 text-primary" />
          Add {type}
        </Button>
      )}
    </div>
  );
}
