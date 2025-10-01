  /* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from 'react';
import { excelToJson, cleanExcelData, extractHeadersFromFile, getSheetNamesFromFile } from '@/api/excelTraitement';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ExcelUploader } from "@/components/excel-uploader";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
// import { SearchBar } from "@/components/search-bar";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [excelData, setExcelData] = useState<any>(null);
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
      <AppSidebar />
      <main>
        <SidebarTrigger />
        <header className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Dashboard d&apos;Analyse Académique</h1>
            <div className="flex items-center gap-3">
              {excelData && (
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/data")}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Voir toutes les données
                </Button>
              )}
              <ExcelUploader onDataLoad={setExcelData} />
            </div>
          </div>
          {/* {currentSection === "accueil" && (
            <SearchBar
              query={searchQuery}
              onQueryChange={setSearchQuery}
              filters={searchFilters}
              onFiltersChange={setSearchFilters}
            />
          )} */}
          
        </header>
          <div>
            <input type="file" accept=".xlsx,.xls" onChange={handleFile} />
            
            {data.map((sheet, index) => (
              <div key={index}>
                <h3>Feuille: {sheet.sheetName}</h3>
                <p>En-têtes: {sheet.headers.join(', ')}</p>
                <pre>{JSON.stringify(sheet.data.slice(0, 3), null, 2)}</pre>
              </div>
            ))}
          </div>
      </main>
    </SidebarProvider>
  );
};

