import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: 'neutral' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  badge,
  badgeVariant = 'neutral',
}) => {
  const badgeClasses = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
  }[badgeVariant];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">{label}</span>
        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-forest-800">
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>

      <div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        <div className="flex items-center justify-between mt-1 min-h-[20px]">
          {subValue ? (
            <span className="text-xs text-slate-500 font-medium">{subValue}</span>
          ) : (
            <span></span>
          )}
          {badge && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeClasses}`}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
