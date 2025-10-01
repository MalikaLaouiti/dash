  /* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from 'react';
import { ExcelUploader } from "@/components/excel-uploader";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export function HeaderBar() {
    const [excelData, setExcelData] = useState<any>(null);
    return (
        <header className="bg-card border-b border-border p-6">
            <div className="items-center justify-between mb-4 grid grid-cols-2">
                <h1 className="text-2xl font-bold text-foreground gap-2">Dashboard d&apos;Analyse Académique</h1>
                <div className="flex  justify-end ">
                    {excelData && (
                        <Button
                            variant="outline"
                            onClick={() => (window.location.href = "/data")}
                            className="flex items-center gap-3"
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
    )
}