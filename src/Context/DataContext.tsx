// Context/DataContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { ParsedExcelData } from "@/lib/excel-parser"

interface DataContextType {
  parsedData: ParsedExcelData | null
  setParsedData: (data: ParsedExcelData | null) => void
  selectedYear: string | null
  setSelectedYear: (year: string | null) => void
  hasData: boolean
  clearData: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  // Charger depuis sessionStorage au démarrage
  const [parsedData, setParsedDataState] = useState<ParsedExcelData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('parsedData')
        if (saved) {
          const data = JSON.parse(saved) 
          return data
        }
      } catch (error) {
        console.error(' Erreur lecture sessionStorage:', error)
      }
    }
    
    return null
  })

  const [selectedYear, setSelectedYear] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('selectedYear')
    }
    return null
  })


  const setParsedData = (data: ParsedExcelData | null) => {
    setParsedDataState(data)
    
    if (typeof window !== 'undefined') {
      if (data) {
        sessionStorage.setItem('parsedData', JSON.stringify(data))
      } else {
        sessionStorage.removeItem('parsedData')
      }
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedYear) {
        sessionStorage.setItem('selectedYear', selectedYear)
        console.log('Année sélectionnée sauvegardée:', selectedYear)
      } else {
        sessionStorage.removeItem('selectedYear')
      }
    }
  }, [selectedYear])

  const clearData = () => {
    setParsedData(null)
    setSelectedYear(null)
  }

  const hasData = parsedData !== null && parsedData.students.length > 0


  return (
    <DataContext.Provider value={{ 
      parsedData, 
      setParsedData, 
      selectedYear, 
      setSelectedYear,
      hasData,
      clearData
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}