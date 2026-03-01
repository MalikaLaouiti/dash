import { GraduationCap, Building2, Users, TrendingUp, LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { KpiMetrics } from '@/hooks/types-matrice';

interface KpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
}

function KpiCard({ label, value, icon: Icon }: KpiCardProps) {
  return (
    <Card className="p-6 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </Card>
  );
}

interface KpiCardsProps {
  metrics: KpiMetrics;
}

const KPI_CONFIG = [
  { key: 'totalFilieres',     label: 'Filières',      icon: GraduationCap },
  { key: 'totalCompanies',    label: 'Entreprises',   icon: Building2 },
  { key: 'totalStudents',     label: 'Étudiants',     icon: Users },
  { key: 'totalPartnerships', label: 'Partenariats',  icon: TrendingUp },
] as const;

export function KpiCards({ metrics }: KpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {KPI_CONFIG.map(({ key, label, icon }) => (
        <KpiCard key={key} label={label} value={metrics[key]} icon={icon} />
      ))}
    </div>
  );
}
