import { Search, Plus, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

interface TopBarProps {
  title: string;
  onSearch?: () => void;
  onAdd?: () => void;
  onMenu?: () => void;
  showSearch?: boolean;
  showAdd?: boolean;
}

export default function TopBar({ 
  title, 
  onSearch, 
  onAdd, 
  onMenu,
  showSearch = false,
  showAdd = false 
}: TopBarProps) {
  const [location] = useLocation();
  const isSettingsPage = location === '/settings';

  return (
    <header className="sticky top-0 bg-card border-b border-card-border z-40 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-600 text-foreground">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {showSearch && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onSearch}
              data-testid="button-search"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
          {showAdd && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onAdd}
              data-testid="button-add"
            >
              <Plus className="w-5 h-5" />
            </Button>
          )}
          {onMenu && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onMenu}
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          {!isSettingsPage && (
            <Link href="/settings">
              <Button
                size="icon"
                variant="ghost"
                data-testid="button-settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
