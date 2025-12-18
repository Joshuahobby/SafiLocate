import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { AdminRoute, ProtectedRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import AuthPage from "@/pages/auth";
import UserDashboard from "@/pages/dashboard";
import ReportFound from "@/pages/report-found";
import ReportLost from "@/pages/report-lost";
import PaymentPage from "@/pages/payment";
import PaymentVerifyPage from "@/pages/payment-verify";
import SearchPage from "@/pages/search";
import ItemDetail from "@/pages/item-detail";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";

function Router() {
  return (
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

