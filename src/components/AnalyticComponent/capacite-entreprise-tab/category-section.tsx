'use client';

import { Badge } from '@/components/ui/badge';
import { CompanyCard } from './company-card';

import {CATEGORY_LABELS, CATEGORY_CONFIG } from './category-conf';
import { CompanyCapacityResult } from '@/lib/analyse/types';

type CompanyCategory = 'grande' | 'moyenne' | 'petite';
interface CategorySectionProps {
  category: CompanyCategory;
  companies: CompanyCapacityResult[];
  totalCapacity: number;
  searchQuery: string;
}

export function CategorySection({ category, companies, totalCapacity, searchQuery }: CategorySectionProps) {
  const config = CATEGORY_CONFIG[category];
  const filteredCompanies = companies.filter(
    (company) =>
      company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.secteur.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredCompanies.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{CATEGORY_LABELS[category]}</h3>
        <Badge className={config.badge}>
          {companies.length} entreprises • {totalCapacity} places
        </Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.slice(0, 9).map((company) => (
          <CompanyCard key={company.companyName} company={company} category={category} />
        ))}
      </div>
    </div>
  );
}