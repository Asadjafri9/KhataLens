import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function HeroCTA() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      signInWithGoogle();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full">
      <button
        onClick={handleGetStarted}
        className="w-full sm:w-auto sm:min-w-[280px] h-12 sm:h-14 bg-primary text-primary-foreground px-6 sm:px-10 rounded-xl font-body font-semibold text-sm sm:text-base hover:bg-primary-deep transition-colors whitespace-nowrap shadow-lg shadow-primary/20"
      >
        {user ? "Go to Dashboard" : "Sign in with Google"}
      </button>

      <a
        href="#how"
        className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-primary text-primary font-body font-semibold text-xs sm:text-sm rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap inline-flex items-center"
      >
        See How It Works
      </a>
    </div>
  );
}
