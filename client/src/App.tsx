import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/languageContext";
import { useAppStore } from "@/context/AppStore";
import BottomNav from "@/components/BottomNav";
import Home from "@/pages/Home";
import Foods from "@/pages/Foods";
import Meals from "@/pages/Meals";
import Health from "@/pages/Health";
import ShoppingLists from "@/pages/ShoppingLists";
import Stats from "@/pages/Stats";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/foods" component={Foods} />
      <Route path="/meals" component={Meals} />
      <Route path="/health" component={Health} />
      <Route path="/lists" component={ShoppingLists} />
      <Route path="/stats" component={Stats} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadAppState = async () => {
      await useAppStore.getState().loadState();
      setIsLoaded(true);
    };
    loadAppState();
  }, []);

  if (!isLoaded) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <div className="relative">
            <Router />
            <BottomNav />
          </div>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
