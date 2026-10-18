import React from 'react';
import { Shield, ShieldAlert, BookOpen, History, Lock, Radio } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenPrivacy, backendOnline }) {
  const navItems = [
    { id: 'scanner', label: 'Threat Scanner', icon: ShieldAlert },
    { id: 'dashboard', label: 'Safety Dashboard', icon: BookOpen },
    { id: 'history', label: 'Scan History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('scanner')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  CyberShield AI
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wider uppercase font-semibold">
                Detect • Explain • Protect
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}

            {/* Privacy Modal trigger */}
            <button
              onClick={onOpenPrivacy}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors border border-transparent"
              title="Privacy Policy & Security Guarantee"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline text-xs">Privacy Guard</span>
            </button>

            {/* Live Backend Heartbeat */}
            <div className="ml-2 pl-2 border-l border-slate-800 flex items-center space-x-1.5" title={backendOnline ? "Backend API Online" : "Connecting to Backend..."}>
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 animate-ping'}`} />
              <span className="hidden xl:inline text-[11px] font-mono text-slate-400">
                {backendOnline ? 'ONLINE' : 'CONNECTING'}
              </span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
