import React, { useState } from 'react';
import { InvestigationRecord } from '../types';
import { DEMO_INVESTIGATIONS } from '../demoData';
import { Shield, Search, Filter, AlertTriangle, ExternalLink, ChevronRight, FileText } from 'lucide-react';

interface CasesListProps {
  cases?: InvestigationRecord[];
  onSelectCase: (record: InvestigationRecord) => void;
}

export const CasesList: React.FC<CasesListProps> = ({
  cases = DEMO_INVESTIGATIONS,
  onSelectCase
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.fraud_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || c.risk_level.toLowerCase() === riskFilter.toLowerCase();
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-1">
            <Shield size={14} />
            <span>Investigation Registry</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Active & Archived Investigations</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Central repository of all submitted, synthetic demo, and active fraud investigation cases.
          </p>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="charcoal-bg p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, Title, Fraud Type..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-500 font-bold flex items-center"><Filter size={12} className="mr-1" /> Risk Filter:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-black/40 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="charcoal-bg rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/5 text-gray-400 uppercase font-bold tracking-wider font-mono border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Case ID</th>
                <th className="px-6 py-4">Title & Fraud Category</th>
                <th className="px-6 py-4">Risk Score</th>
                <th className="px-6 py-4">Evidence Items</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className="hover:bg-white/5 transition-all cursor-pointer"
                >
                  <td className="px-6 py-4 font-mono font-bold text-blue-400">
                    #{c.id}
                    {c.isDemoCase && <span className="block text-[9px] text-amber-400 font-normal">DEMO CASE</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-white text-sm">{c.title}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{c.fraud_type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono uppercase border ${
                      c.risk_level === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      c.risk_level === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {c.risk_score}/100 — {c.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-300">
                    {c.evidences.length} Attachments
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono">
                    {new Date(c.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs text-blue-400 font-bold hover:underline flex items-center justify-end">
                      Inspect Case <ChevronRight size={14} className="ml-1" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CasesList;
