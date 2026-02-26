'use client';

import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subValue?: string;
  icon: LucideIcon;
  iconColor: string;
  trend?: number;
  trendLabel?: string;
  prefix?: string;
  suffix?: string;
  children?: ReactNode;
}

export function MetricCard({
  title,
  value,
  subValue,
  icon: Icon,
  iconColor,
  trend,
  trendLabel,
  prefix = '',
  suffix = '',
  children,
}: MetricCardProps) {
  const isTrendPositive = trend ? trend >= 0 : true;
  
  return (
    <Card className="p-5 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 group">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              isTrendPositive
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40'
            }`}>
              {isTrendPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        
        {children ? (
          children
        ) : (
          subValue && (
            <p className="text-xs text-muted-foreground border-t border-border/30 pt-3">
              {subValue}
            </p>
          )
        )}
      </div>
    </Card>
  );
}