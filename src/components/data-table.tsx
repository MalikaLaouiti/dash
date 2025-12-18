// components/data-table/data-table.tsx
"use client"

import * as React from "react"
import { Table, TableBody, TableHead, TableHeader,TableRow } from "@/components/ui/table"
import { type ParsedExcelData } from "@/lib/excel-parser"
import { TableRows } from "@/components/tableRow"
import { DetailView } from "@/components/ViewDetails"
import { PaginationControls } from "@/components/pagination"

interface DataTableProps {
  data: ParsedExcelData | null
  activeTab: "students" | "companies" | "supervisors-academic" | "supervisors-professional"
  selectedYear?: string
  searchQuery?: string  
  searchFilters?: {     
    students: boolean
    companies: boolean
    supervisors: boolean
  }
}

export function DataTable({ data, activeTab, selectedYear, searchQuery = "",searchFilters }: DataTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [selectedItem, setSelectedItem] = React.useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Aucune donnée à afficher. Importez un fichier Excel pour commencer.</p>
      </div>
    )
  }

  const filterByYear = <T extends { annee: string }>(items: T[]): T[] => {
    if (!selectedYear) return items
    return items.filter(item => item.annee === selectedYear)
  }
const filterBySearch = <T extends Record<string, any>>(items: T[]): T[] => {
  if (!searchQuery || searchQuery.trim().length === 0) return items
  
  const query = searchQuery.toLowerCase().trim()
  
  return items.filter(item => {
    return Object.entries(item).some(([key, value]) => {
      // Ignorer les champs techniques
      if (['id', '_id', 'createdAt', 'updatedAt', '__v'].includes(key)) {
        return false
      }
      
      // Gérer null/undefined
      if (value === null || value === undefined) {
        return false
      }
      
      // ✅ Gérer les tableaux (pour email, telephone, etc.)
      if (Array.isArray(value)) {
        return value.some(item => {
          const itemStr = String(item).toLowerCase()
          return itemStr.includes(query)
        })
      }
      
      // ✅ Gérer les objets (cas rare mais possible)
      if (typeof value === 'object') {
        const jsonStr = JSON.stringify(value).toLowerCase()
        return jsonStr.includes(query)
      }
      
      // ✅ Conversion simple en string (gère string, number, boolean)
      const searchableValue = String(value).toLowerCase()
      return searchableValue.includes(query)
    })
  })
}

  const getFilteredData = () => {
      let result: any[] = []

      if (searchFilters) {
        if (searchFilters.students && activeTab === "students") {
          result = data?.students || []
        } else if (searchFilters.companies && activeTab === "companies") {
          result = data?.companies || []
        } else if (searchFilters.supervisors && activeTab.includes("supervisors")) {
          result = data?.supervisors || []
          if (activeTab === "supervisors-academic") {
            result = result.filter(s => s.categorie === "academique")
          } else if (activeTab === "supervisors-professional") {
            result = result.filter(s => s.categorie === "professionnel")
          }
        }
      } else {
        switch (activeTab) {
          case "students":
            result = data?.students || []
            break
          case "companies":
            result = data?.companies || []
            break
          case "supervisors-academic":
            result = (data?.supervisors || []).filter(s => s.categorie === "academique")
            break
          case "supervisors-professional":
            result = (data?.supervisors || []).filter(s => s.categorie === "professionnel")
            break
        }
      }

      result = filterByYear(result)

      result = filterBySearch(result)

      return result
  }

  const filteredData = getFilteredData()
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const handleViewDetails = (item: any) => {
    setSelectedItem(item)
    setIsDetailOpen(true)
  }

  const getTableHeaders = () => {
    switch (activeTab) {
      case "students":
        return (
          <>
            <TableHead>Code</TableHead>
            <TableHead>Nom & Prénom</TableHead>
            <TableHead>CIN</TableHead>
            <TableHead>Filière</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Titre Projet</TableHead>
            <TableHead>Année</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </>
        )
      case "companies":
        return (
          <>
            <TableHead>Nom</TableHead>
            <TableHead>Secteur</TableHead>
            <TableHead>Année</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead>Stagiaires</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </>
        )
      default:
        return (
          <>
            <TableHead>Nom & Prénom</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Année</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Étudiants</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </>
        )
    }
  }

  return (
    <div className="space-y-2">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {getTableHeaders()}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRows 
              data={paginatedData}
              activeTab={activeTab}
              onViewDetails={handleViewDetails}
            />
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        totalItems={totalItems}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        startIndex={startIndex}
        endIndex={endIndex}
        totalPages={totalPages}
        activeTab={activeTab}
        selectedYear={selectedYear}
      />

      <DetailView
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        selectedItem={selectedItem}
        activeTab={activeTab}
      />
    </div>
  )
}