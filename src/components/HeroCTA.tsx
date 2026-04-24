import type { FormEvent } from "react";

export function HeroCTA() {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full md:w-auto md:min-w-[565px] h-14 items-center gap-2 border border-primary/25 rounded-xl p-1 bg-background"
      >
        <input
          type="email"
          placeholder="Enter your email"
          required
          className="flex-1 h-full px-4 bg-transparent font-body text-sm outline-none text-ink placeholder:text-ink-soft/60"
        />
        <button
          type="submit"
          className="h-full bg-primary text-primary-foreground px-8 rounded-[10px] font-body font-semibold text-sm hover:bg-primary-deep transition-colors"
        >
          Scan My Khata
        </button>
      </form>

      <button
        type="button"
        className="h-14 px-8 border-2 border-primary text-primary font-body font-semibold text-sm rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        See How It Works
      </button>
    </div>
  );
}
