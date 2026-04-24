import { ArrowRight, Clock3, Search, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardShell } from "@/components/DashboardShell";

const customers = [
  { name: "Aslam Traders", city: "Lahore", balance: "Rs. 24,500", due: "Due today", status: "High priority", tone: "text-red-600" },
  { name: "Imran Grocery", city: "Faisalabad", balance: "Rs. 11,200", due: "2 days", status: "Warm", tone: "text-amber-600" },
  { name: "Naeem Store", city: "Karachi", balance: "Rs. 7,900", due: "Paid recently", status: "Healthy", tone: "text-green-600" },
  { name: "Babar Wholesale", city: "Multan", balance: "Rs. 19,000", due: "5 days", status: "Follow up", tone: "text-primary" },
];

export default function Customer() {
  return (
    <DashboardShell
      title="Customer"
      subtitle="See every customer, balance, due date, and follow-up signal in one calm view."
      actions={
        <Link to="/import-sheet" className="hidden sm:inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-ink hover:border-primary/30 hover:text-primary">
          <ArrowRight className="size-4" />
          Import sheet
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Active customers", value: "128", icon: Users },
              { label: "Pending amount", value: "Rs. 62,600", icon: TrendingUp },
              { label: "Due today", value: "7 customers", icon: Clock3 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[28px] border border-border bg-background p-5 shadow-lg shadow-primary/5">
                  <div className="flex items-center justify-between text-ink-soft">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em]">{item.label}</span>
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div className="mt-4 font-display text-3xl text-ink">{item.value}</div>
                </div>
              );
            })}
          </div>

          <div className="rounded-[30px] border border-border bg-background shadow-lg shadow-primary/5">
            <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Customer ledger</div>
                <h2 className="mt-1 font-display text-2xl text-ink">Priority customers</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-surface/50 px-4 py-2 text-sm text-ink-soft">
                <Search className="size-4" />
                Search customer
              </div>
            </div>

            <div className="divide-y divide-border">
              {customers.map((customer) => (
                <div key={customer.name} className="grid gap-3 px-5 py-4 sm:grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr] sm:items-center">
                  <div>
                    <div className="font-semibold text-ink">{customer.name}</div>
                    <div className="text-sm text-ink-soft">{customer.city}</div>
                  </div>
                  <div className="text-sm font-medium text-ink-soft sm:text-right">{customer.balance}</div>
                  <div className="text-sm text-ink-soft sm:text-right">{customer.due}</div>
                  <div className={`text-sm font-semibold sm:text-right ${customer.tone}`}>{customer.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-border bg-primary-darker p-6 text-primary-foreground shadow-lg shadow-primary/10">
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary-foreground/75">Today’s focus</div>
            <h3 className="mt-3 font-display text-3xl uppercase">Top follow-ups first</h3>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
              The dashboard highlights the accounts that need attention now so your team can act fast.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Aslam Traders - send reminder",
                "Babar Wholesale - confirm payment",
                "Imran Grocery - check next visit",
              ].map((item) => (
                <div key={item} className="rounded-[18px] border border-primary-foreground/10 bg-primary-foreground/5 px-4 py-3 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-border bg-background p-6 shadow-lg shadow-primary/5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Quick actions</div>
            <div className="mt-4 space-y-3">
              {[
                "Create new customer",
                "Add payment note",
                "Send bulk reminder",
              ].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-[18px] border border-border bg-surface/50 px-4 py-3 text-sm font-medium text-ink">
                  {item}
                  <ArrowRight className="size-4 text-primary" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}