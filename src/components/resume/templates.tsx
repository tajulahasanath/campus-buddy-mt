import type { ResumeData } from "@/lib/resume/types";

export type TemplateId = "modern" | "classic" | "minimal" | "creative";
export const TEMPLATES: { id: TemplateId; name: string; tag: string }[] = [
  { id: "modern", name: "Modern Professional", tag: "ATS-Friendly" },
  { id: "classic", name: "Classic Corporate", tag: "Traditional" },
  { id: "minimal", name: "Minimal ATS", tag: "Best for ATS" },
  { id: "creative", name: "Creative", tag: "Standout" },
];

const Section = ({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) => (
  <section className="mb-4">
    <h2 className={`mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] ${accent ?? "text-zinc-900 border-b border-zinc-300 pb-1"}`}>{title}</h2>
    <div className="text-[12.5px] leading-snug text-zinc-800">{children}</div>
  </section>
);

const contactLine = (r: ResumeData) =>
  [r.personal.email, r.personal.phone, [r.personal.city, r.personal.state].filter(Boolean).join(", "), r.personal.linkedin, r.personal.github, r.personal.portfolio]
    .filter(Boolean).join(" • ");

function Body({ r }: { r: ResumeData }) {
  const sections: Record<string, React.ReactNode> = {
    objective: r.objective && <Section title="Career Objective">{r.objective}</Section>,
    education: r.education.length > 0 && (
      <Section title="Education">
        {r.education.map((e) => (
          <div key={e.id} className="mb-1.5">
            <div className="flex justify-between"><strong>{e.college}</strong><span className="text-zinc-500">{e.startYear}–{e.endYear}</span></div>
            <div className="text-zinc-700">{[e.degree, e.course].filter(Boolean).join(", ")} {e.score && `— ${e.score}`}</div>
            {e.description && <div className="text-zinc-600">{e.description}</div>}
          </div>
        ))}
      </Section>
    ),
    experience: r.experience.length > 0 && (
      <Section title="Work Experience">
        {r.experience.map((e) => (
          <div key={e.id} className="mb-2">
            <div className="flex justify-between"><strong>{e.role}</strong><span className="text-zinc-500">{e.startDate} – {e.current ? "Present" : e.endDate}</span></div>
            <div className="italic text-zinc-700">{e.company}{e.location && ` • ${e.location}`}</div>
            <ul className="ml-4 mt-0.5 list-disc">{e.description.split("\n").filter(Boolean).map((b, i) => <li key={i}>{b.replace(/^•\s*/, "")}</li>)}</ul>
          </div>
        ))}
      </Section>
    ),
    internships: r.internships.length > 0 && (
      <Section title="Internships">
        {r.internships.map((i) => (
          <div key={i.id} className="mb-1.5">
            <div className="flex justify-between"><strong>{i.role} — {i.company}</strong><span className="text-zinc-500">{i.duration}</span></div>
            <div className="text-zinc-700">{i.description}</div>
          </div>
        ))}
      </Section>
    ),
    projects: r.projects.length > 0 && (
      <Section title="Projects">
        {r.projects.map((p) => (
          <div key={p.id} className="mb-2">
            <div className="flex justify-between"><strong>{p.title}</strong><span className="text-zinc-500">{p.startDate} – {p.endDate}</span></div>
            {p.tech && <div className="italic text-zinc-600">{p.tech}</div>}
            <ul className="ml-4 mt-0.5 list-disc">{p.description.split("\n").filter(Boolean).map((b, i) => <li key={i}>{b.replace(/^•\s*/, "")}</li>)}</ul>
            {(p.link || p.github) && <div className="text-zinc-600">{[p.link, p.github].filter(Boolean).join(" • ")}</div>}
          </div>
        ))}
      </Section>
    ),
    skills: r.skills.length > 0 && (
      <Section title="Skills">
        {["Technical", "Soft"].map((cat) => {
          const items = r.skills.filter((s) => s.category === cat);
          if (!items.length) return null;
          return <div key={cat}><strong>{cat}:</strong> {items.map((s) => s.name).join(", ")}</div>;
        })}
      </Section>
    ),
    certifications: r.certifications.length > 0 && (
      <Section title="Certifications">
        {r.certifications.map((c) => (
          <div key={c.id} className="flex justify-between">
            <span><strong>{c.name}</strong> — {c.org}</span><span className="text-zinc-500">{c.date}</span>
          </div>
        ))}
      </Section>
    ),
    trainings: r.trainings.length > 0 && (
      <Section title="Trainings & Courses">
        {r.trainings.map((t) => (
          <div key={t.id} className="flex justify-between"><span><strong>{t.name}</strong> — {t.platform}</span><span className="text-zinc-500">{t.duration}</span></div>
        ))}
      </Section>
    ),
    achievements: r.achievements.length > 0 && <Section title="Achievements"><ul className="ml-4 list-disc">{r.achievements.map((a, i) => <li key={i}>{a}</li>)}</ul></Section>,
    activities: r.activities.length > 0 && <Section title="Extra-Curricular Activities"><ul className="ml-4 list-disc">{r.activities.map((a, i) => <li key={i}>{a}</li>)}</ul></Section>,
    languages: r.languages.length > 0 && <Section title="Languages">{r.languages.join(", ")}</Section>,
    hobbies: r.hobbies.length > 0 && <Section title="Hobbies">{r.hobbies.join(", ")}</Section>,
    references: r.references.length > 0 && (
      <Section title="References">
        {r.references.map((rf) => (
          <div key={rf.id} className="mb-1"><strong>{rf.name}</strong>, {rf.designation} @ {rf.company} • {rf.email} {rf.phone && `• ${rf.phone}`}</div>
        ))}
      </Section>
    ),
  };
  return <>{r.sectionOrder.map((k) => <div key={k}>{sections[k]}</div>)}</>;
}

export function TemplateView({ r, template }: { r: ResumeData; template: TemplateId }) {
  if (template === "classic") {
    return (
      <div className="bg-white p-10 font-serif text-zinc-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-wide">{r.personal.name || "Your Name"}</h1>
          <p className="mt-1 text-sm text-zinc-700">{contactLine(r)}</p>
        </div>
        <div className="my-3 border-t-2 border-zinc-900" />
        <Body r={r} />
      </div>
    );
  }
  if (template === "minimal") {
    return (
      <div className="bg-white p-10 font-sans text-zinc-900">
        <h1 className="text-2xl font-semibold">{r.personal.name || "Your Name"}</h1>
        <p className="text-xs text-zinc-600">{contactLine(r)}</p>
        <div className="mt-4"><Body r={r} /></div>
      </div>
    );
  }
  if (template === "creative") {
    return (
      <div className="grid grid-cols-3 bg-white font-sans text-zinc-900">
        <aside className="col-span-1 bg-gradient-to-b from-indigo-600 to-violet-700 p-6 text-white">
          <h1 className="text-xl font-bold leading-tight">{r.personal.name || "Your Name"}</h1>
          <p className="mt-1 text-xs opacity-90">{r.personal.email}<br />{r.personal.phone}<br />{[r.personal.city, r.personal.country].filter(Boolean).join(", ")}</p>
          {r.skills.length > 0 && (
            <div className="mt-5">
              <h2 className="mb-1 text-[11px] font-bold uppercase tracking-widest">Skills</h2>
              <ul className="space-y-0.5 text-[12px]">{r.skills.map((s) => <li key={s.id}>• {s.name}</li>)}</ul>
            </div>
          )}
          {r.languages.length > 0 && (
            <div className="mt-5"><h2 className="mb-1 text-[11px] font-bold uppercase tracking-widest">Languages</h2><div className="text-[12px]">{r.languages.join(", ")}</div></div>
          )}
        </aside>
        <main className="col-span-2 p-8"><Body r={{ ...r, skills: [], languages: [] }} /></main>
      </div>
    );
  }
  // modern (default)
  return (
    <div className="bg-white p-10 font-sans text-zinc-900">
      <header className="border-b-2 border-indigo-600 pb-3">
        <h1 className="text-3xl font-bold text-zinc-900">{r.personal.name || "Your Name"}</h1>
        <p className="mt-1 text-[12px] text-zinc-600">{contactLine(r)}</p>
      </header>
      <div className="mt-4"><Body r={r} /></div>
    </div>
  );
}
