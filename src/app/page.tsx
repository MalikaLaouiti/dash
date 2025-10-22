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
  const [activeTab, setActiveTab] = useState<"students" | "companies" | "supervisors" | "raw">("students");

  const handleDataLoad = (data: ParsedExcelData) => {
    setParsedData(data);
  };

  const filteredData = parsedData ? ExcelParser.searchData(parsedData, searchQuery, searchFilters) : [];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <SidebarTrigger />
          
          <div className="flex items-center justify-between mb-4 p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground gap-2">Dashboard d&apos;Analyse Académique</h1>
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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="students">
                  Étudiants ({parsedData?.summary.totalStudents || 0})
                </TabsTrigger>
                <TabsTrigger value="companies">
                  Entreprises ({parsedData?.summary.totalCompanies || 0})
                </TabsTrigger>
                <TabsTrigger value="supervisors">
                  Encadreurs Academique ({parsedData?.summary.totalSupervisors.academiques || 0})
                </TabsTrigger>
                <TabsTrigger value="supervisors">
                  Encadreurs Professionnel ({parsedData?.summary.totalSupervisors.professionnels || 0})
                </TabsTrigger>
                <TabsTrigger value="raw">
                  Vue combinée ({filteredData.length})
                </TabsTrigger>
                <TabsTrigger value="json">
                  JSON
                </TabsTrigger>
              </TabsList>

              <TabsContent value="students" className="mt-6">
                <DataTable data={parsedData} activeTab="students" />
              </TabsContent>

              <TabsContent value="companies" className="mt-6">
                <DataTable data={parsedData} activeTab="companies" />
              </TabsContent>

              <TabsContent value="supervisors" className="mt-6">
                <DataTable data={parsedData} activeTab="supervisors" />
              </TabsContent>

              <TabsContent value="raw" className="mt-6">
                <DataTable data={parsedData} activeTab="raw" />
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

