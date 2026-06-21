import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, CheckCircle2, Trophy, Lightbulb, Code2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/challenges")({
  head: () => ({ meta: [{ title: "Daily Coding Challenges — Student Hub" }] }),
  component: ChallengesPage,
});

type Level = "Beginner" | "Intermediate" | "Advanced";
type Problem = {
  id: string;
  title: string;
  level: Level;
  topic: string;
  statement: string;
  input: string;
  expected: string;          // canonical expected output for grading
  hints: string[];
  solution: string;
  keywords: string[];        // accepted alternative phrasings (lowercase)
};

/** Five+ problems per level so we can show 5 unique daily picks. */
const POOL: Record<Level, Problem[]> = {
  Beginner: [
    { id: "b1", title: "Reverse a String", level: "Beginner", topic: "Strings",
      statement: "Given a string, return its reverse.",
      input: "hello", expected: "olleh", keywords: ["olleh"],
      hints: ["Two-pointer swap.", "Or split/reverse/join."],
      solution: "Convert to array, reverse, join. O(n)." },
    { id: "b2", title: "FizzBuzz (N=15)", level: "Beginner", topic: "Loops",
      statement: "Print Fizz/Buzz/FizzBuzz from 1..15. Give the 15th token.",
      input: "N = 15", expected: "FizzBuzz", keywords: ["fizzbuzz"],
      hints: ["i % 15 first."], solution: "Check 15 before 3 or 5." },
    { id: "b3", title: "Sum of [1,2,3,4,5]", level: "Beginner", topic: "Arrays",
      statement: "Return the sum.",
      input: "[1,2,3,4,5]", expected: "15", keywords: ["15"],
      hints: ["Accumulator."], solution: "Single pass." },
    { id: "b4", title: "Count Vowels in 'Education'", level: "Beginner", topic: "Strings",
      statement: "How many vowels are in 'Education'?",
      input: "Education", expected: "5", keywords: ["5", "five"],
      hints: ["a e i o u (case-insensitive)."], solution: "E,u,a,i,o = 5." },
    { id: "b5", title: "Factorial of 5", level: "Beginner", topic: "Math",
      statement: "Compute 5!.",
      input: "n = 5", expected: "120", keywords: ["120"],
      hints: ["1×2×3×4×5."], solution: "120." },
    { id: "b6", title: "Is 17 Prime?", level: "Beginner", topic: "Math",
      statement: "Answer yes/no.",
      input: "n = 17", expected: "yes", keywords: ["yes", "true", "prime"],
      hints: ["Trial divide up to √n."], solution: "17 is prime → yes." },
    { id: "b7", title: "Max of [3,9,2,7,5]", level: "Beginner", topic: "Arrays",
      statement: "Return the maximum element.",
      input: "[3,9,2,7,5]", expected: "9", keywords: ["9"],
      hints: ["Track running max."], solution: "9." },
  ],
  Intermediate: [
    { id: "i1", title: "Two Sum", level: "Intermediate", topic: "Hash Map",
      statement: "Given nums=[2,7,11,15], target=9 — return the indices.",
      input: "nums=[2,7,11,15], target=9", expected: "[0,1]", keywords: ["0,1", "[0,1]", "0 1"],
      hints: ["Map value → index."], solution: "Indices 0 and 1." },
    { id: "i2", title: "Valid Parentheses", level: "Intermediate", topic: "Stack",
      statement: "Is '([]){}' balanced? Answer true/false.",
      input: "([]){}", expected: "true", keywords: ["true", "yes", "balanced"],
      hints: ["Stack."], solution: "Valid → true." },
    { id: "i3", title: "Reverse Linked List Output", level: "Intermediate", topic: "Linked List",
      statement: "Reverse 1→2→3→4. Give nodes in order.",
      input: "1->2->3->4", expected: "4,3,2,1", keywords: ["4,3,2,1", "4 3 2 1", "4->3->2->1"],
      hints: ["Iterative prev/curr/next."], solution: "4 3 2 1." },
    { id: "i4", title: "First Non-Repeating Char in 'swiss'", level: "Intermediate", topic: "Strings",
      statement: "Return the first non-repeating character.",
      input: "swiss", expected: "w", keywords: ["w"],
      hints: ["Frequency map."], solution: "'w'." },
    { id: "i5", title: "Anagrams 'listen' & 'silent'?", level: "Intermediate", topic: "Strings",
      statement: "Are they anagrams? true/false.",
      input: "listen, silent", expected: "true", keywords: ["true", "yes", "anagram"],
      hints: ["Sort and compare."], solution: "Yes." },
    { id: "i6", title: "Binary Search Index of 7", level: "Intermediate", topic: "Search",
      statement: "Find index of 7 in [1,3,5,7,9,11].",
      input: "[1,3,5,7,9,11], target=7", expected: "3", keywords: ["3"],
      hints: ["Mid = (l+r)/2."], solution: "Index 3." },
  ],
  Advanced: [
    { id: "a1", title: "Longest Substring w/o Repeat in 'abcabcbb'", level: "Advanced", topic: "Sliding Window",
      statement: "Return the length.",
      input: "abcabcbb", expected: "3", keywords: ["3"],
      hints: ["Sliding window + set."], solution: "'abc' → 3." },
    { id: "a2", title: "Merge K Sorted Lists count", level: "Advanced", topic: "Heap",
      statement: "Merge [[1,4,5],[1,3,4],[2,6]]. How many elements total?",
      input: "[[1,4,5],[1,3,4],[2,6]]", expected: "8", keywords: ["8"],
      hints: ["Sum lengths."], solution: "3+3+2 = 8." },
    { id: "a3", title: "Climbing Stairs n=5", level: "Advanced", topic: "DP",
      statement: "Distinct ways to climb 5 stairs (1 or 2 at a time).",
      input: "n=5", expected: "8", keywords: ["8"],
      hints: ["Fibonacci."], solution: "f(5)=8." },
    { id: "a4", title: "Max Subarray Sum [-2,1,-3,4,-1,2,1,-5,4]", level: "Advanced", topic: "Kadane",
      statement: "Return the max contiguous sum.",
      input: "[-2,1,-3,4,-1,2,1,-5,4]", expected: "6", keywords: ["6"],
      hints: ["Kadane."], solution: "[4,-1,2,1] → 6." },
    { id: "a5", title: "Edit Distance 'horse' → 'ros'", level: "Advanced", topic: "DP",
      statement: "Minimum edits.",
      input: "horse, ros", expected: "3", keywords: ["3"],
      hints: ["2-D DP."], solution: "3." },
    { id: "a6", title: "BFS Shortest Path Length on 4-node line", level: "Advanced", topic: "Graph",
      statement: "Graph 1-2-3-4. Length from 1 to 4 (edges).",
      input: "1-2-3-4", expected: "3", keywords: ["3"],
      hints: ["BFS."], solution: "3 edges." },
  ],
};

