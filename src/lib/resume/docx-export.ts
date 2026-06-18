import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat,
} from "docx";
import type { ResumeData } from "./types";

const heading = (text: string) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, color: "1E40AF" })],
  });

const para = (text: string) =>
  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text, size: 22 })] });

const bullet = (text: string) =>
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, size: 22 })],
  });

export async function buildResumeDocx(r: ResumeData): Promise<Blob> {
  const children: Paragraph[] = [];

  // Header
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: r.personal.name || "Your Name", bold: true, size: 40 })],
  }));
  const contact = [r.personal.email, r.personal.phone, [r.personal.city, r.personal.state].filter(Boolean).join(", ")]
    .filter(Boolean).join("  •  ");
  if (contact) children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: [new TextRun({ text: contact, size: 20, color: "555555" })],
  }));
  const links = [r.personal.linkedin, r.personal.github, r.personal.portfolio].filter(Boolean).join("  •  ");
  if (links) children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 200 },
    children: [new TextRun({ text: links, size: 18, color: "1E40AF" })],
  }));

  if (r.objective?.trim()) { children.push(heading("Objective")); children.push(para(r.objective)); }

  if (r.education?.length) {
    children.push(heading("Education"));
    for (const e of r.education) {
      children.push(new Paragraph({ children: [new TextRun({ text: `${e.degree || ""}${e.course ? " in " + e.course : ""}`, bold: true, size: 22 })] }));
      children.push(para([e.college, e.university].filter(Boolean).join(" • ")));
      children.push(para([[e.startYear, e.endYear].filter(Boolean).join(" – "), e.score && `Score: ${e.score}`].filter(Boolean).join("  •  ")));
      if (e.description) children.push(para(e.description));
    }
  }

  if (r.experience?.length) {
    children.push(heading("Experience"));
    for (const x of r.experience) {
      children.push(new Paragraph({ children: [new TextRun({ text: `${x.role || ""} — ${x.company || ""}`, bold: true, size: 22 })] }));
      children.push(para([[x.startDate, x.current ? "Present" : x.endDate].filter(Boolean).join(" – "), x.location].filter(Boolean).join("  •  ")));
      if (x.description) x.description.split(/\n+/).forEach((l) => l.trim() && children.push(bullet(l.replace(/^[-•]\s*/, ""))));
    }
  }

  if (r.internships?.length) {
    children.push(heading("Internships"));
    for (const i of r.internships) {
      children.push(new Paragraph({ children: [new TextRun({ text: `${i.role || ""} — ${i.company || ""}`, bold: true, size: 22 })] }));
      if (i.duration) children.push(para(i.duration));
      if (i.description) children.push(para(i.description));
    }
  }

  if (r.projects?.length) {
    children.push(heading("Projects"));
    for (const p of r.projects) {
      children.push(new Paragraph({ children: [new TextRun({ text: p.title || "", bold: true, size: 22 })] }));
      if (p.tech) children.push(para(`Tech: ${p.tech}`));
      if (p.description) children.push(para(p.description));
      const ls = [p.link, p.github].filter(Boolean).join("  •  ");
      if (ls) children.push(para(ls));
    }
  }

  if (r.skills?.length) {
    children.push(heading("Skills"));
    children.push(para(r.skills.map((s) => s.name).filter(Boolean).join(" • ")));
  }

  if (r.certifications?.length) {
    children.push(heading("Certifications"));
    r.certifications.forEach((c) => children.push(bullet(`${c.name}${c.org ? " — " + c.org : ""}${c.date ? " (" + c.date + ")" : ""}`)));
  }

  if (r.achievements?.length) {
    children.push(heading("Achievements"));
    r.achievements.filter(Boolean).forEach((a) => children.push(bullet(a)));
  }

  if (r.activities?.length) {
    children.push(heading("Extra-Curricular Activities"));
    r.activities.filter(Boolean).forEach((a) => children.push(bullet(a)));
  }

  if (r.languages?.length) {
    children.push(heading("Languages"));
    children.push(para(r.languages.filter(Boolean).join(" • ")));
  }

  const doc = new Document({
    numbering: {
      config: [{
        reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 480, hanging: 240 } } } }],
      }],
    },
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [{
      properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

export function normalizeFilename(input: string): string {
  return (input || "resume")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "resume";
}
