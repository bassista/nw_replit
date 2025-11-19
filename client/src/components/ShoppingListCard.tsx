import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Check, RotateCcw } from "lucide-react";

interface ShoppingListCardProps {
  list: {
    id: string;
    name: string;
    items: {
      id: string;
      name: string;
      checked: boolean;
    }[];
    isPredefined?: boolean;
  };
  onToggleItem: (listId: string, itemId: string) => void;
  onDeleteItem: (listId: string, itemId: string) => void;
  onDeleteList: (listId: string) => void;
  onAddItem: (listId: string) => void;
  onToggleAll: (listId: string, checked: boolean) => void;
}

export default function ShoppingListCard({ 
  list, 
  onToggleItem, 
  onDeleteItem, 
  onDeleteList, 
  onAddItem,
  onToggleAll 
}: ShoppingListCardProps) {
  const checkedCount = list.items.filter(item => item.checked).length;
  const allChecked = list.items.length > 0 && checkedCount === list.items.length;

  return (
    <Card className="overflow-hidden" data-testid={`card-list-${list.id}`}>
      <div className="p-4 bg-muted/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground">{list.name}</h3>
          {list.isPredefined && (
            <Badge variant="secondary" className="text-xs">Predefinita</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {checkedCount}/{list.items.length}
          </Badge>
          {!list.isPredefined && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDeleteList(list.id)}
              data-testid={`button-delete-list-${list.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="divide-y divide-card-border">
        {list.items.map((item) => (
          <div 
            key={item.id} 
            className="p-3 flex items-center gap-3 hover-elevate"
            data-testid={`list-item-${item.id}`}
          >
            <Checkbox
              checked={item.checked}
              onCheckedChange={() => onToggleItem(list.id, item.id)}
              data-testid={`checkbox-${item.id}`}
            />
            <span className={`flex-1 text-sm ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {item.name}
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDeleteItem(list.id, item.id)}
              data-testid={`button-delete-item-${item.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-card-border space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={() => onToggleAll(list.id, true)}
            variant="outline"
            size="sm"
            className="flex-1"
            data-testid={`button-check-all-${list.id}`}
          >
            <Check className="w-4 h-4 mr-2" />
            Spunta Tutto
          </Button>
          <Button
            onClick={() => onToggleAll(list.id, false)}
            variant="outline"
            size="sm"
            className="flex-1"
            data-testid={`button-uncheck-all-${list.id}`}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Ripristina
          </Button>
        </div>
        <Button
          onClick={() => onAddItem(list.id)}
          variant="default"
          className="w-full"
          data-testid={`button-add-item-${list.id}`}
        >
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi Prodotto
        </Button>
      </div>
    </Card>
  );
}
