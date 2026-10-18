import React, { useState, useEffect } from 'react';
import { 
  History, Trash2, Search, Filter, AlertTriangle, 
  ShieldCheck, AlertOctagon, Eye, X, RefreshCw 
} from 'lucide-react';
import { getScanHistory, deleteScanRecord, clearAllHistory, getSystemStats } from '../services/api';

export default function HistoryView({ onViewDetails }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const [histData, statsData] = await Promise.all([
        getScanHistory({
          risk_level: riskFilter || undefined,
          scan_type: typeFilter || undefined,
          search: search || undefined,
        }),
        getSystemStats().catch(() => null),
      ]);
      setHistory(histData || []);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [riskFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete scan record #${id}?`)) return;
    try {
      await deleteScanRecord(id);
      setHistory(prev => prev.filter(r => r.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
      getSystemStats().then(setStats).catch(() => {});
    } catch (err) {
      alert('Failed to delete scan record');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL scan history records from the database? This cannot be undone.')) return;
    try {
      await clearAllHistory();
      setHistory([]);
      setSelectedRecord(null);
      getSystemStats().then(setStats).catch(() => {});
    } catch (err) {
      alert('Failed to clear history');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Total Scans</span>
            <p className="text-2xl font-bold font-mono text-white mt-1">{stats.total_scans}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/90 border border-red-500/30">
            <span className="text-xs text-red-400 font-medium flex items-center space-x-1">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>High Risk</span>
            </span>
            <p className="text-2xl font-bold font-mono text-red-400 mt-1">{stats.high_risk_count}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30">
            <span className="text-xs text-amber-400 font-medium flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Medium Risk</span>
            </span>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{stats.medium_risk_count}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30">
            <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Low Risk</span>
            </span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{stats.low_risk_count}</p>
          </div>
        </div>
      )}

      {/* Control Bar: Search + Filters + Clear All */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scan history..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </form>

        {/* Filter Dropdowns */}
        <div className="flex items-center flex-wrap gap-2">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="">All Risk Levels</option>
            <option value="High">High Risk Only</option>
            <option value="Medium">Medium Risk Only</option>
            <option value="Low">Low Risk Only</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="">All Types</option>
            <option value="url">URLs Only</option>
            <option value="message">Messages Only</option>
          </select>

          <button
            type="button"
            onClick={fetchRecords}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Refresh History"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/60 text-rose-400 border border-rose-800/50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* History Records Table / List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading scan history...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <History className="w-10 h-10 text-slate-600 mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">No Scan Records Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Scans analyzed through CyberShield AI are stored here locally in SQLite. Run a scan from the Threat Scanner tab.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {history.map((item) => {
              let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
              if (item.risk_level === 'High') badgeColor = 'bg-red-950 text-red-400 border-red-500/40';
              if (item.risk_level === 'Medium') badgeColor = 'bg-amber-950 text-amber-400 border-amber-500/40';
              if (item.risk_level === 'Low') badgeColor = 'bg-emerald-950 text-emerald-400 border-emerald-500/40';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedRecord(item)}
                  className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase shrink-0 mt-0.5 ${badgeColor}`}>
                      {item.risk_level} ({item.risk_score})
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="font-mono text-cyan-400 uppercase text-[10px]">
                          [{item.scan_type}]
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 text-[11px]">
                          {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 truncate mt-1 font-mono">
                        {item.content_preview}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {item.indicators?.length || 0} indicators detected
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(item)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-cyan-400">Scan #{selectedRecord.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                  selectedRecord.risk_level === 'High' ? 'bg-red-950 text-red-400 border-red-500/40' :
                  selectedRecord.risk_level === 'Medium' ? 'bg-amber-950 text-amber-400 border-amber-500/40' :
                  'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                }`}>
                  {selectedRecord.risk_level} Risk ({selectedRecord.risk_score}/100)
                </span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 break-all">
              {selectedRecord.content_preview}
            </div>

            {/* Indicators */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">
                Discovered Indicators ({selectedRecord.indicators?.length || 0}):
              </h4>
              <div className="space-y-2">
                {selectedRecord.indicators?.map((ind, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>{ind.name}</span>
                      <span className="text-[10px] uppercase font-mono text-cyan-400">{ind.severity}</span>
                    </div>
                    <p className="text-slate-400 mt-1">{ind.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety actions */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">
                Recommended Actions:
              </h4>
              <div className="space-y-1.5">
                {selectedRecord.recommendations?.map((rec, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300">
                    <strong className="text-emerald-400 font-semibold">{rec.title}: </strong>
                    <span>{rec.action}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
