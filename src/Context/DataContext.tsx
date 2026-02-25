"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface DataContextType {
  parsedData: any;
  setParsedData: (data: any) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedYears: string[];
  toggleAnalyticsYear: (year: string) => void;
  clearAnalyticsYears: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [parsedData, setParsedData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  const toggleAnalyticsYear = (year: string) => {
    setSelectedYears(prev => {
      if (prev.includes(year)) return prev.filter(y => y !== year);
      if (prev.length < 3) return [...prev, year].sort();
      return prev;
    });
  };

  const clearAnalyticsYears = () => setSelectedYears([]);

  return (
    <DataContext.Provider
      value={{
        parsedData,
        setParsedData,
        selectedYear,
        setSelectedYear,
        selectedYears,
        toggleAnalyticsYear,
        clearAnalyticsYears,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}