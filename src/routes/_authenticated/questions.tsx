import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/_authenticated/questions")({
  head: () => ({ meta: [{ title: "Important Questions — Student Hub" }] }),
  component: Questions,
});

const SUBJECTS = [
  {
    name: "Data Structures", weight: "High", qs: [
      "Explain time and space complexity with examples.",
      "Implement a singly linked list with insert/delete operations.",
      "Difference between BFS and DFS with use cases.",
      "Compare quicksort and mergesort — when to use which?",
      "Explain AVL trees and rotations.",
    ],
  },
  {
    name: "Operating Systems", weight: "High", qs: [
      "Explain process states and the PCB.",
      "Difference between paging and segmentation.",
      "Solve a Banker's algorithm problem.",
      "Explain producer–consumer with semaphores.",
      "Compare FCFS, SJF, RR scheduling.",
    ],
  },
  {
    name: "DBMS", weight: "High", qs: [
      "Explain normalization with 1NF–3NF examples.",
      "Difference between joins (inner, left, right, full).",
      "What is ACID? Explain each property.",
      "Indexing — B-tree vs hash.",
      "Write SQL for nth highest salary.",
    ],
  },
  {
    name: "Computer Networks", weight: "Medium", qs: [
      "Explain OSI vs TCP/IP model.",
      "Three-way handshake in TCP.",
      "Difference between TCP and UDP.",
      "Subnetting — solve a CIDR problem.",
      "Explain HTTPS and TLS handshake.",
    ],
  },
  {
    name: "Machine Learning", weight: "Medium", qs: [
      "Bias–variance tradeoff explained.",
      "Compare supervised vs unsupervised vs reinforcement learning.",
      "How does gradient descent work?",
      "Explain overfitting and regularization (L1/L2).",
      "Confusion matrix, precision, recall, F1.",
    ],
  },
];

function Questions() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Important Questions</h1>
        <p className="mt-1 text-muted-foreground">Handpicked, most-asked questions across core subjects.</p>
      </div>
      <Accordion type="multiple" className="space-y-3">
        {SUBJECTS.map((s) => (
          <AccordionItem key={s.name} value={s.name} className="rounded-xl border bg-card px-5 shadow-card-soft">
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold">{s.name}</span>
                <Badge variant={s.weight === "High" ? "default" : "secondary"}>{s.weight} importance</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ol className="ml-5 list-decimal space-y-2 pb-4 text-sm text-muted-foreground">
                {s.qs.map((q, i) => <li key={i}>{q}</li>)}
              </ol>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Card className="bg-gradient-subtle p-5 text-sm text-muted-foreground">
        💡 Tip: Pair these with previous year papers from the <strong>Previous Year Papers</strong> tab to spot repeated patterns.
      </Card>
    </div>
  );
}
