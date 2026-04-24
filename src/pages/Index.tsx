import { useEffect, useState } from "react";
import { ArrowRight, Check, X, Zap, Layers, Sparkles, BarChart3, Users, Lock, Star } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ScribbleUnderline } from "@/components/ScribbleUnderline";
import { RevealText } from "@/components/RevealText";
import { FlipCard } from "@/components/FlipCard";
import { cn } from "@/lib/utils";

const Logo = () => (
  <a href="#" className="font-display text-3xl uppercase tracking-tight text-ink">
    Flux<span className="text-primary">.</span>
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
        <a href="#features" className="hover:text-primary transition-colors">Features</a>
        <a href="#how" className="hover:text-primary transition-colors">How it works</a>
        <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
        <a href="#testimonials" className="hover:text-primary transition-colors">Customers</a>
      </nav>
      <div className="flex items-center gap-3">
        <a href="#" className="hidden sm:inline text-sm font-medium text-ink-soft hover:text-ink">Login</a>
        <a href="#cta" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary-deep transition-colors">
          Start free
          <ArrowRight className="size-4" />
        </a>
      </div>
    </div>
  </header>
  );
};

const Hero = () => (
  <section className="relative pt-36 pb-28 bg-grid overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/30 to-background pointer-events-none" />
    <div className="container relative">
      <Reveal className="flex justify-center">
        <span className="inline-flex items-center gap-2 border border-border-strong bg-background/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft rounded-full">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          Now in private beta
        </span>
      </Reveal>

      <Reveal className="mt-8 text-center" stagger>
        <h1 className="font-display text-ink text-[14vw] sm:text-7xl md:text-8xl lg:text-[9rem] leading-[0.9]">
          <span className="block">SHIP WORK,</span>
          <span className="block">NOT <span className="echo-stack">
            <span className="echo echo-4">MEETINGS</span>
            <span className="echo echo-3">MEETINGS</span>
            <span className="echo echo-2">MEETINGS</span>
            <span className="echo echo-1">MEETINGS</span>
            <span className="echo-top text-primary">MEETINGS</span>
          </span>.</span>
        </h1>
        <p className="mt-8 mx-auto max-w-xl text-lg text-ink-soft font-medium">
          Flux is the operating system for product teams who want to move{" "}
          <ScribbleUnderline>fast</ScribbleUnderline> without the chaos. Plan, build, and ship in one sharp workspace.
        </p>
        <form className="mt-10 mx-auto max-w-xl flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="you@company.com"
            className="flex-1 h-14 px-5 bg-background border border-border-strong rounded-md text-base placeholder:text-ink-soft/60 focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            className="h-14 px-7 font-display uppercase text-lg bg-primary text-primary-foreground rounded-md hover:bg-primary-deep transition-colors"
          >
            Join Waitlist
          </button>
        </form>
        <p className="mt-4 text-xs text-ink-soft">No spam. Free during beta. Cancel anytime.</p>
      </Reveal>

      {/* Mockup */}
      <Reveal className="mt-20">
        <ProductMockup />
      </Reveal>
    </div>
  </section>
);

