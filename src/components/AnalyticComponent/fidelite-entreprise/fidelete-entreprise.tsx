'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, TrendingUp, Award, Search, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import { CompanyLoyaltyResult } from '@/lib/analyse/types';

interface FideliteEntreprisesProps {
  data?: CompanyLoyaltyResult[];
}

const safeNum = (val: unknown, fallback = 0): number => {
  const n = Number(val);
  return isFinite(n) ? n : fallback;
};

// ── Component ────────────────────────────────────────────────────────────────
export default function FideliteEntreprises({ data }: FideliteEntreprisesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'fidelite' | 'stagiaires' | 'annees'>('fidelite');

  // Use provided data only - no mock data fallback
  const resolvedData = data || [];

  // ── Filtered & sorted table rows ──────────────────────────────────────────
  const filteredAndSortedData = useMemo(() => {
    const filtered = resolvedData.filter(
      (company) =>
        (company.companyName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.secteur ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (sortBy === 'fidelite') return safeNum(b.scoreFidelite) - safeNum(a.scoreFidelite);
      if (sortBy === 'stagiaires') return safeNum(b.totalStagiaires) - safeNum(a.totalStagiaires);
      return safeNum(b.nombreAnnees) - safeNum(a.nombreAnnees);
    });
  }, [resolvedData, searchTerm, sortBy]);

  // ── KPIs with safe division ───────────────────────────────────────────────
  const totalCompanies = resolvedData.length;
  
  const loyalCompanies = resolvedData.filter((c) => safeNum(c.scoreFidelite) === 100).length;
  
  const avgLoyaltyScore = totalCompanies > 0 
    ? (resolvedData.reduce((sum, c) => sum + safeNum(c.scoreFidelite), 0) / totalCompanies).toFixed(1)
    : "0.0";
  
  const avgYears = totalCompanies > 0
    ? (resolvedData.reduce((sum, c) => sum + safeNum(c.nombreAnnees), 0) / totalCompanies).toFixed(1)
    : "0.0";
  
  const totalStagiaires = resolvedData.reduce(
    (sum, c) => sum + safeNum(c.totalStagiaires),
    0
  );

  // ── Chart data ────────────────────────────────────────────────────────────
  const loyaltyDistribution = [
    { name: 'Très Fidèle (100%)', value: loyalCompanies, color: '#10b981' },
    {
      name: 'Fidèle (66-99%)',
      value: resolvedData.filter(
        (c) => safeNum(c.scoreFidelite) >= 66 && safeNum(c.scoreFidelite) < 100
      ).length,
      color: '#3b82f6',
    },
    {
      name: 'Peu Fidèle (<66%)',
      value: resolvedData.filter((c) => safeNum(c.scoreFidelite) < 66).length,
      color: '#ef4444',
    },
  ];

  const yearsPresenceData = [3, 2, 1].map((n) => ({
    years: `${n} an${n > 1 ? 's' : ''}`,
    count: resolvedData.filter((c) => safeNum(c.nombreAnnees) === n).length,
    stagiaires: resolvedData
      .filter((c) => safeNum(c.nombreAnnees) === n)
      .reduce((sum, c) => sum + safeNum(c.totalStagiaires), 0),
  }));

  const scatterData = resolvedData.map((company) => ({
    x: safeNum(company.nombreAnnees),
    y: safeNum(company.scoreFidelite),
    z: safeNum(company.totalStagiaires),
    name: company.companyName ?? '',
  }));

  // Calculate trend based on multiplicateurs array
  const getTrend = (multiplicateurs: number[] = []) => {
    if (multiplicateurs.length < 2) return { trend: 'stable', value: 0 };
    
    const first = multiplicateurs[0];
    const last = multiplicateurs[multiplicateurs.length - 1];
    const firstVal = safeNum(first);
    const lastVal = safeNum(last);
    
    const trend = lastVal > firstVal ? 'up' : lastVal < firstVal ? 'down' : 'stable';
    
    return { trend, value: lastVal };
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-500">
        <Card className="p-6 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">Entreprises Fidèles</p>
              <div className="p-2.5 rounded-lg bg-emerald-100/20 dark:bg-emerald-950/30">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{loyalCompanies}</span>
              <span className="text-sm text-muted-foreground">/ {totalCompanies}</span>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Score: 100%
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">Score Moyen</p>
              <div className="p-2.5 rounded-lg bg-primary/10">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{avgLoyaltyScore}%</div>
            <div className="text-xs text-muted-foreground">Tous les partenaires</div>
          </div>
        </Card>

        <Card className="p-6 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">Présence Moyenne</p>
              <div className="p-2.5 rounded-lg bg-blue-100/20 dark:bg-blue-950/30">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{avgYears}</div>
            <div className="text-xs text-muted-foreground">ans en moyenne</div>
          </div>
        </Card>

        <Card className="p-6 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">Stagiaires Accueillis</p>
              <div className="p-2.5 rounded-lg bg-amber-100/20 dark:bg-amber-950/30">
                <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{totalStagiaires}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pie Chart */}
        <Card className="p-6 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Distribution de Fidélité</h3>
          {totalCompanies > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={loyaltyDistribution.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {loyaltyDistribution.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
          <div className="space-y-2 mt-4 text-xs">
            {loyaltyDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Bar Chart */}
        <Card className="p-6 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Présence par Années</h3>
          {totalCompanies > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={yearsPresenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="years" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
        </Card>

        {/* Scatter Chart */}
        <Card className="p-6 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Fidélité vs Présence</h3>
          {totalCompanies > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Années"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Score Fidélité"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Entreprises" data={scatterData} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-6 border border-border/50">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Nom entreprise ou secteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(
              [
                { key: 'fidelite', label: 'Fidélité' },
                { key: 'stagiaires', label: 'Stagiaires' },
                { key: 'annees', label: 'Années' },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Companies Table */}
      <Card className="p-6 border border-border/50 overflow-x-auto">
        <h3 className="text-sm font-semibold text-foreground mb-4">Détail des Entreprises</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Entreprise</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Secteur</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Score</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Années</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Stagiaires</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Tendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.length > 0 ? (
                filteredAndSortedData.map((company) => {
                  const { trend, value } = getTrend(company.multiplicateurs);

                  return (
                    <tr
                      key={company.companyName}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-foreground">
                        {company.companyName}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {company.secteur || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          className={
                            safeNum(company.scoreFidelite) === 100
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : safeNum(company.scoreFidelite) >= 66
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          }
                        >
                          {safeNum(company.scoreFidelite).toFixed(0)}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center text-foreground font-medium">
                        {safeNum(company.nombreAnnees)}
                      </td>
                      <td className="py-3 px-4 text-center text-foreground font-medium">
                        {safeNum(company.totalStagiaires)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {company.multiplicateurs && company.multiplicateurs.length > 0 ? (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              trend === 'up'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : trend === 'down'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                            {value.toFixed(2)}x
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Aucune entreprise trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}