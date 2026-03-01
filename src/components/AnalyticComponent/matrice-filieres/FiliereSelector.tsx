import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface FiliereSelectorProps {
  filieres: string[];
  selectedFiliere: string | null;
  searchTerm: string;
  getCompanyCount: (filiere: string) => number;
  onSearchChange: (value: string) => void;
  onSelect: (filiere: string) => void;
  children?: React.ReactNode; // zone de détail injectée par le parent
}

export function FiliereSelector({
  filieres,
  selectedFiliere,
  searchTerm,
  getCompanyCount,
  onSearchChange,
  onSelect,
  children,
}: FiliereSelectorProps) {
  return (
    <Card className="p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-4">Détail par Filière</h3>

      {/* Barre de recherche */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une filière..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Boutons filières */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filieres.map((filiere) => (
          <Button
            key={filiere}
            onClick={() => onSelect(filiere)}
            variant={selectedFiliere === filiere ? 'default' : 'outline'}
            className="transition-all duration-200"
          >
            {filiere}
            <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
              {getCompanyCount(filiere)}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Contenu détail (CompanyGrid ou message vide) */}
      {children ?? (
        filieres.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Sélectionnez une filière pour voir les entreprises associées
            </p>
          </div>
        )
      )}
    </Card>
  );
}
