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
import { useData } from "@/Context/DataContext";
import Header from "@/components/header";
import Body from "@/components/body";

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
  console.log("year selected in dashboard:", selectedYear);


  return (
    <div className="flex flex-col h-full">
      <Header/>
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
      <Body/>
      
    </div>
  )
};

