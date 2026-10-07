import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { fetchMyOnboarding } from "@/lib/board-api";
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
import Compliance from "@/pages/Compliance";
import Resolutions from "@/pages/Resolutions";
import ESigning from "@/pages/ESigning";
import Vault from "@/pages/Vault";
import Payments from "@/pages/Payments";
import Newsletters from "@/pages/Newsletters";
import Notifications from "@/pages/Notifications";
import Messages from "@/pages/Messages";
import SettingsPage from "@/pages/Settings";
import SkillsMatrix from "./pages/SkillsMatrix";

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

// Confines a board member to /onboarding until their 5-stage
// onboarding is actually complete — mirrors the real source of truth
// the backend itself graduates on (BoardMember.lifecycleStatus flips
// Onboarding → Active once every checklist item is done, see
// BoardMemberService#applyOnboardingGraduation), not a client-side
// recomputation of the stages. Shares the "my-onboarding" query key
// with Onboarding.tsx, so this costs no extra request once that page
// has loaded, and a submission there (which updates the same cache
// key) unlocks the rest of the portal immediately, no refetch needed.
function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { data, isLoading } = useQuery({
    queryKey: ["my-onboarding"],
    queryFn: fetchMyOnboarding,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading your portal…</span>
      </div>
    );
  }

  const onboardingComplete = data?.lifecycleStatus === "Active";
  if (!onboardingComplete && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
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
  "/compliance",
  "/resolutions",
  "/e-signing",
  "/vault",
  "/payments",
  "/newsletters",
  "/notifications",
  "/messages",
  "/settings",
  "/skills-matrix",
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
                  <RequireOnboarding>
                    <PortalLayout />
                  </RequireOnboarding>
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
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/resolutions" element={<Resolutions />} />
              <Route path="/e-signing" element={<ESigning />} />
              <Route path="/vault" element={<Vault />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/skills-matrix" element={<SkillsMatrix />} />
              <Route path="/newsletters" element={<Newsletters />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<SettingsPage />} />
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
