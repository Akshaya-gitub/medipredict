import React from 'react';
import { RiskLevel } from '../types';
import { ShieldCheck, AlertCircle, AlertTriangle, Flame, CheckCircle } from 'lucide-react';

interface Props {
  level: RiskLevel | string;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<Props> = ({ level, label, showIcon = true, size = 'md' }) => {
  const normalizedLevel = level?.toLowerCase().replace('-', '_');

  let bgClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
  let defaultLabel = 'Likely to Attend';
  let Icon = CheckCircle;

  if (normalizedLevel === 'very_low') {
    bgClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    defaultLabel = 'Likely to Attend';
    Icon = CheckCircle;
  } else if (normalizedLevel === 'low') {
    bgClass = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
    defaultLabel = 'Low Risk';
    Icon = ShieldCheck;
  } else if (normalizedLevel === 'moderate') {
    bgClass = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    defaultLabel = 'Moderate Risk';
    Icon = AlertCircle;
  } else if (normalizedLevel === 'high') {
    bgClass = 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800';
    defaultLabel = 'High Risk';
    Icon = AlertTriangle;
  } else if (normalizedLevel === 'very_high') {
    bgClass = 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 glow-red animate-pulse';
    defaultLabel = 'Very High Risk';
    Icon = Flame;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 font-semibold gap-1.5',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 font-bold gap-2'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 18
  };

  return (
    <span className={`inline-flex items-center rounded-full border shadow-sm transition-all duration-150 ${bgClass} ${sizeClasses[size]}`}>
      {showIcon && <Icon size={iconSizes[size]} className="shrink-0" />}
      <span>{label || defaultLabel}</span>
    </span>
  );
};