const ProductMockup = () => (
  <div className="mx-auto max-w-5xl border border-border-strong bg-background rounded-lg shadow-2xl shadow-primary/10 overflow-hidden">
    <div className="flex items-center gap-2 px-4 h-10 border-b border-border bg-surface">
      <span className="size-3 rounded-full bg-primary/80" />
      <span className="size-3 rounded-full bg-primary/40" />
      <span className="size-3 rounded-full bg-primary/20" />
      <span className="mx-auto text-xs font-medium text-ink-soft">flux.app / workspace / sprint-24</span>
    </div>
    <div className="grid grid-cols-12 min-h-[420px]">
      {/* Sidebar */}
      <aside className="col-span-3 border-r border-border bg-surface/60 p-4 space-y-1.5">
        {["Inbox", "Sprint 24", "Roadmap", "Docs", "Insights", "Team"].map((i, idx) => (
          <div key={i} className={`text-xs font-medium px-3 py-2 rounded ${idx === 1 ? 'bg-primary/10 text-primary' : 'text-ink-soft'}`}>
            {i}
          </div>
        ))}
      </aside>
      {/* Canvas */}
      <div className="col-span-6 bg-grid p-6 relative">
        <div className="bg-background border border-border rounded-md p-5 shadow-md">
          <div className="text-[10px] uppercase tracking-widest text-primary font-bold">In progress</div>
          <div className="mt-2 font-display text-2xl text-ink">Onboarding flow v2</div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="h-2 bg-primary rounded-full" />
            <div className="h-2 bg-primary rounded-full" />
            <div className="h-2 bg-border rounded-full" />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="size-7 rounded-full bg-primary text-primary-foreground text-[10px] grid place-items-center font-bold">JM</div>
            <div className="size-7 rounded-full bg-ink text-background text-[10px] grid place-items-center font-bold">AK</div>
            <div className="size-7 rounded-full bg-surface-2 border border-border text-ink-soft text-[10px] grid place-items-center font-bold">+4</div>
          </div>
        </div>
        <div className="absolute bottom-6 right-6 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded shadow-lg">
          ▸ Maya
        </div>
      </div>
      {/* Properties */}
      <aside className="col-span-3 border-l border-border bg-surface/60 p-4 space-y-4 text-xs">
        <div>
          <div className="font-display uppercase text-ink mb-2">Status</div>
          <div className="px-2 py-1.5 bg-primary/10 text-primary rounded font-medium inline-block">Active</div>
        </div>
        <div>
          <div className="font-display uppercase text-ink mb-2">Accent</div>
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-primary border border-border" />
            <code className="text-ink-soft">#990011</code>
          </div>
        </div>
        <div>
          <div className="font-display uppercase text-ink mb-2">Align</div>
          <div className="flex gap-1.5">
            {[1,2,3].map(i => <div key={i} className="size-6 grid place-items-center border border-border rounded text-ink-soft">≡</div>)}
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
        Trusted by 4,200+ product teams
      </Reveal>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-70">
        {["NORTHWIND", "ACME", "LUMEN", "OBSIDIAN", "VERTEX", "HALCYON"].map(b => (
          <div key={b} className="font-display text-xl text-center text-ink uppercase tracking-tight">{b}</div>
        ))}
      </div>
    </div>
  </section>
);

