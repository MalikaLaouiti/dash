"use client"

import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Loader2 } from "lucide-react"
import { StudentDTO } from "@/dto/student.dto"
import { CompanyDTO } from "@/dto/company.dto"
import { SupervisorDTO } from "@/dto/supervisor.dto"
import { on } from "events"
import { useEffect, useState } from "react"

interface TableRowsProps {
  data: any[]
  activeTab: "students" | "companies"  | "supervisors-academic" | "supervisors-professional"
  onViewDetails: (item: any) => void
}

export function TableRows({ data, activeTab, onViewDetails }: TableRowsProps) {
  const renderRow = (item: any, index: number) => {
    switch (activeTab) {
      case "students":
        return renderStudentRow(item as StudentDTO, index, onViewDetails)
      case "companies":
        return renderCompanyRow(item as CompanyDTO, index, onViewDetails)
      default:
        return renderSupervisorRow(item as SupervisorDTO, index, onViewDetails)
    }
  }

  if (data.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={8} className="text-center text-muted-foreground">
          chargement des données... <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />
        </TableCell>
      </TableRow>
    );
  }

  return <>{data.map(renderRow)}</>
}

function renderStudentRow(student: StudentDTO, index: number, onViewDetails: (item: any) => void) {
  return (
    <TableRow key={`${student.cin}-${student.annee}-${student.codeProjet}-${index}`}>
      <TableCell className="font-mono text-xs">{student.codeProjet}</TableCell>
      <TableCell className="font-medium">{student.prenom}</TableCell>
      <TableCell className="text-xs">{student.cin}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs">{student.filiere}</Badge>
      </TableCell>
      <TableCell className="text-center font-semibold">{student.score}</TableCell>
      <TableCell className="max-w-[200px] truncate" title={student.titreProjet}>
        {student.titreProjet}
      </TableCell>
      <TableCell>{student.annee}</TableCell>
      <TableCell>
        <ActionButton onClick={() => onViewDetails(student)} />
      </TableCell>
    </TableRow>
  )
}

function renderCompanyRow(company: CompanyDTO, index: number, onViewDetails: (item: any) => void) {
  return (
    <TableRow key={`${company.nom}-${company.annee}-${index}`}>
      <TableCell className="font-medium">{company.nom}</TableCell>
      <TableCell>
        <Badge variant="outline">{company.secteur || "N/A"}</Badge>
      </TableCell>
      <TableCell>{company.annee}</TableCell>
      <TableCell className="max-w-[150px] truncate">{company.adresse || "N/A"}</TableCell>
      <TableCell>
        <Badge variant="secondary">{company.nombreStagiaires} stagiaires</Badge>
      </TableCell>
      <TableCell>
        <ActionButton onClick={() => onViewDetails(company)} />
      </TableCell>
    </TableRow>
  )
}

function renderSupervisorRow(supervisor: SupervisorDTO, index: number, onViewDetails: (item: any) => void) {
  return (
    <TableRow key={`${supervisor.prenom}-${supervisor.annee}-${index}`}>
      <TableCell className="font-medium">{supervisor.prenom}</TableCell>
      <TableCell>
        <Badge variant={supervisor.categorie === "academique" ? "default" : "outline"}>
          {supervisor.categorie}
        </Badge>
      </TableCell>
      <TableCell>{supervisor.annee}</TableCell>
      <TableCell className="text-xs">{supervisor.email || "N/A"}</TableCell>
      <TableCell>
        <Badge variant="secondary">{supervisor.nombreEtudiants} étudiants</Badge>
      </TableCell>
      <TableCell>
        <ActionButton onClick={() => onViewDetails(supervisor)} />
      </TableCell>
    </TableRow>
  )
}

function ActionButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <Eye className="h-4 w-4" />
    </Button>
  )
}