const dayIndex = () => Math.floor(Date.now() / 86_400_000);

/** Five unique daily picks per level, deterministic by dayIndex. */
function dailyPicks(level: Level, count = 5): Problem[] {
  const pool = POOL[level];
  const n = Math.min(count, pool.length);
  const offset = dayIndex() % pool.length;
  const picks: Problem[] = [];
  for (let i = 0; i < n; i++) picks.push(pool[(offset + i) % pool.length]);
  return picks;
}

type DailyResult = { day: number; level: Level; score: number; total: number; ts: number };
type ProgressState = { completed: string[]; streak: number; lastDay: number; results: DailyResult[] };
const KEY = "challenges:progress:v2";
const loadProgress = (): ProgressState => {
  try { const v = localStorage.getItem(KEY); if (v) return JSON.parse(v); } catch { /* ignore */ }
  return { completed: [], streak: 0, lastDay: 0, results: [] };
};
const saveProgress = (p: ProgressState) => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ } };

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "").replace(/[\[\]"'`]/g, "");
function check(answer: string, p: Problem): boolean {
  const a = normalize(answer);
  if (!a) return false;
  if (a === normalize(p.expected)) return true;
  return p.keywords.some((k) => normalize(k) === a || a.includes(normalize(k)));
}

function ChallengesPage() {
  const { t } = useI18n();
  const [progress, setProgress] = useState<ProgressState>(() => ({ completed: [], streak: 0, lastDay: 0, results: [] }));
  const [tab, setTab] = useState<Level>("Beginner");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<Level, boolean>>({ Beginner: false, Intermediate: false, Advanced: false });

  useEffect(() => { setProgress(loadProgress()); }, []);

  const picks = useMemo(() => ({
    Beginner: dailyPicks("Beginner"),
    Intermediate: dailyPicks("Intermediate"),
    Advanced: dailyPicks("Advanced"),
  }), []);

  const submitLevel = (level: Level) => {
    const list = picks[level];
    let score = 0;
    const ids: string[] = [];
    list.forEach((p) => { if (check(answers[p.id] ?? "", p)) { score++; ids.push(p.id); } });
    const today = dayIndex();
    const newStreak = progress.lastDay === today ? progress.streak
      : progress.lastDay === today - 1 ? progress.streak + 1 : 1;
    const next: ProgressState = {
      completed: Array.from(new Set([...progress.completed, ...ids])),
      streak: newStreak,
      lastDay: today,
      results: [...progress.results, { day: today, level, score, total: list.length, ts: Date.now() }].slice(-50),
    };
    setProgress(next); saveProgress(next);
    setSubmitted((s) => ({ ...s, [level]: true }));
    toast.success(`Scored ${score} / ${list.length} · Streak ${newStreak} 🔥`);
  };

  const retakeLevel = (level: Level) => {
    const ids = picks[level].map((p) => p.id);
    setAnswers((a) => { const cp = { ...a }; ids.forEach((id) => delete cp[id]); return cp; });
    setSubmitted((s) => ({ ...s, [level]: false }));
  };

  const totalProblems = POOL.Beginner.length + POOL.Intermediate.length + POOL.Advanced.length;
  const pct = Math.round((progress.completed.length / totalProblems) * 100);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Daily Challenges")}</h1>
          <p className="mt-1 text-muted-foreground">Five problems per level every day — submit answers and track your streak.</p>
        </div>
        <div className="flex gap-3">
          <Card className="flex items-center gap-2 px-4 py-3">
            <Flame className="h-5 w-5 text-orange-500" />
            <div><div className="text-xs text-muted-foreground">Streak</div><div className="text-lg font-bold">{progress.streak}</div></div>
          </Card>
          <Card className="flex items-center gap-2 px-4 py-3">
            <Trophy className="h-5 w-5 text-amber-500" />
            <div><div className="text-xs text-muted-foreground">Solved</div><div className="text-lg font-bold">{pct}%</div></div>
          </Card>
        </div>
      </div>

      <Progress value={pct} className="h-2" />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Level)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="Beginner">Beginner</TabsTrigger>
          <TabsTrigger value="Intermediate">Intermediate</TabsTrigger>
          <TabsTrigger value="Advanced">Advanced</TabsTrigger>
        </TabsList>
        {(["Beginner", "Intermediate", "Advanced"] as Level[]).map((lvl) => {
          const list = picks[lvl];
          const isSubmitted = submitted[lvl];
          const score = list.reduce((acc, p) => acc + (check(answers[p.id] ?? "", p) ? 1 : 0), 0);
          return (
            <TabsContent key={lvl} value={lvl} className="space-y-4">
              {list.map((p, idx) => {
                const ans = answers[p.id] ?? "";
                const correct = check(ans, p);
                return (
                  <Card key={p.id} className="p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">Q{idx + 1}</Badge>
                      <Badge variant="secondary"><Code2 className="mr-1 h-3 w-3" />{p.topic}</Badge>
                      <Badge>{p.level}</Badge>
                      {isSubmitted && (correct
                        ? <Badge className="bg-emerald-600"><CheckCircle2 className="mr-1 h-3 w-3" />Correct</Badge>
                        : <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Wrong</Badge>)}
                    </div>
                    <h2 className="text-base font-semibold">{p.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{p.statement}</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-md border bg-muted/40 p-3 text-sm"><div className="text-xs font-semibold uppercase text-muted-foreground">Input</div><pre className="mt-1 whitespace-pre-wrap">{p.input}</pre></div>
                      {isSubmitted && (
                        <div className="rounded-md border bg-muted/40 p-3 text-sm"><div className="text-xs font-semibold uppercase text-muted-foreground">Expected</div><pre className="mt-1 whitespace-pre-wrap">{p.expected}</pre></div>
                      )}
                    </div>
                    <Textarea
                      value={ans}
                      disabled={isSubmitted}
                      onChange={(e) => setAnswers((a) => ({ ...a, [p.id]: e.target.value }))}
                      placeholder="Type your answer (final output or value)…"
                      rows={2}
                      className="mt-3 font-mono text-sm"
                    />
                    <details className="mt-2 rounded-md border p-2">
                      <summary className="cursor-pointer text-xs font-medium"><Lightbulb className="mr-1 inline h-3.5 w-3.5 text-amber-500" />Hints</summary>
                      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">{p.hints.map((h, i) => <li key={i}>{h}</li>)}</ul>
                      {isSubmitted && <p className="mt-2 text-xs"><strong>Solution: </strong>{p.solution}</p>}
                    </details>
                  </Card>
                );
              })}

              <div className="flex flex-wrap items-center gap-3">
                {!isSubmitted ? (
                  <Button onClick={() => submitLevel(lvl)} className="bg-gradient-to-r from-indigo-600 to-violet-600">
                    <CheckCircle2 className="mr-2 h-4 w-4" />Submit answers
                  </Button>
                ) : (
                  <>
                    <Card className="px-4 py-2"><strong className="text-lg">{score} / {list.length}</strong> <span className="text-xs text-muted-foreground">correct today</span></Card>
                    <Button variant="outline" onClick={() => retakeLevel(lvl)}>Try again</Button>
                  </>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {progress.results.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-2 font-semibold">Recent scores</h3>
          <div className="space-y-1 text-sm">
            {progress.results.slice().reverse().slice(0, 8).map((r, i) => (
              <div key={i} className="flex justify-between border-b py-1 last:border-0">
                <span className="text-muted-foreground">{new Date(r.ts).toLocaleString()} · {r.level}</span>
                <span className="font-medium">{r.score} / {r.total}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
