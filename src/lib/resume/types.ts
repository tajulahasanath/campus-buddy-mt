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

export function createEmptyResume(): ResumeData {
  return {
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
    sectionOrder: [...DEFAULT_SECTION_ORDER],
  };
}

export const EMPTY_RESUME: ResumeData = createEmptyResume();

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  !!value && typeof value === "object" && !Array.isArray(value);

const asRecord = (value: unknown): UnknownRecord => (isRecord(value) ? value : {});
const asString = (value: unknown): string => (typeof value === "string" ? value : "");
const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

export function normalizeResumeData(raw: unknown): ResumeData {
  const source = asRecord(raw);
  const base = createEmptyResume();
  const personal = asRecord(source.personal);
  const legacyPersonal = asRecord(source.personalInfo);
  const social = asRecord(source.social);
  const activities = asArray<string>(source.activities);
  const legacyActivities = asArray<string>(source.extraCurricular);
  const fullName = asString(personal.name) || asString(legacyPersonal.fullName) || asString(legacyPersonal.name);
  const location = asString(legacyPersonal.location);

  return {
    ...base,
    personal: {
      ...base.personal,
      name: fullName,
      email: asString(personal.email) || asString(legacyPersonal.email),
      phone: asString(personal.phone) || asString(legacyPersonal.phone),
      address: asString(personal.address) || asString(legacyPersonal.address),
      city: asString(personal.city) || location,
      state: asString(personal.state),
      country: asString(personal.country) || asString(legacyPersonal.country) || base.personal.country,
      linkedin: asString(personal.linkedin) || asString(legacyPersonal.linkedin),
      github: asString(personal.github) || asString(legacyPersonal.github),
      portfolio: asString(personal.portfolio) || asString(legacyPersonal.portfolio),
      photo: asString(personal.photo),
    },
    objective: asString(source.objective) || asString(source.careerObjective) || asString(source.summary),
    education: asArray<Education>(source.education),
    experience: asArray<Experience>(source.experience),
    internships: asArray<Internship>(source.internships),
    trainings: asArray<Training>(source.trainings),
    skills: asArray<Skill>(source.skills),
    projects: asArray<Project>(source.projects),
    certifications: asArray<Certification>(source.certifications),
    achievements: asArray<string>(source.achievements),
    activities: activities.length ? activities : legacyActivities,
    languages: asArray<string>(source.languages),
    hobbies: asArray<string>(source.hobbies),
    references: asArray<Reference>(source.references),
    social: { twitter: asString(social.twitter) },
    sectionOrder: asArray<string>(source.sectionOrder).length ? asArray<string>(source.sectionOrder) : [...DEFAULT_SECTION_ORDER],
  };
}

export function getResumeFullName(raw: unknown): string {
  const source = asRecord(raw);
  const personal = asRecord(source.personal);
  const legacyPersonal = asRecord(source.personalInfo);
  return (asString(personal.name) || asString(legacyPersonal.fullName) || asString(legacyPersonal.name)).trim();
}

export function getResumeTitle(data: unknown, fallback = "Untitled Resume"): string {
  const fullName = getResumeFullName(data);
  return fullName ? `${fullName} Resume` : fallback;
}

export const uid = () => Math.random().toString(36).slice(2, 10);
