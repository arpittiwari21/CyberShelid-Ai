import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, EyeOff, FileText, X } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Privacy & Ethics Commitment</h3>
              <p className="text-xs text-slate-400">CyberShield AI Security Standards & Zero Data Retention</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Principles (from Final_Project.pdf Slide 7) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold mb-1">
              <EyeOff className="w-4 h-4" />
              <span>Minimize Personal Data</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              We collect only the bare text or URL submitted for analysis. Previews are truncated and sensitive numbers masked.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>No Sensitive Credentials</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              CyberShield AI never requests passwords, PINs, OTPs, or credit card details. Never paste active personal secrets into any tool.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold mb-1">
              <FileText className="w-4 h-4" />
              <span>Clear Explanations</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every score is backed by transparent, deterministic rule triggers rather than opaque black-box verdicts.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Realistic Limitations</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cybercrime evolves continuously. CyberShield AI acts as an advisory assistant and makes no false claims of 100% detection.
            </p>
          </div>
        </div>

        {/* Academic Project Attribution */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
          <p><strong className="text-slate-300">Academic Project:</strong> Final MCA Master of Computer Applications</p>
          <p><strong className="text-slate-300">Presented by:</strong> Skill Drona</p>
          <p><strong className="text-slate-300">Institution:</strong> KIET deemed to be university</p>
          <p><strong className="text-slate-300">References:</strong> OWASP, CISA, Google Safe Browsing, scikit-learn & FastAPI standards</p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
