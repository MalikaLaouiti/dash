"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useState } from "react";
import { ExcelParser, type ParsedExcelData } from "@/lib/excel-parser";
import { useData } from "@/Context/DataContext";


export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchFilters, setSearchFilters] = useState({
    students: true,
    companies: true,
    supervisors: true,
  })
  
 
  
  // const filteredData = parsedData ? ExcelParser.searchData(parsedData, searchQuery, searchFilters, selectedYear || undefined) : [];
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar/>
        <main className="flex-1 flex flex-col overflow-hidden">
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
