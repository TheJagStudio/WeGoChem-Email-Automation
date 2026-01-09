import React, { useState, useEffect } from 'react';
import { db } from '../mockData';
import { Campaign, ActivityEvent } from '../types';
import { Card, Button, Badge } from './UIComponents';
import { ArrowLeft, Clock, Activity, Zap, Mail, Users, MousePointer, Filter } from 'lucide-react';
import { FlowRenderer, FunnelNode } from './CampaignBuilder';

interface CampaignDetailProps {
    campaignId: string;
    onBack: () => void;
}

export const CampaignDetail: React.FC<CampaignDetailProps> = ({ campaignId, onBack }) => {
    const [campaign, setCampaign] = useState<Campaign | undefined>(undefined);
    const [logs, setLogs] = useState<ActivityEvent[]>([]);
    const [nodes, setNodes] = useState<FunnelNode[]>([]);
    
    // Polling for live data
    useEffect(() => {
        const loadData = () => {
            const camp = db.getCampaign(campaignId);
            if (camp) {
                setCampaign(camp);
                if (camp.funnelConfig?.customNodes) {
                    setNodes(camp.funnelConfig.customNodes);
                }
            }

            // Fetch logs specific to this campaign from all contacts
            // In a real app, you'd have a more efficient query. Here we scan.
            const contacts = db.getContacts();
            const relevantLogs: ActivityEvent[] = [];
            
            contacts.forEach(c => {
                c.history.forEach(h => {
                    // Check if event relates to this campaign via metadata or description matching
                    if (h.metadata?.campaignId === campaignId || h.description.includes(camp?.name || '')) {
                        relevantLogs.push({ ...h, contactName: `${c.firstName} ${c.lastName}` });
                    }
                });
            });

            // Sort desc
            relevantLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setLogs(relevantLogs);
        };

        loadData();
        const interval = setInterval(loadData, 2000); // Live poll
        return () => clearInterval(interval);
    }, [campaignId]);

    if (!campaign) return <div>Loading...</div>;

    const stats = [
        { label: 'Sent', value: campaign.sent, icon: Mail },
        { label: 'Opened', value: campaign.opened, icon: Users, sub: `${((campaign.opened / (campaign.sent || 1)) * 100).toFixed(1)}%` },
        { label: 'Clicked', value: campaign.clicked, icon: MousePointer, sub: `${((campaign.clicked / (campaign.sent || 1)) * 100).toFixed(1)}%` },
        { label: 'Converted', value: campaign.converted, icon: Zap, sub: `${((campaign.converted / (campaign.sent || 1)) * 100).toFixed(1)}%` },
    ];

    return (
        <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 border-b pb-4">
                <Button variant="ghost" onClick={onBack} size="sm" className="h-8 w-8 p-0 rounded-full border border-gray-200">
                    <ArrowLeft size={16} />
                </Button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {campaign.name}
                        <Badge status={campaign.status} />
                    </h1>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <Clock size={12}/> Last updated: {campaign.lastUpdated}
                    </p>
                </div>
                <div className="flex-1"></div>
                {/* Stats Row */}
                <div className="flex gap-4">
                    {stats.map((s, i) => (
                        <div key={i} className="flex flex-col items-center px-4 border-r last:border-0">
                            <span className="text-xs text-gray-400 uppercase font-bold mb-1">{s.label}</span>
                            <span className="text-xl font-bold text-gray-900">{s.value}</span>
                            {s.sub && <span className="text-xs text-green-600 font-medium">{s.sub}</span>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left: Flow Visualization */}
                <Card className="flex-1 flex flex-col overflow-hidden bg-gray-50 relative">
                    <div className="p-3 border-b bg-white flex justify-between items-center z-10">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <Zap size={16} className="text-brand-yellow fill-brand-black"/> Live Flow Execution
                        </h3>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Monitoring
                        </span>
                    </div>
                    <div className="flex-1 overflow-auto p-8 relative">
                         {/* Dotted Grid Background */}
                         <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        
                        <div className="relative z-10 flex justify-center min-w-full">
                            <FlowRenderer 
                                nodes={nodes} 
                                readOnly={true} 
                                activeNodeId={campaign.status === 'running' ? 'email-1' : undefined} // Mock active state
                            />
                        </div>
                    </div>
                </Card>

                {/* Right: Live Event Log */}
                <Card className="w-96 flex flex-col overflow-hidden border-l border-gray-200 shadow-xl">
                    <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Activity size={16} className="text-gray-500"/>
                            Campaign Log
                        </h3>
                        <button className="text-gray-400 hover:text-gray-600"><Filter size={14}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-0 bg-white">
                        {logs.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No activity yet.<br/>Activate <strong>God Mode</strong> to generate traffic.
                            </div>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className="p-3 border-b border-gray-50 hover:bg-blue-50/30 transition-colors flex gap-3 items-start animate-in slide-in-from-top-2">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                                        log.type === 'reply_received' ? 'bg-purple-500' :
                                        log.type === 'link_clicked' ? 'bg-green-500' :
                                        log.type === 'email_opened' ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}></div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-0.5 font-mono">
                                            {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">{log.contactName}</div>
                                        <div className="text-xs text-gray-600">{log.description}</div>
                                        {log.type === 'score_change' && (
                                            <span className="inline-block mt-1 text-[10px] font-bold bg-green-100 text-green-800 px-1.5 rounded">
                                                Score Up
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};