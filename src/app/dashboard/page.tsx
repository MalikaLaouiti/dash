"use client";

import { SearchBar } from "@/components/search-bar";
import { useState } from "react";
import { type ParsedExcelData } from "@/lib/excel-parser";
import Hero_section from "@/components/hero-section";
import Main from "@/components/main-section";

export default function DashHome() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchFilters, setSearchFilters] = useState({
    students: true,
    companies: true,
    supervisors: true,
  })
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<ParsedExcelData | null>(null)




  return (
    <div className="flex flex-col h-full">
      <Hero_section/>
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

      <Main/>
      
    </div>
  )
};

