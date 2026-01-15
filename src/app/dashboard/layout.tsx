"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useState } from "react";


export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar/>
        <main className="flex-1 flex flex-col overflow-hidden">
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
