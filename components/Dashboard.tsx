import React, { useState, useEffect } from 'react';
import { Card, MetricCard, Button, toast } from './UIComponents';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../mockData';
import { Activity, Users, Send, DollarSign, ArrowRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const campaigns = db.getCampaigns();
  const contacts = db.getContacts();
  
  // Derived Data for Top Cards
  const totalContacts = contacts.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'running').length;
  const hotLeads = contacts.filter(c => c.score > 80).length;
  
  // Estimate revenue based on converted contacts (randomized slightly for visual)
  const convertedCount = contacts.filter(c => c.status === 'converted').length;
  const estRevenue = (convertedCount * 15000).toLocaleString();

  // Dynamic Funnel Data
  const getFunnelData = () => {
    let baseData = { sent: 0, opened: 0, clicked: 0, converted: 0 };
    
    if (selectedCampaignId === 'all') {
        campaigns.forEach(c => {
            baseData.sent += c.sent;
            baseData.opened += c.opened;
            baseData.clicked += c.clicked;
            baseData.converted += c.converted;
        });
    } else {
        const campaign = campaigns.find(c => c.id === selectedCampaignId);
        if (campaign) {
            baseData = { 
                sent: campaign.sent, 
                opened: campaign.opened, 
                clicked: campaign.clicked, 
                converted: campaign.converted 
            };
        }
    }

    // Engagement is just a calculated middle step for the funnel visual
    const engaged = Math.round(baseData.clicked * 0.6 + baseData.opened * 0.1);

    return [
        { name: 'Sent', value: baseData.sent },
        { name: 'Opened', value: baseData.opened },
        { name: 'Clicked', value: baseData.clicked },
        { name: 'Engaged', value: engaged },
        { name: 'Converted', value: baseData.converted },
    ];
  };

  const funnelData = getFunnelData();

  // Recent Activity Feed
  const recentActivity = contacts.flatMap(c => 
    c.history.map(h => ({ ...h, contactName: `${c.firstName} ${c.lastName}` }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  const handleExport = () => {
      toast.info("Preparing export...");
      setTimeout(() => toast.success("Dashboard_Report.pdf downloaded"), 1500);
  };

  // Stats for the bottom of the chart
  const sentTotal = funnelData[0].value;
  const openRate = sentTotal > 0 ? ((funnelData[1].value / sentTotal) * 100).toFixed(1) : '0.0';
  const ctr = sentTotal > 0 ? ((funnelData[2].value / sentTotal) * 100).toFixed(1) : '0.0';
  const convRate = sentTotal > 0 ? ((funnelData[4].value / sentTotal) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of your marketing performance and pipeline.</p>
        </div>
        <div className="flex space-x-3">
            <Button variant="outline" size="sm">Last 30 days</Button>
            <Button variant="outline" size="sm" onClick={handleExport}>Export</Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Contacts" value={totalContacts.toLocaleString()} change="12%" trend="up" />
        <MetricCard label="Active Campaigns" value={activeCampaigns} change="2" trend="up" />
        <MetricCard label="Hot Leads (>80)" value={hotLeads} change="8%" trend="up" />
        <MetricCard label="Est. Revenue" value={`$${estRevenue}`} change="5%" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Conversion Funnel</h3>
                    <p className="text-sm text-gray-500">Campaign performance breakdown</p>
                </div>
                <select 
                    className="text-sm border-gray-300 rounded shadow-sm focus:ring-brand-yellow focus:border-brand-yellow p-1.5 bg-gray-50"
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                >
                    <option value="all">All Campaigns</option>
                    {campaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
             </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={funnelData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1D4AFF" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1D4AFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#9CA3AF" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#1D4AFF" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-4 text-center border-t pt-4 border-gray-100">
                 <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Sent</div>
                    <div className="font-bold text-xl text-gray-900">{sentTotal.toLocaleString()}</div>
                 </div>
                 <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Open Rate</div>
                    <div className="font-bold text-xl text-gray-900">{openRate}%</div>
                 </div>
                 <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">CTR</div>
                    <div className="font-bold text-xl text-gray-900">{ctr}%</div>
                 </div>
                 <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Conv. Rate</div>
                    <div className="font-bold text-xl text-gray-900">{convRate}%</div>
                 </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">Top Templates</h3>
                 <div className="space-y-3">
                    {[
                        { name: 'Product Announcement v2', ctr: '8.2%', usage: 1200 },
                        { name: 'Simple Newsletter', ctr: '5.1%', usage: 850 },
                        { name: 'Case Study: Pharma', ctr: '4.9%', usage: 600 },
                    ].map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="h-6 w-6 bg-white border border-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500">#{i+1}</div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">{t.name}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-green-600">{t.ctr} CTR</div>
                            </div>
                        </div>
                    ))}
                 </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Deliverability Health</h3>
                <div className="flex items-center justify-center py-4">
                    <div className="relative h-32 w-32">
                        <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-green-500" strokeDasharray="94, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-gray-900">94</span>
                            <span className="text-xs text-gray-500 font-medium uppercase">Score</span>
                        </div>
                    </div>
                </div>
                <div className="text-center text-sm text-gray-600">
                    Your sender reputation is <strong>Excellent</strong>.
                </div>
              </Card>
          </div>
        </div>

        {/* Side Panel: Recent Activity */}
        <div className="space-y-6">
           <Card className="p-0 h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                <Activity className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flow-root">
                <ul className="-mb-8">
                    {recentActivity.map((event, eventIdx) => (
                    <li key={event.id}>
                        <div className="relative pb-8">
                        {eventIdx !== recentActivity.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                            <div>
                            <span className={`h-8 w-8 rounded flex items-center justify-center border shadow-sm
                                ${event.type === 'score_change' ? 'bg-green-50 border-green-200' : 
                                event.type === 'demo_booked' ? 'bg-purple-50 border-purple-200' : 
                                'bg-blue-50 border-blue-200'}`}>
                                {event.type === 'score_change' ? <DollarSign className="h-4 w-4 text-green-600" /> : 
                                event.type === 'demo_booked' ? <Users className="h-4 w-4 text-purple-600" /> : 
                                <Send className="h-4 w-4 text-blue-600" />}
                            </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5">
                            <div>
                                <p className="text-sm text-gray-500">
                                <span className="font-bold text-gray-900">{event.contactName}</span> {event.description}
                                </p>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            </div>
                        </div>
                        </div>
                    </li>
                    ))}
                </ul>
                </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                <Button variant="ghost" size="sm" className="w-full text-gray-600 justify-between group">
                    View All Activity <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};