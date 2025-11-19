import BadgeCard from '../BadgeCard';

export default function BadgeCardExample() {
  const unlockedBadge = {
    id: '1',
    name: '7 Giorni Consecutivi',
    description: 'Hai tracciato i tuoi pasti per 7 giorni di fila',
    unlocked: true,
    unlockedAt: new Date().toISOString(),
  };

  const lockedBadge = {
    id: '2',
    name: 'Maestro dell\'Idratazione',
    description: 'Raggiungi l\'obiettivo di acqua per 30 giorni',
    unlocked: false,
  };

  return (
    <div className="p-4 space-y-4">
      <BadgeCard badge={unlockedBadge} />
      <BadgeCard badge={lockedBadge} />
    </div>
  );
}
