'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { KpiCards } from './kpi-cards';
import { CapacityPieChart } from './capacity-pie-chart';
import { TopCompaniesChart } from './top-companies-chart';
import { SearchBar } from './search-bar';
import { CategorySection } from './category-section';
import { CATEGORY_CONFIG } from './category-conf';
import { CompanyCapacityResult } from '@/lib/analyse/types';

interface CapacitesData {
  grandesEntreprises: CompanyCapacityResult[];
  moyennesEntreprises: CompanyCapacityResult[];
  petitesEntreprises: CompanyCapacityResult[];
}
// Mock data (à déplacer dans un fichier séparé plus tard)
const mockData: CapacitesData = {
  grandesEntreprises: [
    {
      companyName: 'isimm',
      secteur: '',
      capaciteDeclaree: 25,
      categorie: 'grande',
      annee: '2024',
    },
    // ... autres données
  ],
  moyennesEntreprises: [
    // ... données
  ],
  petitesEntreprises: [
    // ... données
  ],
};
interface CompanyCapaciteProps {
  data?: CompanyCapacityResult;
}

export function CapacitesEntreprises({data}:CompanyCapaciteProps) {
  const [searchQuery, setSearchQuery] = useState('');
//   const [data] = useState<CapacitesData>(mockData);

  // Computed values
  const allCompanies = useMemo(
    () => [...data.grandesEntreprises, ...data.moyennesEntreprises, ...data.petitesEntreprises],
    [data]
  );

  const totalCapacity = useMemo(
    () => allCompanies.reduce((sum, company) => sum + company.capaciteDeclaree, 0),
    [allCompanies]
  );

  const grandesCapacity = useMemo(
    () => data.grandesEntreprises.reduce((sum, company) => sum + company.capaciteDeclaree, 0),
    [data.grandesEntreprises]
  );

  const moyennesCapacity = useMemo(
    () => data.moyennesEntreprises.reduce((sum, company) => sum + company.capaciteDeclaree, 0),
    [data.moyennesEntreprises]
  );

  const petitesCapacity = useMemo(
    () => data.petitesEntreprises.reduce((sum, company) => sum + company.capaciteDeclaree, 0),
    [data.petitesEntreprises]
  );

  const topCompanies = useMemo(
    () => [...allCompanies].sort((a, b) => b.capaciteDeclaree - a.capaciteDeclaree).slice(0, 10),
    [allCompanies]
  );

  const capacityByCategory = [
    { 
      name: 'Grandes', 
      value: grandesCapacity, 
      count: data.grandesEntreprises.length, 
      color: CATEGORY_CONFIG.grande.color 
    },
    { 
      name: 'Moyennes', 
      value: moyennesCapacity, 
      count: data.moyennesEntreprises.length, 
      color: CATEGORY_CONFIG.moyenne.color 
    },
    { 
      name: 'Petites', 
      value: petitesCapacity, 
      count: data.petitesEntreprises.length, 
      color: CATEGORY_CONFIG.petite.color 
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <KpiCards
        totalCompanies={allCompanies.length}
        grandesCount={data.grandesEntreprises.length}
        moyennesCount={data.moyennesEntreprises.length}
        totalCapacity={totalCapacity}
        averageCapacity={totalCapacity / allCompanies.length}
        utilizationRate={82.5}
      />

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CapacityPieChart data={capacityByCategory} />
        <TopCompaniesChart companies={topCompanies} />
      </div>

      {/* Search and Filter */}
      <Card className="p-6 border border-border/50">
        <div className="mb-4">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery}
            placeholder="Rechercher par nom d'entreprise ou secteur..."
          />
        </div>

        {/* Category Sections */}
        <div className="space-y-8">
          <CategorySection
            category="grande"
            companies={data.grandesEntreprises}
            totalCapacity={grandesCapacity}
            searchQuery={searchQuery}
          />

          <CategorySection
            category="moyenne"
            companies={data.moyennesEntreprises}
            totalCapacity={moyennesCapacity}
            searchQuery={searchQuery}
          />

          <CategorySection
            category="petite"
            companies={data.petitesEntreprises}
            totalCapacity={petitesCapacity}
            searchQuery={searchQuery}
          />
        </div>
      </Card>
    </div>
  );
}