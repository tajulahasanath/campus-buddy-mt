import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const InputSchema = z.object({
  task: z.enum(["objective", "improve-objective", "improve-project", "improve-skills", "suggest-skills", "summary", "ats-feedback", "grammar"]),
  context: z.string().max(4000),
  role: z.string().max(200).optional(),
});

async function callOpenAI(system: string, user: string): Promise<string> {
  const key = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env?.OPENAI_API_KEY;
  if (!key) {
    // Graceful mock so UI keeps working before key is configured
    return `[AI suggestion – sample output]\n${user.slice(0, 200)}…\n\nAdd your OpenAI key in project secrets to enable real AI.`;
  }
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

export const aiResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const prompts: Record<typeof data.task, { system: string; user: string }> = {
      objective: {
        system: "You write concise, ATS-friendly career objectives for student resumes. 2–3 sentences max. No fluff.",
        user: `Write a career objective for: ${data.context}. Target role: ${data.role ?? "fresher / student"}.`,
      },
      "improve-objective": {
        system: "You rewrite career objectives to be sharper, results-oriented, and ATS-friendly. 2–3 sentences. Return only the rewritten objective.",
        user: data.context,
      },
      "improve-project": {
        system: "Rewrite project descriptions using strong action verbs, quantifiable impact, and the STAR pattern. 2–4 bullet points starting with •. Return bullets only.",
        user: data.context,
      },
      "improve-skills": {
        system: "Group and clean a list of skills for a resume. Return a comma-separated list, deduplicated, prioritising in-demand technical skills first.",
        user: data.context,
      },
      "suggest-skills": {
        system: "Suggest 8 in-demand technical skills relevant to the given role and background. Return comma-separated list only.",
        user: `Role: ${data.role ?? "Software Engineer"}. Current skills: ${data.context}`,
      },
      summary: {
        system: "Write a 3-sentence professional summary from the provided resume data. ATS-friendly, no first person.",
        user: data.context,
      },
      "ats-feedback": {
        system: "You are an ATS resume reviewer. Give 5 short, specific, actionable bullet points (• …) to improve the resume.",
        user: data.context,
      },
      grammar: {
        system: "Fix grammar and improve clarity of the given resume text. Preserve meaning and length. Return only the corrected text.",
        user: data.context,
      },
    };
    const p = prompts[data.task];
    const result = await callOpenAI(p.system, p.user);
    return { result };
  });
