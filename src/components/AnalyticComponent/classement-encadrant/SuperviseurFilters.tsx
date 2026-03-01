import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { FilterCategorie, SortBy } from '@/hooks/types-classement';

interface SuperviseurFiltersProps {
  filterCategorie: FilterCategorie;
  sortBy: SortBy;
  onFilterChange: (value: FilterCategorie) => void;
  onSortChange: (value: SortBy) => void;
}

export function SuperviseurFilters({
  filterCategorie,
  sortBy,
  onFilterChange,
  onSortChange,
}: SuperviseurFiltersProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      <Select
        value={filterCategorie}
        onValueChange={(v) => onFilterChange(v as FilterCategorie)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filtrer par catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les superviseurs</SelectItem>
          <SelectItem value="academique">Académiques</SelectItem>
          <SelectItem value="professionnel">Professionnels</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sortBy}
        onValueChange={(v) => onSortChange(v as SortBy)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="students">Nombre d'étudiants</SelectItem>
          <SelectItem value="moyenne">Moyenne des notes</SelectItem>
          <SelectItem value="note">Meilleure note</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
