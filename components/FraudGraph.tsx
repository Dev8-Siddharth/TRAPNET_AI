import React, { useState } from 'react';
import { ConnectedEntityNode } from '../types';
import { Network, ShieldAlert, AlertTriangle, Layers, Info, Filter, Search, ChevronRight } from 'lucide-react';

interface FraudGraphProps {
  nodes?: ConnectedEntityNode[];
}

const DEFAULT_GRAPH_NODES: ConnectedEntityNode[] = [
  {
    id: 'NODE-01',
    label: '+91 98765 43210',
    type: 'phone',
    riskScore: 94,
    incidentCount: 14,
    connectedNodes: ['NODE-02', 'NODE-03', 'NODE-06'],
    confidence: 0.91,
    note: 'Observed in 14 submitted incidents across Maharashtra & Gujarat (Bulk SMS Sender)'
  },
  {
    id: 'NODE-02',
    label: 'sbi-kyc-update-portal-882.xyz',
    type: 'domain',
    riskScore: 98,
    incidentCount: 27,
    connectedNodes: ['NODE-01', 'NODE-04'],
    confidence: 0.96,
    note: 'Registered via NameCheap with WHOIS privacy shield (Cloned YONO portal)'
  },
  {
    id: 'NODE-03',
    label: 'paytm-merchant88@paytm',
    type: 'payment_id',
    riskScore: 89,
    incidentCount: 8,
    connectedNodes: ['NODE-01', 'NODE-05'],
    confidence: 0.88,
    note: 'Flagged as compromised merchant mule account for immediate OTP debit'
  },
  {
    id: 'NODE-04',
    label: 'SBI-PanKYC-Campaign-09',
    type: 'campaign',
    riskScore: 95,
    incidentCount: 41,
    connectedNodes: ['NODE-02', 'NODE-01'],
    confidence: 0.94,
    note: 'Active multi-state phishing campaign targeting YONO users'
  },
  {
    id: 'NODE-05',
    label: 'fastpay.crypto@icici',
    type: 'payment_id',
    riskScore: 92,
    incidentCount: 19,
    connectedNodes: ['NODE-03', 'NODE-07'],
    confidence: 0.92,
    note: 'Mule UPI ID linked to investment & task scam reports'
  },
  {
    id: 'NODE-06',
    label: 'apex-wealth-trade-app.online',
    type: 'domain',
    riskScore: 96,
    incidentCount: 11,
    connectedNodes: ['NODE-01', 'NODE-05'],
    confidence: 0.95,
    note: 'Hosted on bulletproof server infrastructure'
  },
  {
    id: 'NODE-07',
    label: 'ceo-office-direct@exec-desk-mail.com',
    type: 'email',
    riskScore: 85,
    incidentCount: 6,
    connectedNodes: ['NODE-05'],
    confidence: 0.86,
    note: 'Spoofed corporate BEC domain'
  }
];

export const FraudGraph: React.FC<FraudGraphProps> = ({ nodes = DEFAULT_GRAPH_NODES }) => {
  const [selectedNode, setSelectedNode] = useState<ConnectedEntityNode>(nodes[0] || DEFAULT_GRAPH_NODES[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredNodes = nodes.filter((n) => {
    const matchesSearch = n.label.toLowerCase().includes(searchTerm.toLowerCase()) || n.note.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || n.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'phone': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'domain': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'payment_id': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'campaign': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'email': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-widest mb-1">
            <Network size={14} />
            <span>Fraud Intelligence Graph</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Entity Relationship Matrix</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Visualizing relationships between phone numbers, domains, UPI handles, emails, and scam campaigns across all submitted incident logs.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20 text-xs font-mono text-purple-300 shrink-0">
          <Layers size={14} />
          <span>Graph Density: {nodes.length} Nodes / 18 Edges</span>
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
            placeholder="Search phone, domain, VPA or campaign..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-500 font-bold flex items-center"><Filter size={12} className="mr-1" /> Filter:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-black/40 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All Entity Types</option>
            <option value="phone">Phone Numbers</option>
            <option value="domain">Domains / URLs</option>
            <option value="payment_id">Payment VPAs</option>
            <option value="campaign">Scam Campaigns</option>
            <option value="email">Emails</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas Representation & Node Inspector */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Node Network Map Column */}
        <div className="lg:col-span-2 charcoal-bg p-6 rounded-2xl border border-white/5 shadow-2xl relative min-h-[420px] flex flex-col justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center justify-between">
            <span>Visual Graph Topology</span>
            <span className="text-[10px] text-gray-500 font-mono">Click any node to inspect relationship data</span>
          </div>

          {/* Interactive Graph Node Clusters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto">
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-900/30 scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:border-blue-500/30 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${getTypeBadgeColor(node.type)}`}>
                      {node.type}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      {node.incidentCount} Incidents
                    </span>
                  </div>

                  <div className="text-sm font-extrabold text-white font-mono truncate mb-1">{node.label}</div>
                  <div className="text-[10px] text-gray-400 line-clamp-2 leading-tight">{node.note}</div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-gray-500 font-mono flex items-center justify-between">
            <span>Safety Protocol: Associations derived from submitted user reports.</span>
            <span>Confidence Threshold: &gt; 80%</span>
          </div>
        </div>

        {/* Selected Node Inspector */}
        <div className="charcoal-bg p-6 rounded-2xl border border-white/5 shadow-2xl space-y-6">
          {selectedNode ? (
            <>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold block mb-1">
                  Entity Inspector
                </span>
                <h3 className="text-xl font-extrabold text-white font-mono break-all">{selectedNode.label}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-black/40 p-3.5 rounded-xl border border-white/10 text-center font-mono">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">Risk Score</div>
                  <div className="text-lg font-black text-red-400">{selectedNode.riskScore}/100</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">Confidence</div>
                  <div className="text-lg font-black text-blue-400">{(selectedNode.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px] mb-1">Observation Note</span>
                  <p className="text-gray-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                    {selectedNode.note}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px] mb-1">Connected Entities ({selectedNode.connectedNodes.length})</span>
                  <div className="space-y-2">
                    {selectedNode.connectedNodes.map((connId) => {
                      const connNode = nodes.find(n => n.id === connId);
                      return (
                        <div key={connId} className="bg-white/5 p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
                          <span className="font-mono text-gray-200">{connNode?.label || connId}</span>
                          <span className="text-[10px] text-blue-400 font-mono">Connection confidence: 88%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded-xl text-[10px] text-blue-300 leading-relaxed">
                <Info size={12} className="inline mr-1 text-blue-400" />
                Language Standard: "Observed in {selectedNode.incidentCount} submitted incidents" / "Potential connection to active campaign".
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500 text-xs">Select a node from the topology map to inspect relationships.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FraudGraph;
