"use client"
import { CalendarSearch, Home, ChartNoAxesCombined, UserStar, Building2, Database } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubItem,
  SidebarMenuSub,
  SidebarMenuSubButton
} from "@/components/ui/sidebar"

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"

const items = [
  {
    title: "Acceuil",
    url: "/",
    icon: Home,
  },
  {
    title: "Année Universitaire",
    url: "#",
    icon: CalendarSearch,
    children: [
      { title: "2022-2023", url: "/add-year" },
      { title: "2023-2024", url: "/list-years" },
      { title: "2024-2025", url: "/list-years" },
    ],
  },
  {
    title: "Encadrent",
    url: "#",
    icon: UserStar,
  },
  {
    title: "Sociéte",
    url: "#",
    icon: Building2,
  },
  {
    title: "Statistique",
    url: "#",
    icon: ChartNoAxesCombined,
  },
]

export function AppSidebar() {
  return (
        <Sidebar>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-sidebar-primary" />
            <h2 className="font-semibold text-sidebar-foreground">Données Académiques</h2>
          </div>
        </div>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Navigation</SidebarGroupLabel>
            <SidebarGroupContent >
              <SidebarMenu >
                {items.map((item) => (
                  item.title == "Année Universitaire" ? (
                    <Collapsible key={item.title} defaultOpen className="group/collapsible"  >
                      <SidebarMenuItem >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <item.icon />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children?.map((child) => (
                              <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuSubButton asChild>
                                  <a href={child.url}>{child.title}</a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) :
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <item.icon />
                          <span >{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    
  )
}