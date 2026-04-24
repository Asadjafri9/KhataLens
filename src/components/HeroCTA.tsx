import type { FormEvent } from "react";

export function HeroCTA() {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full">
      <form
        onSubmit={handleSubmit}
        className="flex w-full sm:w-auto sm:min-w-[420px] md:min-w-[565px] h-12 sm:h-14 items-center gap-2 border border-primary/25 rounded-xl p-1 bg-background"
      >
        <input
          type="email"
          placeholder="Enter your email"
          required
          className="flex-1 h-full px-3 sm:px-4 bg-transparent font-body text-sm outline-none text-ink placeholder:text-ink-soft/60"
        />
        <button
          type="submit"
          className="h-full bg-primary text-primary-foreground px-4 sm:px-8 rounded-[10px] font-body font-semibold text-xs sm:text-sm hover:bg-primary-deep transition-colors whitespace-nowrap"
        >
          Scan My Khata
        </button>
      </form>

      <button
        type="button"
        className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-primary text-primary font-body font-semibold text-xs sm:text-sm rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap"
      >
        See How It Works
      </button>
    </div>
  );
}
