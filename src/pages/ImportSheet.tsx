import { useState, useRef } from "react";
import { CheckCircle2, Upload, ArrowRight, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function ImportSheet() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadKey, setUploadKey] = useState(0); // Add key to force re-render
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [extractedDate, setExtractedDate] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      console.log("No file selected or user not logged in");
      return;
    }
    
    console.log("File selected:", file.name);
    setSelectedFile(file);
    setIsExtracting(true);
    setRows([]);
    setExtractedDate(null);
    
    try {
      console.log("Getting shopkeeper ID...");
      // Get the correct shopkeeper ID
      const { data: sk, error: skError } = await supabase
        .from("shopkeepers")
        .select("id")
        .eq("auth_id", user.id)
        .single();
        
      if (skError || !sk) {
        console.error("Shopkeeper error:", skError);
        throw new Error("Shopkeeper profile not found");
      }
      
      console.log("Shopkeeper ID:", sk.id);

      // Send image to Python FastAPI
      const formData = new FormData();
      formData.append("file", file);
      
      console.log("Sending request to backend at http://localhost:8000/api/extract");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("Request timeout!");
        controller.abort();
      }, 60000); // 60 second timeout
      
      const res = await fetch("http://localhost:8000/api/extract", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log("Response received! Status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Failed to extract data from API: ${errorText}`);
      }
      
      const data = await res.json();
      console.log("Extracted data:", data);
      
      setExtractedDate(data.date);
      
      // Fetch all existing customers for this shopkeeper to try matching
      const { data: customers } = await supabase
        .from("customers")
        .select("id, name, phone")
        .eq("shopkeeper_id", sk.id);
        
      const processedRows = data.entries.map((entry: any, index: number) => {
        let phone = entry.phone;
        let status = phone ? "Ready" : "Needs Phone";
        
        // Auto-match if phone is missing
        if (!phone && customers) {
          const match = customers.find(c => c.name.toLowerCase().trim() === entry.name.toLowerCase().trim());
          if (match && match.phone) {
            phone = match.phone;
            status = "Matched from DB";
          }
        }
        
        return {
          id: index.toString(),
          name: entry.name,
          amount: entry.amount,
          phone: phone || "",
          status: status
        };
      });
      
      setRows(processedRows);
      console.log("Processed rows:", processedRows);
      toast.success("Khata page extracted successfully!");
    } catch (error: any) {
      console.error("Full error:", error);
      if (error.name === 'AbortError') {
        toast.error("Request timed out. The image might be too large or the server is slow.");
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        toast.error("Cannot connect to backend. Make sure FastAPI server is running on port 8000.");
      } else {
        toast.error(error.message || "Error processing image. Check console for details.");
      }
      setRows([]);
      setExtractedDate(null);
    } finally {
      setIsExtracting(false);
      setSelectedFile(null);
      // Reset the file input and force re-render
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploadKey(prev => prev + 1);
      console.log("Upload process completed");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handlePhoneChange = (id: string, newPhone: string) => {
    setRows(rows.map(r => {
      if (r.id === id) {
        return { ...r, phone: newPhone, status: newPhone.trim() ? "Ready (Edited)" : "Needs Phone" };
      }
      return r;
    }));
  };

  const handleConfirmImport = async () => {
    if (!user) return;
    if (rows.length === 0) return toast.error("No data to import");
    
    // Validate missing phones
    if (rows.some(r => !r.phone.trim())) {
      return toast.error("Please fill in all missing phone numbers before importing");
    }
    
    setIsImporting(true);
    
    try {
      const { data: sk } = await supabase
        .from("shopkeepers")
        .select("id")
        .eq("auth_id", user.id)
        .single();
        
      if (!sk) throw new Error("Shopkeeper not found");

      let successfulCount = 0;
      
      for (const row of rows) {
        // If phone is edited, it acts as a "brand new" customer if it doesn't exist
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id, balance")
          .eq("shopkeeper_id", sk.id)
          .eq("name", row.name)
          .eq("phone", row.phone)
          .maybeSingle();
          
        let customerId;
        let newBalance = Number(row.amount);
        
        if (existingCustomer) {
          customerId = existingCustomer.id;
          newBalance = Number(existingCustomer.balance || 0) + Number(row.amount);
          
          await supabase
            .from("customers")
            .update({ balance: newBalance })
            .eq("id", customerId);
        } else {
          // Brand new customer
          const { data: newCustomer, error: insertError } = await supabase
            .from("customers")
            .insert({
              shopkeeper_id: sk.id,
              name: row.name,
              phone: row.phone,
              balance: newBalance
            })
            .select("id")
            .single();
            
          if (insertError) throw insertError;
          customerId = newCustomer.id;
        }
        
        // Parse date properly if possible
        let txDate = new Date().toISOString();
        if (extractedDate) {
          // Replace common slashes/dots so JS Date parses it slightly better
          // Usually DD/MM/YY needs custom parsing, but we'll let JS try. 
          // If Invalid, it falls back to now.
          const parsed = new Date(extractedDate.replace(/\./g, "/"));
          if (!isNaN(parsed.getTime())) {
            txDate = parsed.toISOString();
          }
        }
        
        const { error: txError } = await supabase
          .from("transactions")
          .insert({
            customer_id: customerId,
            shopkeeper_id: sk.id,
            type: "credit", // giving udhaar
            amount: row.amount,
            description: "Imported via KhataLens OCR",
            date: txDate
          });
          
        if (txError) throw txError;
        successfulCount++;
      }
      
      toast.success(`Successfully imported ${successfulCount} entries!`);
      setRows([]);
      setSelectedFile(null);
      setExtractedDate(null);
    } catch (error) {
      console.error(error);
      toast.error("Error saving data to database");
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
                        {row.status === "Needs Phone" && <AlertCircle className="size-4 text-red-500" />}
                        {row.status.includes("Matched") && <Sparkles className="size-4 text-primary" />}
                        {row.status === "Ready" && <CheckCircle2 className="size-4 text-green-600" />}
                        <span className={
                          row.status === "Needs Phone" ? "text-red-500 font-semibold" : 
                          row.status.includes("Matched") ? "text-primary font-semibold text-xs" : "text-green-600 font-semibold"
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
                    Confirm & Save
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