import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { KhataLensLoader } from "@/components/KhataLensLoader";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Customer from "./pages/Customer.tsx";
import ImportSheet from "./pages/ImportSheet.tsx";
import Analytics from "./pages/Analytics.tsx";
import ChatBot from "./pages/ChatBot.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();
const dashboardRoutes = new Set(["/customer", "/import-sheet", "/analytics", "/chat-bot"]);

// Guard: redirects to /login if not authenticated
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null; // wait for auth to resolve
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  const firstLoadRef = useRef(true);
  const previousPathRef = useRef(location.pathname);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    const currentPath = location.pathname;
    const isDashboardSwitch =
      !firstLoadRef.current &&
      dashboardRoutes.has(previousPath) &&
      dashboardRoutes.has(currentPath);

    const isFromLogin = previousPath === "/login";

    if (isDashboardSwitch || isFromLogin) {
      setIsLoading(false);
      previousPathRef.current = currentPath;
      return;
    }

    setIsLoading(true);
    const delay = firstLoadRef.current ? 1150 : 460;
    const timer = window.setTimeout(() => {
      setIsLoading(false);
      firstLoadRef.current = false;
      previousPathRef.current = currentPath;
    }, delay);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence>
        {isLoading ? (
          <motion.div
            key={`loader-${location.pathname}`}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <KhataLensLoader
              label={firstLoadRef.current ? "Preparing KhataLens" : "Syncing workspace"}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login cubeShouldAssemble={!isLoading} />} />
        <Route path="/customer" element={<ProtectedRoute><Customer /></ProtectedRoute>} />
        <Route path="/import-sheet" element={<ProtectedRoute><ImportSheet /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/chat-bot" element={<ProtectedRoute><ChatBot /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/customer" replace /></ProtectedRoute>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
