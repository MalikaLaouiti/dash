"use client";

import { SearchBar } from "@/components/search-bar";
import { DataTable } from "@/components/data-table";
import { JsonPreview } from "@/components/json-preview";
import { UsageInstructions } from "@/components/usage-instructions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState ,useMemo} from "react";
import { ExcelParser, type ParsedExcelData } from "@/lib/excel-parser";
import { ExcelUploader } from "@/components/excel-uploader";

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
  const [parsedData, setParsedData] = useState<ParsedExcelData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("students");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  
  const handleDataLoad = (data: ParsedExcelData) => {
    setParsedData(data);
    // if (data.summary.yearsCovered.length > 0 && !selectedYear) {
    //   setSelectedYear(data.summary.yearsCovered[0]);
    // }
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
  };

  const filteredData = parsedData ? ExcelParser.parseExcelData(parsedData) : [];

  const dynamicTabs = useMemo((): TabConfig[] => {
    if (!parsedData) return [];

    const tabs: TabConfig[] = [
      {
        id: "students",
        label: "Étudiants",
        count: parsedData.summary.totalStudents,
        content: (
          <DataTable 
            data={parsedData} 
            activeTab="students" 
            selectedYear={selectedYear || undefined} 
          />
        ),
      },
      {
        id: "companies",
        label: "Entreprises",
        count: parsedData.summary.totalCompanies,
        content: (
          <DataTable 
            data={parsedData} 
            activeTab="companies" 
            selectedYear={selectedYear || undefined} 
          />
        ),
      },
      {
        id: "supervisors-academic",
        label: "Encadreurs Académiques",
        count: parsedData.summary.totalSupervisors,
        content: (
          <DataTable 
            data={parsedData} 
            activeTab="supervisors-academic" 
            selectedYear={selectedYear || undefined} 
          />
        ),
      },
      {
        id: "supervisors-professional",
        label: "Encadreurs Professionnels",
        count: parsedData.summary.totalSupervisors,
        content: (
          <DataTable 
            data={parsedData} 
            activeTab="supervisors-professional" 
            selectedYear={selectedYear || undefined} 
          />
        ),
      },
      {
        id: "json",
        label: "JSON",
        count: 0,
        content: <JsonPreview data={parsedData} />,
      },
    ];

    return tabs;
  }, [parsedData, selectedYear]);

  return (
    <div className="flex flex-col h-full">
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
                    <Badge variant="secondary">{parsedData.summary.totalStudents + parsedData.summary.totalCompanies + parsedData.summary.totalSupervisors + parsedData.summary.totalSupervisors} éléments</Badge>
                  </CardTitle>
                  <CardDescription>
                    Données extraites du fichier Excel et organisées par catégorie
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-1">
                      <Badge variant="default">{parsedData.summary.totalStudents}</Badge>
                      <span className="text-sm">Étudiants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary">{parsedData.summary.totalCompanies}</Badge>
                      <span className="text-sm">Entreprises</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">{parsedData.summary.totalSupervisors}</Badge>
                      <span className="text-sm">Encadreurs Académiques</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">{parsedData.summary.totalSupervisors}</Badge>
                      <span className="text-sm">Encadreurs Professionnels</span>
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
            {dynamicTabs.length > 0 && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${dynamicTabs.length}, 1fr)` }}>
                  {dynamicTabs.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id}>
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

