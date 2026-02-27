interface CategoryConfig {
  bg: string;
  border: string;
  badge: string;
  color: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  grande: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    color: '#3b82f6'
  },
  moyenne: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    color: '#10b981'
  },
  petite: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    color: '#f59e0b'
  }
};

export const CATEGORY_LABELS = {
  grande: 'Grandes Entreprises',
  moyenne: 'Moyennes Entreprises',
  petite: 'Petites Entreprises'
};