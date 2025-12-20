"use client"

import type React from "react"
import {DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Mail,
  Phone,
  Users,
  UserCheck,
} from "lucide-react"
import { DetailField } from "./detail-field"

export function SupervisorDetail({ supervisor }: { supervisor: any }) {
  return (
    <>
      <DialogHeader className="space-y-4 pb-6 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-semibold tracking-tight">{supervisor.prenom}</DialogTitle>
            <DialogDescription className="text-base">Informations de l'encadreur</DialogDescription>
          </div>
          <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            {supervisor.nombreEtudiants} {supervisor.nombreEtudiants > 1 ? "étudiants" : "étudiant"}
          </Badge>
        </div>
      </DialogHeader>

      <div className="space-y-6 py-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            Informations
          </h3>
          <div className="bg-muted/30 rounded-lg p-4 space-y-3 border">
            <DetailField icon={<UserCheck className="h-4 w-4" />} label="Catégorie" value={supervisor.categorie} />
            <DetailField
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={supervisor.email || "Non renseigné"}
            />
            <DetailField
              icon={<Phone className="h-4 w-4" />}
              label="Téléphone"
              value={supervisor.telephone || "Non renseigné"}
            />
          </div>
        </div>
      </div>
    </>
  )
}