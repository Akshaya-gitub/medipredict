import React from 'react';
import { RiskLevel } from '../types';
import { Sparkles, Info } from 'lucide-react';

interface Props {
  probability: number;
  riskLevel: RiskLevel | string;
  riskLabel: string;
  confidence: number;
}

export const PredictionGauge: React.FC<Props> = ({
  probability,
  riskLevel,
  riskLabel,
  confidence
}) => {
  // Normalize probability
  const clampedProb = Math.min(100, Math.max(0, probability));

  // Determine stroke color
  let strokeColor = '#10b981'; // very_low
  let glowClass = 'glow-emerald';
  let textColor = 'text-emerald-600 dark:text-emerald-400';

  if (probability > 80) {
    strokeColor = '#ef4444'; // very_high
    glowClass = 'glow-red';
    textColor = 'text-red-600 dark:text-red-400';
  } else if (probability > 60) {
    strokeColor = '#f97316'; // high
    glowClass = 'glow-orange';
    textColor = 'text-orange-600 dark:text-orange-400';
  } else if (probability > 40) {
    strokeColor = '#f59e0b'; // moderate
    glowClass = 'glow-amber';
    textColor = 'text-amber-600 dark:text-amber-400';
  } else if (probability > 20) {
    strokeColor = '#3b82f6'; // low
    glowClass = 'glow-blue';
    textColor = 'text-blue-600 dark:text-blue-400';
  }

  // SVG parameters
  const radius = 70;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProb / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md transition-all">
      <div className="relative flex items-center justify-center">
        {/* SVG Circle Gauge */}
        <svg width="180" height="180" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
            fill="transparent"
          />
          {/* Animated progress circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {probability}%
          </span>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            No-Show Risk
          </span>
        </div>
      </div>

      {/* Risk Classification */}
      <div className="mt-4 text-center">
        <div className={`text-base sm:text-lg font-bold tracking-wide uppercase ${textColor}`}>
          {riskLabel}
        </div>
      </div>

      {/* Confidence Score Pill */}
      <div className="mt-4 w-full bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles size={15} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Prediction Confidence
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              Data evidence strength
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-base font-extrabold text-purple-600 dark:text-purple-400">
            {confidence}%
          </span>
        </div>
      </div>
    </div>
  );
};
