import { Badge } from '@/components/ui/badge';
import { CompanyFiliereDetail } from '@/hooks/types-matrice';

interface CompanyCardProps {
  company: CompanyFiliereDetail;
}

function CompanyCard({ company }: CompanyCardProps) {
  return (
    <div className="p-4 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors">
      <div className="flex items-start justify-between mb-1">
        <p className="font-medium text-foreground text-sm">{company.companyName}</p>
        <Badge className="bg-primary/20 text-primary font-semibold">
          {company.nombreEtudiants}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-1">{company.secteur || '—'}</p>
      <p className="text-xs text-muted-foreground">
        Moy. notes:{' '}
        <span className="font-medium text-foreground">
          {company.moyenneNotes.toFixed(1)}
        </span>
      </p>
    </div>
  );
}

interface CompanyGridProps {
  filiere: string;
  companies: CompanyFiliereDetail[];
}

export function CompanyGrid({ filiere, companies }: CompanyGridProps) {
  if (companies.length === 0) return null;

  return (
    <div>
      <h4 className="font-semibold text-foreground mb-3">
        Entreprises — {filiere}
      </h4>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <CompanyCard key={company.companyId} company={company} />
        ))}
      </div>
    </div>
  );
}
