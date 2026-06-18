import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, CheckCircle2, Trophy, Lightbulb, Code2 } from "lucide-react";
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
  output: string;
  hints: string[];
  solution: string;
};

const POOL: Record<Level, Problem[]> = {
  Beginner: [
    { id: "b1", title: "Reverse a String", level: "Beginner", topic: "Strings",
      statement: "Given a string, return its reverse.",
      input: "hello", output: "olleh",
      hints: ["Try a two-pointer swap.", "Or use built-in split/reverse/join."],
      solution: "Convert the string to an array, reverse it, and join back. O(n) time, O(n) space." },
    { id: "b2", title: "FizzBuzz", level: "Beginner", topic: "Loops",
      statement: "Print Fizz for multiples of 3, Buzz for 5, FizzBuzz for both, else the number, from 1 to N.",
      input: "N = 15", output: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz",
      hints: ["Use modulo.", "Check 15 before 3 or 5."],
      solution: "Loop 1..N. If i%15==0 print FizzBuzz; else i%3 Fizz; else i%5 Buzz; else i." },
    { id: "b3", title: "Sum of Array", level: "Beginner", topic: "Arrays",
      statement: "Return the sum of integers in an array.",
      input: "[1,2,3,4,5]", output: "15",
      hints: ["Single pass accumulator."],
      solution: "Iterate and add each element to a running total." },
  ],
  Intermediate: [
    { id: "i1", title: "Two Sum", level: "Intermediate", topic: "Hash Map",
      statement: "Given nums and target, return indices of the two numbers adding to target.",
      input: "nums=[2,7,11,15], target=9", output: "[0,1]",
      hints: ["Map of value → index.", "One pass."],
      solution: "Store seen[value]=index; for each x check map for target-x. O(n)." },
    { id: "i2", title: "Valid Parentheses", level: "Intermediate", topic: "Stack",
      statement: "Check if a string of brackets is balanced.",
      input: "\"([]){}\"", output: "true",
      hints: ["Use a stack.", "Match closing with top of stack."],
      solution: "Push openers; on closer, pop and compare. Empty at end means valid." },
  ],
  Advanced: [
    { id: "a1", title: "Longest Substring Without Repeating Characters", level: "Advanced", topic: "Sliding Window",
      statement: "Find the length of the longest substring with all distinct characters.",
      input: "\"abcabcbb\"", output: "3",
      hints: ["Sliding window with a set.", "Shrink from left when duplicate appears."],
      solution: "Expand right, store chars in a map of last index; jump left to lastIndex+1. O(n)." },
    { id: "a2", title: "Merge K Sorted Lists", level: "Advanced", topic: "Heap",
      statement: "Merge k sorted linked lists into one sorted list.",
      input: "[[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]",
      hints: ["Min-heap of list heads.", "Pop smallest, push its next."],
      solution: "Push each head into a min-heap; repeatedly pop smallest and push its successor. O(N log k)." },
  ],
};

const dayIndex = () => Math.floor(Date.now() / 86_400_000);
const todayProblem = (level: Level) => POOL[level][dayIndex() % POOL[level].length];

type Progress = { completed: string[]; streak: number; lastDay: number };
const KEY = "challenges:progress";
const loadProgress = (): Progress => {
  try { const v = localStorage.getItem(KEY); if (v) return JSON.parse(v); } catch {}
  return { completed: [], streak: 0, lastDay: 0 };
};
const saveProgress = (p: Progress) => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {} };

function ChallengesPage() {
  const { t } = useI18n();
  const [progress, setProgress] = useState<Progress>(() => ({ completed: [], streak: 0, lastDay: 0 }));
  const [tab, setTab] = useState<Level>("Beginner");

  useEffect(() => { setProgress(loadProgress()); }, []);

  const totalProblems = POOL.Beginner.length + POOL.Intermediate.length + POOL.Advanced.length;
  const pct = useMemo(() => Math.round((progress.completed.length / totalProblems) * 100), [progress]);

  const markDone = (p: Problem) => {
    if (progress.completed.includes(p.id)) return;
    const today = dayIndex();
    const newStreak = progress.lastDay === today ? progress.streak
      : progress.lastDay === today - 1 ? progress.streak + 1 : 1;
    const next: Progress = { completed: [...progress.completed, p.id], streak: newStreak, lastDay: today };
    setProgress(next); saveProgress(next);
    toast.success(`Completed! Streak: ${newStreak} 🔥`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Daily Challenges")}</h1>
          <p className="mt-1 text-muted-foreground">One problem each day at three difficulty levels.</p>
        </div>
        <div className="flex gap-3">
          <Card className="flex items-center gap-2 px-4 py-3">
            <Flame className="h-5 w-5 text-orange-500" />
            <div><div className="text-xs text-muted-foreground">Streak</div><div className="text-lg font-bold">{progress.streak}</div></div>
          </Card>
          <Card className="flex items-center gap-2 px-4 py-3">
            <Trophy className="h-5 w-5 text-amber-500" />
            <div><div className="text-xs text-muted-foreground">Progress</div><div className="text-lg font-bold">{pct}%</div></div>
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
          const p = todayProblem(lvl);
          const done = progress.completed.includes(p.id);
          return (
            <TabsContent key={lvl} value={lvl} className="space-y-4">
              <Card className="p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary"><Code2 className="mr-1 h-3 w-3" />{p.topic}</Badge>
                  <Badge>{p.level}</Badge>
                  {done && <Badge variant="outline" className="border-green-500 text-green-600"><CheckCircle2 className="mr-1 h-3 w-3" />Completed</Badge>}
                </div>
                <h2 className="text-xl font-bold">{p.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{p.statement}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border bg-muted/40 p-3 text-sm"><div className="text-xs font-semibold uppercase text-muted-foreground">Sample input</div><pre className="mt-1 whitespace-pre-wrap">{p.input}</pre></div>
                  <div className="rounded-md border bg-muted/40 p-3 text-sm"><div className="text-xs font-semibold uppercase text-muted-foreground">Sample output</div><pre className="mt-1 whitespace-pre-wrap">{p.output}</pre></div>
                </div>
                <details className="mt-4 rounded-md border p-3">
                  <summary className="cursor-pointer text-sm font-medium"><Lightbulb className="mr-1 inline h-4 w-4 text-amber-500" />Hints</summary>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{p.hints.map((h, i) => <li key={i}>{h}</li>)}</ul>
                </details>
                <details className="mt-2 rounded-md border p-3">
                  <summary className="cursor-pointer text-sm font-medium">Solution explanation</summary>
                  <p className="mt-2 text-sm text-muted-foreground">{p.solution}</p>
                </details>
                <Button onClick={() => markDone(p)} disabled={done} className="mt-5 bg-gradient-to-r from-indigo-600 to-violet-600">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {done ? "Completed" : t("Mark as Completed")}
                </Button>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
