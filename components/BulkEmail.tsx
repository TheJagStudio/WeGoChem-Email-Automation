import React, { useState, useMemo } from 'react';
import { db } from '../mockData';
import { Card, Button, Input, toast } from './UIComponents';
import { Users, Mail, CheckCircle, Search, Filter, Send } from 'lucide-react';
import { Contact } from '../types';

export const BulkEmail: React.FC = () => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [filterIndustry, setFilterIndustry] = useState('');
    
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [customSubject, setCustomSubject] = useState('');
    const [isSending, setIsSending] = useState(false);

    const contacts = db.getContacts();
    const templates = db.getTemplates();

    const filteredContacts = useMemo(() => {
        return contacts.filter(c => {
            const matchesSearch = c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  c.company.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesIndustry = filterIndustry ? c.industry === filterIndustry : true;
            return matchesSearch && matchesIndustry;
        });
    }, [contacts, searchTerm, filterIndustry]);

    const industries = Array.from(new Set(contacts.map(c => c.industry))).filter(Boolean);

    const toggleContact = (id: string) => {
        const next = new Set(selectedContacts);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedContacts(next);
    };

    const toggleAll = () => {
        if (selectedContacts.size === filteredContacts.length) {
            setSelectedContacts(new Set());
        } else {
            setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
        }
    };

    const handleSend = () => {
        if(selectedContacts.size === 0) return toast.error("Select at least one contact");
        if(!selectedTemplateId) return toast.error("Select a template");
        
        setIsSending(true);
        setTimeout(() => {
            const subject = customSubject || templates.find(t => t.id === selectedTemplateId)?.subject || "Update";
            db.bulkSendEmail(Array.from(selectedContacts), selectedTemplateId, subject);
            toast.success(`Sent to ${selectedContacts.size} contacts`);
            setIsSending(false);
            setStep(1);
            setSelectedContacts(new Set());
        }, 1500);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Direct Bulk Email</h1>
                <p className="text-gray-500 mt-1">Send immediate updates to selected segments without building a full campaign.</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center space-x-4 border-b pb-4">
                <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-brand-black' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-brand-yellow' : 'bg-gray-200'}`}>1</div>
                    <span className="font-medium">Select Audience</span>
                </div>
                <div className="h-px w-10 bg-gray-300"></div>
                <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-brand-black' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-brand-yellow' : 'bg-gray-200'}`}>2</div>
                    <span className="font-medium">Choose Content</span>
                </div>
                <div className="h-px w-10 bg-gray-300"></div>
                <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-brand-black' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-brand-yellow' : 'bg-gray-200'}`}>3</div>
                    <span className="font-medium">Review & Send</span>
                </div>
            </div>

            {step === 1 && (
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                             <div className="relative w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
                             </div>
                             <select 
                                className="border-gray-300 rounded p-2 text-sm"
                                value={filterIndustry}
                                onChange={e => setFilterIndustry(e.target.value)}
                             >
                                <option value="">All Industries</option>
                                {industries.map(i => <option key={i} value={i}>{i}</option>)}
                             </select>
                        </div>
                        <div className="text-sm text-gray-500">
                            {selectedContacts.size} selected
                        </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input type="checkbox" onChange={toggleAll} checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0} className="rounded text-brand-yellow focus:ring-brand-yellow" />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredContacts.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <input type="checkbox" checked={selectedContacts.has(c.id)} onChange={() => toggleContact(c.id)} className="rounded text-brand-yellow focus:ring-brand-yellow" />
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{c.company}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{c.industry}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                        <Button onClick={() => setStep(2)} disabled={selectedContacts.size === 0}>Next: Choose Content</Button>
                    </div>
                </Card>
            )}

            {step === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6 h-fit">
                        <h3 className="text-lg font-bold mb-4">Select Template</h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {templates.map(t => (
                                <div 
                                    key={t.id}
                                    onClick={() => { setSelectedTemplateId(t.id); setCustomSubject(t.subject); }}
                                    className={`p-3 border rounded cursor-pointer transition-all ${selectedTemplateId === t.id ? 'border-brand-yellow bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="font-bold text-sm">{t.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{t.subject}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4">Customize</h3>
                        {selectedTemplateId ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                                    <Input value={customSubject} onChange={e => setCustomSubject(e.target.value)} />
                                </div>
                                <div className="p-4 bg-gray-50 rounded border text-sm text-gray-600 font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                                    {templates.find(t => t.id === selectedTemplateId)?.content}
                                </div>
                                <div className="flex justify-between pt-4">
                                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                    <Button onClick={() => setStep(3)}>Next: Review</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500 text-center py-10">Select a template to preview</div>
                        )}
                    </Card>
                </div>
            )}

            {step === 3 && (
                 <Card className="p-6 max-w-2xl mx-auto text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Send?</h2>
                    <p className="text-gray-500 mb-8">
                        You are about to send <strong>"{customSubject}"</strong> to <strong>{selectedContacts.size} contacts</strong>.
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded text-left mb-8 space-y-2 border">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Recipients:</span>
                            <span className="font-bold">{selectedContacts.size}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Template:</span>
                            <span className="font-bold">{templates.find(t => t.id === selectedTemplateId)?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Estimated Delivery:</span>
                            <span className="font-bold">Immediate</span>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                        <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                        <Button onClick={handleSend} disabled={isSending} className="min-w-[150px]">
                            {isSending ? 'Sending...' : 'Confirm & Send'}
                        </Button>
                    </div>
                 </Card>
            )}
        </div>
    );
};