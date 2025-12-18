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
}

export function DataTable({ data, activeTab, selectedYear }: DataTableProps) {
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

  const getFilteredData = () => {
    switch (activeTab) {
      case "students":
        return filterByYear(data.students)
      case "companies":
        return filterByYear(data.companies)
      case "supervisors-academic":
        return filterByYear(data.supervisors.filter(s => s.categorie === "academique"))
      case "supervisors-professional":
        return filterByYear(data.supervisors.filter(s => s.categorie === "professionnel"))
      default:
        return []
    }
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