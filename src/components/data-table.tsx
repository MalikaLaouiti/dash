"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ExcelParser, type ParsedExcelData, type Student, type Company, type Supervisor } from "@/lib/excel-parser"

interface DataTableProps {
  data: ParsedExcelData | null
  activeTab: "students" | "companies" | "supervisors" | "raw"
}

export function DataTable({ data, activeTab }: DataTableProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Aucune donnée à afficher. Importez un fichier Excel pour commencer.</p>
      </div>
    )
  }

  const renderStudentRow = (student: Student) => (
    <TableRow key={student.id}>
      <TableCell className="font-medium">{student.nom}</TableCell>
      <TableCell>{student.prenom}</TableCell>
      <TableCell>{student.specialisation}</TableCell>
      <TableCell>{student.annee}</TableCell>
      <TableCell>{student.societe || "N/A"}</TableCell>
      <TableCell>{student.encadreur || "N/A"}</TableCell>
      <TableCell>{student.email || "N/A"}</TableCell>
      <TableCell>{student.telephone || "N/A"}</TableCell>
      <TableCell>
        <Badge variant={student.statut === "actif" ? "default" : student.statut === "diplome" ? "secondary" : "destructive"}>
          {student.statut}
        </Badge>
      </TableCell>
    </TableRow>
  )

  const renderCompanyRow = (company: Company) => (
    <TableRow key={company.id}>
      <TableCell className="font-medium">{company.nom}</TableCell>
      <TableCell>{company.secteur}</TableCell>
      <TableCell>{company.annee}</TableCell>
      <TableCell>{company.adresse || "N/A"}</TableCell>
      <TableCell>{company.contact || "N/A"}</TableCell>
      <TableCell>{company.email || "N/A"}</TableCell>
      <TableCell>{company.telephone || "N/A"}</TableCell>
      <TableCell>
        <Badge variant="outline">{company.nombreStagiaires} stagiaires</Badge>
      </TableCell>
    </TableRow>
  )

  const renderSupervisorRow = (supervisor: Supervisor) => (
    <TableRow key={supervisor.id}>
      <TableCell className="font-medium">{supervisor.nom}</TableCell>
      <TableCell>{supervisor.prenom}</TableCell>
      <TableCell>{supervisor.specialisation}</TableCell>
      <TableCell>{supervisor.annee}</TableCell>
      <TableCell>{supervisor.email || "N/A"}</TableCell>
      <TableCell>{supervisor.telephone || "N/A"}</TableCell>
      <TableCell>
        <Badge variant="outline">{supervisor.nombreEtudiants} étudiants</Badge>
      </TableCell>
    </TableRow>
  )

  const renderRawDataRow = (item: any, index: number) => (
    <TableRow key={index}>
      <TableCell className="font-medium">{item.type}</TableCell>
      <TableCell>{item.nom || item.societe || "N/A"}</TableCell>
      <TableCell>{item.prenom || item.secteur || "N/A"}</TableCell>
      <TableCell>{item.specialisation || "N/A"}</TableCell>
      <TableCell>{item.annee}</TableCell>
      <TableCell>{item.email || "N/A"}</TableCell>
      <TableCell>{item.telephone || "N/A"}</TableCell>
      <TableCell>{item.societe || item.nombreStagiaires || item.nombreEtudiants || "N/A"}</TableCell>
    </TableRow>
  )

  const getTableContent = () => {
    switch (activeTab) {
      case "students":
        return (
          <>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Spécialisation</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>Société</TableHead>
                <TableHead>Encadreur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.students.length > 0 ? (
                data.students.map(renderStudentRow)
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    Aucun étudiant trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </>
        )

      case "companies":
        return (
          <>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Secteur</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Stagiaires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.companies.length > 0 ? (
                data.companies.map(renderCompanyRow)
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Aucune entreprise trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </>
        )

      case "supervisors":
        return (
          <>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Spécialisation</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Étudiants</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.supervisors.length > 0 ? (
                data.supervisors.map(renderSupervisorRow)
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Aucun encadreur trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </>
        )

      case "raw":
        // Combine all data for raw view
        const allData = [
          ...data.students.map(s => ({ ...s, type: "student" })),
          ...data.companies.map(c => ({ ...c, type: "company" })),
          ...data.supervisors.map(s => ({ ...s, type: "supervisor" }))
        ]
        
        return (
          <>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Nom/Société</TableHead>
                <TableHead>Prénom/Secteur</TableHead>
                <TableHead>Spécialisation</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Autre</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allData.length > 0 ? (
                allData.map(renderRawDataRow)
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Aucune donnée trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        {getTableContent()}
      </Table>
    </div>
  )
}
