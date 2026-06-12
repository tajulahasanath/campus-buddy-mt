import type { ResumeData } from "./types";

export function computeCompletion(r: ResumeData): number {
  const checks = [
    !!r.personal.name, !!r.personal.email, !!r.personal.phone, !!r.personal.city,
    !!r.personal.linkedin, !!r.objective && r.objective.length > 30,
    r.education.length > 0, r.skills.length >= 3, r.projects.length > 0,
    r.experience.length > 0 || r.internships.length > 0,
    r.certifications.length > 0, r.achievements.length > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export type ATSResult = {
  score: number;
  missing: string[];
  suggestions: string[];
  strengths: string[];
};

export function analyzeATS(r: ResumeData): ATSResult {
  const missing: string[] = [];
  const suggestions: string[] = [];
  const strengths: string[] = [];
  let score = 0;

  // Contact (20)
  const contactFields = [r.personal.name, r.personal.email, r.personal.phone, r.personal.city, r.personal.linkedin];
  const contactDone = contactFields.filter(Boolean).length;
  score += (contactDone / contactFields.length) * 20;
  if (contactDone < contactFields.length) missing.push("Complete contact information (LinkedIn, phone, city)");
  else strengths.push("Complete contact information");

  // Objective (10)
  if (r.objective.length > 50 && r.objective.length < 400) { score += 10; strengths.push("Concise career objective"); }
  else if (!r.objective) missing.push("Career objective / summary");
  else suggestions.push("Keep objective between 50–400 characters");

  // Education (15)
  if (r.education.length > 0) { score += 15; strengths.push("Education listed"); } else missing.push("Education entry");

  // Skills (15)
  if (r.skills.length >= 6) { score += 15; strengths.push(`${r.skills.length} skills listed`); }
  else if (r.skills.length > 0) { score += 8; suggestions.push("Add at least 6 skills (mix of technical & soft)"); }
  else missing.push("Skills section");

  // Projects (15)
  if (r.projects.length >= 2) { score += 15; strengths.push("Projects showcased"); }
  else if (r.projects.length === 1) { score += 8; suggestions.push("Add 1–2 more projects"); }
  else missing.push("Projects");

  // Experience/Internships (15)
  const expCount = r.experience.length + r.internships.length;
  if (expCount > 0) { score += 15; strengths.push("Practical experience listed"); }
  else missing.push("Work experience or internship");

  // Certifications/Achievements (5)
  if (r.certifications.length + r.achievements.length > 0) { score += 5; strengths.push("Achievements / certifications"); }
  else suggestions.push("Add certifications or achievements to stand out");

  // Length/formatting (5)
  const wordCount = JSON.stringify(r).split(/\s+/).length;
  if (wordCount > 200 && wordCount < 1200) score += 5;
  else if (wordCount <= 200) suggestions.push("Resume looks sparse — add more detail");
  else suggestions.push("Consider trimming to 1 page for freshers");

  // Keywords
  const text = JSON.stringify(r).toLowerCase();
  const goodKeywords = ["led", "built", "developed", "improved", "achieved", "managed", "designed", "implemented"];
  const found = goodKeywords.filter((k) => text.includes(k));
  if (found.length >= 3) { strengths.push("Strong action verbs"); }
  else suggestions.push("Use action verbs: Built, Led, Improved, Achieved…");

  return { score: Math.round(score), missing, suggestions, strengths };
}
