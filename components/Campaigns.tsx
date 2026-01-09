import React, { useState, useEffect } from 'react';
import { db } from '../mockData';
import { Card, Button, Badge, toast } from './UIComponents';
import { Plus, BarChart2, Play, Pause, Edit3, Trash2, Eye } from 'lucide-react';
import { CampaignBuilder } from './CampaignBuilder';
import { CampaignDetail } from './CampaignDetail';
import { Campaign } from '../types';

export const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  
  // New State for Inspection View
  const [inspectCampaignId, setInspectCampaignId] = useState<string | null>(null);

  // Poll for updates to ensure sent/opened counts reflect God Mode instantly
  useEffect(() => {
    refreshCampaigns();
    const interval = setInterval(refreshCampaigns, 3000); 
    return () => clearInterval(interval);
  }, []);

  const refreshCampaigns = () => {
      setCampaigns(db.getCampaigns());
  };

  // Derived Metrics
  const totalSent = campaigns.reduce((acc, c) => acc + (c.sent || 0), 0);
  const totalOpened = campaigns.reduce((acc, c) => acc + (c.opened || 0), 0);
  const totalClicked = campaigns.reduce((acc, c) => acc + (c.clicked || 0), 0);
  const totalConverted = campaigns.reduce((acc, c) => acc + (c.converted || 0), 0);

  const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0';
  const avgCtr = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0.0';
  const avgConvRate = totalSent > 0 ? ((totalConverted / totalSent) * 100).toFixed(1) : '0.0';

  const handlePause = (id: string, name: string) => {
      const success = db.updateCampaignStatus(id, 'paused');
      if (success) {
          toast.info(`Campaign "${name}" paused`);
          refreshCampaigns();
      }
  };

  const handleResume = (id: string, name: string) => {
      const success = db.updateCampaignStatus(id, 'running');
      if (success) {
          toast.success(`Campaign "${name}" resumed`);
          refreshCampaigns();
      }
  };

  const handleDelete = (id: string, name: string) => {
      if (confirm(`Are you sure you want to delete campaign "${name}"?`)) {
          db.deleteCampaign(id);
          toast.success("Campaign deleted");
          refreshCampaigns();
      }
  };

  const handleEdit = (id: string) => {
    setEditingCampaignId(id);
    setIsBuilderOpen(true);
  };

  const handleInspect = (id: string) => {
      setInspectCampaignId(id);
  };

  const handleNew = () => {
    setEditingCampaignId(null);
    setIsBuilderOpen(true);
  };

  // --- RENDER INSPECTION VIEW IF SELECTED ---
  if (inspectCampaignId) {
      return <CampaignDetail campaignId={inspectCampaignId} onBack={() => setInspectCampaignId(null)} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your outreach sequences and funnels</p>
        </div>
        <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" /> New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Avg Open Rate</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{avgOpenRate}%</h3>
            </div>
            <div className="h-10 w-10 bg-green-50 border border-green-200 rounded flex items-center justify-center text-green-600">
                <BarChart2 className="h-5 w-5" />
            </div>
        </Card>
         <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Avg CTR</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{avgCtr}%</h3>
            </div>
            <div className="h-10 w-10 bg-blue-50 border border-blue-200 rounded flex items-center justify-center text-blue-600">
                <BarChart2 className="h-5 w-5" />
            </div>
        </Card>
         <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Conversions</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{avgConvRate}%</h3>
            </div>
            <div className="h-10 w-10 bg-purple-50 border border-purple-200 rounded flex items-center justify-center text-purple-600">
                <BarChart2 className="h-5 w-5" />
            </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Performance</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Updated</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign) => {
                        const percentSent = campaign.audienceSize > 0 
                            ? Math.round((campaign.sent / campaign.audienceSize) * 100) 
                            : 0;
                        const openRate = campaign.sent > 0 
                            ? Math.round((campaign.opened / campaign.sent) * 100) 
                            : 0;
                        
                        return (
                            <tr key={campaign.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900">{campaign.name}</div>
                                    <div className="text-xs text-gray-500 font-mono">ID: {campaign.id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge status={campaign.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap w-64">
                                    <div className="flex items-center">
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mr-2 border border-gray-300">
                                            <div className={`h-full ${campaign.status === 'paused' ? 'bg-orange-400' : 'bg-brand-yellow'}`} style={{ width: `${percentSent}%` }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">{percentSent}%</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">{campaign.sent} / {campaign.audienceSize} Sent</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-4">
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{openRate}%</div>
                                            <div className="text-[10px] text-gray-500 uppercase">Open Rate</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{campaign.clicked}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">Clicks</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {campaign.lastUpdated}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        {/* INSPECT BUTTON ADDED HERE */}
                                        <button 
                                            onClick={() => handleInspect(campaign.id)}
                                            className="text-gray-500 hover:text-brand-black p-1.5 hover:bg-gray-100 rounded border border-transparent hover:border-gray-300 transition-all"
                                            title="Inspect Flow"
                                        >
                                            <Eye className="h-4 w-4"/>
                                        </button>

                                        {campaign.status === 'running' && (
                                            <button onClick={() => handlePause(campaign.id, campaign.name)} className="text-gray-500 hover:text-orange-600 p-1.5 hover:bg-orange-50 rounded border border-transparent hover:border-orange-200 transition-all" title="Pause">
                                                <Pause className="h-4 w-4"/>
                                            </button>
                                        )}
                                        {campaign.status === 'paused' && (
                                            <button onClick={() => handleResume(campaign.id, campaign.name)} className="text-gray-500 hover:text-green-600 p-1.5 hover:bg-green-50 rounded border border-transparent hover:border-green-200 transition-all" title="Resume">
                                                <Play className="h-4 w-4"/>
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleEdit(campaign.id)} 
                                            className="text-gray-500 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-all" 
                                            title="Edit"
                                        >
                                            <Edit3 className="h-4 w-4"/>
                                        </button>
                                        <button onClick={() => handleDelete(campaign.id, campaign.name)} className="text-gray-500 hover:text-red-600 p-1.5 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-all" title="Delete">
                                            <Trash2 className="h-4 w-4"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </Card>

      {isBuilderOpen && (
        <CampaignBuilder 
            campaignId={editingCampaignId}
            onClose={() => { 
                setIsBuilderOpen(false); 
                refreshCampaigns(); 
            }} 
        />
      )}
    </div>
  );
};