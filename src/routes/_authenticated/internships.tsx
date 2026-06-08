import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Briefcase, MapPin, Clock, ExternalLink, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/internships")({
  head: () => ({ meta: [{ title: "Internship Opportunities — Student Hub" }] }),
  component: Internships,
});

const INTERNSHIPS = [
  { co: "Google", role: "Software Engineering Intern", loc: "Bengaluru", type: "On-site", stipend: "₹ 90k/mo", tags: ["SWE", "Tier-1"], url: "https://careers.google.com" },
  { co: "Microsoft", role: "SDE Intern", loc: "Hyderabad", type: "On-site", stipend: "₹ 80k/mo", tags: ["SWE"], url: "https://careers.microsoft.com" },
  { co: "Zomato", role: "Product Intern", loc: "Gurugram", type: "Hybrid", stipend: "₹ 50k/mo", tags: ["Product"], url: "https://www.zomato.com/careers" },
  { co: "Razorpay", role: "Backend Intern", loc: "Remote", type: "Remote", stipend: "₹ 60k/mo", tags: ["Backend", "Go"], url: "https://razorpay.com/jobs" },
  { co: "Swiggy", role: "Data Science Intern", loc: "Bengaluru", type: "Hybrid", stipend: "₹ 55k/mo", tags: ["ML", "Python"], url: "https://careers.swiggy.com" },
  { co: "Flipkart", role: "Frontend Intern", loc: "Bengaluru", type: "On-site", stipend: "₹ 60k/mo", tags: ["React", "Frontend"], url: "https://www.flipkartcareers.com" },
  { co: "Atlassian", role: "Full-Stack Intern", loc: "Remote", type: "Remote", stipend: "₹ 70k/mo", tags: ["Full-Stack"], url: "https://www.atlassian.com/company/careers" },
  { co: "Adobe", role: "Research Intern", loc: "Noida", type: "On-site", stipend: "₹ 75k/mo", tags: ["Research", "AI"], url: "https://careers.adobe.com" },
  { co: "Postman", role: "Developer Advocate Intern", loc: "Remote", type: "Remote", stipend: "₹ 45k/mo", tags: ["DevRel"], url: "https://www.postman.com/company/careers" },
];

function Internships() {
  const [q, setQ] = useState("");
  const list = INTERNSHIPS.filter((i) => q === "" || `${i.co} ${i.role} ${i.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Internship Opportunities</h1>
        <p className="mt-1 text-muted-foreground">Curated openings across tech, product, ML and more.</p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company, role, skill…" className="pl-9" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((i) => (
          <Card key={i.co + i.role} className="p-5 transition-shadow hover:shadow-elegant">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-brand text-primary-foreground font-bold">{i.co[0]}</div>
                <div>
                  <h3 className="font-semibold">{i.role}</h3>
                  <p className="text-sm text-muted-foreground">{i.co}</p>
                </div>
              </div>
              <Badge className="bg-success text-success-foreground">{i.stipend}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {i.loc}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {i.type}</span>
              <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" /> Internship</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">{i.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}</div>
            <a href={i.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              Apply now <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
