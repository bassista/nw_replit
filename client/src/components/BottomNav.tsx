import { Home, UtensilsCrossed, BarChart3, Settings, Apple, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/languageContext";

export default function BottomNav() {
  const [location] = useLocation();
  const { t } = useLanguage();
  
  const navItems = [
    { icon: Home, label: t.nav.diary, path: "/" },
    { icon: Apple, label: t.nav.foods, path: "/foods" },
    { icon: UtensilsCrossed, label: t.nav.meals, path: "/meals" },
    { icon: ShoppingBag, label: t.nav.lists, path: "/lists" },
    { icon: BarChart3, label: t.nav.stats, path: "/stats" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-50 safe-area-bottom shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto">
        {navItems.map((item) => {
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
      </div>
    </nav>
  );
}
