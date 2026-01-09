import React, { useState, useMemo } from 'react';
import { Card, MetricCard, Button, Badge } from './UIComponents';
import { 
    AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart 
} from 'recharts';
import { db } from '../mockData';
import { ArrowUpRight, CheckCircle, AlertTriangle, Shield, Mail, DollarSign, Target, MousePointer, Activity, Calendar } from 'lucide-react';

const CAMPAIGN_ROI_DATA = [
    { name: 'Q1 Launch', cost: 1200, revenue: 45000, roi: 3650 },
    { name: 'Cold Outreach', cost: 500, revenue: 12000, roi: 2300 },
    { name: 'Webinar Invites', cost: 2000, revenue: 28000, roi: 1300 },
    { name: 'Nurture seq.', cost: 100, revenue: 8500, roi: 8400 },
];

const LEAD_SOURCE_DATA = [
    { name: 'Outbound Email', value: 45 },
    { name: 'Webinar', value: 25 },
    { name: 'Organic Search', value: 20 },
    { name: 'Referral', value: 10 },
];

const COLORS = ['#FFE01B', '#2D2D2D', '#9CA3AF', '#E5E7EB'];

export const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'deliverability' | 'roi'>('overview');
  const [timeRange, setTimeRange] = useState('30d');
  
  // Stabilize data generation
  const timeSeriesData = useMemo(() => {
      const days = timeRange === '7d' ? 7 : 30;
      return Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 5000) + 2000 + (i * 100),
        leads: Math.floor(Math.random() * 50) + 10 + (i * 2),
        openRate: 45 + Math.random() * 20,
        deliverability: 98 + Math.random() * 1.5,
    }));
  }, [timeRange]);

  const deliverabilityTrend = useMemo(() => {
      return Array.from({ length: 14 }, (_, i) => ({
        day: `Day ${i + 1}`,
        reputation: 92 + Math.floor(Math.random() * 7),
        inboxPlacement: 95 + Math.random() * 4,
    }));
  }, []); // Static for demo session

  const domains = db.getDomains();
  const deliverability = db.getDeliverability();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded text-sm">
          <p className="font-bold text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-gray-500 capitalize">{entry.name}:</span>
                <span className="font-medium text-gray-900">
                    {entry.name === 'revenue' || entry.name === 'cost' ? '$' : ''}
                    {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                    {entry.name.includes('Rate') || entry.name === 'deliverability' || entry.name === 'reputation' ? '%' : ''}
                </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard label="Total Revenue (30d)" value="$142,500" change="18.2%" trend="up" />
            <MetricCard label="Avg. Open Rate" value="52.4%" change="4.1%" trend="up" />
            <MetricCard label="Lead Conversion" value="3.8%" change="0.5%" trend="up" />
            <MetricCard label="Active Deals" value="47" change="12" trend="up" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Revenue Chart */}
            <Card className="lg:col-span-2 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Revenue & Lead Trend</h3>
                        <p className="text-sm text-gray-500">Correlation between new leads and revenue generation</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></div> Revenue</span>
                        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-gray-800 mr-1"></div> Leads</span>
                    </div>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={timeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" stroke="#9CA3AF" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" stroke="#9CA3AF" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                            <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar yAxisId="right" dataKey="leads" fill="#2D2D2D" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.8} />
                            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#FFE01B" strokeWidth={3} dot={{r: 4, fill: '#FFE01B', strokeWidth: 2, stroke: '#fff'}} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Lead Sources */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Lead Sources</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={LEAD_SOURCE_DATA}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {LEAD_SOURCE_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-3">
                    <div className="p-3 bg-gray-50 rounded border border-gray-100 flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium">Top Performer</span>
                        <span className="text-sm font-bold text-gray-900">Outbound Email (45%)</span>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );

  const renderDeliverability = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="p-6 border-l-4 border-l-green-500">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sender Score</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">94<span className="text-lg text-gray-400 font-normal">/100</span></h3>
                    </div>
                    <Shield className="h-8 w-8 text-green-500 opacity-20" />
                </div>
                <div className="mt-4 text-sm text-green-700 bg-green-50 p-2 rounded inline-block font-medium">
                    Excellent Reputation
                </div>
             </Card>
             <Card className="p-6 border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Inbox Placement</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">98.5%</h3>
                    </div>
                    <Mail className="h-8 w-8 text-blue-500 opacity-20" />
                </div>
                <div className="mt-4 text-sm text-gray-500">
                    <span className="font-bold text-gray-900">0.3%</span> Spam Folder Rate
                </div>
             </Card>
             <Card className="p-6 border-l-4 border-l-yellow-500">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Blacklist Status</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">Clean</h3>
                    </div>
                    <CheckCircle className="h-8 w-8 text-yellow-500 opacity-20" />
                </div>
                <div className="mt-4 text-sm text-gray-500">
                    Checked 200+ lists (Spamhaus, Barracuda...)
                </div>
             </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
                 <h3 className="text-lg font-bold text-gray-900 mb-6">Reputation Trend (Last 14 Days)</h3>
                 <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={deliverabilityTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="day" stroke="#9CA3AF" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                            <YAxis domain={[80, 100]} stroke="#9CA3AF" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="reputation" stroke="#22c55e" strokeWidth={3} name="Reputation Score" dot={{r: 4, strokeWidth: 2, stroke: '#fff'}} />
                            <Line type="monotone" dataKey="inboxPlacement" stroke="#3b82f6" strokeWidth={3} name="Inbox Placement %" dot={{r: 4, strokeWidth: 2, stroke: '#fff'}} />
                        </LineChart>
                    </ResponsiveContainer>
                 </div>
            </Card>

            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Domain Health</h3>
                <div className="space-y-4">
                    {domains.map(d => (
                        <div key={d.id} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-900 text-sm">{d.domain}</span>
                                <Badge status={d.status === 'active' ? 'running' : 'engaged'} />
                            </div>
                            <div className="space-y-2 mt-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">SPF Record</span>
                                    {d.spfVerified ? <span className="text-green-600 flex items-center font-bold text-xs"><CheckCircle className="h-3 w-3 mr-1"/> Valid</span> : <span className="text-red-500">Invalid</span>}
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">DKIM Signature</span>
                                    {d.dkimVerified ? <span className="text-green-600 flex items-center font-bold text-xs"><CheckCircle className="h-3 w-3 mr-1"/> Valid</span> : <span className="text-red-500">Invalid</span>}
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">DMARC Policy</span>
                                    {d.dmarcVerified ? <span className="text-green-600 flex items-center font-bold text-xs"><CheckCircle className="h-3 w-3 mr-1"/> Valid</span> : <span className="text-yellow-600 font-bold text-xs flex items-center"><AlertTriangle className="h-3 w-3 mr-1"/> Pending</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">Manage Domains</Button>
                </div>
            </Card>
        </div>
    </div>
  );

  const renderROI = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">ROI by Campaign</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">Sort by: ROI</span>
                    </div>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={CAMPAIGN_ROI_DATA} margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                            <XAxis type="number" stroke="#9CA3AF" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                            <YAxis dataKey="name" type="category" stroke="#2D2D2D" tick={{fontSize: 12, fontWeight: 600}} tickLine={false} axisLine={false} width={100} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="roi" fill="#FFE01B" radius={[0, 4, 4, 0]} barSize={32}>
                                {CAMPAIGN_ROI_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.roi > 3000 ? '#FFE01B' : '#E5E7EB'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Attribution Model (Last Touch)</h3>
                <div className="space-y-4">
                    <div className="relative pt-6 pb-2">
                        <div className="flex justify-between text-sm font-medium mb-1">
                            <span>Email Campaigns</span>
                            <span className="font-bold">$84,500 (59%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-brand-black h-2 rounded-full" style={{width: '59%'}}></div>
                        </div>
                    </div>
                    <div className="relative pt-2 pb-2">
                        <div className="flex justify-between text-sm font-medium mb-1">
                            <span>Direct Sales / Calls</span>
                            <span className="font-bold">$32,100 (22%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-brand-yellow h-2 rounded-full" style={{width: '22%'}}></div>
                        </div>
                    </div>
                    <div className="relative pt-2 pb-2">
                        <div className="flex justify-between text-sm font-medium mb-1">
                            <span>Events / Webinars</span>
                            <span className="font-bold">$18,200 (13%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-gray-400 h-2 rounded-full" style={{width: '13%'}}></div>
                        </div>
                    </div>
                    <div className="relative pt-2 pb-2">
                        <div className="flex justify-between text-sm font-medium mb-1">
                            <span>Social / Organic</span>
                            <span className="font-bold">$7,700 (6%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-gray-300 h-2 rounded-full" style={{width: '6%'}}></div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-start gap-3">
                        <ArrowUpRight className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">Insight</h4>
                            <p className="text-sm text-gray-600 mt-1">
                                Email campaigns have a <strong>3.2x higher ROI</strong> than webinar events this quarter. Consider shifting $5k budget to high-performing nurture sequences.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
         </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Deep Analytics</h1>
           <p className="text-gray-500 mt-1 text-sm">Comprehensive performance reporting and attribution.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
             <Button 
                variant={timeRange === '7d' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setTimeRange('7d')}
                className={timeRange === '7d' ? 'bg-gray-100 text-gray-900 border-transparent' : ''}
             >
                7 Days
             </Button>
             <Button 
                variant={timeRange === '30d' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setTimeRange('30d')}
                className={timeRange === '30d' ? 'bg-gray-100 text-gray-900 border-transparent' : ''}
             >
                30 Days
             </Button>
             <Button variant="ghost" size="sm" className="text-gray-400">Custom</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
            {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'deliverability', label: 'Deliverability & Health', icon: Shield },
                { id: 'roi', label: 'ROI & Attribution', icon: DollarSign },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                        group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200
                        ${activeTab === tab.id 
                            ? 'border-brand-yellow text-brand-black' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    `}
                >
                    <tab.icon className={`
                        -ml-0.5 mr-2 h-5 w-5
                        ${activeTab === tab.id ? 'text-brand-yellow fill-brand-black' : 'text-gray-400 group-hover:text-gray-500'}
                    `} />
                    {tab.label}
                </button>
            ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pb-12">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'deliverability' && renderDeliverability()}
        {activeTab === 'roi' && renderROI()}
      </div>
    </div>
  );
};