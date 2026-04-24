import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import BrandedRubiksCube from "@/components/BrandedRubiksCube";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface LoginProps {
  cubeShouldAssemble?: boolean;
}

export default function Login({ cubeShouldAssemble = true }: LoginProps) {
  const [showForm, setShowForm] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleIntroComplete = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowForm(true);
    }, 800);
  };

  const handleDemoLogin = () => {
    setIsTransitioning(true);
    setShowForm(true);
    setTimeout(() => {
      navigate('/customer');
    }, 500);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/customer'
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate Google login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background">
      {/* Navigation - Top Bar */}
      <div className="absolute left-0 top-0 z-[100] p-6 sm:p-10">
        <Link
          to="/"
          className="group flex items-center gap-2 rounded-full border border-border bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-ink transition-all hover:border-primary/40 hover:bg-white/10"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Go Back
        </Link>
      </div>

      {/* Background with dynamic red glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.08),transparent_70%)]"
      />

      {/* Grid pattern overlay */}
      <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6">
        <div
          className={`flex flex-col items-center transition-all duration-1000 ease-in-out ${showForm ? "opacity-0 scale-150 blur-2xl pointer-events-none absolute" : "opacity-100 scale-100 blur-0"
            }`}
        >
          <div className="relative h-[400px] w-[400px] sm:h-[500px] sm:w-[500px]">
            <BrandedRubiksCube
              className="h-full w-full"
              variant="login"
              playIntro={cubeShouldAssemble}
              onIntroComplete={handleIntroComplete}
            />
          </div>
          <p className={`mt-4 text-center text-[10px] uppercase tracking-[0.4em] text-primary/50 transition-opacity duration-1000 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
            Awaiting Secure Authentication
          </p>
        </div>

        <div
          className={`w-full max-w-md transition-all duration-1000 ease-out ${showForm ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-24 scale-95 pointer-events-none blur-xl"
            }`}
        >
          <div className="glass-card overflow-hidden rounded-[40px] p-8 sm:p-10">
            <div className="mb-8">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-6" />
              </div>
              <h1 className="font-display text-4xl uppercase text-ink">Access Vault</h1>
              <p className="mt-2 text-sm text-ink-soft opacity-60">Initialize your administrative session</p>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('/customer'); }}>
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-ink-soft/40">Credential ID</label>
                <input
                  type="email"
                  placeholder="admin.access@khatalens.app"
                  required
                  className="premium-input h-14 w-full rounded-2xl border border-border bg-white/40 px-6 text-sm outline-none focus:border-primary/40 focus:ring-8 focus:ring-primary/5"
                />
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-ink-soft/40">Secure Token</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  required
                  className="premium-input h-14 w-full rounded-2xl border border-border bg-white/40 px-6 text-sm outline-none focus:border-primary/40 focus:ring-8 focus:ring-primary/5"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-primary font-bold text-white transition-all hover:bg-primary-deep active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center gap-2 tracking-wider">
                    DECRYPT & ENTER
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary via-primary-deep to-primary opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-col items-center gap-4 border-t border-border/50 pt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-border bg-white transition-all hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="size-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-sm font-bold text-gray-700">Continue with Google</span>
              </button>

              <div className="flex w-full items-center justify-between px-2">
                <button
                  onClick={handleDemoLogin}
                  className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-deep transition-colors"
                >
                  Launch Demo
                </button>
                <a href="#" className="text-[10px] uppercase tracking-widest text-ink-soft/30 hover:text-ink-soft/60 transition-colors">
                  Recovery Mode
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

