import { Home, UtensilsCrossed, BarChart3, Settings, Apple, ShoppingBag, Heart, MoreVertical, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/languageContext";
import { useState } from "react";

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
    <>
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
          <button
            data-testid="nav-more"
            onClick={() => setOpenMore(!openMore)}
            className={`flex flex-col items-center justify-center gap-1 px-2 py-2 min-w-[64px] rounded-lg transition-colors duration-200 hover:bg-muted/50`}
          >
            <MoreVertical className="w-6 h-6 text-muted-foreground" strokeWidth={2} />
            <span className="text-xs font-500 text-muted-foreground">Altro</span>
          </button>
        </div>
      </nav>

      {/* More Menu - Dropdown */}
      {openMore && (
        <div className="fixed bottom-16 right-4 bg-card border border-card-border rounded-lg shadow-lg z-50 w-48">
          <div className="flex items-center justify-between p-2 border-b border-card-border">
            <span className="text-sm font-semibold">Altro</span>
            <button onClick={() => setOpenMore(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 p-1">
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
        </div>
      )}

      {/* Backdrop */}
      {openMore && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpenMore(false)}
        />
      )}
    </>
  );
}