const ProblemSolution = () => (
  <section className="grid md:grid-cols-2 border-b border-border">
    {/* Problem */}
    <div className="bg-primary-darker text-background p-10 md:p-16 bg-grid-dark">
      <Reveal>
        <div className="text-[11px] uppercase tracking-[0.25em] text-background/50 font-semibold">The old way</div>
        <h3 className="mt-6 font-display text-5xl md:text-6xl uppercase">
          Tools that<br/>slow you<br/>down.
        </h3>
        <ul className="mt-10 space-y-4">
          {[
            "Endless tabs between Jira, Slack and Notion",
            "Status updates that nobody reads",
            "Roadmaps outdated the day they ship",
            "Meetings to talk about the meetings",
          ].map(t => (
            <li key={t} className="flex items-start gap-3 text-background/75 font-medium">
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
        <div className="text-[11px] uppercase tracking-[0.25em] text-primary-foreground/70 font-semibold">The Flux way</div>
        <h3 className="mt-6 font-display text-5xl md:text-6xl uppercase">
          One sharp<br/>workspace.<br/>Real momentum.
        </h3>
        <ul className="mt-10 space-y-4">
          {[
            "Plan, build, and ship in a single canvas",
            "Live status — no standups required",
            "Roadmaps that update themselves",
            "AI summaries instead of 1-hour syncs",
          ].map(t => (
            <li key={t} className="flex items-start gap-3 font-medium">
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
        <div className="text-[11px] uppercase tracking-[0.25em] text-primary font-bold">Features</div>
        <h2 className="mt-4 font-display text-5xl md:text-7xl uppercase text-ink">
          Built for teams<br/>who actually <ScribbleUnderline>ship</ScribbleUnderline>.
        </h2>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 auto-rows-[minmax(360px,auto)] gap-5">
        <FlipCard
          variant="dark"
          className="md:col-span-2 min-h-[360px]"
          front={
            <>
              <Zap className="size-8 text-primary" />
              <h3 className="mt-6 font-display text-3xl uppercase">Realtime Sprint canvas</h3>
              <p className="mt-3 text-background/70 max-w-md">A live, opinionated board where work moves itself as code, design and decisions land.</p>
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
              <div className="text-[11px] uppercase tracking-[0.25em] text-primary font-bold">How it works</div>
              <h3 className="mt-4 font-display text-3xl uppercase">Zero-friction flow</h3>
              <p className="mt-3 text-ink-soft">Every PR, design and doc auto-snaps into the canvas. No drag-and-drop tax. No status meetings.</p>
              <ul className="mt-6 space-y-2 text-sm text-ink-soft">
                <li className="flex gap-2"><Check className="size-4 mt-0.5 text-primary" strokeWidth={3} />Live PR + issue sync</li>
                <li className="flex gap-2"><Check className="size-4 mt-0.5 text-primary" strokeWidth={3} />Auto-grouped by sprint</li>
                <li className="flex gap-2"><Check className="size-4 mt-0.5 text-primary" strokeWidth={3} />Inline review threads</li>
              </ul>
            </>
          }
        />

        <FlipCard
          className="min-h-[360px]"
          front={
            <>
              <Layers className="size-8 text-primary" />
              <h3 className="mt-6 font-display text-3xl uppercase">Stacked roadmaps</h3>
              <p className="mt-3 text-ink-soft">Tie strategy to commits without spreadsheets.</p>
              <div className="mt-6 space-y-2">
                <div className="h-3 bg-primary/80 rounded-full w-5/6" />
                <div className="h-3 bg-primary/50 rounded-full w-3/5" />
                <div className="h-3 bg-primary/20 rounded-full w-4/6" />
              </div>
            </>
          }
          back={
            <>
              <div className="text-[11px] uppercase tracking-[0.25em] font-bold opacity-80">Roadmaps</div>
              <h3 className="mt-4 font-display text-3xl uppercase">From vision to PR</h3>
              <p className="mt-3 opacity-90">Stack initiatives across quarters. Each card stays linked to live work.</p>
            </>
          }
        />

        <FlipCard
          className="min-h-[360px]"
          front={
            <>
              <Sparkles className="size-8 text-primary" />
              <h3 className="mt-6 font-display text-3xl uppercase">AI standups</h3>
              <p className="mt-3 text-ink-soft">Auto-generated daily summaries from real activity.</p>
              <div className="mt-6 bg-ink text-background rounded p-4 text-xs font-mono leading-relaxed">
                <div className="text-primary/80">&gt; flux summary --today</div>
                <div className="opacity-70">3 PRs merged · 12 issues closed</div>
                <div className="opacity-70">2 blockers flagged · 1 launch ready</div>
              </div>
            </>
          }
          back={
            <>
              <div className="text-[11px] uppercase tracking-[0.25em] font-bold opacity-80">AI</div>
              <h3 className="mt-4 font-display text-3xl uppercase">Skip the sync</h3>
              <p className="mt-3 opacity-90">Delivered to Slack at 9am. Surfaces blockers before they become Jira tickets.</p>
            </>
          }
        />

        <FlipCard
          className="md:col-span-2 min-h-[360px]"
          front={
            <>
              <BarChart3 className="size-8 text-primary" />
              <h3 className="mt-6 font-display text-3xl uppercase">Cycle insights</h3>
              <p className="mt-3 text-ink-soft max-w-md">See where work stalls — across squads, repos, and quarters — without building a single dashboard.</p>
              <div className="mt-8 flex items-end gap-2 h-28">
                {[40, 72, 55, 90, 65, 88, 76, 95, 60, 82].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/80 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            </>
          }
          back={
            <>
              <div className="text-[11px] uppercase tracking-[0.25em] font-bold opacity-80">Insights</div>
              <h3 className="mt-4 font-display text-3xl uppercase">Spot the bottleneck</h3>
              <p className="mt-3 opacity-90 max-w-md">Cycle time, throughput, review latency — already computed. No SQL, no BI tool, no rituals.</p>
            </>
          }
        />

        <FlipCard
          className="min-h-[360px]"
          front={
            <>
              <Users className="size-8 text-primary" />
              <h3 className="mt-6 font-display text-3xl uppercase">Squad rooms</h3>
              <p className="mt-3 text-ink-soft">Async-first spaces with the context already loaded.</p>
              <div className="mt-6 flex -space-x-2">
                {["JM", "AK", "RT", "ED", "LO"].map((n, i) => (
                  <div key={n} className={`size-10 rounded-full grid place-items-center text-xs font-bold border-2 border-card ${i % 2 ? 'bg-primary text-primary-foreground' : 'bg-ink text-background'}`}>{n}</div>
                ))}
              </div>
            </>
          }
          back={
            <>
              <div className="text-[11px] uppercase tracking-[0.25em] font-bold opacity-80">Squads</div>
              <h3 className="mt-4 font-display text-3xl uppercase">Context, preloaded</h3>
              <p className="mt-3 opacity-90">Every room ships with the right docs, PRs and decisions pinned. New hires onboard themselves.</p>
            </>
          }
        />

        <FlipCard
          className="min-h-[360px]"
          front={
            <>
              <Lock className="size-8 text-primary" />
              <h3 className="mt-6 font-display text-3xl uppercase">Enterprise grade</h3>
              <p className="mt-3 text-ink-soft">SOC2, SAML SSO, audit logs, EU residency.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["SOC2", "SSO", "SCIM", "GDPR"].map(t => (
                  <span key={t} className="text-[10px] uppercase tracking-widest font-bold border border-border px-2 py-1 text-ink-soft">{t}</span>
                ))}
              </div>
            </>
          }
          back={
            <>
              <div className="text-[11px] uppercase tracking-[0.25em] font-bold opacity-80">Security</div>
              <h3 className="mt-4 font-display text-3xl uppercase">Built for IT</h3>
              <p className="mt-3 opacity-90">SCIM provisioning, granular audit logs, regional data residency. Your security team will actually like us.</p>
            </>
          }
        />
      </div>
    </div>
  </section>
);

const HowItWorks = () => {
  const steps = [
    { n: "01", title: "Connect your stack", body: "Pipe in GitHub, Linear, Figma and Slack in under two minutes. Flux maps your work automatically." },
    { n: "02", title: "Define your cadence", body: "Set the sprint shape that fits your team — weekly, biweekly, continuous. Flux runs the rituals." },
    { n: "03", title: "Ship without friction", body: "Watch decisions, code and design land in one place. No status meetings. No surprises." },
  ];
  return (
    <section id="how" className="py-28 border-b border-border bg-surface/40 bg-grid">
      <div className="container grid md:grid-cols-3 gap-12">
        <div className="md:sticky md:top-28 self-start">
          <Reveal>
            <div className="text-[11px] uppercase tracking-[0.25em] text-primary font-bold">Process</div>
            <h2 className="mt-4 font-display text-5xl md:text-7xl uppercase text-ink">
              How<br/>it<br/>works.
            </h2>
          </Reveal>
        </div>
        <div className="md:col-span-2 space-y-12">
          {steps.map(s => (
            <Reveal key={s.n} className="group flex gap-8 items-start border-t border-border pt-10">
              <div className="font-display text-7xl md:text-8xl text-primary/20 group-hover:text-primary transition-colors duration-500 leading-none">{s.n}</div>
              <div>
                <h3 className="font-display text-3xl md:text-4xl uppercase text-ink">{s.title}</h3>
                <p className="mt-3 text-ink-soft text-lg max-w-lg">{s.body}</p>
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
    { q: "We killed three weekly meetings the week we adopted Flux. Nobody noticed — except our shipping velocity.", n: "Jordan Mei", r: "Head of Product, Northwind", dark: false },
    { q: "It feels like the tool was built by a team that has actually shipped software. Sharp, opinionated, fast.", n: "Aiko Kuroda", r: "VP Engineering, Lumen", dark: true },
    { q: "Our roadmap finally tells the truth. Stakeholders stopped asking for status decks.", n: "Rafael Tovar", r: "CPO, Vertex", dark: false },
  ];
  return (
    <section id="testimonials" className="py-28 border-b border-border">
      <div className="container">
        <Reveal className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.25em] text-primary font-bold">Loved by builders</div>
          <h2 className="mt-4 font-display text-5xl md:text-7xl uppercase text-ink">Real teams.<br/>Real momentum.</h2>
        </Reveal>
        <div className="mt-16 grid md:grid-cols-3 gap-5">
          {items.map((t,i) => (
            <Reveal key={i} className={`p-8 border ${t.dark ? 'bg-primary-darker text-background border-primary-darker md:translate-y-4' : 'bg-card border-border'}`}>
              <div className="flex gap-1">
                {[...Array(5)].map((_,k)=>(<Star key={k} className="size-5 fill-primary text-primary" />))}
              </div>
              <p className={`mt-6 text-lg font-medium leading-snug ${t.dark ? 'text-background' : 'text-ink'}`}>"{t.q}"</p>
              <div className="mt-8 flex items-center gap-3">
                <div className={`size-12 rounded-full grid place-items-center font-display uppercase ${t.dark ? 'bg-background text-ink' : 'bg-ink text-background'}`}>{t.n.split(' ').map(p=>p[0]).join('')}</div>
                <div>
                  <div className="font-display uppercase text-sm">{t.n}</div>
                  <div className={`text-xs ${t.dark ? 'text-background/60' : 'text-ink-soft'}`}>{t.r}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCTA = () => (
  <section id="cta" className="relative py-32 bg-primary text-primary-foreground overflow-hidden">
    <div className="absolute inset-0 bg-grid-dark opacity-50" />
    <div className="absolute inset-0 grid place-items-center pointer-events-none select-none">
      <div className="font-display text-[22vw] uppercase text-primary-foreground/[0.06] leading-none whitespace-nowrap">SHIP IT</div>
    </div>
    <div className="container relative text-center">
      <Reveal stagger>
        <div className="text-[11px] uppercase tracking-[0.25em] font-bold text-primary-foreground/70">Start today</div>
        <h2 className="mt-6 font-display text-6xl md:text-8xl uppercase leading-[0.9]">
          Stop talking.<br/>Start <span className="italic font-display">shipping</span>.
        </h2>
        <p className="mt-8 max-w-2xl mx-auto text-xl md:text-2xl text-primary-foreground/80 font-medium">
          Join 4,200+ product teams replacing meetings with momentum. Free during beta.
        </p>
        <form className="mt-12 mx-auto max-w-xl flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="you@company.com"
            className="flex-1 h-14 px-5 bg-background text-ink border border-background rounded-md text-base placeholder:text-ink-soft/60 focus:outline-none"
          />
          <button
            type="submit"
            className="h-14 px-7 font-display uppercase text-lg bg-primary-darker text-background rounded-md hover:bg-ink transition-all hover:scale-[1.03] shadow-xl"
          >
            Get Access →
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
        <div className="font-display text-3xl uppercase text-background">Flux<span className="text-primary">.</span></div>
        <p className="mt-4 text-sm max-w-xs">The operating system for product teams who want to move fast without the chaos.</p>
      </div>
      {[
        { t: "Product", l: ["Features", "Pricing", "Changelog", "Roadmap"] },
        { t: "Company", l: ["About", "Careers", "Press", "Contact"] },
        { t: "Resources", l: ["Docs", "Blog", "Community", "Status"] },
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
        <div>© 2026 Flux Labs. All rights reserved.</div>
        <div className="flex gap-6 mt-3 sm:mt-0">
          <a href="#" className="hover:text-background">Privacy</a>
          <a href="#" className="hover:text-background">Terms</a>
          <a href="#" className="hover:text-background">Security</a>
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
