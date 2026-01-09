import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User } from 'lucide-react';
import { Input } from './UIComponents';

interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
}

export const AICopilot: React.FC<{ isOpen: boolean; onClose: () => void; context: string }> = ({ isOpen, onClose, context }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'ai', text: 'Hello! I am your WeGoChem Agent. I can help you analyze campaign performance, draft emails, or summarize lead data. How can I assist?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;
        
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Mock AI Response logic
        setTimeout(() => {
            let responseText = "I'm processing that data. One moment...";
            
            const lowerInput = userMsg.text.toLowerCase();
            if (lowerInput.includes('campaign') || lowerInput.includes('performance')) {
                responseText = "Based on current data, **'Q1 Product Launch'** is performing 15% better than industry average. However, the drop-off rate at the second email is high (45%). I recommend A/B testing the subject line.";
            } else if (lowerInput.includes('lead') || lowerInput.includes('bayer')) {
                responseText = "I've analyzed the leads from **Bayer**. They have a high engagement score (85+). The key decision maker appears to be Sarah Miller. Would you like me to draft a personalized outreach email for her?";
            } else if (lowerInput.includes('draft') || lowerInput.includes('email')) {
                responseText = "Sure, here is a draft:\n\n*Subject: Logistics optimization for Bayer*\n\nHi Sarah,\n\nI noticed Bayer is expanding in the EU region. Our new polymer series helps reduce logistical overhead by 20%...\n\n**Shall I send this to your draft folder?**";
            } else if (lowerInput.includes('summary') || lowerInput.includes('dashboard')) {
                responseText = "You have **1,240 contacts** and **3 active campaigns**. Estimated revenue in the pipeline is **$705,000**. Two campaigns require your attention due to low deliverability scores.";
            }

            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: responseText }]);
            setIsTyping(false);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[55]" onClick={onClose} />
            
            <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-[60] flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#2D2D2D] text-white">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-brand-yellow" />
                        <span className="font-bold tracking-tight">AI Copilot</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={18}/></button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
                    {messages.map(m => (
                        <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${m.role === 'ai' ? 'bg-[#2D2D2D] text-brand-yellow border-gray-700' : 'bg-white text-gray-600 border-gray-200'}`}>
                                {m.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                            </div>
                            <div className={`p-3 rounded-lg text-sm max-w-[85%] shadow-sm leading-relaxed ${
                                m.role === 'ai' ? 'bg-white text-gray-800 border border-gray-200' : 'bg-blue-600 text-white'
                            }`}>
                                <div className="whitespace-pre-wrap">{m.text}</div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-3 animate-in fade-in duration-300">
                            <div className="w-8 h-8 rounded-full bg-[#2D2D2D] text-brand-yellow flex items-center justify-center shadow-sm"><Bot size={16} /></div>
                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="relative">
                        <Input 
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder={`Ask about ${context}...`} 
                            className="pr-10 border-gray-300 focus:border-brand-yellow focus:ring-brand-yellow"
                        />
                        <button 
                            onClick={handleSend}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-brand-yellow transition-colors p-1"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2 text-center flex items-center justify-center gap-1">
                        <Sparkles size={10}/> AI-generated content. Review for accuracy.
                    </div>
                </div>
            </div>
        </>
    );
};