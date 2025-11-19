import { Card } from "@/components/ui/card";
import { Award, Lock } from "lucide-react";

interface BadgeCardProps {
  badge: {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: string;
  };
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <Card 
      className={`p-4 ${badge.unlocked ? 'bg-primary/5 border-primary/20' : 'opacity-60'}`}
      data-testid={`badge-${badge.id}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-full ${badge.unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
          {badge.unlocked ? (
            <Award className="w-6 h-6 text-primary" />
          ) : (
            <Lock className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">{badge.name}</h4>
          <p className="text-sm text-muted-foreground">{badge.description}</p>
          {badge.unlocked && badge.unlockedAt && (
            <p className="text-xs text-primary font-medium mt-2">
              Sbloccato il {new Date(badge.unlockedAt).toLocaleDateString('it-IT')}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
