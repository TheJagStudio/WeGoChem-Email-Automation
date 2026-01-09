import React, { useState, useEffect } from 'react';
import { Play, Pause, Zap, Activity, FastForward } from 'lucide-react';
import { db } from '../mockData';

export const SimulationController: React.FC = () => {
    const [isActive, setIsActive] = useState(false);
    const [speed, setSpeed] = useState<'1x' | '5x' | '10x'>('1x');
    const [stats, setStats] = useState({ eventsGenerated: 0 });

    useEffect(() => {
        let interval: any;
        if (isActive) {
            const delay = speed === '1x' ? 2000 : speed === '5x' ? 500 : 200;
            
            interval = setInterval(() => {
                // 1. Pick a random campaign
                const campaigns = db.getCampaigns().filter(c => c.status === 'running');
                if (campaigns.length === 0) return;
                const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];

                // 2. Pick a random contact
                const contacts = db.getContacts();
                const contact = contacts[Math.floor(Math.random() * contacts.length)];

                // 3. Determine Event Type (Weighted randomness)
                const rand = Math.random();
                let type: any = 'email_opened';
                let desc = `Opened email from "${campaign.name}"`;
                
                // CRITICAL: Update Campaign Stats in DB object
                const updatedCampaign = { ...campaign };

                if (rand > 0.85) {
                    type = 'link_clicked';
                    desc = `Clicked link in "${campaign.name}"`;
                    updatedCampaign.clicked++;
                    db.updateContact(contact.id, { score: contact.score + 5 });
                } else if (rand > 0.96) {
                    type = 'reply_received';
                    desc = `Replied to "${campaign.name}"`;
                    // Setting status hot will help in Leads board
                    db.updateContact(contact.id, { status: 'hot', score: contact.score + 15 });
                } else {
                    updatedCampaign.opened++;
                    if(Math.random() > 0.5) updatedCampaign.sent++; 
                }

                // 4. Write Activity to DB
                // We purposefully use the db wrapper method which updates the internal contact history
                db.addActivity(contact.id, {
                    type,
                    description: desc,
                    timestamp: new Date().toISOString(),
                    metadata: { campaignId: campaign.id }
                });

                // 5. Persist Campaign Stats
                db.addCampaign(updatedCampaign);
                
                // Trigger notification
                if (type === 'reply_received') {
                    db.addNotification({
                        title: 'New Reply Received',
                        message: `${contact.firstName} ${contact.lastName} replied to ${campaign.name}`,
                        type: 'info',
                        link: '/inbox'
                    });
                } 

                setStats(prev => ({ eventsGenerated: prev.eventsGenerated + 1 }));

            }, delay);
        }
        return () => clearInterval(interval);
    }, [isActive, speed]);

    // RENDER: Now styled to fit in Sidebar (Not fixed positioning)
    return (
        <div className="mx-4 mb-4 bg-brand-black text-white p-3 rounded-xl shadow-lg border border-gray-700 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-gray-600/50">
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-brand-yellow animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">God Mode</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">{stats.eventsGenerated} evts</div>
            </div>
            
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => setIsActive(!isActive)}
                    className={`flex items-center justify-center h-8 w-8 rounded-full transition-all duration-200 ${isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                    title={isActive ? "Pause Simulation" : "Start Simulation"}
                >
                    {isActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5"/>}
                </button>

                <div className="h-6 w-px bg-gray-600/50 mx-1"></div>

                <div className="flex bg-gray-800/50 rounded-lg p-1 gap-1">
                    {(['1x', '5x', '10x'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setSpeed(s)}
                            className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${speed === s ? 'bg-brand-yellow text-brand-black shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
            {isActive && (
                <div className="px-1 text-[10px] text-brand-yellow/80 font-mono flex items-center justify-center gap-2 bg-gray-800/30 py-1 rounded">
                    <Zap size={10} /> Generating Traffic...
                </div>
            )}
        </div>
    );
};