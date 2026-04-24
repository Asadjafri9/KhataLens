import { BarChart3 } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="size-20 rounded-2xl bg-primary/10 grid place-items-center mb-6">
        <BarChart3 className="size-10 text-primary" />
      </div>
      <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">Analytics</h1>
      <p className="mt-3 text-ink-soft max-w-md text-sm sm:text-base">
        Your business intelligence dashboard. Top customers, revenue trends, overdue summaries — all in one place.
      </p>
      <div className="mt-8 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest">
        Coming Soon
      </div>
    </div>
  );
};

export default Analytics;
