// components/entreprise/company-card.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_CONFIG } from './category-conf';
import { CompanyCapacityResult } from '@/lib/analyse/types';


type CompanyCategory = 'grande' | 'moyenne' | 'petite';
interface CompanyCardProps {
  company: CompanyCapacityResult;
  category: CompanyCategory;
}

export function CompanyCard({ company, category }: CompanyCardProps) {
  const config = CATEGORY_CONFIG[category];

  return (
    <Card className={`p-4 border ${config.border} ${config.bg} hover:shadow-md transition-shadow`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-sm capitalize truncate">
              {company.companyName}
            </h4>
            {company.secteur && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {company.secteur}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-current border-opacity-10">
          <span className="text-xs text-muted-foreground">Capacité</span>
          <Badge className={config.badge}>{company.capaciteDeclaree}</Badge>
        </div>
      </div>
    </Card>
  );
}