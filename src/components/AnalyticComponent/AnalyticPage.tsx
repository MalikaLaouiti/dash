'use client';

import { useState } from 'react';
import { Download, FileText, Table2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empty, EmptyDescription, EmptyHeader } from '@/components/ui/empty';
import { KPICards } from '@/components/AnalyticComponent/kpi-cards';
import { useData } from '@/Context/DataContext';



export function AnalyticsPage() {
  const { selectedYears, clearAnalyticsYears } = useData();

  const isValidSelection = selectedYears.length >= 2;
  const isMaxSelected = selectedYears.length === 3;

  return (
    <main className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Left Section - Title */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
              Analyse Comparative Multi-Années
            </h1>
            <p className="text-base text-muted-foreground">
              Comparaison année par année des stages
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
            {/* Années sélectionnées — lecture seule, la sidebar gère la sélection */}
            {selectedYears.length > 0 && (
              <Card className="p-4 border border-border bg-card">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">
                      Années sélectionnées
                    </label>
                    <button
                      onClick={clearAnalyticsYears}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Tout effacer
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedYears.map((year) => (
                      <Badge key={year} variant="secondary" className="px-2 py-1">
                        {year}
                      </Badge>
                    ))}
                  </div>
                  {!isValidSelection && (
                    <p className="text-xs text-destructive">
                      Sélectionnez au moins 2 années dans la barre latérale
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2" size="lg" disabled={!isValidSelection}>
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <FileText className="w-4 h-4" />
                  <span>Exporter en PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Table2 className="w-4 h-4" />
                  <span>Exporter en CSV</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>



        {/* Content Area */}
        {!isValidSelection ? (
          <Card className="p-12 md:p-16 border border-border/50">
            <Empty>
                <EmptyHeader>Données insuffisantes</EmptyHeader>
                <EmptyDescription>Veuillez sélectionner au moins deux années pour comparer</EmptyDescription>
            </Empty>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                KPI Comparatifs
              </h2>
              <KPICards selectedYears={selectedYears} isLoading={false} />
            </div>

            {/* Additional Details Card */}
            <Card className="p-8 border border-border bg-card">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Résumé Détaillé
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: 'Total Stages', value: '128' },
                      { label: 'Taux Réussite', value: '94.5%' },
                      { label: 'Note Moyenne', value: '16.2/20' },
                      { label: 'Durée Moyenne', value: '12.3 sem.' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="p-4 rounded-lg bg-secondary/50 border border-border/50"
                      >
                        <p className="text-sm text-muted-foreground mb-1">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Analyse comparative pour {selectedYears.join(', ')}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
