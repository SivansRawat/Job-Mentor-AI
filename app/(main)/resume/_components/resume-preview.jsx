"use client";

import { Mail, Phone, Linkedin, Twitter, Globe, Briefcase, GraduationCap, Code2, Sparkles, ExternalLink } from "lucide-react";

export function ResumePreview({ formValues, user }) {
  const { contactInfo = {}, summary = "", skills = "", experience = [], education = [], projects = [] } = formValues || {};

  const skillsList = skills
    ? skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="w-full flex justify-center overflow-x-auto py-4 bg-muted/30 rounded-xl">
      <div
        id="styled-resume-pdf"
        className="w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl p-8 md:p-10 font-sans text-slate-900 leading-tight space-y-4 print:p-6 print:shadow-none box-border"
        style={{ colorScheme: "light" }}
      >
        {/* HEADER SECTION */}
        <div className="border-b-2 border-slate-800 pb-3 text-center space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-slate-900">
            {user?.fullName || "Candidate Name"}
          </h1>

          {/* CONTACT INFO BAR */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-600 font-medium">
            {contactInfo?.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-700" /> {contactInfo.email}
              </span>
            )}
            {contactInfo?.mobile && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-700" /> {contactInfo.mobile}
              </span>
            )}
            {contactInfo?.linkedin && (
              <a
                href={contactInfo.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-slate-800 hover:underline font-semibold"
              >
                <Linkedin className="h-3 w-3 text-slate-700" /> LinkedIn
              </a>
            )}
            {contactInfo?.twitter && (
              <a
                href={contactInfo.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-slate-800 hover:underline font-semibold"
              >
                <Twitter className="h-3 w-3 text-slate-700" /> Twitter/X
              </a>
            )}
          </div>
        </div>

        {/* PROFESSIONAL SUMMARY */}
        {summary && (
          <div className="space-y-1">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
              Professional Summary
            </h2>
            <p className="text-[11px] text-slate-700 leading-normal whitespace-pre-line">
              {summary}
            </p>
          </div>
        )}

        {/* CORE SKILLS */}
        {skillsList.length > 0 && (
          <div className="space-y-1">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
              Technical & Professional Skills
            </h2>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {skillsList.map((skill, index) => (
                <span
                  key={index}
                  className="bg-slate-100 border border-slate-300 text-slate-800 px-2 py-0.5 rounded text-[10px] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* WORK EXPERIENCE */}
        {experience.length > 0 && (
          <div className="space-y-2.5">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
              Work Experience
            </h2>
            <div className="space-y-2">
              {experience.map((exp, index) => (
                <div key={index} className="space-y-0.5">
                  <div className="flex justify-between items-baseline flex-wrap">
                    <span className="text-[11.5px] font-bold text-slate-900">
                      {exp.title} <span className="font-normal text-slate-600">| {exp.organization}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-[10.5px] leading-snug text-slate-700 whitespace-pre-line pl-2 border-l border-slate-200">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDUCATION */}
        {education.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
              Education
            </h2>
            <div className="space-y-1.5">
              {education.map((edu, index) => (
                <div key={index} className="flex justify-between items-baseline flex-wrap">
                  <div>
                    <span className="text-[11px] font-bold text-slate-900">
                      {edu.degree || edu.title} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                    </span>
                    <span className="text-[10.5px] text-slate-600 block">
                      {edu.organization}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {edu.startDate} – {edu.current ? "Present" : edu.endDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS */}
        {projects.length > 0 && (
          <div className="space-y-2.5">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
              Featured Projects
            </h2>
            <div className="space-y-2">
              {projects.map((proj, index) => (
                <div key={index} className="space-y-0.5">
                  <div className="flex justify-between items-baseline flex-wrap">
                    <span className="text-[11.5px] font-bold text-slate-900 flex items-center gap-1">
                      {proj.title}
                      {proj.projectUrl && (
                        <a
                          href={proj.projectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-600 hover:text-slate-900"
                        >
                          <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      )}
                      {proj.organization && (
                        <span className="font-normal text-slate-600">({proj.organization})</span>
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {proj.startDate} – {proj.current ? "Present" : proj.endDate}
                    </span>
                  </div>

                  {proj.techStack && (
                    <div className="text-[10px] font-semibold text-slate-700">
                      Tech Stack: <span className="font-normal font-mono">{proj.techStack}</span>
                    </div>
                  )}

                  {proj.description && (
                    <p className="text-[10.5px] leading-snug text-slate-700 whitespace-pre-line pl-2 border-l border-slate-200">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
