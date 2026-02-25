'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Building2,
  UserCheck,
  Award,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface KPICardsProps {
  selectedYears: string[];
  isLoading?: boolean;
}

// Mock data - using string keys to match selectedYears
const kpiData = {
  students: {
    title: 'Étudiants',
    icon: Users,
    data: {
      '2020': 45,
      '2021': 52,
      '2022': 68,
      '2023': 75,
      '2024': 82,
    },
  },
  companies: {
    title: 'Entreprises',
    icon: Building2,
    data: {
      '2020': 28,
      '2021': 31,
      '2022': 38,
      '2023': 42,
      '2024': 47,
    },
  },
  supervisors: {
    title: 'Encadreurs',
    icon: UserCheck,
    data: {
      '2020': 35,
      '2021': 38,
      '2022': 42,
      '2023': 45,
      '2024': 48,
    },
  },
  averageGrade: {
    title: 'Note Moyenne',
    icon: Award,
    data: {
      '2020': 14.5,
      '2021': 15.2,
      '2022': 15.8,
      '2023': 16.1,
      '2024': 16.4,
    },
  },
};

function KPISkeleton() {
  return (
    <Card className="p-6 border border-border animate-pulse">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-lg" />
          <div className="h-6 bg-muted rounded w-24" />
        </div>
        <div className="h-16 bg-muted rounded" />
      </div>
    </Card>
  );
}

function KPICard({
  title,
  Icon,
  values,
  chartData,
  bestYear,
  worstYear,
}: {
  title: string;
  Icon: any;
  values: Record<string, number>; // Changed from Record<number, number>
  chartData: any;
  bestYear: string; // Changed from number
  worstYear: string; // Changed from number
}) {
  const years = Object.keys(values).sort(); // Changed: removed .map(Number)
  const firstValue = values[years[0]];
  const lastValue = values[years[years.length - 1]];
  const change = lastValue - firstValue;
  const percentChange = ((change / firstValue) * 100).toFixed(1);
  const isIncrease = change >= 0;

  return (
    <Card className="p-6 border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 bg-card group">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">{title}</h3>
        </div>
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            isIncrease
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'
          }`}
        >
          {isIncrease ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {Math.abs(Number(percentChange))}%
        </div>
      </div>

      {/* Values Row */}
      <div className="flex gap-3 mb-4">
        {years.map((year) => (
          <div key={year} className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">{year}</div>
            <div className="text-2xl font-bold text-foreground">
              {typeof values[year] === 'number'
                ? values[year] % 1 === 0
                  ? values[year]
                  : values[year].toFixed(1)
                : values[year]}
            </div>
          </div>
        ))}
      </div>

      {/* Sparkline Chart */}
      <div className="h-12 -mx-2 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Year Badges */}
      <div className="flex gap-2">
        <Badge
          variant="secondary"
          className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
        >
          Meilleur: {bestYear}
        </Badge>
        <Badge
          variant="secondary"
          className="text-xs bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800"
        >
          Pire: {worstYear}
        </Badge>
      </div>
    </Card>
  );
}

export function KPICards({ selectedYears, isLoading = false }: KPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <KPISkeleton key={i} />
        ))}
      </div>
    );
  }

  if (selectedYears.length < 2) {
    return null;
  }

  const kpis = [kpiData.students, kpiData.companies, kpiData.supervisors, kpiData.averageGrade];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        // Filter data based on selected years (now works with strings)
        const filteredData = selectedYears.reduce(
          (acc, year) => {
            acc[year] = kpi.data[year as keyof typeof kpi.data];
            return acc;
          },
          {} as Record<string, number>
        );

        const years = [...selectedYears].sort(); // Create copy to avoid mutation
        const chartData = years.map((year) => ({
          year,
          value: kpi.data[year as keyof typeof kpi.data],
        }));

        // Find best and worst years based on values
        const values = Object.values(filteredData);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        
        const bestYear = years.find(year => filteredData[year] === maxValue) || years[0];
        const worstYear = years.find(year => filteredData[year] === minValue) || years[0];

        return (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            Icon={kpi.icon}
            values={filteredData}
            chartData={chartData}
            bestYear={bestYear}
            worstYear={worstYear}
          />
        );
      })}
    </div>
  );
}