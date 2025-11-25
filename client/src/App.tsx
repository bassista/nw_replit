import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/languageContext";
import { useAppStore } from "@/context/AppStore";
import { useWaterReminders } from "@/hooks/use-water-reminders";
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

function AppContent() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadAppState = async () => {
      await useAppStore.getState().loadState();
      setIsLoaded(true);
    };
    loadAppState();
  }, []);

  // Register Service Worker and setup water reminders
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('SW registration failed:', error);
      });

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Use water reminders hook
  useWaterReminders();

  if (!isLoaded) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="relative">
      <Router />
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
