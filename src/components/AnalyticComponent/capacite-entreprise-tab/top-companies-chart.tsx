'use client';

import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CompanyCapacityResult } from '@/lib/analyse/types';

interface TopCompaniesChartProps {
  companies: CompanyCapacityResult[];
}

export function TopCompaniesChart({ companies }: TopCompaniesChartProps) {
  return (
    <Card className="p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-4">Top 10 Entreprises par Capacité</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={companies}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="companyName" 
            angle={-45} 
            textAnchor="end" 
            height={80} 
            tick={{ fontSize: 12 }} 
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="capaciteDeclaree" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}