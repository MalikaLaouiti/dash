"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DataTable } from "@/components/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { ExcelParser, type ParsedExcelData } from "@/lib/excel-parser";

interface TabConfig {
  id: string;
  label: string;
  count: number;
  content: React.ReactNode;
}

export default function Encadreurant() {
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
    if (data.summary.yearsCovered.length > 0 && !selectedYear) {
      setSelectedYear(data.summary.yearsCovered[0]);
    }
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
  };

  const filteredData = parsedData ? ExcelParser.searchData(parsedData, searchQuery, searchFilters, selectedYear || undefined) : [];

  const dynamicTabs = useMemo((): TabConfig[] => {
    if (!parsedData) return [];

    const tabs: TabConfig[] = [
      {
        id: "supervisors-academic",
        label: "Encadreurs Académiques",
        count: parsedData.summary.totalSupervisors.academiques,
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
        count: parsedData.summary.totalSupervisors.professionnels,
        content: (
          <DataTable
            data={parsedData}
            activeTab="supervisors-professional"
            selectedYear={selectedYear || undefined}
          />
        ),
      },
    ];

    return tabs;
  }, [parsedData, selectedYear]);

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
          <div className="flex-1 overflow-auto p-4 space-y-6">
            {!parsedData }

            {parsedData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Données des Encadreurs academiques et professionals
                    <Badge variant="secondary">{parsedData.summary.totalStudents + parsedData.summary.totalCompanies + parsedData.summary.totalSupervisors.academiques + parsedData.summary.totalSupervisors.professionnels} éléments</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">{parsedData.summary.totalSupervisors.academiques}</Badge>
                      <span className="text-sm">Encadreurs Académiques</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">{parsedData.summary.totalSupervisors.professionnels}</Badge>
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
        </main>
      </div>
    </SidebarProvider>
  )
};

