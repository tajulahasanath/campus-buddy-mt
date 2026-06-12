export type Education = { id: string; degree: string; course: string; college: string; university: string; startYear: string; endYear: string; score: string; description: string };
export type Experience = { id: string; company: string; role: string; location: string; startDate: string; endDate: string; current: boolean; description: string };
export type Internship = { id: string; company: string; role: string; duration: string; description: string };
export type Training = { id: string; name: string; platform: string; duration: string; certificateUrl: string };
export type Skill = { id: string; name: string; level: "Beginner" | "Intermediate" | "Advanced"; category: "Technical" | "Soft" };
export type Project = { id: string; title: string; link: string; github: string; startDate: string; endDate: string; tech: string; description: string };
export type Certification = { id: string; name: string; org: string; date: string; url: string };
export type Reference = { id: string; name: string; designation: string; company: string; email: string; phone: string };

export type ResumeData = {
  personal: { name: string; email: string; phone: string; address: string; city: string; state: string; country: string; linkedin: string; github: string; portfolio: string; photo: string };
  objective: string;
  education: Education[];
  experience: Experience[];
  internships: Internship[];
  trainings: Training[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  achievements: string[];
  activities: string[];
  languages: string[];
  hobbies: string[];
  references: Reference[];
  social: { twitter: string };
  sectionOrder: string[];
};

export const DEFAULT_SECTION_ORDER = [
  "objective", "education", "experience", "internships", "projects", "skills",
  "certifications", "trainings", "achievements", "activities", "languages", "hobbies", "references",
];

export const EMPTY_RESUME: ResumeData = {
  personal: { name: "", email: "", phone: "", address: "", city: "", state: "", country: "India", linkedin: "", github: "", portfolio: "", photo: "" },
  objective: "",
  education: [],
  experience: [],
  internships: [],
  trainings: [],
  skills: [],
  projects: [],
  certifications: [],
  achievements: [],
  activities: [],
  languages: [],
  hobbies: [],
  references: [],
  social: { twitter: "" },
  sectionOrder: DEFAULT_SECTION_ORDER,
};

export const uid = () => Math.random().toString(36).slice(2, 10);
