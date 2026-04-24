import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, X, Camera, Brain, MessageSquare, BarChart3, Eye, ScanLine, Star, BookOpen, Send } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ScribbleUnderline } from "@/components/ScribbleUnderline";
import { HeroCTA } from "@/components/HeroCTA";
import { FlipCard } from "@/components/FlipCard";
import BrandedRubiksCube from "@/components/BrandedRubiksCube";
import { cn } from "@/lib/utils";

const Logo = () => (
  <a href="#" className="font-display text-3xl uppercase tracking-tight text-ink">
    Khata<span className="text-primary">Lens</span>
  </a>
);

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
  <header
    className={cn(
      "fixed top-0 inset-x-0 z-50 h-20 transition-all duration-300",
      isScrolled
        ? "border-b border-border/70 bg-background/80 backdrop-blur-md"
        : "border-b border-transparent bg-transparent"
    )}
  >
    <div className="container h-full flex items-center justify-between">
      <Logo />
      <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-ink-soft">
        <a href="#features" className="hover:text-primary transition-colors">AI Layers</a>
        <a href="#how" className="hover:text-primary transition-colors">How it works</a>
        <a href="#problem" className="hover:text-primary transition-colors">Why KhataLens</a>
        <a href="#testimonials" className="hover:text-primary transition-colors">Impact</a>
      </nav>
      <div className="flex items-center gap-3">
        <a href="#" className="hidden sm:inline text-sm font-medium text-ink-soft hover:text-ink">Login</a>
        <a href="#cta" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary-deep transition-colors">
          Try KhataLens
          <ArrowRight className="size-4" />
        </a>
      </div>
    </div>
  </header>
  );
};

const Hero = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setTrigger(sectionRef.current);
  }, []);
  return (
  <section ref={sectionRef} className="relative pt-36 pb-28 bg-grid overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/30 to-background pointer-events-none" />
    {/* Centered 3D cube — sits BEHIND the headline */}
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-16 md:top-12 w-[300px] sm:w-[380px] md:w-[480px] lg:w-[560px] aspect-square z-0 opacity-75"
    >
      <BrandedRubiksCube scrollTriggerEl={trigger} />
    </div>
    {/* Transparent veil in front of cube for text readability */}
    <div className="pointer-events-none absolute inset-x-0 top-16 h-[62vh] bg-gradient-to-b from-background/80 via-background/50 to-background/0 z-[1]" />
    <div className="container relative z-10">

      <Reveal className="flex justify-center">
        <span className="inline-flex items-center gap-2 border border-border-strong bg-background/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft rounded-full">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          AI-Powered Migration
        </span>
      </Reveal>

      <div className="mt-8 text-center">
        <h1 className="font-display text-ink text-[11vw] sm:text-5xl md:text-7xl lg:text-[8rem] leading-[0.95] tracking-[-0.02em]">
          <span className="block">SNAP KHATA,</span>
          <span className="block mt-1">
            <ScribbleUnderline>GET</ScribbleUnderline>{" "}
            <span className="text-primary">DIGITAL</span>.
          </span>
        </h1>
        <p className="mt-8 mx-auto max-w-xl text-base sm:text-lg text-ink font-medium leading-relaxed">
          Pakistan's small businesses already have data — it's just{" "}
          <ScribbleUnderline>trapped</ScribbleUnderline> inside paper. KhataLens unlocks it using AI.
        </p>
        <div className="mt-10 mx-auto max-w-4xl">
          <HeroCTA />
        </div>
        <p className="mt-4 text-xs sm:text-sm text-ink-soft">📸 Photo → 🧠 Extract → 🧾 Structure → ⚠️ Detect overdue → 💬 Generate reminder</p>
      </div>

      {/* Mockup */}
      <Reveal className="mt-20">
        <ProductMockup />
      </Reveal>
    </div>
  </section>
  );
};

