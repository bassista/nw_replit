import { Home, UtensilsCrossed, BarChart3, Settings, Apple } from "lucide-react";
import { Link, useLocation } from "wouter";

const navItems = [
  { icon: Home, label: "Diario", path: "/" },
  { icon: Apple, label: "Cibi", path: "/foods" },
  { icon: UtensilsCrossed, label: "Pasti", path: "/meals" },
  { icon: BarChart3, label: "Statistiche", path: "/stats" },
  { icon: Settings, label: "Impostazioni", path: "/settings" },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                data-testid={`nav-${item.label.toLowerCase()}`}
                className="flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] hover-elevate active-elevate-2 rounded-md"
              >
                <Icon 
                  className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`text-xs ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground font-medium'}`}>
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
