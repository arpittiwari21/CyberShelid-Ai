import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, ShoppingBag, CreditCard, Briefcase, Globe, 
  ShieldCheck, AlertTriangle, CheckCircle, Info, ChevronRight, HelpCircle 
} from 'lucide-react';
import { getGuidance } from '../services/api';

const PERSONA_ICONS = {
  students: GraduationCap,
  shoppers: ShoppingBag,
  payments: CreditCard,
  businesses: Briefcase,
  general: Globe,
};

export default function SafetyDashboard({ onScanSample }) {
  const [guidanceData, setGuidanceData] = useState(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState('students');
  const [checklist, setChecklist] = useState({
    urgency: false,
    otp: false,
    unknownLink: false,
    threatOrPrize: false,
    unverifiedSender: false,
  });

  useEffect(() => {
    getGuidance()
      .then((data) => setGuidanceData(data))
      .catch((err) => console.error('Failed to load guidance:', err));
  }, []);

  const activePersona = guidanceData?.personas?.find(p => p.id === selectedPersonaId) || guidanceData?.personas?.[0];

  const handleToggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const threatCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Cybersecurity Guidance & Best Practices</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Safety Guidance for Targeted Audiences
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Tailored threat prevention playbooks for Students, Online Shoppers, Digital Payment Users, and Small Businesses. Learn the warning signs before falling victim.
          </p>
        </div>
      </div>

      {/* Persona Selector Tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Select Your User Persona:
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {guidanceData?.personas?.map((p) => {
            const Icon = PERSONA_ICONS[p.id] || Globe;
            const isSelected = p.id === selectedPersonaId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersonaId(p.id)}
                className={`p-3.5 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold leading-tight">{p.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Persona Deep Dive Card */}
      {activePersona && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>{activePersona.title}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">{activePersona.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Common Threats */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-rose-400 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Prevalent Threat Vectors</span>
              </h4>
              <ul className="space-y-2">
                {activePersona.common_threats.map((threat, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-rose-400 font-bold shrink-0">•</span>
                    <span>{threat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Defense Rules */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>Proactive Defense Protocols</span>
              </h4>
              <ul className="space-y-2">
                {activePersona.key_rules.map((rule, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Real-World Scam Simulation Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold">
                  Simulated Real-World Attack Scenario
                </span>
                <p className="text-xs text-slate-300 mt-1 italic font-serif">
                  "{activePersona.example_scam}"
                </p>
              </div>
              <button
                type="button"
                onClick={() => onScanSample(activePersona.example_scam)}
                className="shrink-0 px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer self-start sm:self-auto"
              >
                <span>Test in Scanner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick 5-Step Self Check Calculator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Interactive 5-Point Threat Self-Check</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Check any warning signs present in the message or link you received:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { key: 'urgency', label: 'Urgent deadline (e.g. "within 24 hours", "account closing")' },
            { key: 'otp', label: 'Requests OTP, PIN, CVV, or banking details' },
            { key: 'unknownLink', label: 'Contains a shortened or unfamiliar link (bit.ly, .xyz)' },
            { key: 'threatOrPrize', label: 'Promises free money/prize or threatens arrest/legal action' },
            { key: 'unverifiedSender', label: 'Sent from unusual phone number or free email (@gmail)' },
          ].map((item) => (
            <label
              key={item.key}
              onClick={() => handleToggleChecklist(item.key)}
              className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center space-x-2 transition-all select-none ${
                checklist[item.key]
                  ? 'bg-red-950/40 border-red-500/40 text-red-300 font-semibold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <input
                type="checkbox"
                checked={checklist[item.key]}
                onChange={() => {}}
                className="w-4 h-4 rounded text-red-500 focus:ring-0 cursor-pointer"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>

        {/* Self-check outcome */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-300">
            Detected Warning Signs: <strong className="font-mono text-cyan-400">{threatCount} of 5</strong>
          </span>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase ${
            threatCount >= 2
              ? 'bg-red-950 text-red-400 border-red-500/40'
              : threatCount === 1
              ? 'bg-amber-950 text-amber-400 border-amber-500/40'
              : 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
          }`}>
            {threatCount >= 2 ? 'Probable Scam (High Risk)' : threatCount === 1 ? 'Potential Risk' : 'Safe Indicators'}
          </span>
        </div>
      </div>

      {/* Threat Knowledge / Indicators Encyclopedia */}
      {guidanceData?.indicators_knowledge && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
            <Info className="w-5 h-5 text-cyan-400" />
            <span>Cyber Threat Anatomy & Glossary</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guidanceData.indicators_knowledge.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                  {item.category}
                </span>
                <h4 className="text-sm font-bold text-white mb-1.5">{item.concept}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