const ProductMockup = () => (
  <div className="mx-auto max-w-5xl border border-border-strong bg-background rounded-lg shadow-2xl shadow-primary/10 overflow-hidden">
    <div className="flex items-center gap-2 px-4 h-10 border-b border-border bg-surface">
      <span className="size-3 rounded-full bg-primary/80" />
      <span className="size-3 rounded-full bg-primary/40" />
      <span className="size-3 rounded-full bg-primary/20" />
      <span className="mx-auto text-xs font-medium text-ink-soft hidden sm:inline">khatalens.app / scan / ledger-page-04</span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-12 min-h-[300px] md:min-h-[420px]">
      {/* Sidebar — scanned pages (hidden on mobile) */}
      <aside className="hidden md:block col-span-3 border-r border-border bg-surface/60 p-4 space-y-1.5">
        {["📷 Upload Page", "📄 Page 1", "📄 Page 2", "📄 Page 3 ★", "📊 Insights", "💬 Reminders"].map((i, idx) => (
          <div key={i} className={`text-xs font-medium px-3 py-2 rounded ${idx === 3 ? 'bg-primary/10 text-primary' : 'text-ink-soft'}`}>
            {i}
          </div>
        ))}
      </aside>
      {/* Extracted ledger table */}
      <div className="col-span-1 md:col-span-6 bg-grid p-4 sm:p-6 relative">
        <div className="bg-background border border-border rounded-md p-4 sm:p-5 shadow-md">
          <div className="text-[10px] sm:text-xs uppercase tracking-widest text-primary font-bold">Extracted Records</div>
          <div className="mt-3 space-y-2">
            {[
              { name: "Aslam", amt: "Rs. 2,500", status: "Overdue", color: "text-red-600" },
              { name: "Imran", amt: "Rs. 1,000", status: "Paid", color: "text-green-600" },
              { name: "Naeem", amt: "Rs. 900", status: "Pending", color: "text-amber-600" },
            ].map(r => (
              <div key={r.name} className="flex items-center justify-between text-xs sm:text-sm border-b border-border pb-2">
                <span className="font-medium text-ink">{r.name}</span>
                <span className="text-ink-soft">{r.amt}</span>
                <span className={`font-bold ${r.color}`}>{r.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[10px] sm:text-xs text-ink-soft">3 entries • 95% confidence • AI structured</div>
        </div>
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded shadow-lg">
          ▸ Send Reminder
        </div>
      </div>
      {/* Insights panel (hidden on mobile) */}
      <aside className="hidden md:block col-span-3 border-l border-border bg-surface/60 p-4 space-y-4 text-xs">
        <div>
          <div className="font-display uppercase text-ink mb-2">Recoverable</div>
          <div className="px-2 py-1.5 bg-primary/10 text-primary rounded font-medium inline-block">Rs. 3,400</div>
        </div>
        <div>
          <div className="font-display uppercase text-ink mb-2">Overdue</div>
          <div className="px-2 py-1.5 bg-red-100 text-red-700 rounded font-medium inline-block">1 customer</div>
        </div>
        <div>
          <div className="font-display uppercase text-ink mb-2">Reminder</div>
          <div className="bg-ink text-background rounded p-2 text-[10px] font-mono leading-relaxed">
            <div className="text-primary-soft">Aslam bhai,</div>
            <div className="opacity-80">aap ka Rs. 2,500 udhaar pending hai.</div>
          </div>
        </div>
      </aside>
    </div>
  </div>
);

const SocialProof = () => (
  <section className="border-y border-border bg-surface/40">
    <div className="container py-10">
      <Reveal className="text-center text-[11px] uppercase tracking-[0.25em] text-ink-soft font-semibold">
        The problem is massive
      </Reveal>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
        {[
          { stat: "40M+", label: "Small businesses in Pakistan" },
          { stat: "80%", label: "Still use paper registers" },
          { stat: "Rs. 0", label: "Recovered from lost records" },
          { stat: "5 sec", label: "KhataLens scan time" },
        ].map(b => (
          <div key={b.stat} className="text-center">
            <div className="font-display text-2xl sm:text-3xl text-primary">{b.stat}</div>
            <div className="mt-1 text-xs sm:text-sm text-ink">{b.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ProblemSolution = () => (
  <section id="problem" className="grid md:grid-cols-2 border-b border-border">
    {/* Problem */}
    <div className="bg-primary-darker text-background p-10 md:p-16 bg-grid-dark">
      <Reveal>
        <div className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-background/60 font-semibold">The paper problem</div>
        <h3 className="mt-6 font-display text-3xl sm:text-5xl md:text-6xl uppercase">
          Data trapped<br/>in messy<br/>notebooks.
        </h3>
        <ul className="mt-10 space-y-4">
          {[
            "Handwritten entries that are hard to search",
            "Lost or damaged registers erasing months of data",
            "Manual follow-ups that never happen",
            "No visibility into who owes what",
          ].map(t => (
            <li key={t} className="flex items-start gap-3 text-background/90 font-medium text-sm sm:text-base">
              <X className="size-5 text-primary mt-0.5 shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
    {/* Solution */}
    <div className="bg-primary text-primary-foreground p-10 md:p-16 border-l-4 border-background/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-dark opacity-40" />
      <Reveal className="relative">
        <div className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-primary-foreground/80 font-semibold">The KhataLens way</div>
        <h3 className="mt-6 font-display text-3xl sm:text-5xl md:text-6xl uppercase">
          Snap a photo.<br/>Get a digital<br/>ledger.
        </h3>
        <ul className="mt-10 space-y-4">
          {[
            "AI reads handwritten pages in seconds",
            "Structured customer ledger with balances",
            "Overdue accounts flagged automatically",
            "WhatsApp reminders generated in Urdu & English",
          ].map(t => (
            <li key={t} className="flex items-start gap-3 font-medium text-sm sm:text-base">
              <Check className="size-5 mt-0.5 shrink-0" strokeWidth={3} />
              {t}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  </section>
);

const FeatureCard = ({ className = "", children }: any) => (
  <div className={`group border border-border bg-card p-8 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 ${className}`}>
    {children}
  </div>
);

const Bento = () => (
  <section id="features" className="py-28 border-b border-border">
    <div className="container">
      <Reveal className="max-w-3xl">
        <div className="text-[11px] uppercase tracking-[0.25em] text-primary font-bold">4 AI Layers</div>
        <h2 className="mt-4 font-display text-3xl sm:text-5xl md:text-7xl uppercase text-ink">
          Not just OCR.<br/>Real <ScribbleUnderline>intelligence</ScribbleUnderline>.
        </h2>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 auto-rows-[minmax(280px,auto)] sm:auto-rows-[minmax(360px,auto)] gap-5">
        <FlipCard
          variant="dark"
          className="md:col-span-2 min-h-[360px]"
          front={
            <>
              <Eye className="size-8 text-primary" />
              <h3 className="mt-6 font-display text-2xl sm:text-3xl uppercase">Vision AI</h3>
              <p className="mt-3 text-background/80 max-w-md text-sm sm:text-base">Reads messy handwritten ledger pages — uneven lines, abbreviations, mixed Urdu/English, inconsistent formats.</p>
              <div className="mt-8 grid grid-cols-3 gap-2">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className={`h-10 rounded ${i % 3 === 0 ? 'bg-primary' : 'bg-background/10'} ${i % 2 === 0 ? 'animate-pulse-soft' : ''}`} style={{ animationDelay: `${i * 120}ms` }} />
                ))}
              </div>
              <div className="mt-auto pt-6 text-[10px] uppercase tracking-[0.25em] text-background/50">Hover to flip →</div>
            </>
          }
          back={
            <>
              <div className="text-[11px] uppercase tracking-[0.25em] text-primary font-bold">Layer 1</div>
              <h3 className="mt-4 font-display text-3xl uppercase">Beyond simple OCR</h3>
              <p className="mt-3 text-ink-soft">Computer vision + OCR + layout understanding to convert unstructured handwritten pages into structured transaction records.</p>
              <ul className="mt-6 space-y-2 text-sm text-ink-soft">
                <li className="flex gap-2"><Check className="size-4 mt-0.5 text-primary" strokeWidth={3} />Row boundary detection</li>
                <li className="flex gap-2"><Check className="size-4 mt-0.5 text-primary" strokeWidth={3} />Customer name extraction</li>
                <li className="flex gap-2"><Check className="size-4 mt-0.5 text-primary" strokeWidth={3} />Amount & date parsing</li>
              </ul>
            </>
          }
        />

        <FlipCard
          className="min-h-[360px]"
          front={
            <>
              <Brain className="size-8 text-primary" />
              <h3 className="mt-6 font-display text-2xl sm:text-3xl uppercase">Language AI</h3>
              <p className="mt-3 text-ink-soft text-sm sm:text-base">Understands what each notebook entry actually means.</p>
              <div className="mt-6 bg-ink text-background rounded p-4 text-xs font-mono leading-relaxed">
                <div className="text-primary/80">"Aslam 2500 kal"</div>
                <div className="opacity-70">→ Customer: Aslam</div>
                <div className="opacity-70">→ Amount: Rs. 2,500</div>
                <div className="opacity-70">→ Status: Pending</div>
              </div>
            </>
          }
          back={
            <>
              <div className="text-[11px] uppercase tracking-[0.25em] font-bold opacity-80">Layer 2</div>
              <h3 className="mt-4 font-display text-3xl uppercase">Meaning, not text</h3>
              <p className="mt-3 opacity-90">LLM/NLP layer classifies and normalizes entries into customer-wise balances, due dates, and transaction types.</p>
            </>
          }
        />

        <FlipCard
          className="min-h-[360px]"
          front={
            <>
              <ScanLine className="size-8 text-primary" />
              <h3 className="mt-6 font-display text-2xl sm:text-3xl uppercase">Reasoning AI</h3>
              <p className="mt-3 text-ink-soft text-sm sm:text-base">Detects overdue and risky accounts automatically.</p>
              <div className="mt-6 space-y-2">
                <div className="h-3 bg-red-500/80 rounded-full w-5/6" />
                <div className="h-3 bg-amber-500/60 rounded-full w-3/5" />
                <div className="h-3 bg-green-500/40 rounded-full w-4/6" />
              </div>
            </>
          }
          back={
            <>
              <div className="text-[11px] uppercase tracking-[0.25em] font-bold opacity-80">Layer 3</div>
              <h3 className="mt-4 font-display text-3xl uppercase">Actionable insight</h3>
              <p className="mt-3 opacity-90">Identifies overdue balances, repeat debtors, and follow-up priority from transaction history.</p>
            </>
          }
        />

        <FlipCard
          className="md:col-span-2 min-h-[360px]"
          front={
            <>
              <MessageSquare className="size-8 text-primary" />
              <h3 className="mt-6 font-display text-2xl sm:text-3xl uppercase">Generative AI</h3>
              <p className="mt-3 text-ink-soft max-w-md text-sm sm:text-base">Creates personalized recovery messages from extracted ledger data, ready to send via WhatsApp.</p>
              <div className="mt-8 space-y-3">
                <div className="bg-surface border border-border rounded-lg p-4 text-sm">
                  <div className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Urdu reminder</div>
                  <div className="text-ink font-medium">Aslam bhai, aap ka Rs. 2,500 udhaar pending hai. Meherbani kar ke payment kar dein. Shukriya.</div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-4 text-sm">
                  <div className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">English reminder</div>
                  <div className="text-ink font-medium">Hello Aslam, your pending balance is Rs. 2,500. Please clear it when possible. Thank you.</div>
                </div>
              </div>
            </>
          }
          back={
            <>
              <div className="text-[11px] uppercase tracking-[0.25em] font-bold opacity-80">Layer 4</div>
              <h3 className="mt-4 font-display text-3xl uppercase">Smart reminders</h3>
              <p className="mt-3 opacity-90 max-w-md">Generates polite Urdu/English messages, stronger reminders for long-overdue cases, and customer-specific summaries.</p>
            </>
          }
        />

        <FlipCard
          className="min-h-[360px]"
          front={
            <>
              <Send className="size-8 text-primary" />
              <h3 className="mt-6 font-display text-2xl sm:text-3xl uppercase">WhatsApp Ready</h3>
              <p className="mt-3 text-ink-soft text-sm sm:text-base">One-click send via the channel merchants already use daily.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["WHATSAPP", "SMS", "COPY", "SHARE"].map(t => (
                  <span key={t} className="text-[10px] uppercase tracking-widest font-bold border border-border px-2 py-1 text-ink-soft">{t}</span>
                ))}
              </div>
            </>
          }
          back={
            <>
              <div className="text-[11px] uppercase tracking-[0.25em] font-bold opacity-80">Delivery</div>
              <h3 className="mt-4 font-display text-3xl uppercase">Last-mile action</h3>
              <p className="mt-3 opacity-90">Not just digitization — we improve cash recovery through a communication channel merchants already use.</p>
            </>
          }
        />

        <FlipCard
          className="min-h-[360px]"
          front={
            <>
              <BookOpen className="size-8 text-primary" />
              <h3 className="mt-6 font-display text-2xl sm:text-3xl uppercase">Export & Save</h3>
              <p className="mt-3 text-ink-soft text-sm sm:text-base">Download structured data as CSV. Keep records safe forever.</p>
              <div className="mt-6 flex items-end gap-2 h-28">
                {[40, 72, 55, 90, 65, 88, 76, 95, 60, 82].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/80 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            </>
          }
          back={
            <>
              <div className="text-[11px] uppercase tracking-[0.25em] font-bold opacity-80">Data</div>
              <h3 className="mt-4 font-display text-3xl uppercase">Your data, yours</h3>
              <p className="mt-3 opacity-90">Export customer ledgers, transaction history, and balance summaries. No lock-in.</p>
            </>
          }
        />
      </div>
    </div>
  </section>
);

const HowItWorks = () => {
  const steps = [
    { n: "01", title: "Snap your khata page", body: "Take a photo of any handwritten udhaar notebook page. Messy handwriting, mixed Urdu/English — KhataLens handles it all." },
    { n: "02", title: "AI extracts & structures", body: "Vision AI reads rows, Language AI understands meaning, Reasoning AI flags overdue accounts — all in seconds." },
    { n: "03", title: "Send & recover", body: "Review your digital ledger, see who owes what, and send personalized WhatsApp reminders with one click." },
  ];
  return (
    <section id="how" className="py-28 border-b border-border bg-surface/40 bg-grid">
      <div className="container grid md:grid-cols-3 gap-12">
        <div className="md:sticky md:top-28 self-start">
          <Reveal>
            <div className="text-[11px] uppercase tracking-[0.25em] text-primary font-bold">Process</div>
            <h2 className="mt-4 font-display text-3xl sm:text-5xl md:text-7xl uppercase text-ink">
              How<br/>it<br/>works.
            </h2>
          </Reveal>
        </div>
        <div className="md:col-span-2 space-y-12">
          {steps.map(s => (
            <Reveal key={s.n} className="group flex gap-4 sm:gap-8 items-start border-t border-border pt-10">
              <div className="font-display text-5xl sm:text-7xl md:text-8xl text-primary/20 group-hover:text-primary transition-colors duration-500 leading-none">{s.n}</div>
              <div>
                <h3 className="font-display text-2xl sm:text-3xl md:text-4xl uppercase text-ink">{s.title}</h3>
                <p className="mt-3 text-ink-soft text-base sm:text-lg max-w-lg">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const items = [
    { q: "A shopkeeper takes a picture of his notebook, and five seconds later he knows who owes him money. That's the magic.", n: "Kiryana Owner", r: "Local Shop, Karachi", dark: false },
    { q: "Digital khata apps help you from today onward. KhataLens helps you bring your past into the digital system.", n: "Market Insight", r: "Small Business Research", dark: true },
    { q: "With one click, the app drafts the reminder in Urdu. My customers actually respond now.", n: "Wholesale Trader", r: "Wholesale Market, Lahore", dark: false },
  ];
  return (
    <section id="testimonials" className="py-28 border-b border-border">
      <div className="container">
        <Reveal className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.25em] text-primary font-bold">Real impact</div>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl md:text-7xl uppercase text-ink">Real shops.<br/>Real recovery.</h2>
        </Reveal>
        <div className="mt-16 grid md:grid-cols-3 gap-5">
          {items.map((t, i) => {
            const initials = t.n.split(' ').map(p => p[0]).join('');
            return (
              <Reveal key={i} className={`group/t [perspective:1200px] min-h-[280px] sm:min-h-[320px] ${t.dark ? 'md:translate-y-4' : ''}`}>
                <div className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(0.61,0.98,0.48,1.01)] group-hover/t:[transform:rotate(180deg)_rotateX(180deg)]">
                  {/* Front */}
                  <div className={`absolute inset-0 [backface-visibility:hidden] border p-8 flex flex-col shadow-sm ${t.dark ? 'bg-primary-darker text-background border-primary-darker' : 'bg-card text-ink border-border'}`}>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, k) => (<Star key={k} className="size-5 fill-primary text-primary" />))}
                    </div>
                    <p className={`mt-6 text-base sm:text-lg font-medium leading-snug ${t.dark ? 'text-background' : 'text-ink'}`}>"{t.q}"</p>
                    <div className={`mt-auto pt-6 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] ${t.dark ? 'text-background/60' : 'text-ink-soft'}`}>Hover to meet them →</div>
                  </div>
                  {/* Back */}
                  <div className={`absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] border p-8 flex flex-col items-center justify-center text-center shadow-xl shadow-primary/20 ${t.dark ? 'bg-background text-ink border-border' : 'bg-primary text-primary-foreground border-primary'}`}>
                    <div className={`size-20 rounded-full grid place-items-center font-display text-2xl uppercase mb-5 ${t.dark ? 'bg-primary text-primary-foreground' : 'bg-background text-ink'}`}>{initials}</div>
                    <div className="font-display uppercase text-2xl">{t.n}</div>
                    <div className={`mt-2 text-sm ${t.dark ? 'text-ink-soft' : 'text-primary-foreground/80'}`}>{t.r}</div>
                    <div className={`mt-5 h-px w-12 ${t.dark ? 'bg-primary' : 'bg-primary-foreground/40'}`} />
                    <div className={`mt-5 text-[11px] uppercase tracking-[0.25em] font-bold ${t.dark ? 'text-primary' : 'text-primary-foreground/80'}`}>Real user story</div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const FinalCTA = () => (
  <section id="cta" className="relative py-32 bg-primary text-primary-foreground overflow-hidden">
    <div className="absolute inset-0 bg-grid-dark opacity-50" />
    <div className="absolute inset-0 grid place-items-center pointer-events-none select-none">
      <div className="font-display text-[22vw] uppercase text-primary-foreground/[0.06] leading-none whitespace-nowrap">SCAN IT</div>
    </div>
    <div className="container relative text-center">
      <Reveal stagger>
        <div className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-primary-foreground/80">Start today</div>
        <h2 className="mt-6 font-display text-4xl sm:text-6xl md:text-8xl uppercase leading-[0.9]">
          Stop losing money.<br/>Start <span className="italic font-display">recovering</span>.
        </h2>
        <p className="mt-8 max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-primary-foreground/90 font-medium">
          KhataLens is not replacing bookkeeping apps. It is the AI bridge that gets small businesses into them.
        </p>
        <form className="mt-12 mx-auto max-w-xl flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="you@business.com"
            className="flex-1 h-14 px-5 bg-background text-ink border border-background rounded-md text-base placeholder:text-ink-soft/60 focus:outline-none"
          />
          <button
            type="submit"
            className="h-14 px-7 font-display uppercase text-lg bg-primary-darker text-background rounded-md hover:bg-ink transition-all hover:scale-[1.03] shadow-xl"
          >
            Try KhataLens →
          </button>
        </form>
      </Reveal>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-primary-darker text-background/70 border-t border-background/10">
    <div className="container py-16 grid md:grid-cols-4 gap-10">
      <div>
        <div className="font-display text-3xl uppercase text-background">Khata<span className="text-primary">Lens</span></div>
        <p className="mt-4 text-sm max-w-xs">AI-powered paper-to-ledger assistant for Pakistan's small businesses. From paper chaos to digital control.</p>
      </div>
      {[
        { t: "Product", l: ["AI Layers", "How it works", "Demo", "Pricing"] },
        { t: "Company", l: ["About", "Team", "Press", "Contact"] },
        { t: "Resources", l: ["Documentation", "Blog", "Community", "Support"] },
      ].map(c => (
        <div key={c.t}>
          <div className="font-display uppercase text-background text-sm">{c.t}</div>
          <ul className="mt-4 space-y-2 text-sm">
            {c.l.map(i => <li key={i}><a href="#" className="hover:text-background transition-colors">{i}</a></li>)}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-background/10">
      <div className="container py-6 flex flex-col sm:flex-row items-center justify-between text-xs">
        <div>© 2026 KhataLens. All rights reserved.</div>
        <div className="flex gap-6 mt-3 sm:mt-0">
          <a href="#" className="hover:text-background">Privacy</a>
          <a href="#" className="hover:text-background">Terms</a>
          <a href="#" className="hover:text-background">Contact</a>
        </div>
      </div>
    </div>
  </footer>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <ProblemSolution />
        <Bento />
        <HowItWorks />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
