import React, { useState, useEffect } from 'react';
import { db } from '../mockData';
import { Card, Button } from './UIComponents';
import { Search, Star, Archive, Reply, Trash2, Mail, Sparkles, Inbox as InboxIcon } from 'lucide-react';

export const Inbox: React.FC = () => {
    // Mock Inbox Data based on Contacts with history 'reply_received'
    const [threads, setThreads] = useState<any[]>([]);
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

    useEffect(() => {
        const loadThreads = () => {
            const contacts = db.getContacts();
            // Filter contacts who have replied
            const replyThreads = contacts.filter(c => 
                c.history.some(h => h.type === 'reply_received')
            ).map(c => {
                const lastReply = c.history.find(h => h.type === 'reply_received');
                return {
                    id: c.id,
                    name: `${c.firstName} ${c.lastName}`,
                    email: c.email,
                    company: c.company,
                    subject: `Re: Follow up regarding ${c.company}`, // Mock subject
                    preview: "Thanks for reaching out. We are actually looking for...",
                    time: lastReply?.timestamp || new Date().toISOString(),
                    unread: Math.random() > 0.5
                };
            }).sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime());

            setThreads(replyThreads);
            if (replyThreads.length > 0 && !selectedThreadId) {
                // Keep selected if exists, else select first
                if (!threads.find(t => t.id === selectedThreadId)) {
                    setSelectedThreadId(replyThreads[0].id);
                }
            }
        };

        loadThreads();
        const interval = setInterval(loadThreads, 3000); // Poll for new replies from simulation
        return () => clearInterval(interval);
    }, [selectedThreadId, threads.length]);

    const selectedThread = threads.find(t => t.id === selectedThreadId);

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-500">
            {/* Thread List */}
            <Card className="w-1/3 flex flex-col overflow-hidden bg-white border-gray-200">
                <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <InboxIcon className="h-5 w-5 text-brand-black"/> Inbox 
                            {threads.filter(t => t.unread).length > 0 && (
                                <span className="bg-brand-yellow text-brand-black text-xs px-2 py-0.5 rounded-full">{threads.filter(t => t.unread).length}</span>
                            )}
                        </h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input className="w-full bg-gray-50 border border-gray-200 rounded pl-9 py-2 text-sm focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow" placeholder="Search mail..." />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {threads.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm p-8 text-center">
                            <Mail className="h-10 w-10 mb-2 opacity-20" />
                            <p>No replies yet.</p>
                            <p className="text-xs mt-2 text-gray-500">Enable "God Mode" simulation to generate traffic.</p>
                        </div>
                    ) : (
                        threads.map(t => (
                            <div 
                                key={t.id}
                                onClick={() => setSelectedThreadId(t.id)}
                                className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 relative ${selectedThreadId === t.id ? 'bg-blue-50/50' : ''}`}
                            >
                                {selectedThreadId === t.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-yellow"></div>}
                                <div className="flex justify-between mb-1">
                                    <span className={`text-sm text-gray-900 ${t.unread ? 'font-bold' : ''}`}>{t.name}</span>
                                    <span className="text-xs text-gray-400">{new Date(t.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div className="text-xs text-gray-600 truncate mb-1 font-medium">{t.subject}</div>
                                <div className="text-xs text-gray-400 truncate">{t.preview}</div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Message View */}
            <Card className="flex-1 flex flex-col overflow-hidden bg-white border-gray-200">
                {selectedThread ? (
                    <>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/30">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center font-bold text-brand-black text-lg border border-yellow-500 shadow-sm">
                                    {selectedThread.name[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedThread.subject}</h2>
                                    <div className="text-sm text-gray-500">
                                        From <span className="text-gray-900 font-medium">{selectedThread.name}</span> &lt;{selectedThread.email}&gt;
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(selectedThread.time).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-yellow-500"><Star size={18}/></Button>
                                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500"><Archive size={18}/></Button>
                                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500"><Trash2 size={18}/></Button>
                            </div>
                        </div>
                        
                        <div className="flex-1 p-8 overflow-y-auto text-gray-800 leading-relaxed text-sm space-y-4">
                            <p>Hi Sales Team,</p>
                            <p>Thanks for reaching out. We are actually looking for a new polymer supplier for our Q3 production run.</p>
                            <p>I reviewed the materials you sent. Could you provide a specific quote for 500 metric tons of the High-Density variant delivered to our Hamburg facility?</p>
                            <p>Also, are you compliant with the new EU sustainability regulations (Directive 2024/XYZ)?</p>
                            <p>Best regards,<br/>{selectedThread.name}<br/>{selectedThread.company}</p>
                            
                            <div className="border-l-2 border-gray-200 pl-4 mt-8 text-gray-400 text-xs">
                                <p className="mb-2">On {new Date(Date.now() - 86400000).toLocaleDateString()}, WeGoChem wrote:</p>
                                <p className="italic">... (Original Campaign Email Content) ...</p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                                <Button variant="primary" size="sm" className="flex items-center gap-2 px-4">
                                    <Reply size={14} /> Reply
                                </Button>
                                <div className="h-6 w-px bg-gray-200"></div>
                                <Button variant="outline" size="sm" className="text-xs flex items-center gap-2 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                                    <Sparkles size={12} className="text-purple-500" />
                                    AI: Sustainability Response
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs flex items-center gap-2 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                                    <Sparkles size={12} className="text-purple-500" />
                                    AI: Generate Quote
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <InboxIcon size={32} className="opacity-40" />
                        </div>
                        <p className="font-medium">Select a conversation to read</p>
                    </div>
                )}
            </Card>
        </div>
    );
};