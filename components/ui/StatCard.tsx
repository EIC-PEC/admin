import React from 'react';
import { LucideIcon } from 'lucide-react';

export type StatCardVariant = 'mint' | 'cyan' | 'blue' | 'coral' | 'gold' | 'purple' | 'amber' | 'emerald';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  icon: LucideIcon;
  variant?: StatCardVariant;
  badge?: string;
  accentBadge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = 'mint',
  badge,
  accentBadge,
}) => {
  const displayBadge = badge || accentBadge;

  const variantConfig: Record<string, { iconBg: string; badgeBg: string; valueColor: string }> = {
    mint: {
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      valueColor: 'text-(--text-primary)',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      valueColor: 'text-(--text-primary)',
    },
    cyan: {
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
      badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
      valueColor: 'text-(--text-primary)',
    },
    blue: {
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      valueColor: 'text-(--text-primary)',
    },
    coral: {
      iconBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
      badgeBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
      valueColor: 'text-(--text-primary)',
    },
    gold: {
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      valueColor: 'text-(--text-primary)',
    },
    amber: {
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      valueColor: 'text-(--text-primary)',
    },
    purple: {
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
      badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
      valueColor: 'text-(--text-primary)',
    },
  };

  const current = variantConfig[variant] || variantConfig.mint;

  return (
    <div className="relative overflow-hidden rounded-xl border border-(--border-panel) bg-(--bg-panel) p-4 sm:p-5 transition-all duration-150 hover:border-(--border-panel-elevated) shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted)">{title}</p>
          <h3 className="mt-1 text-2xl lg:text-3xl font-bold tracking-tight text-(--text-primary)">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-(--text-secondary) truncate">{subtitle}</p>
          )}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${current.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(trend || displayBadge) && (
        <div className="flex items-center justify-between border-t border-(--border-subtle) pt-2.5 text-xs">
          {trend ? (
            <span className={`font-semibold ${trend.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          ) : (
            <span />
          )}

          {displayBadge && (
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${current.badgeBg}`}>
              {displayBadge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
