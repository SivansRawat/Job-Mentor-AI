"use client";

import { Mail, Phone, Linkedin, Twitter, Globe, Briefcase, GraduationCap, Code, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ResumePreview({ formValues, user }) {
  const { contactInfo = {}, summary = "", skills = "", experience = [], education = [], projects = [] } = formValues || {};

  const skillsList = skills
    ? skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div
      id="styled-resume-pdf"
      className="bg-card text-card-foreground border-2 border-border shadow-2xl rounded-xl p-8 md:p-12 max-w-4xl mx-auto space-y-8 font-sans transition-all"
    >
      {/* Header Banner */}
      <div className="border-b-2 border-primary/20 pb-6 text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          {user?.fullName || "Your Full Name"}
        </h1>

        {/* Contact Information Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-muted-foreground">
          {contactInfo?.email && (
            <span className="flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-md">
              <Mail className="h-3.5 w-3.5 text-primary" /> {contactInfo.email}
            </span>
          )}
          {contactInfo?.mobile && (
            <span className="flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-md">
              <Phone className="h-3.5 w-3.5 text-primary" /> {contactInfo.mobile}
            </span>
          )}
          {contactInfo?.linkedin && (
            <a
              href={contactInfo.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 bg-muted/60 hover:bg-muted px-2.5 py-1 rounded-md transition-colors text-primary"
            >
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </a>
          )}
          {contactInfo?.twitter && (
            <a
              href={contactInfo.twitter}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 bg-muted/60 hover:bg-muted px-2.5 py-1 rounded-md transition-colors text-primary"
            >
              <Twitter className="h-3.5 w-3.5" /> Twitter/X
            </a>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b pb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Professional Summary
          </h2>
          <p className="text-xs md:text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
            {summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {skillsList.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b pb-1 flex items-center gap-2">
            <Code className="h-4 w-4" /> Core Technical & Professional Skills
          </h2>
          <div className="flex flex-wrap gap-2 pt-1">
            {skillsList.map((skill, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1 text-xs font-medium border bg-primary/5 text-primary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {experience.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b pb-1 flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Work Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <div key={index} className="space-y-1.5 border-l-2 border-primary/30 pl-4 py-1">
                <div className="flex justify-between items-start flex-wrap">
                  <h3 className="text-sm font-bold text-foreground">
                    {exp.title} <span className="font-normal text-muted-foreground">at {exp.organization}</span>
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-xs md:text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b pb-1 flex items-center gap-2">
            <GraduationCap className="h-4 w-4" /> Education
          </h2>
          <div className="space-y-3">
            {education.map((edu, index) => (
              <div key={index} className="flex justify-between items-start flex-wrap border-l-2 border-primary/30 pl-4 py-1">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{edu.title}</h3>
                  <p className="text-xs text-muted-foreground">{edu.organization}</p>
                </div>
                <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">
                  {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b pb-1 flex items-center gap-2">
            <Globe className="h-4 w-4" /> Featured Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj, index) => (
              <div key={index} className="space-y-1 border-l-2 border-primary/30 pl-4 py-1">
                <div className="flex justify-between items-start flex-wrap">
                  <h3 className="text-sm font-bold text-foreground">{proj.title}</h3>
                  <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">
                    {proj.startDate} - {proj.current ? "Present" : proj.endDate}
                  </span>
                </div>
                {proj.description && (
                  <p className="text-xs md:text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
