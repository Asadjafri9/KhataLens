import { Bot, MessageSquareMore, Send, Sparkles, ShieldCheck, TriangleAlert, Loader2 } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Message {
  role: "assistant" | "user";
  content: string;
}

export default function ChatBot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Good morning. I'm your KhataLens assistant. I can summarize your ledger, identify overdue accounts, or help you draft recovery messages." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const fetchLedgerContext = async () => {
    try {
      const statsRes = await fetch("http://localhost:8000/api/stats");
      const custRes = await fetch("http://localhost:8000/api/customers");
      
      const stats = await statsRes.json();
      const customers = await custRes.json();
      
      const topDebtors = customers.slice(0, 5).map((c: any) => `${c.name}: Rs. ${c.balance}`).join(", ");
      
      return `Total Customers: ${stats.activeCustomers}. 
              Total Pending Recovery: Rs. ${stats.totalBalance}. 
              Top Debtors: ${topDebtors}.`;
    } catch (error) {
      console.error("Context fetch error:", error);
      return "Ledger data currently unavailable.";
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const contextData = await fetchLedgerContext();

      // Using the working OCR key for the chatbot to ensure active quota
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GOOGLE_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are KhataLens AI, a specialized assistant for shopkeepers in Pakistan. 
                  You help them manage their digital ledger (Khata). 
                  
                  CONTEXT DATA:
                  ${contextData}
                  
                  INSTRUCTIONS:
                  - Answer questions based on the provided CONTEXT DATA.
                  - If a customer's balance is asked, use the context.
                  - If asked to draft a reminder, provide it in both English and Urdu (Roman Urdu is fine).
                  - Keep answers concise and helpful.
                  - If the data is not in the context, politely say you don't have that specific record.
                  
                  PREVIOUS CONVERSATION:
                  ${messages.map(m => `${m.role}: ${m.content}`).join("\n")}
                  
                  USER QUERY:
                  ${messageText}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Gemini API Error");
      }

      const assistantContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that request.";

      const assistantMessage: Message = { 
        role: "assistant", 
        content: assistantContent
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong with the AI assistant.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardShell
      title="Khata AI Assistant"
      subtitle="Talk to your ledger data. Ask for summaries, overdue accounts, or draft messages."
      actions={
        <div className="hidden sm:inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-ink-soft">
          <Bot className={`size-4 ${isLoading ? "text-primary animate-pulse" : "text-primary"}`} />
          {isLoading ? "AI Thinking..." : "Assistant Online"}
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="flex h-[600px] flex-col rounded-[30px] border border-border bg-background shadow-lg shadow-primary/5 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-5 shrink-0">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Live Assistant</div>
              <h2 className="mt-1 font-display text-2xl text-ink">Insightful Khata Chat</h2>
            </div>
            <div className="hidden sm:flex items-center rounded-full border border-border bg-surface/50 px-4 py-2 text-sm text-ink-soft">
              <ShieldCheck className="mr-2 size-4 text-primary" />
              Secure Data Layer
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 px-6 py-6 overflow-y-auto bg-grid">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] rounded-[22px] px-5 py-3.5 text-sm leading-relaxed sm:max-w-[72%] shadow-sm ${message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-white border border-border text-ink rounded-tl-none"
                  }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-ink-soft animate-pulse">
                <Loader2 className="size-3 animate-spin" />
                AI is analyzing your ledger...
              </div>
            )}
          </div>

          <div className="border-t border-border px-6 py-5 bg-surface/30">
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                "Who owes me the most?",
                "Draft a reminder for Aslam",
                "Summarize recent activity",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => handleSendMessage(item)}
                  disabled={isLoading}
                  className="rounded-full border border-border bg-white px-4 py-1.5 text-xs font-medium text-ink-soft hover:border-primary/40 hover:text-primary transition-all disabled:opacity-50"
                >
                  {item}
                </button>
              ))}
            </div>

            <form
              className="flex items-center gap-3 rounded-[20px] border border-border bg-white px-4 py-2 shadow-sm focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5 transition-all"
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your customers or transactions..."
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-ink-soft/40"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-50 transition-all active:scale-95"
              >
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-border bg-primary-darker p-6 text-primary-foreground shadow-lg shadow-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-dark opacity-20" />
            <div className="relative z-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/75">
              <Sparkles className="size-4" />
              Intelligence Layer
            </div>
            <div className="relative z-10 mt-4 space-y-4 text-sm leading-relaxed text-primary-foreground/90">
              <p>“Kaunse customers ka balance sabse zyada hai?”</p>
              <p>“Babar Wholesale ke liye ek polite payment reminder draft karo.”</p>
              <p>“Summary of total pending recovery.”</p>
            </div>
          </div>

          <div className="rounded-[30px] border border-border bg-background p-6 shadow-lg shadow-primary/5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Data Privacy</div>
            <div className="mt-4 space-y-3 text-sm text-ink-soft">
              <div className="flex items-start gap-3 rounded-[18px] border border-border bg-surface/50 p-4">
                <ShieldCheck className="mt-0.5 size-4 text-primary" />
                Your ledger data is used locally to help the AI answer your questions.
              </div>
              <div className="flex items-start gap-3 rounded-[18px] border border-border bg-surface/50 p-4">
                <MessageSquareMore className="mt-0.5 size-4 text-primary" />
                The AI understands both English and Urdu/Roman Urdu queries perfectly.
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
