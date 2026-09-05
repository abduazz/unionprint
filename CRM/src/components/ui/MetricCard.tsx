import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs hover:border-neutral-300 transition-all duration-150 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center shadow-xs">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-black text-neutral-900 tracking-tight mb-1">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>{subtitle}</span>
            {trend && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
