"use client"

import type React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

import { StudentDetail } from "./student-detail"
import { SupervisorDetail } from "./supervisor-detail"
import { CompanyDetail } from "./company-detail" 
interface DetailViewProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedItem: any
  activeTab: "students" | "companies" | "supervisors-academic" | "supervisors-professional"
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
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">{renderContent()}</DialogContent>
    </Dialog>
  )
}
