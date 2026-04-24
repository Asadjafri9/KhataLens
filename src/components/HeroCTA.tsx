import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function HeroCTA() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate("/customer");
    } else {
      signInWithGoogle();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full">
      <motion.button
        whileHover={{ scale: 1.05, y: -2, boxShadow: "0 20px 40px rgba(var(--primary-rgb), 0.3)" }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGetStarted}
        className="w-full sm:w-auto sm:min-w-[280px] h-12 sm:h-14 bg-primary text-primary-foreground px-6 sm:px-10 rounded-xl font-body font-semibold text-sm sm:text-base transition-all whitespace-nowrap shadow-lg shadow-primary/20"
      >
        {user ? "Enter Your Ledger" : "Sign in with Google"}
      </motion.button>

      <motion.a
        whileHover={{ scale: 1.05, y: -2, backgroundColor: "hsl(var(--primary))", color: "white" }}
        whileTap={{ scale: 0.98 }}
        href="#how"
        className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-primary text-primary font-body font-semibold text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap inline-flex items-center"
      >
        See How It Works
      </motion.a>
    </div>
  );
}
