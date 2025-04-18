import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import FavoritesPage from "@/pages/FavoritesPage";
import ContactPage from "@/pages/ContactPage";
import UblockNotification from "@/components/UblockNotification";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route path="/contact" component={ContactPage} />
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
        <UblockNotification />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
