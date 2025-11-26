// import { z } from "zod";

// export const onboardingSchema = z.object({
//   industry: z.string({
//     required_error: "Please select an industry",
//   }),
//   subIndustry: z.string({
//     required_error: "Please select a specialization",
//   }),
//   bio: z.string().max(500).optional(),
//   experience: z
//     .string()
//     .transform((val) => parseInt(val, 10))
//     .pipe(
//       z
//         .number()
//         .min(0, "Experience must be at least 0 years")
//         .max(50, "Experience cannot exceed 50 years")
//     ),
//   skills: z.string().transform((val) =>
//     val
      // ? val
//           .split(",")
//           .map((skill) => skill.trim())
//           .filter(Boolean)
//       : undefined
//   ),
// });

// export const contactSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   mobile: z.string().optional(),
//   linkedin: z.string().optional(),
//   twitter: z.string().optional(),
// });

// export const entrySchema = z
//   .object({
//     title: z.string().min(1, "Title is required"),
//     organization: z.string().min(1, "Organization is required"),
//     startDate: z.string().min(1, "Start date is required"),
//     endDate: z.string().optional(),
//     description: z.string().min(1, "Description is required"),
//     current: z.boolean().default(false),
//   })
//   .refine(
//     (data) => {
//       if (!data.current && !data.endDate) {
//         return false;
//       }
//       return true;
//     },
//     {
//       message: "End date is required unless this is your current position",
//       path: ["endDate"],
//     }
//   );

// export const resumeSchema = z.object({
//   contactInfo: contactSchema,
//   summary: z.string().min(1, "Professional summary is required"),
//   skills: z.string().min(1, "Skills are required"),
//   experience: z.array(entrySchema),
//   education: z.array(entrySchema),
//   projects: z.array(entrySchema),
// });

// export const coverLetterSchema = z.object({
//   companyName: z.string().min(1, "Company name is required"),
//   jobTitle: z.string().min(1, "Job title is required"),
//   jobDescription: z.string().min(1, "Job description is required"),
// });


import { z } from "zod";

export const onboardingSchema = z.object({
  industry: z.string({
    required_error: "Please select an industry",
  }),
  subIndustry: z.string({
    required_error: "Please select a specialization",
  }),
  bio: z.string().max(500).optional(),
  experience: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .min(0, "Experience must be at least 0 years")
        .max(50, "Experience cannot exceed 50 years")
    ),
  skills: z.string().transform((val) =>
    val
      ? val
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : undefined
  ),
});

/* ✅ Updated contactSchema with validation checks */
export const contactSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  mobile: z
    .string()
    .regex(
      /^\+?[0-9]{7,15}$/,
      "Enter a valid phone number (e.g., +1234567890)"
    )
    .optional()
    .or(z.literal("")),
  linkedin: z
    .string()
    .regex(
      /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9_-]+\/?$/,
      "Enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username)"
    )
    .optional()
    .or(z.literal("")),
  twitter: z
    .string()
    .regex(
      /^https?:\/\/(www\.)?(twitter|x)\.com\/[A-Za-z0-9_]+\/?$/,
      "Enter a valid Twitter or X profile URL (e.g., https://twitter.com/username)"
    )
    .optional()
    .or(z.literal("")),
});

export const entrySchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    organization: z.string().min(1, "Organization is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    current: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.current && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date is required unless this is your current position",
      path: ["endDate"],
    }
  );

/* ✅ Updated resumeSchema */
export const resumeSchema = z.object({
  contactInfo: contactSchema,
  summary: z
    .string()
    .min(10, "Professional summary must be at least 10 characters long"),
  skills: z
    .string()
    .min(5, "Please list at least one skill (comma-separated)"),
  experience: z.array(entrySchema),
  education: z.array(entrySchema),
  projects: z.array(entrySchema),
});

export const coverLetterSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});
