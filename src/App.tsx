import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PortalLayout } from "@/components/layout/PortalLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import ComingSoon from "@/pages/ComingSoon";
import SignContractPage from "@/pages/SignContractPage";
import { NAV_GROUPS } from "@/components/layout/nav";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Pages that have a real screen; everything else still renders the placeholder.
const BUILT_ROUTES = ["/dashboard", "/onboarding"];
const placeholderRoutes = NAV_GROUPS.flatMap((g) => g.items).filter(
  (i) => !BUILT_ROUTES.includes(i.url),
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public, unauthenticated — reached via the appointment
                letter's emailed signing link, before this director has
                any board-portal login at all. Registered outside every
                auth-gated route group. */}
            <Route
              path="/sign-contract/:token"
              element={<SignContractPage />}
            />
            <Route
              path="/login"
              element={
                <GuestOnly>
                  <Login />
                </GuestOnly>
              }
            />
            <Route
              element={
                <RequireAuth>
                  <PortalLayout />
                </RequireAuth>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              {placeholderRoutes.map((i) => (
                <Route
                  key={i.url}
                  path={i.url}
                  element={<ComingSoon title={i.title} icon={i.icon} />}
                />
              ))}
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
