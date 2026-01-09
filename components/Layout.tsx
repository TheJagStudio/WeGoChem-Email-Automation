import React, { useState, useEffect, useRef } from 'react';
import { ViewState, AppNotification } from '../types';
import { LayoutDashboard, Send, Users, FileText, BarChart2, Settings, LogOut, Bell, Search, MailPlus, Sparkles, Inbox } from 'lucide-react';
import { Button } from './UIComponents';
import { db } from '../mockData';
import { SimulationController } from './SimulationController'; // Imported
import { AICopilot } from './AICopilot';

interface LayoutProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  children: React.ReactNode;
}

const NavItem: React.FC<{ 
  icon: React.ElementType; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  badge?: number;
}> = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 mb-1 text-sm font-medium group
      ${active 
        ? 'bg-blue-50 text-ph-blue' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
  >
    <Icon className={`h-4 w-4 ${active ? 'text-ph-blue' : 'text-gray-500 group-hover:text-gray-900'}`} />
    <span className="flex-1 text-left">{label}</span>
    {badge ? (
        <span className="bg-brand-yellow text-brand-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
    ) : active ? (
        <div className="w-1.5 h-1.5 rounded-full bg-ph-blue"></div>
    ) : null}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children }) => {
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ contacts: any[], campaigns: any[], templates: any[] }>({ contacts: [], campaigns: [], templates: [] });
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // AI State
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Load notifications
  useEffect(() => {
    const loadNotifs = () => setNotifications(db.getNotifications());
    loadNotifs();
    const interval = setInterval(loadNotifs, 3000); // Increased poll rate for responsiveness
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Search Effect
  useEffect(() => {
      if (searchQuery.length > 1) {
          const results = db.globalSearch(searchQuery);
          setSearchResults(results);
          setShowSearch(true);
      } else {
          setShowSearch(false);
      }
  }, [searchQuery]);

  // Click Outside Handlers
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
              setShowSearch(false);
          }
          if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
              setShowNotifications(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = (id: string) => {
      db.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
      db.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="flex h-screen bg-brand-light overflow-hidden">
      {/* Sidebar - Light Theme */}
      <aside className="w-64 bg-white border-r border-ph-border flex flex-col z-20 shrink-0">
        <div className="p-4 border-b border-ph-border/50">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onChangeView('dashboard')}>
            <div className="h-8 w-8 bg-brand-yellow rounded-md flex items-center justify-center font-bold text-brand-black text-xl border border-yellow-500 shadow-sm">W</div>
            <div className="flex flex-col">
                 <span className="font-bold text-sm tracking-tight text-gray-900">WeGoChem</span>
                 <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Intelligence Platform</span>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-6">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Product OS</div>
            <nav className="space-y-0.5">
                <NavItem icon={LayoutDashboard} label="Dashboard" active={currentView === 'dashboard'} onClick={() => onChangeView('dashboard')} />
                <NavItem icon={Inbox} label="Inbox" active={currentView === 'inbox'} onClick={() => onChangeView('inbox')} />
                <NavItem icon={Send} label="Campaigns" active={currentView === 'campaigns'} onClick={() => onChangeView('campaigns')} />
                <NavItem icon={MailPlus} label="Bulk Email" active={currentView === 'bulk-email'} onClick={() => onChangeView('bulk-email')} />
                <NavItem icon={Users} label="Leads" active={currentView === 'leads'} onClick={() => onChangeView('leads')} />
                <NavItem icon={FileText} label="Templates" active={currentView === 'templates'} onClick={() => onChangeView('templates')} />
                <NavItem icon={BarChart2} label="Analytics" active={currentView === 'analytics'} onClick={() => onChangeView('analytics')} />
            </nav>
          </div>
          
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Project Settings</div>
            <nav className="space-y-0.5">
                <NavItem icon={Settings} label="Configuration" active={currentView === 'settings'} onClick={() => onChangeView('settings')} />
            </nav>
          </div>
        </div>
        
        {/* MOVED GOD MODE CONTROLLER HERE */}
        <SimulationController />

        <div className="p-4 border-t border-ph-border bg-gray-50/50">
             <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-ph-blue to-cyan-500 flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">
                    JD
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">Jane Doe</p>
                    <p className="text-xs text-gray-500 truncate">Marketing Manager</p>
                </div>
                <LogOut className="h-4 w-4 text-gray-400" />
             </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-brand-light relative">
         {/* Top Header */}
         <header className="bg-brand-light border-b border-ph-border h-14 flex items-center justify-between px-6 z-10 shrink-0">
            <div className="flex items-center w-full max-w-xl">
                <div className="relative w-full" ref={searchRef}>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-brand-yellow focus:border-brand-yellow block pl-10 p-2 shadow-sm placeholder-gray-400" 
                        placeholder="Search leads, campaigns, templates..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if(searchQuery.length > 1) setShowSearch(true); }}
                    />
                    {/* ... Search Results Dropdown (unchanged) ... */}
                    {showSearch && (
                        <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                            {searchResults.contacts.length === 0 && searchResults.campaigns.length === 0 && searchResults.templates.length === 0 ? (
                                <div className="p-4 text-sm text-gray-500 text-center">No results found.</div>
                            ) : (
                                <div className="max-h-96 overflow-y-auto p-2 space-y-4">
                                    {searchResults.contacts.length > 0 && (
                                        <div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">Contacts</div>
                                            {searchResults.contacts.map((c: any) => (
                                                <button key={c.id} onClick={() => { onChangeView('leads'); setShowSearch(false); }} className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center justify-between group">
                                                    <span className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</span>
                                                    <span className="text-xs text-gray-400 group-hover:text-blue-500">{c.company}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {searchResults.campaigns.length > 0 && (
                                        <div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">Campaigns</div>
                                            {searchResults.campaigns.map((c: any) => (
                                                <button key={c.id} onClick={() => { onChangeView('campaigns'); setShowSearch(false); }} className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center justify-between group">
                                                    <span className="text-sm font-medium text-gray-900">{c.name}</span>
                                                    <span className="text-xs text-gray-400 group-hover:text-brand-black">{c.status}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                     {searchResults.templates.length > 0 && (
                                        <div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">Templates</div>
                                            {searchResults.templates.map((t: any) => (
                                                <button key={t.id} onClick={() => { onChangeView('templates'); setShowSearch(false); }} className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center justify-between group">
                                                    <span className="text-sm font-medium text-gray-900">{t.name}</span>
                                                    <span className="text-xs text-gray-400 group-hover:text-brand-black">{t.category}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex items-center space-x-4">
                 <button 
                    onClick={() => setIsAiOpen(true)}
                    className="flex items-center gap-2 bg-[#2D2D2D] text-brand-yellow px-3 py-1.5 rounded-full text-xs font-bold hover:bg-gray-800 transition-all shadow-sm group hover:scale-105"
                >
                    <Sparkles size={14} className="group-hover:animate-pulse"/>
                    <span className="hidden sm:inline">Ask AI Agent</span>
                </button>

                <div className="h-4 w-px bg-gray-300"></div>

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <Button variant="ghost" size="sm" className="relative text-gray-500 hover:text-gray-900" onClick={() => setShowNotifications(!showNotifications)}>
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                        )}
                    </Button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-in zoom-in-95 duration-100">
                            <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
                                <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-gray-500">All caught up!</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className={`p-4 border-b last:border-0 hover:bg-gray-50 transition-colors ${n.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}>
                                            <div className="flex justify-between items-start">
                                                <h4 className={`text-sm font-bold ${n.type === 'error' ? 'text-red-600' : 'text-gray-900'}`}>{n.title}</h4>
                                                {!n.isRead && (
                                                    <button onClick={() => handleMarkRead(n.id)} title="Mark Read"><div className="h-2 w-2 bg-blue-500 rounded-full"></div></button>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                                            <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                                                <span>{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
         </header>

         {/* Content Area */}
         <main className="flex-1 overflow-auto p-6 scroll-smooth">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
         </main>
         
         <AICopilot isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} context={currentView} />
      </div>
    </div>
  );
};