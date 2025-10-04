"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { HeaderBar } from '@/components/header-bar';
import { SearchBar } from "@/components/search-bar";
import { useState } from "react";
import { cleanExcelData, excelToJson, extractHeadersFromFile, getSheetNamesFromFile } from "@/api/excelTraitement";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchFilters, setSearchFilters] = useState({
    students: true,
    companies: true,
    supervisors: true,
  })
  const [data, setData] = useState<any[]>([]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. Conversion complète
      const result = await excelToJson(file);
      console.log('Toutes les feuilles:', result);

      // 2. Juste les en-têtes
      const headers = await extractHeadersFromFile(file);
      console.log('En-têtes par feuille:', headers);

      // 3. Juste les noms de feuilles
      const sheetNames = await getSheetNamesFromFile(file);
      console.log('Noms des feuilles:', sheetNames);

      // 4. Nettoyage des données
      const cleanedData = result.sheets.map(sheet => ({
        ...sheet,
        data: cleanExcelData(sheet.data)
      }));

      setData(cleanedData);

    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <SidebarTrigger />
          <HeaderBar />
          <SearchBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            filters={searchFilters}
            onFiltersChange={setSearchFilters}
          />

          <div>
            
            
            {data.map((sheet, index) => (
              <div key={index}>
                <h3>Feuille: {sheet.sheetName}</h3>
                <p>En-têtes: {sheet.headers.join(', ')}</p>
                <pre>{JSON.stringify(sheet.data.slice(0, 3), null, 2)}</pre>
              </div>
            ))}
          </div>
        </main>
      </div>
    </SidebarProvider>

  );
};

