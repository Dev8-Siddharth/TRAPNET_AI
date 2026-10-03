import React from 'react';
import { InvestigationRecord } from '../types';
import { DEMO_INVESTIGATIONS, DEMO_CAMPAIGNS } from '../demoData';
import { 
  Shield, TrendingUp, Users, Activity, ExternalLink, AlertTriangle, 
  Flame, Network, Plus, ArrowRight, ShieldCheck, DollarSign
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface DashboardProps {
  reports?: InvestigationRecord[];
  onNavigate: (tab: any) => void;
  onSelectCase: (record: InvestigationRecord) => void;
}

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

export const Dashboard: React.FC<DashboardProps> = ({
  reports = DEMO_INVESTIGATIONS,
  onNavigate,
  onSelectCase
}) => {
  const chartData = [
    { name: 'KYC Phishing', value: 41 },
    { name: 'Investment Scam', value: 28 },
    { name: 'Customs / Delivery', value: 19 },
    { name: 'Job Offer Scam', value: 16 },
    { name: 'Executive BEC', value: 12 },
    { name: 'Other / Social Eng.', value: 12 }
  ];

  const riskData = [
    { name: 'Low', value: 24 },
    { name: 'Moderate', value: 55 },
    { name: 'High', value: 37 },
    { name: 'Critical', value: 12 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-1">
            <Shield size={14} />
            <span>National Fraud Investigation Dashboard</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">TRAPNET AI Intelligence Center</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Real-time attack reconstruction, entity relationship mapping, and campaign correlation across national incident feeds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('investigate')}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-blue-900/30 transition-all"
          >
            <Plus size={16} />
            <span>New Investigation</span>
          </button>
        </div>
      </header>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Total Investigations" value="128" trend="+14% this week" icon={<Shield className="text-blue-400" size={18} />} />
        <KPICard label="High Risk Cases" value="37" trend="Action Required" icon={<AlertTriangle className="text-orange-400" size={18} />} />
        <KPICard label="Critical Threat" value="12" trend="Active Attacks" icon={<Flame className="text-red-400" size={18} />} />
        <KPICard label="Connected Entities" value="284" trend="Graph Mapping" icon={<Network className="text-purple-400" size={18} />} />
        <KPICard label="Potential Exposure" value="₹18.4L" trend="National Estimate" icon={<DollarSign className="text-emerald-400" size={18} />} />
      </div>

      {/* Synthetic Demo Data Notice */}
      <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 font-mono flex items-center justify-between">
        <span>DEMO MODE ACTIVE: KPI metrics and campaign aggregates generated using synthetic incident feeds.</span>
        <button onClick={() => onNavigate('settings')} className="underline hover:text-white font-bold">Configure Mode</button>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="charcoal-bg p-6 rounded-2xl border border-white/5 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4 flex items-center">
            <TrendingUp size={18} className="mr-2 text-blue-400" />
            Scam Category Distribution
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#121212', border: '1px solid #333', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Assessment Bar */}
        <div className="charcoal-bg p-6 rounded-2xl border border-white/5 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4 flex items-center">
            <AlertTriangle size={18} className="mr-2 text-orange-400" />
            Criticality Assessment Spectrum
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#121212', border: '1px solid #333', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Critical' ? '#ef4444' : entry.name === 'High' ? '#f97316' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Investigations Table */}
      <div className="charcoal-bg rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white">Recent Case Registry</h3>
            <p className="text-xs text-gray-400">Click any investigation to view full multimodal attack reconstruction.</p>
          </div>
          <button onClick={() => onNavigate('cases')} className="text-xs font-bold text-blue-400 hover:underline flex items-center">
            View All Cases <ArrowRight size={14} className="ml-1" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/5 text-gray-400 font-mono font-bold uppercase border-b border-white/5">
              <tr>
                <th className="px-6 py-3.5">Ref ID</th>
                <th className="px-6 py-3.5">Title / Fraud Type</th>
                <th className="px-6 py-3.5">Risk Level</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reports.slice(0, 5).map((rep) => (
                <tr
                  key={rep.id}
                  onClick={() => onSelectCase(rep)}
                  className="hover:bg-white/5 transition-all cursor-pointer"
                >
                  <td className="px-6 py-4 font-mono font-bold text-blue-400">#{rep.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white text-xs">{rep.title}</div>
                    <div className="text-[10px] font-mono text-gray-400">{rep.fraud_type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono uppercase border ${
                      rep.risk_level === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    }`}>
                      {rep.risk_score}/100 — {rep.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono">
                    {new Date(rep.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-blue-400 font-bold hover:underline">
                    Inspect &rarr;
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

const KPICard = ({ label, value, trend, icon }: { label: string; value: string; trend: string; icon: any }) => (
  <div className="charcoal-bg p-5 rounded-2xl border border-white/5 shadow-lg">
    <div className="flex items-center justify-between mb-3">
      <div className="p-2 bg-white/5 rounded-xl">{icon}</div>
      <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">{trend}</span>
    </div>
    <div className="text-2xl font-black text-white font-mono mb-0.5">{value}</div>
    <div className="text-[11px] text-gray-400 font-semibold">{label}</div>
  </div>
);

export default Dashboard;
