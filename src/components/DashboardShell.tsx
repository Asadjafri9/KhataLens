import { ReactNode, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Bot, FileSpreadsheet, LogOut, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const navigation = [
  { label: "Customer", to: "/customer", icon: Users },
  { label: "Import Sheet", to: "/import-sheet", icon: FileSpreadsheet },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Chat Bot", to: "/chat-bot", icon: Bot },
];

interface DashboardShellProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function DashboardShell({ title, subtitle, actions, children }: DashboardShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="min-h-screen bg-grid text-ink">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.10),_transparent_28%),radial-gradient(circle_at_top_right,_hsl(var(--primary)/0.08),_transparent_24%),linear-gradient(to_bottom,_transparent_0%,_transparent_60%,_hsl(var(--background)/0.75)_100%)]" />

      <div className="relative min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-4 px-4 py-4 sm:px-6 lg:px-10">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.3em] text-ink-soft">KhataLens / Dashboard</div>
              <div className="mt-1 flex min-w-0 items-baseline gap-3">
                <h1 className="font-display text-2xl sm:text-3xl text-ink shrink-0">{title}</h1>
                <p className="min-w-0 text-sm sm:text-base text-ink-soft truncate">{subtitle}</p>
              </div>
            </div>
            {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
          </div>

          <div className="lg:hidden overflow-x-auto border-t border-border/70 px-4 py-3 sm:px-6">
            <div className="flex gap-2 min-w-max">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-ink-soft transition-colors"
                    activeClassName="border-primary bg-primary text-primary-foreground"
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <aside className="group hidden lg:sticky lg:top-[96px] lg:h-[calc(100vh-96px)] lg:self-start lg:flex lg:w-[132px] lg:hover:w-[300px] lg:flex-col px-4 py-5 transition-all duration-300 ease-out">
            <div className="relative flex h-full min-h-0 flex-col items-center rounded-[32px] border border-primary/30 bg-[linear-gradient(180deg,hsl(var(--primary-darker))_0%,hsl(353_74%_14%)_55%,hsl(353_76%_11%)_100%)] px-3 py-4 text-primary-foreground shadow-[inset_0_1px_0_hsl(var(--primary-foreground)/0.09),0_20px_60px_hsl(var(--primary)/0.24)]">
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_22%_8%,hsl(var(--primary-foreground)/0.08),transparent_32%),radial-gradient(circle_at_80%_88%,hsl(var(--primary)/0.18),transparent_46%)]" />

              <div className="relative flex w-full items-center justify-center">
                <Link
                  to="/customer"
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-foreground/25 bg-background/95 shadow-[inset_0_1px_0_hsl(var(--primary)/0.10),0_8px_20px_hsl(var(--primary-darker)/0.28)]"
                >
                  <img src="/khatalens-logo.png" alt="KhataLens" className="h-10 w-10 object-contain" />
                </Link>
              </div>

              <nav className="relative mt-5 flex w-full flex-1 flex-col items-center gap-3">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      aria-label={item.label}
                      title={item.label}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center gap-3 rounded-xl border border-transparent text-primary-foreground/80 transition-all duration-200 hover:border-primary-foreground/25 hover:bg-primary-foreground/8 hover:text-primary-foreground group-hover:h-12 group-hover:w-full group-hover:justify-start group-hover:px-4"
                      )}
                      activeClassName="border-primary-foreground/30 bg-primary-foreground/12 text-primary-foreground shadow-[inset_0_1px_0_hsl(var(--primary-foreground)/0.20),0_8px_24px_hsl(var(--primary-darker)/0.28)]"
                    >
                      <Icon className="size-[19px] min-w-[19px]" />
                      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-200 group-hover:max-w-[140px] group-hover:opacity-100">
                        {item.label}
                      </span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="relative mt-4 w-full">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-red-300/25 bg-red-500/15 text-red-100 transition-colors hover:bg-red-500/24 group-hover:justify-start group-hover:px-4"
                  aria-label="Log Out"
                  title="Log Out"
                >
                  <LogOut className="size-[19px] min-w-[19px]" />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-200 group-hover:max-w-[120px] group-hover:opacity-100">
                    Log Out
                  </span>
                </button>
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <main className="flex-1 overflow-hidden px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(3px)" }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>

        <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
          <AlertDialogContent className="max-w-md rounded-none border border-primary-foreground/15 bg-[linear-gradient(165deg,hsl(var(--primary))_0%,hsl(var(--primary-darker))_100%)] p-0 text-primary-foreground shadow-[0_26px_86px_hsl(var(--primary)/0.35)]">
            <div className="border-b border-primary-foreground/15 bg-transparent px-7 py-6">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-3xl uppercase text-primary-foreground">Exit KhataLens?</AlertDialogTitle>
                <AlertDialogDescription className="pt-2 text-sm leading-relaxed text-primary-foreground/85">
                  Are you sure you want to exit this workspace? You will be redirected to the landing page.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>

            <AlertDialogFooter className="bg-primary-darker/45 px-7 py-6 sm:space-x-3">
              <AlertDialogCancel className="h-11 rounded-full border-primary-foreground/25 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                Stay here
              </AlertDialogCancel>
              <AlertDialogAction
                className="h-11 rounded-full bg-primary-foreground px-6 text-primary hover:bg-primary-soft hover:text-primary"
                onClick={async () => {
                  await signOut();
                  navigate("/");
                }}
              >
                Yes, exit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}