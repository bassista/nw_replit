import { Home, UtensilsCrossed, BarChart3, Settings, Apple, ShoppingBag, Heart, MoreVertical } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/languageContext";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function BottomNav() {
  const [location] = useLocation();
  const [openMore, setOpenMore] = useState(false);
  const { t } = useLanguage();
  
  const mainItems = [
    { icon: Home, label: t.nav.diary, path: "/" },
    { icon: Apple, label: t.nav.foods, path: "/foods" },
    { icon: UtensilsCrossed, label: t.nav.meals, path: "/meals" },
    { icon: Heart, label: t.nav.health, path: "/health" },
  ];

  const moreItems = [
    { icon: ShoppingBag, label: t.nav.lists, path: "/lists" },
    { icon: BarChart3, label: t.nav.stats, path: "/stats" },
    { icon: Settings, label: t.settings.title, path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-50 safe-area-bottom shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-1">
        {mainItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-2 min-w-[64px] rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-primary/10' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <Icon 
                  className={`w-6 h-6 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`text-xs font-500 transition-colors ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}

        {/* More Button */}
        <Popover open={openMore} onOpenChange={setOpenMore}>
          <PopoverTrigger asChild>
            <button
              data-testid="nav-more"
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2 min-w-[64px] rounded-lg transition-colors duration-200 hover:bg-muted/50`}
            >
              <MoreVertical className="w-6 h-6 text-muted-foreground" strokeWidth={2} />
              <span className="text-xs font-500 text-muted-foreground">Altro</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 mb-20">
            <div className="space-y-1">
              {moreItems.map((item) => {
                const isActive = location === item.path;
                const Icon = item.icon;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <button
                      onClick={() => setOpenMore(false)}
                      data-testid={`nav-more-${item.label.toLowerCase()}`}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  </Link>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
}
