import { Bot, MessageSquareMore, Send, Sparkles, ShieldCheck, TriangleAlert } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";

const conversation = [
  { role: "assistant", text: "Good morning. I can draft reminders, explain overdue balances, or summarize this week’s recovery." },
  { role: "user", text: "Show me top 5 overdue customers." },
  { role: "assistant", text: "Done. Aslam Traders, Babar Wholesale, and three more accounts are flagged. Want me to prepare reminder messages?" },
];

export default function ChatBot() {
  return (
    <DashboardShell
      title="Chat Bot"
      subtitle="Talk to the assistant in simple language, then turn that chat into reminder actions and summaries."
      actions={<div className="hidden sm:inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-ink-soft"><Bot className="size-4 text-primary" />Assistant online</div>}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[30px] border border-border bg-background shadow-lg shadow-primary/5">
          <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Conversation</div>
              <h2 className="mt-1 font-display text-2xl text-ink">Ask in plain English or Urdu</h2>
            </div>
            <div className="rounded-full border border-border bg-surface/50 px-4 py-2 text-sm text-ink-soft">
              <ShieldCheck className="mr-2 inline size-4 text-primary" />
              Safe suggestions
            </div>
          </div>

          <div className="space-y-4 px-6 py-6">
            {conversation.map((message) => (
              <div
                key={message.text}
                className={`max-w-[85%] rounded-[22px] px-4 py-3 text-sm leading-relaxed sm:max-w-[72%] ${message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-surface/70 text-ink"}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="border-t border-border px-6 py-5">
            <div className="flex flex-wrap gap-2">
              {[
                "Summarize overdue accounts",
                "Draft reminder in Urdu",
                "Show cash recovery trend",
              ].map((item) => (
                <button key={item} type="button" className="rounded-full border border-border bg-surface/50 px-4 py-2 text-sm text-ink-soft hover:border-primary/25 hover:text-primary">
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-[20px] border border-border bg-background px-4 py-3">
              <input
                type="text"
                placeholder="Type a question for the assistant"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-soft/50"
              />
              <button className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">
                Send
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-border bg-primary-darker p-6 text-primary-foreground shadow-lg shadow-primary/10">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/75">
              <Sparkles className="size-4" />
              Ready prompts
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-primary-foreground/84">
              <p>“Prepare reminders for accounts due this week.”</p>
              <p>“Give me a short Urdu message for Aslam bhai.”</p>
              <p>“Which customers need a call today?”</p>
            </div>
          </div>

          <div className="rounded-[30px] border border-border bg-background p-6 shadow-lg shadow-primary/5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Guardrails</div>
            <div className="mt-4 space-y-3 text-sm text-ink-soft">
              <div className="flex items-start gap-3 rounded-[18px] border border-border bg-surface/50 p-4">
                <TriangleAlert className="mt-0.5 size-4 text-amber-600" />
                Assistant only suggests actions. You approve before sending anything.
              </div>
              <div className="flex items-start gap-3 rounded-[18px] border border-border bg-surface/50 p-4">
                <MessageSquareMore className="mt-0.5 size-4 text-primary" />
                Messages can be drafted in a friendly, local tone for your customers.
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}