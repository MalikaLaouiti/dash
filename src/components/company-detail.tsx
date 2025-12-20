"use client"

import type React from "react"
import {DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  Briefcase,
  Calendar,
  UserCheck,
} from "lucide-react"
import { DetailField } from "./detail-field"

export function CompanyDetail({ company }: { company: any }) {
  return (
    <>
      <DialogHeader className="space-y-4 pb-6 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-semibold tracking-tight">{company.nom}</DialogTitle>
            <DialogDescription className="text-base">Informations complètes de l'entreprise</DialogDescription>
          </div>
          <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            {company.nombreStagiaires} {company.nombreStagiaires > 1 ? "stagiaires" : "stagiaire"}
          </Badge>
        </div>
      </DialogHeader>

      <div className="space-y-6 py-6">
        {/* Company Info Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Informations Générales
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DetailField
              icon={<Briefcase className="h-4 w-4" />}
              label="Secteur"
              value={company.secteur || "Non spécifié"}
            />
            <DetailField icon={<Calendar className="h-4 w-4" />} label="Année" value={company.annee} />
          </div>
          <DetailField
            icon={<MapPin className="h-4 w-4" />}
            label="Adresse"
            value={company.adresse || "Non renseignée"}
          />
        </div>

        {/* Contact Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Contact
          </h3>
          <div className="space-y-3">
            <DetailField
              icon={<Mail className="h-4 w-4" />}
              label="Emails"
              value={company.email?.join(", ") || "Non renseigné"}
            />
            <DetailField
              icon={<Phone className="h-4 w-4" />}
              label="Téléphones"
              value={company.telephone?.join(", ") || "Non renseigné"}
            />
          </div>
        </div>

        {/* Supervisors Section */}
        {company.encadrantPro && company.encadrantPro.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Encadrants Professionnels
            </h3>
            <div className="bg-muted/30 rounded-lg p-4 border">
              <div className="flex flex-wrap gap-2">
                {company.encadrantPro.map((encadrant: string, index: number) => (
                  <Badge key={index} variant="outline" className="font-normal">
                    {encadrant}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}