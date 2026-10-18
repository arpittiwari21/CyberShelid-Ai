import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ScannerCard from './components/ScannerCard';
import ResultView from './components/ResultView';
import SafetyDashboard from './components/SafetyDashboard';
import HistoryView from './components/HistoryView';
import PrivacyModal from './components/PrivacyModal';
import Footer from './components/Footer';
import { scanContent, checkHealth } from './services/api';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  // Initial and periodic backend health check
  useEffect(() => {
    const ping = () => {
      checkHealth()
        .then(() => setBackendOnline(true))
        .catch(() => setBackendOnline(false));
    };
    ping();
    const interval = setInterval(ping, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleScan = async (inputType, content) => {
    setLoading(true);
    setError(null);
    try {
      const data = await scanContent(inputType, content);
      setScanResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while analyzing the submission. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setError(null);
  };

  const handleScanSampleFromDashboard = (sampleText) => {
    setActiveTab('scanner');
    setScanResult(null);
    handleScan('message', sampleText);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setError(null);
        }}
        onOpenPrivacy={() => setPrivacyOpen(true)}
        backendOnline={backendOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="px-2 py-1 rounded bg-red-900/40 hover:bg-red-800/40 text-red-300 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Scanner View */}
        {activeTab === 'scanner' && (
          <div className="space-y-8">
            {/* If result is present, display ResultView; else display ScannerCard */}
            {scanResult ? (
              <ResultView result={scanResult} onReset={handleReset} />
            ) : (
              <div className="space-y-6">
                {/* Hero Introduction Badge */}
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Rule-Based Phishing & Fraud Analysis Engine</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Spot Cyber Threats Before They Strike
                  </h1>
                  <p className="text-sm text-slate-400">
                    Analyze deceptive domain structures, urgent coercive phrases, and credential harvesting tactics with explainable AI safety recommendations.
                  </p>
                </div>

                {/* Input Card */}
                <ScannerCard onScan={handleScan} loading={loading} />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Safety Dashboard */}
        {activeTab === 'dashboard' && (
          <SafetyDashboard onScanSample={handleScanSampleFromDashboard} />
        )}

        {/* Tab 3: Scan History */}
        {activeTab === 'history' && (
          <HistoryView
            onViewDetails={(item) => {
              setScanResult({
                id: item.id,
                input_type: item.scan_type,
                content_preview: item.content_preview,
                risk_level: item.risk_level,
                risk_score: item.risk_score,
                summary: `Historical assessment for ${item.content_preview}`,
                indicators: item.indicators,
                recommendations: item.recommendations,
                created_at: item.created_at,
              });
              setActiveTab('scanner');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenPrivacy={() => setPrivacyOpen(true)}
      />

      {/* Privacy Policy Modal */}
      <PrivacyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />
    </div>
  );
}
