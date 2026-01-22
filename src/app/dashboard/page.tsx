"use client";

import { SearchBar } from "@/components/search-bar";
import { DataTable } from "@/components/data-table";
import { JsonPreview } from "@/components/json-preview";
import { UsageInstructions } from "@/components/usage-instructions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { type ParsedExcelData } from "@/lib/excel-parser";
import { ExcelUploader } from "@/components/excel-uploader";
import { useData } from "@/Context/DataContext";
import { parse } from "path";

interface TabConfig {
  id: string;
  label: string;
  count: number;
  content: React.ReactNode;
}

export default function DashHome() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchFilters, setSearchFilters] = useState({
    students: true,
    companies: true,
    supervisors: true,
  })
  const { parsedData, setParsedData, selectedYear, setSelectedYear } = useData();
  const [activeTab, setActiveTab] = useState<string>("students")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<ParsedExcelData | null>(null)
  const displayData = searchResults || parsedData;
  console.log("Données affichées dans le tableau:", displayData);
  console.log("Données dans le contexte:", parsedData);

  const handleDataLoad = (data: ParsedExcelData) => {
    setParsedData(data);
    console.log("Données chargées dans le contexte:", data);
    if (data.summary.yearsCovered.length > 0 && !selectedYear) {
      setSelectedYear(data.summary.yearsCovered[0]);
    }
  };

  const dynamicTabs = useMemo((): TabConfig[] => {
    if (!parsedData) return [];

    const tabs: TabConfig[] = [
      {
        id: "students",
        label: "Étudiants",
        count: parsedData.students.length,
        content: (
          <DataTable
            data={displayData}
            activeTab="students"
            selectedYear={selectedYear || undefined}
            searchQuery={searchQuery}
            searchFilters={searchFilters}
          />
        ),
      },
      {
        id: "companies",
        label: "Entreprises",
        count: parsedData.companies.length,
        content: (
          <DataTable
            data={displayData}
            activeTab="companies"
            selectedYear={selectedYear || undefined}
            searchQuery={searchQuery}
            searchFilters={searchFilters}
          />
        ),
      },
      {
        id: "supervisors-academic",
        label: "Encadreurs Académiques",
        count: parsedData.supervisors.filter(s => s.categorie === "academique").length,
        content: (
          <DataTable
            data={displayData}
            activeTab="supervisors-academic"
            selectedYear={selectedYear || undefined}
            searchQuery={searchQuery}
            searchFilters={searchFilters}
          />
        ),
      },
      {
        id: "supervisors-professional",
        label: "Encadreurs Professionnels",
        count: parsedData.supervisors.filter(s => s.categorie === "professionnel").length,
        content: (
          <DataTable
            data={displayData}
            activeTab="supervisors-professional"
            selectedYear={selectedYear || undefined}
            searchQuery={searchQuery}
            searchFilters={searchFilters}
          />
        ),
      },
      {
        id: "json",
        label: "JSON",
        count: 0,
        content: <JsonPreview data={displayData} />,
      },
    ];
    return tabs;
  }, [displayData, parsedData, selectedYear, searchQuery, searchFilters]);



  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Dashboard d&apos;Analyse Académique</h1>
        </div>
        <ExcelUploader onDataLoad={handleDataLoad} year={selectedYear!} />
      </div>
      <div className="flex items-center gap-4 pl-9 pr-8 pb-2 border-b">
        <SearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          filters={searchFilters}
          onFiltersChange={setSearchFilters}
        />
      </div>
      {isSearching && (
        <div className="text-sm text-muted-foreground">
          Recherche en cours...
        </div>
      )}

      {searchQuery && searchResults && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">
            {searchResults.summary.totalStudents +
              searchResults.summary.totalCompanies +
              searchResults.summary.totalSupervisors}
          </span> résultat(s) trouvé(s) pour &quot;{searchQuery}&quot;
        </div>
      )}

      <div className="flex-1 overflow-auto p-9 space-y-2">
        {!parsedData && <UsageInstructions />}

        {parsedData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Résumé des données importées
                <Badge variant="secondary">{parsedData.students.length + parsedData.companies.length + parsedData.supervisors.filter(s => s.categorie === "academique").length + parsedData.supervisors.filter(s => s.categorie === "professionnel").length} éléments</Badge>
              </CardTitle>
              <CardDescription>
                {searchQuery
                  ? `Résultats filtrés pour "${searchQuery}"`
                  : "Données extraites du fichier Excel et organisées par catégorie"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4">
                <span className="text-sm text-muted-foreground">Années couvertes: </span>
                {parsedData.summary.yearsCovered.map(year => (
                  year === selectedYear ?
                    <Badge key={year} variant="default" className="mr-2">{year}</Badge>
                    : <Badge key={year} variant="outline" className="mr-2">{year}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {dynamicTabs.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap gap-4 w-full" style={{ gridTemplateColumns: `repeat(${dynamicTabs.length}, 1fr)` }}>
              {dynamicTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex-1 min-w-[150px] max-w-[250px]">
                  {tab.label} {tab.count > 0 && `(${tab.count})`}
                </TabsTrigger>
              ))}
            </TabsList>

            {dynamicTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-6">
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  )
};

