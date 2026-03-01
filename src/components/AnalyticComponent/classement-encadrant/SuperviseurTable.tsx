import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TopSupervisorResult } from '@/lib/analyse/types';

// ── Sous-composant ligne ────────────────────────────────────────────────────
interface SuperviseurRowProps {
  supervisor: TopSupervisorResult;
}

function SuperviseurRow({ supervisor }: SuperviseurRowProps) {
  return (
    <tr className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
      <td className="py-3 px-4">
        <p className="font-medium text-foreground">{supervisor.supervisorId}</p>
        <p className="text-xs text-muted-foreground">{supervisor.email}</p>
      </td>
      <td className="py-3 px-4">
        <Badge
          variant={supervisor.categorie === 'academique' ? 'default' : 'secondary'}
          className="capitalize"
        >
          {supervisor.categorie}
        </Badge>
      </td>
      <td className="text-center py-3 px-4 font-semibold text-foreground">
        {supervisor.nombreEtudiants}
      </td>
      <td className="text-center py-3 px-4 font-semibold text-foreground">
        {supervisor.moyenneNotes}
      </td>
      <td className="text-center py-3 px-4">
        <span className="inline-block bg-primary/10 text-primary rounded-full px-3 py-1 font-semibold text-sm">
          {supervisor.meilleurNote}/20
        </span>
      </td>
    </tr>
  );
}

// ── Composant principal ─────────────────────────────────────────────────────
interface SuperviseurTableProps {
  data: TopSupervisorResult[];
}

export function SuperviseurTable({ data }: SuperviseurTableProps) {
  return (
    <Card className="p-6 border border-border/50 bg-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Détail des Superviseurs
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              {['Nom', 'Catégorie', 'Étudiants', 'Moyenne', 'Meilleur'].map((col) => (
                <th
                  key={col}
                  className="text-left py-3 px-4 font-semibold text-foreground first:[&]:text-left [&:nth-child(n+3)]:text-center"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((supervisor) => (
              <SuperviseurRow key={supervisor.supervisorId} supervisor={supervisor} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
