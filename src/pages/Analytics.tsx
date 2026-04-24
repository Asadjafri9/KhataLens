import { BarChart3, Clock3, DollarSign, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const monthlyData = [
  { month: "Jan", recovered: 24000, overdue: 9000 },
  { month: "Feb", recovered: 28000, overdue: 7500 },
  { month: "Mar", recovered: 31000, overdue: 6800 },
  { month: "Apr", recovered: 35500, overdue: 5400 },
  { month: "May", recovered: 39000, overdue: 4600 },
  { month: "Jun", recovered: 42000, overdue: 3200 },
];

const statusData = [
  { label: "Paid", value: 62 },
  { label: "Pending", value: 24 },
  { label: "Overdue", value: 14 },
];

export default function Analytics() {
  return (
    <DashboardShell
      title="Analytics"
      subtitle="Track recovery trends, overdue risk, and the overall health of your ledger at a glance."
      actions={<div className="hidden sm:inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-ink-soft"><BarChart3 className="size-4 text-primary" />Weekly view</div>}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Recovered", value: "Rs. 1.24M", icon: DollarSign },
              { label: "Open balance", value: "Rs. 320k", icon: TrendingUp },
              { label: "Overdue", value: "14%", icon: Clock3 },
              { label: "Active alerts", value: "8", icon: BarChart3 },
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

          <div className="rounded-[30px] border border-border bg-background p-6 shadow-lg shadow-primary/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Recovery trend</div>
                <h2 className="mt-1 font-display text-2xl text-ink">Recovered vs overdue</h2>
              </div>
              <div className="text-sm text-ink-soft">Last 6 months</div>
            </div>

            <div className="mt-6 h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="recoveredFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="overdueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--ink-soft))" tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--ink-soft))" tickLine={false} axisLine={false} tickFormatter={(value) => `Rs ${Number(value) / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "18px",
                    }}
                  />
                  <Area type="monotone" dataKey="recovered" stroke="hsl(var(--primary))" fill="url(#recoveredFill)" strokeWidth={3} />
                  <Area type="monotone" dataKey="overdue" stroke="hsl(var(--destructive))" fill="url(#overdueFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-border bg-background p-6 shadow-lg shadow-primary/5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Portfolio mix</div>
            <h3 className="mt-2 font-display text-2xl text-ink">Status breakdown</h3>
            <div className="mt-5 h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" stroke="hsl(var(--ink-soft))" tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--ink-soft))" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "18px",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[18, 18, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[30px] border border-border bg-primary-darker p-6 text-primary-foreground shadow-lg shadow-primary/10">
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary-foreground/75">Insights</div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-primary-foreground/84">
              <p>Collections are strongest in the first three days after reminder send.</p>
              <p>Accounts older than 10 days should be surfaced to the chat bot for follow-up.</p>
              <p>Imported sheets with clear dates convert 22% faster than manual entries.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}