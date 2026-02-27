'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { KpiCards } from './kpi-cards';
import { CapacityPieChart } from './capacity-pie-chart';
import { TopCompaniesChart } from './top-companies-chart';
import { SearchBar } from './search-bar';
import { CategorySection } from './category-section';
import { CATEGORY_CONFIG } from './category-conf';
import { CapacityAPIResult } from '@/lib/analyse/types';

// Mock data (à déplacer dans un fichier séparé plus tard)
const mockData: CapacityAPIResult = {
  stats: {
    totalGrandes: 9,
    totalMoyennes: 5,
    totalPetites: 5,
    capaciteTotaleGrandes: 85,
    capaciteTotaleMoyennes: 20,
    capaciteTotalePetites: 10,
  },
  grandesEntreprises: [
    {
      companyName: 'isimm',
      secteur: '',
      capaciteDeclaree: 25,
      categorie: 'grande',
      annee: '2024',
    },
    {
      companyName: 'leoni',
      secteur: 'informatique',
      capaciteDeclaree: 9,
      categorie: 'grande',
      annee: '2024',
    },
    // ... autres données
  ],
  moyennesEntreprises: [
    {
      companyName: 'enovarobotics',
      secteur: 'Robotique électronique',
      capaciteDeclaree: 4,
      categorie: 'moyenne',
      annee: '2024',
    },
    // ... données
  ],
  petitesEntreprises: [
    {
      companyName: 'enim',
      secteur: 'Électronique embarquée',
      capaciteDeclaree: 2,
      categorie: 'petite',
      annee: '2024',
    },
    // ... données
  ],
};

interface CompanyCapaciteProps {
  data?: CapacityAPIResult; // Le composant attend 'data' comme prop
}

export function CapacitesEntreprises({ data }: CompanyCapaciteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Utiliser les données fournies ou les données mock
  const displayData = data || mockData;

  // Computed values avec useMemo pour optimiser
  const allCompanies = useMemo(
    () => [
      ...displayData.grandesEntreprises,
      ...displayData.moyennesEntreprises,
      ...displayData.petitesEntreprises
    ],
    [displayData]
  );

  const totalCapacity = useMemo(
    () => allCompanies.reduce((sum, company) => sum + company.capaciteDeclaree, 0),
    [allCompanies]
  );

  const grandesCapacity = useMemo(
    () => displayData.grandesEntreprises.reduce((sum, company) => sum + company.capaciteDeclaree, 0),
    [displayData.grandesEntreprises]
  );

  const moyennesCapacity = useMemo(
    () => displayData.moyennesEntreprises.reduce((sum, company) => sum + company.capaciteDeclaree, 0),
    [displayData.moyennesEntreprises]
  );

  const petitesCapacity = useMemo(
    () => displayData.petitesEntreprises.reduce((sum, company) => sum + company.capaciteDeclaree, 0),
    [displayData.petitesEntreprises]
  );

  const topCompanies = useMemo(
    () => [...allCompanies]
      .sort((a, b) => b.capaciteDeclaree - a.capaciteDeclaree)
      .slice(0, 10),
    [allCompanies]
  );

  const capacityByCategory = useMemo(
    () => [
      { 
        name: 'Grandes', 
        value: grandesCapacity, 
        count: displayData.grandesEntreprises.length, 
        color: CATEGORY_CONFIG.grande.color 
      },
      { 
        name: 'Moyennes', 
        value: moyennesCapacity, 
        count: displayData.moyennesEntreprises.length, 
        color: CATEGORY_CONFIG.moyenne.color 
      },
      { 
        name: 'Petites', 
        value: petitesCapacity, 
        count: displayData.petitesEntreprises.length, 
        color: CATEGORY_CONFIG.petite.color 
      },
    ],
    [grandesCapacity, moyennesCapacity, petitesCapacity, displayData]
  );

  // Vérifier si des données existent
  if (!displayData || !displayData.stats) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <KpiCards
        totalCompanies={allCompanies.length}
        grandesCount={displayData.stats.totalGrandes}
        moyennesCount={displayData.stats.totalMoyennes}
        petitesCount={displayData.stats.totalPetites}
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
            companies={displayData.grandesEntreprises}
            totalCapacity={grandesCapacity}
            searchQuery={searchQuery}
          />

          <CategorySection
            category="moyenne"
            companies={displayData.moyennesEntreprises}
            totalCapacity={moyennesCapacity}
            searchQuery={searchQuery}
          />

          <CategorySection
            category="petite"
            companies={displayData.petitesEntreprises}
            totalCapacity={petitesCapacity}
            searchQuery={searchQuery}
          />
        </div>
      </Card>
    </div>
  );
}