import { useEffect, useState } from "react";
import { BarChart3, Clock3, DollarSign, TrendingUp, Users } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Cell
} from "recharts";

interface AnalyticsData {
  openBalance: number;
  totalCredit: number;
  totalRecovered: number;
  customerCount: number;
  pendingCount: number;
  paidCount: number;
  monthlyData: { month: string; imported: number }[];
  statusBreakdown: { label: string; value: number }[];
}

const BAR_COLORS = ["hsl(var(--primary))", "#f87171"];

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/analytics")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load analytics");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `Rs. ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `Rs. ${(n / 1_000).toFixed(1)}k`;
    return `Rs. ${n.toLocaleString()}`;
  };

  const overdueRate =
    data && data.customerCount > 0
      ? Math.round((data.pendingCount / data.customerCount) * 100)
      : 0;

  const statCards = data
    ? [
        { label: "Total Credit Given", value: fmt(data.totalCredit), icon: DollarSign },
        { label: "Open Balance", value: fmt(data.openBalance), icon: TrendingUp },
        { label: "Pending Customers", value: `${overdueRate}%`, icon: Clock3 },
        { label: "Total Customers", value: String(data.customerCount), icon: Users },
      ]
    : [];

  return (
    <DashboardShell
      title="Analytics"
      subtitle="Track recovery trends, overdue risk, and the overall health of your ledger at a glance."
      actions={
        <div className="hidden sm:inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-ink-soft">
          <BarChart3 className="size-4 text-primary" />
          Live data
        </div>
      }
    >
      {loading ? (
        <div className="flex h-64 items-center justify-center text-ink-soft">
          Loading analytics from local database…
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center rounded-[30px] border border-red-200 bg-red-50 text-red-600 text-sm">
          ⚠️ {error} — Make sure the Python backend is running.
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Stat Cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((item) => {
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

          {/* ── Recovery Trend ── */}
          <div className="rounded-[30px] border border-border bg-background p-6 shadow-lg shadow-primary/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Recovery Trend</div>
                <h2 className="mt-1 font-display text-2xl text-ink">Monthly Imported Credit</h2>
              </div>
              <div className="text-sm text-ink-soft">
                {data!.monthlyData.length > 0
                  ? `Last ${data!.monthlyData.length} month${data!.monthlyData.length !== 1 ? "s" : ""}`
                  : "No data yet"}
              </div>
            </div>

            {data!.monthlyData.length === 0 ? (
              <div className="mt-6 flex h-[280px] items-center justify-center rounded-2xl border-2 border-dashed border-border text-sm text-ink-soft">
                No transaction history yet. Import a khata sheet to see trends.
              </div>
            ) : (
              <div className="mt-6 h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data!.monthlyData}>
                    <defs>
                      <linearGradient id="importedFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--ink-soft))" tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="hsl(var(--ink-soft))"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `Rs ${Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip
                      formatter={(v: number) => [`Rs. ${v.toLocaleString()}`, "Imported"]}
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "18px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="imported"
                      stroke="hsl(var(--primary))"
                      fill="url(#importedFill)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ── Portfolio Mix ── */}
          <div className="rounded-[30px] border border-border bg-background p-6 shadow-lg shadow-primary/5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Portfolio Mix</div>
            <h3 className="mt-2 font-display text-2xl text-ink">Customer Status Breakdown</h3>

            {data!.customerCount === 0 ? (
              <div className="mt-6 flex h-[200px] items-center justify-center rounded-2xl border-2 border-dashed border-border text-sm text-ink-soft">
                No customers yet. Import a khata sheet first.
              </div>
            ) : (
              <>
                <div className="mt-6 h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data!.statusBreakdown} barCategoryGap="40%">
                      <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="label" stroke="hsl(var(--ink-soft))" tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--ink-soft))" tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        formatter={(v: number) => [`${v} customer${v !== 1 ? "s" : ""}`, ""]}
                        contentStyle={{
                          background: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "18px",
                        }}
                      />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                        {data!.statusBreakdown.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-primary inline-block" />
                    <span className="text-ink-soft">Paid Off: <strong className="text-ink">{data!.paidCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-red-400 inline-block" />
                    <span className="text-ink-soft">Pending: <strong className="text-ink">{data!.pendingCount}</strong></span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Insights ── */}
          <div className="rounded-[30px] border border-primary/30 bg-[linear-gradient(180deg,hsl(var(--primary-darker))_0%,hsl(353_74%_14%)_100%)] p-6 sm:p-8 text-primary-foreground shadow-[0_20px_60px_hsl(var(--primary)/0.24)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary-foreground/75">Insights</div>
            <h3 className="mt-2 font-display text-2xl sm:text-3xl text-primary-foreground">Your Ledger Summary</h3>
            
            <div className="mt-6 space-y-3">
              {data!.customerCount === 0 ? (
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-primary-foreground/80">
                  No data yet — import your first khata sheet to see insights here.
                </div>
              ) : (
                <>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-start gap-4 hover:bg-white/10 transition-colors">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl shadow-inner">👥</div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Customer Base</h4>
                      <p className="mt-1 text-sm leading-relaxed text-primary-foreground/80">
                        You have <strong>{data!.customerCount}</strong> customer{data!.customerCount !== 1 ? "s" : ""} in total.{" "}
                        <strong className="text-white">{data!.pendingCount}</strong> still have an outstanding balance.
                      </p>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-start gap-4 hover:bg-white/10 transition-colors">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl shadow-inner">💰</div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Credit Overview</h4>
                      <p className="mt-1 text-sm leading-relaxed text-primary-foreground/80">
                        Total credit extended: <strong>{fmt(data!.totalCredit)}</strong>.
                        Current open balance: <strong className="text-white">{fmt(data!.openBalance)}</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-start gap-4 hover:bg-white/10 transition-colors">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl shadow-inner">
                      {overdueRate > 50 ? "⚠️" : overdueRate > 0 ? "✅" : "🎉"}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Health Status</h4>
                      <p className="mt-1 text-sm leading-relaxed text-primary-foreground/80">
                        {overdueRate > 50 
                          ? "More than half your customers still owe money. Consider sending reminders via the Chat Bot."
                          : overdueRate > 0 
                            ? `${100 - overdueRate}% of your customers are fully paid off. Keep it up!`
                            : "All customers are fully paid off. Your ledger is perfectly clean!"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      )}
    </DashboardShell>
  );
}