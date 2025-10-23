"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useState } from "react";
import { ExcelParser, type ParsedExcelData } from "@/lib/excel-parser";


export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  const [parsedData, setParsedData] = useState<ParsedExcelData | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchFilters, setSearchFilters] = useState({
    students: true,
    companies: true,
    supervisors: true,
  })
  
  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
  };
  
  const filteredData = parsedData ? ExcelParser.searchData(parsedData, searchQuery, searchFilters, selectedYear || undefined) : [];
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar
          selectedYear={selectedYear|| undefined}
          onYearSelect={handleYearSelect}
          availableYears={parsedData?.summary.yearsCovered || []}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
