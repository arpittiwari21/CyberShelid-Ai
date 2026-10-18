import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer({ setActiveTab, onOpenPrivacy }) {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">CyberShield AI</span>
              <p className="text-xs text-slate-400">Detect • Explain • Protect — Smarter Detection. Safer Tomorrow.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <button onClick={() => setActiveTab('scanner')} className="hover:text-cyan-400 cursor-pointer">
              Threat Scanner
            </button>
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-cyan-400 cursor-pointer">
              Safety Dashboard
            </button>
            <button onClick={() => setActiveTab('history')} className="hover:text-cyan-400 cursor-pointer">
              Scan History
            </button>
            <button onClick={onOpenPrivacy} className="hover:text-cyan-400 cursor-pointer">
              Privacy & Ethics
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>Presented by: Skill Drona | MCA | KIET deemed to be university</p>
          <p>Grounding Sources: OWASP Top 10 • CISA Guidelines • Google Safe Browsing Heuristics</p>
        </div>
      </div>
    </footer>
  );
}
