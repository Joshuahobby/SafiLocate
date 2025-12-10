import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ReportFound from "@/pages/report-found";
import ReportLost from "@/pages/report-lost";
import PaymentPage from "@/pages/payment";
import SearchPage from "@/pages/search";
import ItemDetail from "@/pages/item-detail";
import AdminDashboard from "@/pages/admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/report-found" component={ReportFound} />
      <Route path="/report-lost" component={ReportLost} />
      <Route path="/payment" component={PaymentPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/item/:id" component={ItemDetail} />
      <Route path="/admin" component={AdminDashboard} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
