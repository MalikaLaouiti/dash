'use client';

import { useState } from 'react';
import { CompanyFiliereResult } from '@/lib/analyse/types';
import { useMatriceData } from '@/hooks/useMatriceData';
import { KpiCards } from './KpiCards';
import { FiliereBarChart } from './FiliereBarChart';
import { CompanyPieChart } from './CompanyPieChart';
import { FiliereSelector } from './FiliereSelector';
import { CompanyGrid } from './CompanyGrid';
import { GlobalStats } from './GlobalStats';

interface MatriceFilieresProps {
  data: CompanyFiliereResult[];
}

export default function MatriceFilieres({ data }: MatriceFilieresProps) {
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState<string | null>(null);

  const {
    kpiMetrics,
    filiereDistributionData,
    companyStudentData,
    getCompaniesForFiliere,
    filterFilieres,
    getCompanyCountForFiliere,
  } = useMatriceData(data);

  const filteredFilieres   = filterFilieres(searchTerm);
  const companiesForDetail = selectedFiliere
    ? getCompaniesForFiliere(selectedFiliere)
    : [];

  return (
    <main className="space-y-6">
      <KpiCards metrics={kpiMetrics} />

      <div className="grid gap-6 lg:grid-cols-2">
        <FiliereBarChart data={filiereDistributionData} />
        <CompanyPieChart  data={companyStudentData} />
      </div>

      <FiliereSelector
        filieres={filteredFilieres}
        selectedFiliere={selectedFiliere}
        searchTerm={searchTerm}
        getCompanyCount={getCompanyCountForFiliere}
        onSearchChange={setSearchTerm}
        onSelect={setSelectedFiliere}
      >
        {selectedFiliere && companiesForDetail.length > 0 ? (
          <CompanyGrid filiere={selectedFiliere} companies={companiesForDetail} />
        ) : undefined}
      </FiliereSelector>

      <GlobalStats metrics={kpiMetrics} />
    </main>
  );
}