import { Card } from '@/components/ui/card';
import { KpiMetrics } from '@/hooks/types-matrice';

interface StatItemProps {
  label: string;
  value: string | number;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

interface GlobalStatsProps {
  metrics: KpiMetrics;
}

export function GlobalStats({ metrics }: GlobalStatsProps) {
  const utilisationRate =
    metrics.totalCompanies > 0
      ? ((metrics.totalStudents / (metrics.totalCompanies * 5)) * 100).toFixed(0) + '%'
      : '0%';

  return (
    <Card className="p-6 border border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
      <h3 className="font-semibold text-foreground mb-4">Statistiques Globales</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatItem label="Moy. Étudiants/Entreprise" value={metrics.avgStudentsPerCompany} />
        <StatItem label="Moy. Étudiants/Filière"    value={metrics.avgStudentsPerFiliere} />
        <StatItem label="Partenaires Uniques"        value={metrics.totalCompanies} />
        <StatItem label="Taux d'Utilisation"         value={utilisationRate} />
      </div>
    </Card>
  );
}
