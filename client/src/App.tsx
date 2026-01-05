import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { AdminRoute, ProtectedRoute } from "@/lib/protected-route";
import { Loader2 } from "lucide-react";
import Safety from "@/pages/safety";
import FAQ from "@/pages/faq";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Cookies from "@/pages/cookies";

// Lazy load pages
const Home = lazy(() => import("@/pages/home"));
const About = lazy(() => import("@/pages/about"));
const AuthPage = lazy(() => import("@/pages/auth"));
const UserDashboard = lazy(() => import("@/pages/dashboard"));
const ReportFound = lazy(() => import("@/pages/report-found"));
const ReportLost = lazy(() => import("@/pages/report-lost"));
const PaymentPage = lazy(() => import("@/pages/payment"));
const PaymentVerifyPage = lazy(() => import("@/pages/payment-verify"));
const SearchPage = lazy(() => import("@/pages/search"));
const ItemDetail = lazy(() => import("@/pages/item-detail"));
const AdminLogin = lazy(() => import("@/pages/admin/login"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      <p className="text-xs font-medium text-muted-foreground animate-pulse tracking-widest uppercase">
        SafiLocate Loading...
      </p>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/report-found" component={ReportFound} />
        <Route path="/report-lost" component={ReportLost} />
        <Route path="/payment/verify" component={PaymentVerifyPage} />
        <Route path="/payment" component={PaymentPage} />
        <Route path="/search" component={SearchPage} />
        <Route path="/safety" component={Safety} />
        <Route path="/faq" component={FAQ} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/cookies" component={Cookies} />
        <Route path="/item/:id" component={ItemDetail} />

        {/* User dashboard - requires authentication */}
        <ProtectedRoute path="/dashboard" component={UserDashboard} />

        {/* Admin routes - requires admin/moderator role */}
        <Route path="/admin/login" component={AdminLogin} />
        <AdminRoute path="/admin/dashboard" component={AdminDashboard} />
        <AdminRoute path="/admin" component={AdminDashboard} />

        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

