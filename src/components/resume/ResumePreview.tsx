import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Monitor, Smartphone, FileDown, Loader2 } from "lucide-react";
import { TemplateView, type TemplateId } from "./templates";
import type { ResumeData } from "@/lib/resume/types";
import { toast } from "sonner";
import { buildResumeDocx, normalizeFilename } from "@/lib/resume/docx-export";
import { getResumeTitle } from "@/lib/resume/types";

export function ResumePreview({ r, template, title }: { r: ResumeData; template: TemplateId; title?: string }) {
  const [zoom, setZoom] = useState(0.7);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [downloading, setDownloading] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState(false);

  const safeName = normalizeFilename(title || getResumeTitle(r, "resume"));

  const downloadDoc = async () => {
    setDownloadingDoc(true);
    const loading = toast.loading("Generating DOCX…");
    try {
      const blob = await buildResumeDocx(r);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${safeName}.docx`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast.success("DOCX downloaded", { id: loading });
    } catch (e) {
      toast.error("DOCX generation failed", { id: loading });
    } finally {
      setDownloadingDoc(false);
    }
  };

  const downloadPDF = async () => {
    const node = document.getElementById("resume-print-area");
    if (!node) return;
    setDownloading(true);
    const loading = toast.loading("Generating PDF…");
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: `${safeName}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(node)
        .save();
      toast.success("PDF downloaded", { id: loading });
    } catch (e) {
      toast.error("PDF generation failed", { id: loading });
    } finally {
      setDownloading(false);
    }
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
          <Button size="sm" variant="outline" onClick={downloadDoc} disabled={downloadingDoc}>
            {downloadingDoc ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <FileDown className="mr-1.5 h-4 w-4" />}
            DOCX
          </Button>
          <Button size="sm" onClick={downloadPDF} disabled={downloading} className="bg-gradient-to-r from-indigo-600 to-violet-600">
            {downloading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <FileDown className="mr-1.5 h-4 w-4" />}
            PDF
          </Button>
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
