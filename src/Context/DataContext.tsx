// Context/DataContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface DataContextType {
  parsedData: any;
  setParsedData: (data: any) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [parsedData, setParsedData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");

  return (
    <DataContext.Provider
      value={{
        parsedData,
        setParsedData,
        selectedYear,
        setSelectedYear,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  console.log("🟢 useData appelé, context:", context);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}