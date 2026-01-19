"use client"
import { 
  CalendarSearch, 
  Home, 
  ChartNoAxesCombined, 
  UserStar, 
  Building2, 
  Database } from "lucide-react"

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
import { useData } from "@/Context/DataContext"


export function AppSidebar( ) {
  const {parsedData,selectedYear, setSelectedYear} = useData();
  const availableYears = parsedData?.summary.yearsCovered || [];
  const onYearSelect = (year: string) => {
    setSelectedYear(year);
  };
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
      children: availableYears.length > 0 ? availableYears.map(year => ({
        title: year,
        url: "#",
        year: year
      })) : [
        { title: "2024", url: "#", year: "2024" },
        { title: "2023", url: "#", year: "2023" },
        { title: "2022", url: "#", year: "2022" },
      ],
    },
    {
      title: "Encadrent",
      url: "/dashboard/encadrant",
      icon: UserStar,
    },
    {
      title: "Sociéte",
      url: "/societes",
      icon: Building2,
    },
  {
    title: "Analyse",
    url: "/analyse",
    icon: ChartNoAxesCombined,
  },
  ]
  
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
            {/* <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Navigation</SidebarGroupLabel> */}
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
                              <SidebarMenuSubItem key={child.title} >
                                <SidebarMenuSubButton 
                                  asChild
                                  className={selectedYear === child.year ? "bg-accent text-accent-foreground" : ""}
                                >
                                  <button 
                                    onClick={() => onYearSelect?.(child.year || child.title)}
                                    className="w-full text-left"
                                  >
                                    {child.title}
                                    {selectedYear === child.year && (
                                      <span className="ml-auto text-xs">✓</span>
                                    )}
                                  </button>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) :
                    <SidebarMenuItem key={item.title} >
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