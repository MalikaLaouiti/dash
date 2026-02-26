"use client";

import { useState,useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { VueGlobale } from './vue-global';
import { useData } from '@/Context/DataContext';
import { getYearComparison } from '@/lib/analyse/analytic';
import { YearComparisonResult } from '@/lib/analyse/types';

export function AnalyticsTabs() {
  const [activeTab, setActiveTab] = useState('vue-globale');
  const {selectedYears}=useData();
  const [data, setData] = useState<YearComparisonResult>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedYears || selectedYears.length < 2) {
      setData(undefined); // Reset les données si pas assez d'années
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getYearComparison(selectedYears);
        setData(result);
        console.log("Données récupérées:", result);
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

  if (!data) {
    return <div>Aucune donnée disponible</div>;
  }
  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'capacites-entreprises':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Capacités Entreprises
              </h3>
              <p className="text-muted-foreground mb-4">
                Analyse des capacités d'accueil et des ressources disponibles dans les entreprises partenaires.
              </p>
            </div>
            <Card className="p-8 border border-border bg-card">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Entreprises Actives</p>
                  <p className="text-3xl font-bold text-foreground">156</p>
                  <p className="text-xs text-green-600 dark:text-green-400">+12% vs année précédente</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Capacité Totale</p>
                  <p className="text-3xl font-bold text-foreground">524</p>
                  <p className="text-xs text-green-600 dark:text-green-400">+8% vs année précédente</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Taux d'Utilisation</p>
                  <p className="text-3xl font-bold text-foreground">87.5%</p>
                  <p className="text-xs text-green-600 dark:text-green-400">+2.3% vs année précédente</p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'fidelite-entreprises':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Fidélité Entreprises
              </h3>
              <p className="text-muted-foreground mb-4">
                Suivi de la fidélité des entreprises et analyse des réitérations de partenariats.
              </p>
            </div>
            <Card className="p-8 border border-border bg-card">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Entreprises Récurrentes</p>
                  <p className="text-3xl font-bold text-foreground">142</p>
                  <p className="text-xs text-green-600 dark:text-green-400">+9% vs année précédente</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Taux Fidélité</p>
                  <p className="text-3xl font-bold text-foreground">91%</p>
                  <p className="text-xs text-green-600 dark:text-green-400">+3.5% vs année précédente</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Nouvelles Entreprises</p>
                  <p className="text-3xl font-bold text-foreground">14</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Impact: +26 stages</p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'classement-superviseurs':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Classement Superviseurs
              </h3>
              <p className="text-muted-foreground mb-4">
                Performance et classement des superviseurs académiques et professionnels.
              </p>
            </div>
            <Card className="p-8 border border-border bg-card">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Superviseurs Actifs</p>
                  <p className="text-3xl font-bold text-foreground">47</p>
                  <p className="text-xs text-green-600 dark:text-green-400">+2 vs année précédente</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Note Moyenne</p>
                  <p className="text-3xl font-bold text-foreground">4.7/5</p>
                  <p className="text-xs text-green-600 dark:text-green-400">+0.2 vs année précédente</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Charge Moyenne</p>
                  <p className="text-3xl font-bold text-foreground">5.3</p>
                  <p className="text-xs text-muted-foreground">étudiants par superviseur</p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'matrice-filieres':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Matrice Filières
              </h3>
              <p className="text-muted-foreground mb-4">
                Distribution des stages par filière académique et secteur d'activité.
              </p>
            </div>
            <Card className="p-8 border border-border bg-card">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Filières Représentées</p>
                  <p className="text-3xl font-bold text-foreground">8</p>
                  <p className="text-xs text-muted-foreground">Informatique, Génie, etc.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Distribution la Plus Importante</p>
                  <p className="text-3xl font-bold text-foreground">Informatique</p>
                  <p className="text-xs text-muted-foreground">38% des stages</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Secteurs d'Activité</p>
                  <p className="text-3xl font-bold text-foreground">24</p>
                  <p className="text-xs text-muted-foreground">secteurs différents</p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'vue-globale':
      default:
        return <VueGlobale data={data} />;
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
