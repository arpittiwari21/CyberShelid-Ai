import React, { useState } from 'react';
import { Globe, MessageSquare, AlertCircle, Sparkles, Send, ShieldAlert, Check } from 'lucide-react';

const DEMO_SAMPLES = [
  {
    label: "Slide 3 Bank Scam (OTP + Link)",
    type: "message",
    text: "Your account will be closed in 24 hours. Click here to verify now: http://bit.ly/verify and share your OTP."
  },
  {
    label: "Raw IP Phishing Page",
    type: "url",
    text: "http://192.168.1.100/paypal-login/verify.php"
  },
  {
    label: "Fake Courier Delivery SMS",
    type: "message",
    text: "USPS Notice: Your package #9400100 is held at transit due to incomplete street address. Pay $1.50 redelivery fee within 12h: http://usps-update-portal.xyz/track"
  },
  {
    label: "Suspicious High-Risk TLD",
    type: "url",
    text: "http://chase-security-check.xyz/account/login"
  },
  {
    label: "Legitimate Official Portal",
    type: "url",
    text: "https://www.google.com"
  }
];

export default function ScannerCard({ onScan, loading }) {
  const [inputType, setInputType] = useState('message');
  const [content, setContent] = useState(DEMO_SAMPLES[0].text);
  const [privacyWarning, setPrivacyWarning] = useState(null);

  const handleContentChange = (e) => {
    const val = e.target.value;
    setContent(val);

    // Client-side privacy warning check
    const hasCardNumber = /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/.test(val);
    const hasPasswordHint = /\b(password\s*[:=]\s*\S+|my\s+pin\s+is\s+\d+)\b/i.test(val);

    if (hasCardNumber || hasPasswordHint) {
      setPrivacyWarning("Privacy Alert: Do not paste real personal card numbers or actual passwords. CyberShield AI protects your privacy and never collects personal credentials.");
    } else {
      setPrivacyWarning(null);
    }
  };

  const loadSample = (sample) => {
    setInputType(sample.type);
    setContent(sample.text);
    setPrivacyWarning(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || loading) return;
    onScan(inputType, content.trim());
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Header Accent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-slate-800/80 gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>Intelligent Threat Scanner</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Submit a suspicious web address or text message to examine deceptive patterns, urgency, and fraud indicators.
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setInputType('message')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inputType === 'message'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Scam Message / SMS</span>
          </button>
          <button
            type="button"
            onClick={() => setInputType('url')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inputType === 'url'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Suspicious URL</span>
          </button>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {inputType === 'url' ? 'Target URL to inspect:' : 'Suspicious Message / Email / SMS Text:'}
          </label>

          {inputType === 'url' ? (
            <div className="relative">
              <input
                type="text"
                value={content}
                onChange={handleContentChange}
                placeholder="e.g. http://192.168.1.100/paypal-login or http://bit.ly/bank-verify"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono transition-all"
                required
              />
            </div>
          ) : (
            <div className="relative">
              <textarea
                rows={4}
                value={content}
                onChange={handleContentChange}
                placeholder="Paste the suspicious SMS, WhatsApp message, or email text here..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-y"
                required
              />
            </div>
          )}
        </div>

        {/* Privacy Warning Banner if detected */}
        {privacyWarning && (
          <div className="flex items-start space-x-2 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{privacyWarning}</span>
          </div>
        )}

        {/* Preloaded Demo Scenarios */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-400 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Test with Real-World Scenarios:</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadSample(sample)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions & Privacy Guarantee Note */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Privacy Ensured: Input is evaluated rule-by-rule without credential storage.</span>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Analyzing Indicators...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Analyze Threat</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
