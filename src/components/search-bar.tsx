"use client"

import { useState, useEffect } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
  filters: {
    students: boolean
    companies: boolean
    supervisors: boolean
  }
  onFiltersChange: (filters: any) => void
}

export function SearchBar({ query, onQueryChange, filters, onFiltersChange }: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const searchSuggestions = [
    "informatique",
    "gestion",
    "marketing",
    "finance",
    "tech",
    "consulting",
    "stage",
    "projet",
    "mémoire",
    "encadrement",
    "société",
    "entreprise",
  ]

  useEffect(() => {
    if (query.length > 1) {
      const filtered = searchSuggestions.filter((suggestion) => suggestion.toLowerCase().includes(query.toLowerCase()))
      setSuggestions(filtered.slice(0, 5))
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [query])

  const handleFilterChange = (key: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      [key]: checked,
    })
  }

  const clearSearch = () => {
    onQueryChange("")
    setShowSuggestions(false)
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(Boolean).length
  }

  const getActiveFiltersLabels = () => {
    const labels = []
    if (filters.students) labels.push("Étudiants")
    if (filters.companies) labels.push("Sociétés")
    if (filters.supervisors) labels.push("Encadreurs")
    return labels
  }

  return (
    <div className="space-y-3 p-1 w-full">
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des étudiants, sociétés, encadreurs..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-10 pr-10 bg-input border-border"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          {/* Search Suggestions */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                  onClick={() => {
                    onQueryChange(suggestion)
                    setShowSuggestions(false)
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent relative h-9 ">
              <Filter className="h-4 w-4" />
              Filtres
              {getActiveFiltersCount() > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 text-xs">{getActiveFiltersCount()}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 " align="end">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Filtrer par type</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="students"
                    checked={filters.students}
                    onCheckedChange={(checked) => handleFilterChange("students", checked as boolean)}
                  />
                  <label htmlFor="students" className="text-sm">
                    Étudiants
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="companies"
                    checked={filters.companies}
                    onCheckedChange={(checked) => handleFilterChange("companies", checked as boolean)}
                  />
                  <label htmlFor="companies" className="text-sm">
                    Sociétés
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="supervisors"
                    checked={filters.supervisors}
                    onCheckedChange={(checked) => handleFilterChange("supervisors", checked as boolean)}
                  />
                  <label htmlFor="supervisors" className="text-sm">
                    Encadreurs
                  </label>
                </div>
              </div>

              {getActiveFiltersCount() > 0 && (
                <div className="pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => onFiltersChange({ students: true, companies: true, supervisors: true })}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && getActiveFiltersCount() < 3 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtres actifs:</span>
          {getActiveFiltersLabels().map((label) => (
            <Badge key={label} variant="secondary" className="text-xs">
              {label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
