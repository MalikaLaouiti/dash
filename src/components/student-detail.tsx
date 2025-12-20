"use client"

import type React from "react"
import {DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  User,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Award,
  Users,
  Briefcase,
  Calendar,
  Hash,
  FileText,
  UserCheck,
} from "lucide-react"
import { DetailField } from "./detail-field"

export function StudentDetail({ student }: { student: any }) {
  return (
    <>
      <DialogHeader className="space-y-4 pb-6 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-semibold tracking-tight">{student.prenom}</DialogTitle>
            <DialogDescription className="text-base">Informations complètes du stage</DialogDescription>
          </div>
          <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
            <Award className="h-3.5 w-3.5 mr-1.5" />
            {student.score}
          </Badge>
        </div>
      </DialogHeader>

      <div className="space-y-6 py-6">
        {/* Project Info Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Projet de Fin d'Études
          </h3>
          <div className="bg-muted/30 rounded-lg p-4 space-y-3 border">
            <DetailField
              icon={<FileText className="h-4 w-4" />}
              label="Titre du Projet"
              value={student.titreProjet}
              highlight
            />
            <div className="grid grid-cols-2 gap-4">
              <DetailField icon={<Hash className="h-4 w-4" />} label="Code Projet" value={student.codeProjet} />
              <DetailField icon={<Users className="h-4 w-4" />} label="Collaboration" value={student.collaboration} />
            </div>
            {student.collaborateur && (
              <DetailField icon={<User className="h-4 w-4" />} label="Collaborateur" value={student.collaborateur} />
            )}
          </div>
        </div>

        {/* Academic Info Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Informations Académiques
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DetailField icon={<Hash className="h-4 w-4" />} label="CIN" value={student.cin} />
            <DetailField icon={<GraduationCap className="h-4 w-4" />} label="Filière" value={student.filiere} />
            <DetailField icon={<Calendar className="h-4 w-4" />} label="Année" value={student.annee} />
            <DetailField
              icon={<UserCheck className="h-4 w-4" />}
              label="Encadrant Académique"
              value={student.encadreurAcId || "Non assigné"}
            />
          </div>
        </div>

        {/* Internship Location Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Lieu du Stage
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DetailField
              icon={<MapPin className="h-4 w-4" />}
              label="Localisation"
              value={student.localisation_type || "Externe"}
            />
            <DetailField
              icon={<Building2 className="h-4 w-4" />}
              label="Entreprise ID"
              value={student.companyId || "N/A"}
            />
            <DetailField
              icon={<UserCheck className="h-4 w-4" />}
              label="Encadrant Professionnel"
              value={student.encadreurProId || "Non assigné"}
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Contact
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DetailField icon={<Mail className="h-4 w-4" />} label="Email" value={student.email || "Non renseigné"} />
            <DetailField
              icon={<Phone className="h-4 w-4" />}
              label="Téléphone"
              value={student.telephone || "Non renseigné"}
            />
          </div>
        </div>
      </div>
    </>
  )
}