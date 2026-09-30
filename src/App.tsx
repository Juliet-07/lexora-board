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
import GovernanceCodeApprovals from "@/pages/GovernanceCodeApprovals";
import ComingSoon from "@/pages/ComingSoon";
import SignContractPage from "@/pages/SignContractPage";
import { NAV_GROUPS } from "@/components/layout/nav";
import Committees from "./pages/Committees";
import Meetings from "./pages/Meetings";
import BoardPacks from "@/pages/BoardPacks";
import Declarations from "@/pages/Declarations";
import Evaluations from "@/pages/Evaluations";
import Directory from "@/pages/Directory";
import BoardCalendar from "./pages/Calendar";
import Training from "./pages/Training";

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
const BUILT_ROUTES = [
  "/dashboard",
  "/onboarding",
  "/governance-codes",
  "/committees",
  "/meetings",
  "/board-packs",
  "/declarations",
  "/evaluations",
  "/directory",
  "/calendar",
  "/training",
];
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
              <Route
                path="/governance-codes"
                element={<GovernanceCodeApprovals />}
              />
              <Route path="/committees" element={<Committees />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/board-packs" element={<BoardPacks />} />
              <Route path="/declarations" element={<Declarations />} />
              <Route path="/evaluations" element={<Evaluations />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/calendar" element={<BoardCalendar />} />
              <Route path="/training" element={<Training />} />
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
