import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/languageContext";
import { useAppStore } from "@/context/AppStore";
import { useWaterReminders } from "@/hooks/use-water-reminders";
import { isNative } from "@/lib/platform";
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
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

  // Initialize Capacitor or Service Worker
  useEffect(() => {
    const initCapacitor = async () => {
      if (isNative()) {
        // Native app initialization
        try {
          // Hide splash screen after app is loaded
          await SplashScreen.hide();

          // Configure status bar
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#22c55e' });
        } catch (error) {
          console.error('Error initializing Capacitor:', error);
        }

        // Handle back button on Android
        CapApp.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            CapApp.exitApp();
          } else {
            window.history.back();
          }
        });

        // Handle app state changes
        CapApp.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active?', isActive);
          if (isActive) {
            // Reload app state when app becomes active
            useAppStore.getState().loadState();
          }
        });
      } else {
        // Web: Register Service Worker
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js').catch((error) => {
            console.error('SW registration failed:', error);
          });
        }
      }
    };

    initCapacitor();

    return () => {
      if (isNative()) {
        CapApp.removeAllListeners();
      }
    };
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
