import React, { useEffect, useState } from 'react';
import { fetchThreatIntelligence } from '../services/geminiService';
import { Campaign } from '../types';
import { DEMO_CAMPAIGNS } from '../demoData';
import { Flame, TrendingUp, ShieldAlert, AlertTriangle, Activity, ExternalLink, RefreshCw } from 'lucide-react';

export const ThreatIntelligence: React.FC = () => {
  const [data, setData] = useState<{
    campaigns: Campaign[];
    earlyWarnings: { category: string; change: string; trend: 'up' | 'down'; riskLevel: string }[];
    totalInvestigations: number;
    criticalCases: number;
    highRiskCases: number;
    connectedEntitiesCount: number;
    potentialExposure: string;
  }>({
    campaigns: DEMO_CAMPAIGNS,
    earlyWarnings: [
      { category: 'KYC Phishing / Bank Impersonation', change: '+42%', trend: 'up', riskLevel: 'Critical' },
      { category: 'Investment & Task Scams', change: '+17%', trend: 'up', riskLevel: 'Critical' },
      { category: 'Customs / Delivery Scams', change: '+8%', trend: 'up', riskLevel: 'High' },
      { category: 'Job Offer Fraud', change: '-5%', trend: 'down', riskLevel: 'Moderate' },
    ],
    totalInvestigations: 128,
    criticalCases: 37,
    highRiskCases: 42,
    connectedEntitiesCount: 284,
    potentialExposure: '₹18.4 Lakhs',
  });

  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchThreatIntelligence();
      setData(res);
    } catch (e) {
      // fallback to synthetic demo data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-1">
            <Flame size={14} />
            <span>National Threat Intelligence Hub</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Campaign Detection & Early Warning</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Pattern matching algorithm aggregates isolated incident submissions sharing domains, VPA handles, or language signatures into active campaigns.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 rounded-xl flex items-center space-x-2 self-start shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Threat Feed</span>
        </button>
      </header>

      {/* Early Warning Radar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.earlyWarnings.map((warn, i) => (
          <div key={i} className="charcoal-bg p-5 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">7-Day Trend Shift</span>
              <span className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded ${
                warn.trend === 'up' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                {warn.change}
              </span>
            </div>
            <div className="text-sm font-extrabold text-white mb-1 truncate">{warn.category}</div>
            <div className="text-[10px] text-gray-400 font-mono">Risk Level: {warn.riskLevel}</div>
          </div>
        ))}
      </div>

      {/* Active Campaign Rings */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center">
          <AlertTriangle size={18} className="mr-2 text-amber-400" />
          Detected Active Fraud Campaigns ({data.campaigns.length})
        </h3>

        <div className="grid lg:grid-cols-3 gap-6">
          {data.campaigns.map((camp) => (
            <div key={camp.id} className="charcoal-bg p-6 rounded-2xl border border-white/10 hover:border-amber-500/40 transition-all shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 mb-2 inline-block">
                    {camp.riskLevel} RISK CAMPAIGN
                  </span>
                  <h4 className="text-base font-extrabold text-white">{camp.name}</h4>
                  <p className="text-xs font-mono text-blue-400 mt-0.5">{camp.fraudType}</p>
                </div>
                <span className="text-[10px] font-mono bg-white/5 text-gray-300 px-2.5 py-1 rounded-full border border-white/10 shrink-0">
                  {camp.status}
                </span>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                {camp.description}
              </p>

              <div className="grid grid-cols-4 gap-2 text-center bg-black/40 p-2.5 rounded-xl border border-white/5 text-mono font-bold text-xs">
                <div>
                  <div className="text-[9px] text-gray-500 uppercase">Incidents</div>
                  <div className="text-blue-400 font-black">{camp.relatedIncidentsCount}</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 uppercase">Domains</div>
                  <div className="text-purple-400 font-black">{camp.domainsCount}</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 uppercase">Phones</div>
                  <div className="text-amber-400 font-black">{camp.phonesCount}</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 uppercase">VPAs</div>
                  <div className="text-red-400 font-black">{camp.upiCount}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Key High-Risk Indicators</div>
                <div className="flex flex-wrap gap-1.5">
                  {camp.entities.map((ent, idx) => (
                    <span key={idx} className="text-[10px] font-mono bg-white/5 text-gray-300 px-2 py-0.5 rounded border border-white/10">
                      {ent}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreatIntelligence;
