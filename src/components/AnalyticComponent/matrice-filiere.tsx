'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Search, GraduationCap, Building2, Users, TrendingUp } from 'lucide-react';
import { CompanyFiliereResult } from '@/lib/analyse/types';

// ── Props ────────────────────────────────────────────────────────────────────
interface MatriceFilièresProps {
  data?: CompanyFiliereResult[];
}


// ── Helpers ──────────────────────────────────────────────────────────────────
const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#6366f1', '#f97316',
];

const safeNum = (val: unknown, fallback = 0): number => {
  const n = Number(val);
  return isFinite(n) ? n : fallback;
};

export default function MatriceFilieres({ data }:{ data: CompanyFiliereResult[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState<string | null>(null);

  const kpiMetrics = useMemo(() => {
    const totalCompanies = data.length;
    const allFilieres = new Set<string>();
    let totalStudents = 0;
    let totalPartnerships = 0;

    data.forEach((company) => {
      totalStudents += safeNum(company.totalEtudiants);
      (company.filieres ?? []).forEach((f) => {
        allFilieres.add(f.filiere);
        totalPartnerships += 1;
      });
    });

    return {
      totalCompanies,
      totalFilieres: allFilieres.size,
      totalStudents,
      totalPartnerships,
      avgStudentsPerCompany: totalCompanies
        ? (totalStudents / totalCompanies).toFixed(1)
        : '0',
      avgStudentsPerFiliere: allFilieres.size
        ? (totalStudents / allFilieres.size).toFixed(1)
        : '0',
    };
  }, [data]);

  // ── All unique filières ───────────────────────────────────────────────────
  const allFilieres = useMemo(() => {
    const set = new Set<string>();
    data.forEach((c) => (c.filieres ?? []).forEach((f) => set.add(f.filiere)));
    return Array.from(set).sort();
  }, [data]);

  // ── Bar chart: students per filière (aggregated across companies) ──────────
  const filiereDistributionData = useMemo(() =>
    allFilieres.map((filiere) => {
      let students = 0;
      let companies = 0;
      data.forEach((company) => {
        const match = (company.filieres ?? []).find((f) => f.filiere === filiere);
        if (match) {
          students += safeNum(match.nombreEtudiants);
          companies += 1;
        }
      });
      return { name: filiere, students, companies };
    }),
  [data, allFilieres]);

  // ── Pie chart: top companies by total students ────────────────────────────
  const companyStudentData = useMemo(() =>
    [...data]
      .map((c) => ({ name: c.companyName ?? c.companyId, value: safeNum(c.totalEtudiants) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8),
  [data]);

  // ── Filtered filière buttons ──────────────────────────────────────────────
  const filteredFilieres = useMemo(() =>
    searchTerm
      ? allFilieres.filter((f) => f.toLowerCase().includes(searchTerm.toLowerCase()))
      : allFilieres,
  [allFilieres, searchTerm]);

  // Companies for the selected filière
  const companiesForFiliere = useMemo(() => {
    if (!selectedFiliere) return [];
    return data
      .flatMap((company) => {
        const match = (company.filieres ?? []).find((f) => f.filiere === selectedFiliere);
        if (!match) return [];
        return [{
          companyId: company.companyId,
          companyName: company.companyName,
          secteur: company.secteur,
          nombreEtudiants: safeNum(match.nombreEtudiants),
          moyenneNotes: safeNum(match.moyenneNotes),
        }];
      })
      .sort((a, b) => b.nombreEtudiants - a.nombreEtudiants);
  }, [data, selectedFiliere]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Filières', value: kpiMetrics.totalFilieres, icon: GraduationCap },
          { label: 'Entreprises', value: kpiMetrics.totalCompanies, icon: Building2 },
          { label: 'Étudiants', value: kpiMetrics.totalStudents, icon: Users },
          { label: 'Partenariats', value: kpiMetrics.totalPartnerships, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <Card
            key={label}
            className="p-6 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{label}</p>
                <p className="text-3xl font-bold text-foreground">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 border border-border/50">
          <h3 className="font-semibold text-foreground mb-4">Distribution par Filière</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filiereDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                }}
              />
              <Legend />
              <Bar dataKey="students" fill="#3b82f6" name="Étudiants" />
              <Bar dataKey="companies" fill="#8b5cf6" name="Entreprises" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border border-border/50">
          <h3 className="font-semibold text-foreground mb-4">Top Entreprises par Étudiants</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={companyStudentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${String(name).substring(0, 12)}… (${value})`}
                outerRadius={80}
                dataKey="value"
              >
                {companyStudentData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Filière detail */}
      <Card className="p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">Détail par Filière</h3>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une filière..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {filteredFilieres.map((filiere) => {
            const count = data.filter((c) =>
              (c.filieres ?? []).some((f) => f.filiere === filiere)
            ).length;
            return (
              <Button
                key={filiere}
                onClick={() => setSelectedFiliere(filiere)}
                variant={selectedFiliere === filiere ? 'default' : 'outline'}
                className="transition-all duration-200"
              >
                {filiere}
                <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {selectedFiliere && companiesForFiliere.length > 0 ? (
          <div>
            <h4 className="font-semibold text-foreground mb-3">
              Entreprises — {selectedFiliere}
            </h4>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {companiesForFiliere.map((company) => (
                <div
                  key={company.companyId}
                  className="p-4 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-foreground text-sm">{company.companyName}</p>
                    <Badge className="bg-primary/20 text-primary font-semibold">
                      {company.nombreEtudiants}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{company.secteur || '-'}</p>
                  <p className="text-xs text-muted-foreground">
                    Moy. notes:{' '}
                    <span className="font-medium text-foreground">
                      {company.moyenneNotes.toFixed(1)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          filteredFilieres.length > 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Sélectionnez une filière pour voir les entreprises associées
              </p>
            </div>
          )
        )}
      </Card>

      {/* Summary statistics */}
      <Card className="p-6 border border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
        <h3 className="font-semibold text-foreground mb-4">Statistiques Globales</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Moy. Étudiants/Entreprise</p>
            <p className="text-2xl font-bold text-foreground">
              {kpiMetrics.avgStudentsPerCompany}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Moy. Étudiants/Filière</p>
            <p className="text-2xl font-bold text-foreground">
              {kpiMetrics.avgStudentsPerFiliere}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Partenaires Uniques</p>
            <p className="text-2xl font-bold text-foreground">{kpiMetrics.totalCompanies}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Taux d'Utilisation</p>
            <p className="text-2xl font-bold text-foreground">
              {kpiMetrics.totalCompanies > 0
                ? (
                    (kpiMetrics.totalStudents / (kpiMetrics.totalCompanies * 5)) * 100
                  ).toFixed(0)
                : '0'}
              %
            </p>
          </div>
        </div>
      </Card>
    </main>
  );
}