import React, { useState } from 'react';
import { Card, Button, Input, toast } from './UIComponents';
import { MessageCircle, Phone, Mail, FileQuestion } from 'lucide-react';

export const Support: React.FC = () => {
    const [msg, setMsg] = useState('');

    const handleSubmit = () => {
        toast.success("Support ticket created! We'll reply shortly.");
        setMsg('');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
             <div className="text-center py-8">
                <h1 className="text-3xl font-bold text-gray-900">How can we help?</h1>
                <p className="text-gray-600 mt-2">Our dedicated support team is available 24/7 for enterprise partners.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 text-center hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-gray-900">Email Support</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">Response within 2 hours</p>
                    <a href="mailto:support@wegochem.com" className="text-sm font-bold text-blue-600 hover:underline">support@wegochem.com</a>
                </Card>

                <Card className="p-6 text-center hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-gray-900">Live Chat</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">Available 9am - 5pm EST</p>
                    <Button size="sm" variant="outline">Start Chat</Button>
                </Card>

                <Card className="p-6 text-center hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-gray-900">Phone</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">Urgent technical issues</p>
                    <div className="text-sm font-bold text-gray-900">+1 (800) 555-0199</div>
                </Card>
            </div>

            <Card className="p-8 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Submit a Ticket</h2>
                        <p className="text-sm text-gray-500 mb-6">Describe your issue in detail. If it's technical, please include steps to reproduce.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                                <Input placeholder="e.g. Campaign not sending" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
                                <select className="w-full border-gray-300 rounded p-2 text-sm">
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                    <option>Critical</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col h-full">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                        <textarea 
                            className="flex-1 w-full border border-gray-300 rounded p-3 text-sm focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow resize-none"
                            placeholder="Describe your issue..."
                            value={msg}
                            onChange={e => setMsg(e.target.value)}
                        ></textarea>
                        <div className="mt-4 flex justify-end">
                            <Button onClick={handleSubmit}>Submit Ticket</Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};