"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SearchBar } from "@/components/search-bar";
import { ExcelUploader } from "@/components/excel-uploader";
import { DataTable } from "@/components/data-table";
import { JsonPreview } from "@/components/json-preview";
import { UsageInstructions } from "@/components/usage-instructions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ExcelParser, type ParsedExcelData } from "@/lib/excel-parser";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchFilters, setSearchFilters] = useState({
    students: true,
    companies: true,
    supervisors: true,
  })
  const [parsedData, setParsedData] = useState<ParsedExcelData | null>(null);
  const [activeTab, setActiveTab] = useState<"students" | "companies" | "supervisors-academic" | "supervisors-professional" | "raw">("students");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const handleDataLoad = (data: ParsedExcelData) => {
    setParsedData(data);
    // Sélectionner automatiquement la première année disponible
    if (data.summary.yearsCovered.length > 0 && !selectedYear) {
      setSelectedYear(data.summary.yearsCovered[0]);
    }
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
  };

  const filteredData = parsedData ? ExcelParser.searchData(parsedData, searchQuery, searchFilters, selectedYear || undefined) : [];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar 
          selectedYear={selectedYear || undefined}
          onYearSelect={handleYearSelect}
          availableYears={parsedData?.summary.yearsCovered || []}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <SidebarTrigger />
          
          <div className="flex items-center justify-between mb-4 p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">Dashboard d&apos;Analyse Académique</h1>
              {selectedYear && (
                <Badge variant="default" className="text-sm">
                  Année: {selectedYear}
                </Badge>
              )}
            </div>
            <ExcelUploader onDataLoad={handleDataLoad} />
          </div>
          
          <div className="flex items-center gap-2 p-2 border-b "> 
            <SearchBar 
              query={searchQuery}
              onQueryChange={setSearchQuery}
              filters={searchFilters}
              onFiltersChange={setSearchFilters}
            />
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-6">
            {!parsedData && <UsageInstructions />}
            
            {parsedData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Résumé des données importées
                    <Badge variant="secondary">{parsedData.summary.totalStudents + parsedData.summary.totalCompanies + parsedData.summary.totalSupervisors.academiques +parsedData.summary.totalSupervisors.professionnels} éléments</Badge>
                  </CardTitle>
                  <CardDescription>
                    Données extraites du fichier Excel et organisées par catégorie
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{parsedData.summary.totalStudents}</Badge>
                      <span className="text-sm">Étudiants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{parsedData.summary.totalCompanies}</Badge>
                      <span className="text-sm">Entreprises</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{parsedData.summary.totalSupervisors.total}</Badge>
                      <span className="text-sm">Encadreurs</span>
                    </div>
              </div>
                  <div className="mt-4">
                    <span className="text-sm text-muted-foreground">Années couvertes: </span>
                    {parsedData.summary.yearsCovered.map(year => (
                      <Badge key={year} variant="outline" className="mr-2">{year}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="students">
                  Étudiants ({parsedData?.summary.totalStudents || 0})
                </TabsTrigger>
                <TabsTrigger value="companies">
                  Entreprises ({parsedData?.summary.totalCompanies || 0})
                </TabsTrigger>
                <TabsTrigger value="supervisors-academic">
                  Encadreurs Académiques ({parsedData?.summary.totalSupervisors.academiques || 0})
                </TabsTrigger>
                <TabsTrigger value="supervisors-professional">
                  Encadreurs Professionnels ({parsedData?.summary.totalSupervisors.professionnels || 0})
                </TabsTrigger>
                <TabsTrigger value="raw">
                  Vue combinée ({filteredData.length})
                </TabsTrigger>
                <TabsTrigger value="json">
                  JSON
                </TabsTrigger>
              </TabsList>

              <TabsContent value="students" className="mt-6">
                <DataTable data={parsedData} activeTab="students" selectedYear={selectedYear || undefined} />
              </TabsContent>

              <TabsContent value="companies" className="mt-6">
                <DataTable data={parsedData} activeTab="companies" selectedYear={selectedYear || undefined} />
              </TabsContent>

              <TabsContent value="supervisors-academic" className="mt-6">
                <DataTable data={parsedData} activeTab="supervisors-academic" selectedYear={selectedYear || undefined} />
              </TabsContent>

              <TabsContent value="supervisors-professional" className="mt-6">
                <DataTable data={parsedData} activeTab="supervisors-professional" selectedYear={selectedYear || undefined} />
              </TabsContent>

              <TabsContent value="raw" className="mt-6">
                <DataTable data={parsedData} activeTab="raw" selectedYear={selectedYear || undefined} />
              </TabsContent>

              <TabsContent value="json" className="mt-6">
                <JsonPreview data={parsedData} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
};

