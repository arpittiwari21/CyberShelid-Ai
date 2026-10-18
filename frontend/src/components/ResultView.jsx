import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, 
  ExternalLink, Copy, Check, ArrowLeft, Info, HelpCircle,
  Brain, Cpu, Zap
} from 'lucide-react';
import RiskGauge from './RiskGauge';

export default function ResultView({ result, onReset }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const {
    id,
    input_type,
    content_preview,
    risk_level,
    risk_score,
    summary,
    indicators = [],
    recommendations = [],
    ml_analysis,
    created_at
  } = result;

  const handleCopySummary = () => {
    const text = `CyberShield AI Analysis Report\nRisk Level: ${risk_level} (${risk_score}/100)\nTarget: ${content_preview}\nSummary: ${summary}\nTop Recommendation: ${recommendations[0]?.action || 'Stay alert'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <button
          onClick={onReset}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Scan Another URL or Message</span>
        </button>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            Scan #{id || 'TEMP'}
          </span>
          <span>{created_at ? new Date(created_at).toLocaleTimeString() : 'Just now'}</span>
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share Report'}</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Grid: RiskGauge + Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Risk Gauge */}
        <div className="md:col-span-1">
          <RiskGauge score={risk_score} riskLevel={risk_level} indicators={indicators} />
        </div>

        {/* Right Column: Executive Summary & Context */}
        <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
                Analyzed {input_type === 'url' ? 'Web Address' : 'Message Text'}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">Rule-Based Assessment Engine</span>
            </div>

            {/* Target Preview Box */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 mb-4 font-mono text-xs text-slate-300 break-all select-all">
              {content_preview}
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Executive Threat Assessment</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {summary}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Detection Confidence: <strong className="text-slate-200">Rule-Verified Heuristics</strong></span>
            <span>Target Persona: <strong className="text-cyan-400">All Internet Users</strong></span>
          </div>
        </div>
      </div>

      {/* AI/ML Detection Engine & Evaluation Metrics (Slides 5 & 6) */}
      {ml_analysis && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">
                Machine Learning Threat Classification
              </h3>
              <span className="text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded-full">
                Active NLP Pipeline
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Inference: <strong className="text-slate-200 font-mono">{ml_analysis.response_time_ms} ms</strong></span>
              </span>
              <span>•</span>
              <span>Confidence: <strong className="text-purple-300 font-mono">{Math.round(ml_analysis.confidence * 100)}%</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ML Probability Meter */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-mono">Statistical Probability</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-purple-300">
                    {ml_analysis.ml_score}%
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    ml_analysis.ml_risk === 'High' ? 'bg-red-950 text-red-400 border-red-500/40' :
                    ml_analysis.ml_risk === 'Medium' ? 'bg-amber-950 text-amber-400 border-amber-500/40' :
                    'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                  }`}>
                    {ml_analysis.ml_risk} Risk
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Trained on English and Hinglish phishing datasets using TF-IDF n-gram vectorization.
              </p>
            </div>

            {/* Extracted Linguistic Features */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-mono">Extracted Key Signals</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {ml_analysis.top_features?.length > 0 ? (
                    ml_analysis.top_features.map((feat, i) => (
                      <span key={i} className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {feat}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No suspicious lexical clusters</span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-slate-500 mt-2">Top TF-IDF coefficients driving prediction</span>
            </div>

            {/* Model Evaluation Metrics from Slide 5 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 uppercase font-mono">Evaluation Benchmark</span>
              <div className="grid grid-cols-3 gap-2 mt-1 text-center">
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Precision</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">97.4%</span>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Recall</span>
                  <span className="text-xs font-mono font-bold text-cyan-400">96.1%</span>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">F1-Score</span>
                  <span className="text-xs font-mono font-bold text-purple-400">96.7%</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 mt-2 text-center">Dual Verification: Rule Heuristics + ML Model</span>
            </div>
          </div>
        </div>
      )}

      {/* Warning Indicators Breakdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Warning Signs & Detected Indicators ({indicators.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Transparent Rule Triggers</span>
        </div>

        {indicators.length === 0 ? (
          <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-center flex flex-col items-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
            <h4 className="text-sm font-bold text-emerald-300">Clean Submission</h4>
            <p className="text-xs text-slate-400 max-w-md mt-1">
              No known phishing URLs, coercive urgency phrases, or sensitive credential requests were found in this content.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {indicators.map((ind, idx) => {
              let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
              if (ind.severity === 'high') badgeColor = 'bg-red-950/60 text-red-400 border-red-500/40';
              if (ind.severity === 'medium') badgeColor = 'bg-amber-950/60 text-amber-400 border-amber-500/40';
              if (ind.severity === 'low') badgeColor = 'bg-blue-950/60 text-blue-400 border-blue-500/40';

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase ${badgeColor}`}>
                        {ind.severity}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100">{ind.name}</h4>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400/90 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40 self-start sm:self-auto">
                      {ind.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-normal mb-2">
                    {ind.description}
                  </p>

                  {ind.evidence && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800/80 font-mono">
                      <strong className="text-slate-300 font-sans">Trigger Pattern: </strong>
                      <span className="text-amber-300">{ind.evidence}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Practical Safety Recommendations */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Recommended Safety Precautions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, idx) => {
            let priorityBadge = 'bg-slate-800 text-slate-300 border-slate-700';
            if (rec.priority === 'critical') priorityBadge = 'bg-red-950/60 text-red-400 border-red-500/40';
            if (rec.priority === 'warning') priorityBadge = 'bg-amber-950/60 text-amber-400 border-amber-500/40';
            if (rec.priority === 'advisory') priorityBadge = 'bg-blue-950/60 text-blue-400 border-blue-500/40';

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${priorityBadge}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{rec.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{rec.action}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
