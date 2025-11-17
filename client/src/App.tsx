import { lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PageTransition } from "@/components/PageTransition";
import { PageLoader } from "@/components/PageLoader";
import { AnimatePresence } from "framer-motion";

const Demo = lazy(() => import("@/pages/Demo"));
const DemoLogin = lazy(() => import("@/pages/DemoLogin"));
const Admin = lazy(() => import("@/pages/Admin"));
const Docs = lazy(() => import("@/pages/Docs"));
const Keys = lazy(() => import("@/pages/Keys"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <PageTransition location={location}>
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
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
