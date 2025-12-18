'use client'

import { createContext, useContext,useState,ReactNode } from "react"
import { ParsedExcelData } from "@/lib/excel-parser"

interface DataContextType {
  parsedData: ParsedExcelData | null
  setParsedData: (data:ParsedExcelData|null) => void
  selectedYear: string | null
  setSelectedYear: (year:string|null) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [parsedData, setParsedData] = useState<ParsedExcelData | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  return (
    <DataContext.Provider value={{ parsedData, setParsedData, selectedYear, setSelectedYear}}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}