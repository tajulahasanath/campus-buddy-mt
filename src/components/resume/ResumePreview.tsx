import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Monitor, Smartphone, Printer, FileDown } from "lucide-react";
import { TemplateView, type TemplateId } from "./templates";
import type { ResumeData } from "@/lib/resume/types";

export function ResumePreview({ r, template }: { r: ResumeData; template: TemplateId }) {
  const [zoom, setZoom] = useState(0.7);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const downloadDoc = () => {
    const node = document.getElementById("resume-print-area");
    if (!node) return;
    const html = `<html><head><meta charset="utf-8"><title>${r.personal.name || "Resume"}</title></head><body>${node.innerHTML}</body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${(r.personal.name || "resume").replace(/\s+/g, "_")}.doc`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="no-print mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2">
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
          <span className="w-12 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
          <Button size="icon" variant="ghost" onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
          <div className="mx-2 h-5 w-px bg-border" />
          <Button size="icon" variant={device === "desktop" ? "default" : "ghost"} onClick={() => setDevice("desktop")}><Monitor className="h-4 w-4" /></Button>
          <Button size="icon" variant={device === "mobile" ? "default" : "ghost"} onClick={() => setDevice("mobile")}><Smartphone className="h-4 w-4" /></Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={downloadDoc}><FileDown className="mr-1.5 h-4 w-4" /> DOCX</Button>
          <Button size="sm" onClick={() => window.print()} className="bg-gradient-to-r from-indigo-600 to-violet-600"><Printer className="mr-1.5 h-4 w-4" /> PDF</Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border bg-zinc-100 p-4 dark:bg-zinc-900">
        <div className="mx-auto origin-top shadow-elegant" style={{ width: device === "mobile" ? 420 : 794, transform: `scale(${zoom})`, transformOrigin: "top center" }}>
          <Card id="resume-print-area" className="print-area overflow-hidden rounded-md p-0">
            <TemplateView r={r} template={template} />
          </Card>
        </div>
      </div>
      <style>{`@media print { body * { visibility: hidden; } .print-area, .print-area * { visibility: visible; } .print-area { position: absolute; inset: 0; background: white; box-shadow: none !important; transform: none !important; } .no-print { display: none !important; } @page { size: A4; margin: 0; } }`}</style>
    </div>
  );
}
