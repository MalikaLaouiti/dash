"use client";

import { useState,useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { VueGlobale } from './vue-global-tab/vue-global';
import { useData } from '@/Context/DataContext';
import { getCompanyCapacity, getCompanyFiliere, getCompanyLoyalty, getTopSupervisors, getYearComparison } from '@/lib/analyse/analytic';
import { CapacityAPIResult, CompanyFiliereResult, CompanyLoyaltyResult, TopSupervisorResult, YearComparisonResult } from '@/lib/analyse/types';
import { CapacitesEntreprises } from './capacite-entreprise-tab/capacite-entreprises';
import FideliteEntreprises from './fidelite-entreprise/fidelete-entreprise';
import { ClassementSuperviseurs } from './classement-encadrant';
import MatriceFilieres from './matrice-filiere';

export function AnalyticsTabs() {
  const [activeTab, setActiveTab] = useState('vue-globale');
  const {selectedYears}=useData();
  const [yearComparisondata, setyearComparisonData] = useState<YearComparisonResult>();
  const [companyCapacitydata, setcompanyCapacityData] = useState<CapacityAPIResult>();
  const [loyalitydata, setLoyalityData] = useState<CompanyLoyaltyResult[]>([]);
  const [ClassementData, setClassementData] = useState<TopSupervisorResult[]>([]);
  const [MatriceFilièreData, setMatriceFiliereData] = useState<CompanyFiliereResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedYears || selectedYears.length < 2) {
      setyearComparisonData(undefined); // Reset les données si pas assez d'années
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const yearComparison = await getYearComparison(selectedYears);
        const companyCapacity =await getCompanyCapacity ([selectedYears[0]]);
        const loyality = await getCompanyLoyalty (selectedYears);
        const ClassementData = await getTopSupervisors ([(selectedYears.sort())[0]],"academique",20);
        console.log("ClassementData:", ClassementData);
        const MatriceFilièreData= await getCompanyFiliere(selectedYears);
        
        setyearComparisonData(yearComparison);
        setcompanyCapacityData(companyCapacity);
        setLoyalityData(loyality);
        setClassementData(ClassementData);
        setMatriceFiliereData(MatriceFilièreData);

        console.log("Données récupérées:", yearComparison);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedYears?.length > 0) fetchData();
  }, [selectedYears]);
  
  const tabs = [
    {
      id: 'vue-globale',
      label: 'Vue Globale',
      description: 'Vue d\'ensemble des indicateurs clés',
    },
    {
      id: 'capacites-entreprises',
      label: 'Capacités Entreprises',
      description: 'Analyse des capacités d\'accueil des entreprises',
    },
    {
      id: 'fidelite-entreprises',
      label: 'Fidélité Entreprises',
      description: 'Suivi de la fidélité et réitération des entreprises',
    },
    {
      id: 'classement-superviseurs',
      label: 'Classement Superviseurs',
      description: 'Classement et performance des superviseurs',
    },
    {
      id: 'matrice-filieres',
      label: 'Matrice Filières',
      description: 'Distribution des stages par filière',
    },
    
  ];
  if (!selectedYears || selectedYears.length < 2) {
    return (
      <div className="p-6 md:p-8">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Sélectionnez au moins 2 années pour la comparaison
        </h3>
        <p className="text-muted-foreground">
          Veuillez sélectionner au moins deux années dans le sélecteur pour afficher les données comparatives.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!yearComparisondata && !companyCapacitydata) {
    return <div>Aucune donnée disponible</div>;
  }
  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'capacites-entreprises':
        return (
          <CapacitesEntreprises data={companyCapacitydata} />
        );

      case 'fidelite-entreprises':
        return (
          <FideliteEntreprises data={loyalitydata} />
        );

      case 'classement-superviseurs':
        return (
          <ClassementSuperviseurs data={ClassementData}/>
        );

      case 'matrice-filieres':
        return (
          <MatriceFilieres data={MatriceFilièreData} />
        );

      case 'vue-globale':
      default:
        return <VueGlobale data={yearComparisondata} />;
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
              Tableau de Bord Analytique
            </h1>
            <p className="text-base text-muted-foreground">
              Suivez et analysez les données pour prendre des décisions
            </p>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="border-t border-border"
          >
            <div className="px-6 md:px-8 overflow-x-auto">
              <TabsList className="w-full justify-start gap-2 h-auto bg-transparent p-0 border-0">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="relative rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-all duration-200 ease-out
                      data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm
                      dark:data-[state=active]:text-blue-400 dark:data-[state=active]:border-blue-400
                      text-muted-foreground hover:text-foreground hover:border-border
                      dark:text-muted-foreground dark:hover:text-foreground
                      whitespace-nowrap"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content with Smooth Transition */}
            <div className="relative">
              {tabs.map((tab) => (
                <TabsContent
                  key={tab.id}
                  value={tab.id}
                  className="animate-in fade-in duration-300 data-[state=inactive]:hidden"
                >
                  <div className="p-6 md:p-8">
                    {renderTabContent(tab.id)}
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
