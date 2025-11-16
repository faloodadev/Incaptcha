import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PageTransition } from "@/components/PageTransition";
import { AnimatePresence } from "framer-motion";
import Demo from "@/pages/Demo";
import DemoLogin from "@/pages/DemoLogin";
import Admin from "@/pages/Admin";
import Docs from "@/pages/Docs";
import Keys from "@/pages/Keys";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <PageTransition location={location}>
        <Switch location={location}>
          <Route path="/" component={Demo} />
          <Route path="/demo-login" component={DemoLogin} />
          <Route path="/admin" component={Admin} />
          <Route path="/docs" component={Docs} />
          <Route path="/api-reference" component={Docs} />
          <Route path="/keys" component={Keys} />
          <Route path="/pricing" component={Docs} />
          <Route path="/support" component={Docs} />
          <Route path="/faq" component={Docs} />
          <Route path="/terms" component={Docs} />
          <Route path="/privacy" component={Docs} />
          <Route component={NotFound} />
        </Switch>
      </PageTransition>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Router />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
