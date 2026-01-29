'use client'

import { SidebarProvider } from "@/components/ui/sidebar"
import { DataProvider } from "@/Context/DataContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </DataProvider>
  )
}