import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function RiskGauge({ score = 0, riskLevel = 'Low', indicators = [] }) {
  // Color tokens based on Risk Level
  let strokeColor = '#10b981'; // emerald-500
  let textColor = 'text-emerald-400';
  let bgColor = 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300';
  let glowClass = '';
  let Icon = ShieldCheck;

  if (riskLevel === 'High') {
    strokeColor = '#ef4444'; // red-500
    textColor = 'text-red-400';
    bgColor = 'bg-red-950/40 border-red-500/30 text-red-300';
    glowClass = 'glow-high';
    Icon = AlertOctagon;
  } else if (riskLevel === 'Medium') {
    strokeColor = '#f59e0b'; // amber-500
    textColor = 'text-amber-400';
    bgColor = 'bg-amber-950/40 border-amber-500/30 text-amber-300';
    Icon = AlertTriangle;
  }

  // Calculate SVG arc stroke dash
  // Radius = 45, Circumference = 2 * PI * 45 = ~282.74
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const highCount = indicators.filter(i => i.severity === 'high').length;
  const medCount = indicators.filter(i => i.severity === 'medium').length;
  const lowCount = indicators.filter(i => i.severity === 'low').length;

  return (
    <div className={`p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden ${glowClass}`}>
      {/* Background ambient radial gradient */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${strokeColor} 0%, transparent 70%)`
        }}
      />

      {/* SVG Radial Meter */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background track circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="9"
            fill="transparent"
          />
          {/* Active progress arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={strokeColor}
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {clampedScore}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            Threat Score
          </span>
        </div>
      </div>

      {/* Risk Category Tag */}
      <div className="mt-4 flex flex-col items-center">
        <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${bgColor}`}>
          <Icon className="w-4 h-4" />
          <span>{riskLevel} Risk</span>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center max-w-[220px]">
          {riskLevel === 'High' && 'Severe threats detected. Do not click or share credentials.'}
          {riskLevel === 'Medium' && 'Unverified indicators present. Proceed with caution.'}
          {riskLevel === 'Low' && 'Clean structure. No major threat signatures identified.'}
        </p>
      </div>

      {/* Severity Breakdown Pills */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 w-full grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
          <span className="text-xs text-red-400 font-bold font-mono">{highCount}</span>
          <p className="text-[10px] text-slate-400 uppercase">Critical</p>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
          <span className="text-xs text-amber-400 font-bold font-mono">{medCount}</span>
          <p className="text-[10px] text-slate-400 uppercase">Warning</p>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
          <span className="text-xs text-emerald-400 font-bold font-mono">{lowCount}</span>
          <p className="text-[10px] text-slate-400 uppercase">Info</p>
        </div>
      </div>
    </div>
  );
}
