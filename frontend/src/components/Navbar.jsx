import React from 'react';
import { Shield, ShieldAlert, BookOpen, History, Lock, LogIn, LogOut, User } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenPrivacy, 
  backendOnline, 
  currentUser, 
  onOpenAuth, 
  onLogout 
}) {
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
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
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
              className="flex items-center space-x-1 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors border border-transparent cursor-pointer"
              title="Privacy Policy & Security Guarantee"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline text-xs">Privacy</span>
            </button>

            {/* Authentication Status / Login Button */}
            {currentUser ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                    {currentUser.username[0].toUpperCase()}
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-200 leading-none">
                      {currentUser.username}
                    </span>
                    <span className="text-[10px] text-cyan-400/80 leading-none mt-0.5 max-w-[100px] truncate">
                      {currentUser.role || 'Member'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all shadow-sm shadow-cyan-500/10 cursor-pointer ml-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Live Backend Heartbeat */}
            <div className="ml-1 pl-2 border-l border-slate-800 flex items-center space-x-1.5" title={backendOnline ? "Backend API Online" : "Connecting to Backend..."}>
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 animate-ping'}`} />
              <span className="hidden 2xl:inline text-[11px] font-mono text-slate-400">
                {backendOnline ? 'ONLINE' : 'CONNECTING'}
              </span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
