import { CheckCircle2, FileSpreadsheet, Upload, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardShell } from "@/components/DashboardShell";

const previewRows = [
  { name: "Aslam", amount: "2,500", date: "12 Apr", status: "Mapped" },
  { name: "Imran", amount: "1,200", date: "13 Apr", status: "Mapped" },
  { name: "Naeem", amount: "900", date: "14 Apr", status: "Needs review" },
  { name: "Babar", amount: "4,100", date: "15 Apr", status: "Mapped" },
];

export default function ImportSheet() {
  return (
    <DashboardShell
      title="Import Sheet"
      subtitle="Upload CSV or XLSX files, map columns, and preview the structured khata before saving."
      actions={<Link to="/analytics" className="hidden sm:inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"><Sparkles className="size-4" />View analytics</Link>}
    >
      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <div className="rounded-[30px] border border-border bg-background p-6 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Upload className="size-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Upload</div>
                <h2 className="font-display text-2xl text-ink">Drop your sheet here</h2>
              </div>
            </div>

            <div className="mt-5 rounded-[26px] border-2 border-dashed border-primary/25 bg-primary/5 px-6 py-14 text-center">
              <FileSpreadsheet className="mx-auto size-12 text-primary" />
              <p className="mt-4 text-sm font-medium text-ink">Drag and drop CSV / XLSX, or pick a file from your device.</p>
              <p className="mt-2 text-sm text-ink-soft">KhataLens keeps the same warm brand tone while making imports feel light.</p>
              <button className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">
                Choose file
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="rounded-[30px] border border-border bg-background p-6 shadow-lg shadow-primary/5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Mapping</div>
            <h3 className="mt-2 font-display text-2xl text-ink">Column mapping</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                "Customer name",
                "Amount",
                "Date",
                "Status",
                "Phone",
              ].map((item) => (
                <span key={item} className="rounded-full border border-border bg-surface/50 px-4 py-2 text-sm text-ink-soft">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-5 rounded-[20px] border border-primary/15 bg-primary/5 p-4 text-sm text-ink-soft">
              Tip: map the same sheet once and reuse it every week to keep imports consistent.
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-border bg-background shadow-lg shadow-primary/5">
          <div className="flex flex-col gap-3 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Preview</div>
              <h2 className="mt-1 font-display text-2xl text-ink">Structured rows</h2>
            </div>
            <div className="rounded-full border border-border bg-surface/50 px-4 py-2 text-sm text-ink-soft">
              95% confidence • 4 rows ready
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="grid gap-3 text-xs uppercase tracking-[0.2em] text-ink-soft sm:grid-cols-[1.2fr_0.7fr_0.6fr_0.8fr]">
              <span>Name</span>
              <span className="sm:text-right">Amount</span>
              <span className="sm:text-right">Date</span>
              <span className="sm:text-right">Status</span>
            </div>

            <div className="mt-4 divide-y divide-border rounded-[24px] border border-border bg-surface/35">
              {previewRows.map((row) => (
                <div key={row.name} className="grid gap-3 px-4 py-4 text-sm sm:grid-cols-[1.2fr_0.7fr_0.6fr_0.8fr] sm:items-center">
                  <div className="font-semibold text-ink">{row.name}</div>
                  <div className="sm:text-right text-ink-soft">Rs. {row.amount}</div>
                  <div className="sm:text-right text-ink-soft">{row.date}</div>
                  <div className="sm:text-right font-semibold text-primary">{row.status}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex items-center gap-3 rounded-[20px] border border-border bg-background px-4 py-3 text-sm text-ink-soft">
                <CheckCircle2 className="size-5 text-green-600" />
                We matched customer names, amounts, and dates automatically.
              </div>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">
                Confirm import
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}