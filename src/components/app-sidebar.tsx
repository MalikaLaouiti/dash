'use client';

import { CalendarSearch, Home, ChartNoAxesCombined, Database } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

import { useData } from '@/Context/DataContext';

export function AppSidebar() {
  const {
    parsedData,
    selectedYear,
    setSelectedYear,
    selectedYears,
    toggleAnalyticsYear,
  } = useData();

  const pathname = usePathname();
  const isAnalyticsPage = pathname === '/dashboard/analyse';

  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await fetch('/api/year', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json(); 

        if (result.success && result.data.length > 0) {
          setAvailableYears(result.data.reverse());
        }
      } catch (error) {
        console.error('Failed to fetch years:', error);
        setAvailableYears(['2025', '2024', '2023']);
      } finally {
        setIsLoading(false);
      }
    };

    fetchYears();
  }, []);

  const handleYearClick = (year: string) => {
    if (isAnalyticsPage) {
      toggleAnalyticsYear(year);
    } else {
      setSelectedYear(year);
    }
  };

  const isYearActive = (year: string) => {
    if (isAnalyticsPage) return selectedYears.includes(year);
    return selectedYear === year;
  };

  const isYearDisabled = (year: string) => {
    if (!isAnalyticsPage) return false;
    return selectedYears.length >= 3 && !selectedYears.includes(year);
  };

  return (
    <Sidebar>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-sidebar-primary" />
          <h2 className="font-semibold text-sidebar-foreground">
            Données Académiques
          </h2>
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Accueil - Toujours en premier */}
              <SidebarMenuItem key="accueil">
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <Home className="w-4 h-4" />
                    <span>Accueil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>


              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <CalendarSearch />
                      <span>Année Universitaire</span>
                      {isAnalyticsPage && selectedYears.length > 0 && (
                        <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                          {selectedYears.length}/3
                        </span>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {availableYears.map((year: string) => (
                        <SidebarMenuSubItem key={year}>
                          <SidebarMenuSubButton
                            asChild
                            className={
                              isYearActive(year)
                                ? 'bg-accent text-accent-foreground'
                                : isYearDisabled(year)
                                  ? 'opacity-40 cursor-not-allowed'
                                  : ''
                            }
                          >
                            <button
                              onClick={() => !isYearDisabled(year) && handleYearClick(year)}
                              className="w-full text-left flex items-center"
                              disabled={isYearDisabled(year)}
                            >
                              {year}
                              {isYearActive(year) && (
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

              {/* Analyse - Toujours en dernier */}
              <SidebarMenuItem key="analyse">
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/analyse">
                    <ChartNoAxesCombined className="w-4 h-4" />
                    <span>Analyse</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}