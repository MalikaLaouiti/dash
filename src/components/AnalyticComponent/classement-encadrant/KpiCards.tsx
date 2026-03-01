import { Users, Award, TrendingUp, Star, LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { KpiSuperviseurs } from '@/hooks/types-classement';

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  subLabel?: string;
  icon?: LucideIcon;
}

function KpiCard({ label, value, subLabel, icon: Icon }: KpiCardProps) {
  return (
    <Card className="p-6 border border-border/50 bg-gradient-to-br from-card to-card/50">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          {Icon && <Icon className="w-4 h-4 text-primary" />}
        </div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {subLabel && <p className="text-xs text-muted-foreground">{subLabel}</p>}
      </div>
    </Card>
  );
}

interface KpiCardsProps {
  kpi: KpiSuperviseurs;
}

export function KpiCards({ kpi }: KpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Superviseurs"
        value={kpi.totalSuperviseurs}
        subLabel={`${kpi.academiqueSupervisors} académiques`}
        icon={Users}
      />
      <KpiCard
        label="Étudiants"
        value={kpi.totalEtudiants}
        subLabel={`${kpi.avgEtudiantsParSuperviseur} par superviseur`}
        icon={Award}
      />
      <KpiCard
        label="Moyenne Générale"
        value={kpi.averageMoyenne}
        subLabel="/20"
        icon={TrendingUp}
      />
      <KpiCard
        label="Top Superviseur"
        value={<span className="text-xl truncate block">{kpi.topSupervisorId ?? '—'}</span>}
        subLabel={kpi.topSupervisorEtudiants != null ? `${kpi.topSupervisorEtudiants} étudiants` : undefined}
        icon={Star}
      />
    </div>
  );
}
