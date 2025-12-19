// components/data-table/detail-view.tsx
"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DetailViewProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedItem: any
  activeTab: "students" | "companies" | "supervisors" | "supervisors-academic" | "supervisors-professional"
}

export function DetailView({ isOpen, onOpenChange, selectedItem, activeTab }: DetailViewProps) {
  if (!selectedItem) return null

  const renderContent = () => {
    switch (activeTab) {
      case "students":
        return <StudentDetail student={selectedItem} />
      case "companies":
        return <CompanyDetail company={selectedItem} />
      default:
        return <SupervisorDetail supervisor={selectedItem} />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}

function StudentDetail({ student }: { student: any }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Détails de l'étudiant</DialogTitle>
        <DialogDescription>Informations complètes du stage</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4 py-4">
        <DetailField label="Nom & Prénom" value={student.prenom} />
        <DetailField label="CIN" value={student.cin} />
        <DetailField label="Code Projet" value={student.codeProjet} className="font-mono" />
        <DetailField label="Filière" value={student.filiere} />
        <DetailField label="Score" value={student.score} className="font-semibold" />
        <DetailField label="Année" value={student.annee} />
        <DetailField label="Titre du Projet" value={student.titreProjet} span={2} />
        <DetailField label="Collaboration" value={student.collaboration} />
        {student.collaborateur && <DetailField label="Collaborateur" value={student.collaborateur} />}
        <DetailField label="Localisation" value={student.localisation_type || "Externe"} />
        <DetailField label="Entreprise ID" value={student.companyId || "N/A"} />
        <DetailField label="Email" value={student.email || "N/A"} />
        <DetailField label="Téléphone" value={student.telephone || "N/A"} />
        <DetailField label="Encadrant Académique" value={student.encadreurAcId || "N/A"} />
        <DetailField label="Encadrant Professionnel" value={student.encadreurProId || "N/A"} />
      </div>
    </>
  )
}

function CompanyDetail({ company }: { company: any }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Détails de l'entreprise</DialogTitle>
        <DialogDescription>Informations complètes</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4 py-4">
        <DetailField label="Nom" value={company.nom} span={2} className="font-semibold" />
        <DetailField label="Secteur" value={company.secteur || "N/A"} />
        <DetailField label="Année" value={company.annee} />
        <DetailField label="Adresse" value={company.adresse || "N/A"} span={2} />
        <DetailField label="Emails" value={company.email?.join(', ') || "N/A"} span={2} />
        <DetailField label="Téléphones" value={company.telephone?.join(', ') || "N/A"} span={2} />
        <DetailField label="Encadrants Professionnels" value={company.encadrantPro?.join(', ') || "N/A"} span={2} />
        <DetailField label="Nombre de Stagiaires" value={company.nombreStagiaires} className="font-semibold" />
      </div>
    </>
  )
}

function SupervisorDetail({ supervisor }: { supervisor: any }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Détails de l'encadreur</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <DetailField label="Nom & Prénom" value={supervisor.prenom} />
        <DetailField label="Catégorie" value={supervisor.categorie} />
        <DetailField label="Email" value={supervisor.email || "N/A"} />
        <DetailField label="Téléphone" value={supervisor.telephone || "N/A"} />
        <DetailField label="Nombre d'étudiants" value={supervisor.nombreEtudiants} className="font-semibold" />
      </div>
    </>
  )
}

function DetailField({ 
  label, 
  value, 
  span = 1, 
  className = "" 
}: { 
  label: string
  value: string | number
  span?: number
  className?: string 
}) {
  return (
    <div className={`col-span-${span}`}>
      <label className="text-sm font-semibold text-muted-foreground">{label}</label>
      <p className={`text-sm mt-1 ${className}`}>{value}</p>
    </div>
  )
}