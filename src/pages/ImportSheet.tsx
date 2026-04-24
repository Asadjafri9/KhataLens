import { useState, useRef } from "react";
import { CheckCircle2, Upload, ArrowRight, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";

export default function ImportSheet() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadKey, setUploadKey] = useState(0);
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [extractedDate, setExtractedDate] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setIsExtracting(true);
    setRows([]);
    setExtractedDate(null);
    
    try {
      // Send image to Python FastAPI for OCR
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("http://localhost:8000/api/extract", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to extract data: ${errorText}`);
      }
      
      const data = await res.json();
      setExtractedDate(data.date);
        
      const processedRows = data.entries.map((entry: any, index: number) => {
        return {
          id: index.toString(),
          name: entry.name,
          amount: entry.amount,
          phone: entry.phone || "",
          status: entry.phone ? "Ready" : "Phone required",
          originalPhone: entry.phone || ""
        };
      });
      
      setRows(processedRows);
      toast.success("Khata page extracted successfully!");
    } catch (error: any) {
      console.error("Extraction error:", error);
      toast.error(error.message || "Error processing image.");
    } finally {
      setIsExtracting(false);
      setSelectedFile(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handlePhoneChange = (id: string, newPhone: string) => {
    setRows(rows.map(r => {
      if (r.id === id) {
        let newStatus = newPhone.trim() ? "Ready" : "Phone required";
        return { ...r, phone: newPhone, status: newStatus };
      }
      return r;
    }));
  };

  const handleConfirmImport = async () => {
    if (rows.length === 0) return toast.error("No data to import");
    
    if (rows.some(r => !r.phone.trim())) {
      return toast.error("Please fill in all missing phone numbers before importing");
    }
    
    setIsImporting(true);
    
    try {
      const res = await fetch("http://localhost:8000/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: rows,
          date: extractedDate
        })
      });

      if (!res.ok) throw new Error("Failed to save to local database");

      const result = await res.json();
      toast.success(`Successfully imported ${result.imported} entries to local storage!`);
      setRows([]);
      setExtractedDate(null);
    } catch (error) {
      console.error(error);
      toast.error("Error saving data to local database");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <DashboardShell
      title="Khata Scanner"
      subtitle="Upload Khata notebook images. AI extracts structured data automatically."
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
                <h2 className="font-display text-2xl text-ink">Scan Khata Page</h2>
              </div>
            </div>

            <div className="mt-5 rounded-[26px] border-2 border-dashed border-primary/25 bg-primary/5 px-6 py-14 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Sparkles className="size-8" />
              </div>
              <p className="mt-4 text-sm font-medium text-ink">Drag and drop Khata images (JPG, PNG), or pick a file from your device.</p>
              <p className="mt-2 text-sm text-ink-soft">Our Gemini AI reads handwritten Urdu/English smoothly.</p>
              <input
                type="file"
                key={uploadKey}
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
              />
              <button 
                onClick={triggerFileInput}
                disabled={isExtracting || isImporting}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-50"
              >
                {isExtracting ? (
                  <><Loader2 className="size-4 animate-spin" /> Extracting AI Data...</>
                ) : (
                  <>{selectedFile ? selectedFile.name : "Select Khata Image"} <ArrowRight className="size-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-border bg-background shadow-lg shadow-primary/5 flex flex-col">
          <div className="flex flex-col gap-3 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Live Preview</div>
              <h2 className="mt-1 font-display text-2xl text-ink">Extracted Entries</h2>
            </div>
            {extractedDate && (
              <div className="rounded-full border border-border bg-surface/50 px-4 py-2 text-sm font-medium text-ink">
                Scanned Date: <span className="text-primary ml-1">{extractedDate}</span>
              </div>
            )}
          </div>

          <div className="px-6 py-5 flex-1">
            {rows.length === 0 ? (
              <div className="flex h-full items-center justify-center min-h-[200px] text-ink-soft text-sm">
                Upload an image to see extracted data here.
              </div>
            ) : (
              <>
                <div className="grid gap-3 text-xs uppercase tracking-[0.2em] text-ink-soft sm:grid-cols-[1fr_0.8fr_1fr_0.8fr] mb-4">
                  <span>Name</span>
                  <span className="sm:text-right">Amount (PKR)</span>
                  <span>Phone Number</span>
                  <span className="sm:text-right">Status</span>
                </div>

                <div className="divide-y divide-border rounded-[24px] border border-border bg-surface/35 overflow-hidden">
                  {rows.map((row) => (
                    <div key={row.id} className="grid gap-3 px-4 py-4 text-sm sm:grid-cols-[1fr_0.8fr_1fr_0.8fr] sm:items-center">
                      <div className="font-semibold text-ink">{row.name}</div>
                      <div className="sm:text-right font-medium text-ink-soft">Rs. {row.amount}</div>
                      <div>
                        <input
                          type="text"
                          value={row.phone}
                          onChange={(e) => handlePhoneChange(row.id, e.target.value)}
                          placeholder="e.g. 0300-1234567"
                          className={`w-full bg-background border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary ${!row.phone.trim() ? "border-red-400" : "border-border"}`}
                        />
                      </div>
                      <div className="sm:text-right flex items-center justify-end gap-1.5">
                        {row.status === "Phone required" && <AlertCircle className="size-4 text-red-500" />}
                        {row.status === "Ready" && <CheckCircle2 className="size-4 text-green-600" />}
                        <span className={
                          row.status === "Phone required" ? "text-red-500 font-semibold" : "text-green-600 font-semibold"
                        }>
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-3 rounded-[20px] border border-border bg-background px-4 py-3 text-sm text-ink-soft">
                    {rows.some(r => !r.phone.trim()) ? (
                      <><AlertCircle className="size-5 text-red-500" /> Please add missing phone numbers.</>
                    ) : (
                      <><CheckCircle2 className="size-5 text-green-600" /> All entries are ready to import.</>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleConfirmImport}
                    disabled={isImporting || rows.some(r => !r.phone.trim())}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-50 whitespace-nowrap"
                  >
                    {isImporting ? <Loader2 className="size-4 animate-spin" /> : null}
                    Confirm & Save to Local
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}