import React from 'react';

export type BadgeVariant = 
  | 'indigo' 
  | 'emerald' 
  | 'purple' 
  | 'amber' 
  | 'sky' 
  | 'rose' 
  | 'teal' 
  | 'fuchsia'
  | 'neutral'
  | 'black';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'neutral', 
  children, 
  className = '',
  icon
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    sky: 'bg-sky-50 text-sky-700 border-sky-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    teal: 'bg-teal-50 text-teal-700 border-teal-200/80',
    fuchsia: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/80',
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    black: 'bg-black text-white border-black',
  };

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-tight transition-colors ${variantStyles[variant]} ${className}`}>
      {icon}
      {children}
    </span>
  );
};
