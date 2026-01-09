import React, { useState, useEffect } from 'react';
import { db } from '../mockData';
import { Contact, Status } from '../types';
import { Card, Button, Badge, Input, toast, Modal } from './UIComponents';
import { Search, Filter, MoreHorizontal, Mail, Phone, Calendar, ArrowRight, User, CheckCircle, X, Trash2, LayoutList, Kanban, GripVertical, Edit3 } from 'lucide-react';

export const Leads: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  
  // UI State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterScore, setFilterScore] = useState(0);

  // Form State
  const [leadFormData, setLeadFormData] = useState({ firstName: '', lastName: '', email: '', company: '', role: '', industry: '', tags: [] as string[] });
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [emailContent, setEmailContent] = useState('');

  useEffect(() => {
    refreshContacts();
  }, []);

  const refreshContacts = () => {
      const all = db.getContacts();
      setContacts(all);
      if (selectedContact) {
          const updated = all.find(c => c.id === selectedContact.id);
          setSelectedContact(updated || null);
      }
  };

  const filteredContacts = contacts.filter(c => 
    (c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
    c.score >= filterScore
  );

  const handleConvert = () => {
      if (!selectedContact) return;
      
      const success = db.convertLead(selectedContact.id);
      if (success) {
          toast.success(`Converted ${selectedContact.firstName} to a Deal!`);
          refreshContacts();
      } else {
          toast.info("Lead is already converted.");
      }
  };

  const openAddModal = () => {
    setEditingLeadId(null);
    setLeadFormData({ firstName: '', lastName: '', email: '', company: '', role: '', industry: '', tags: [] });
    setIsLeadModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingLeadId(contact.id);
    setLeadFormData({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        company: contact.company,
        role: contact.role,
        industry: contact.industry,
        tags: contact.tags
    });
    setIsLeadModalOpen(true);
  };

  const handleSaveLead = () => {
      if (!leadFormData.email || !leadFormData.lastName) {
          toast.error("Email and Last Name are required");
          return;
      }
      
      if (editingLeadId) {
          db.updateContact(editingLeadId, leadFormData);
          toast.success("Lead updated successfully");
      } else {
          db.addContact(leadFormData);
          toast.success("Lead added successfully");
      }
      
      setIsLeadModalOpen(false);
      refreshContacts();
  };

  const handleDeleteLead = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (confirm("Are you sure you want to delete this lead?")) {
          db.deleteContact(id);
          if (selectedContact?.id === id) setSelectedContact(null);
          refreshContacts();
          toast.success("Lead deleted");
      }
  };

  const handleSendEmail = () => {
      toast.success(`Email sent to ${selectedContact?.email}`);
      setIsEmailOpen(false);
      setEmailContent('');
      if (selectedContact) {
          db.addActivity(selectedContact.id, {
              type: 'email_sent',
              description: 'Sent manual email',
              timestamp: new Date().toISOString()
          });
          refreshContacts();
      }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
      e.dataTransfer.setData('contactId', id);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: Status) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('contactId');
      if (id) {
          const contact = contacts.find(c => c.id === id);
          if (contact && contact.status !== status) {
              db.updateContact(id, { status });
              refreshContacts();
              toast.success(`Moved ${contact.firstName} to ${status.charAt(0).toUpperCase() + status.slice(1)}`);
          }
      }
  };

  const BOARD_COLUMNS: { id: Status; label: string; color: string }[] = [
      { id: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
      { id: 'engaged', label: 'Engaged', color: 'bg-green-100 text-green-800' },
      { id: 'hot', label: 'Hot Leads', color: 'bg-orange-100 text-orange-800' },
      { id: 'nurture', label: 'Nurture', color: 'bg-yellow-100 text-yellow-800' },
      { id: 'converted', label: 'Converted', color: 'bg-purple-100 text-purple-800' },
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-500">
      {/* Main View Area (List or Board) */}
      <div className={`${selectedContact ? 'w-1/2 hidden lg:flex' : 'w-full'} flex-col space-y-4 transition-all duration-300 min-w-0`}>
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Leads & Contacts</h1>
            </div>
            <div className="flex items-center space-x-3">
                 <div className="flex bg-white rounded-lg border border-gray-200 p-0.5 shadow-sm">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        title="List View"
                    >
                        <LayoutList className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode('board')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'board' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Board View"
                    >
                        <Kanban className="h-4 w-4" />
                    </button>
                 </div>
                 <Button onClick={openAddModal}>+ Add Lead</Button>
            </div>
        </div>
        
        <div className="space-y-2">
            <Card className="p-2 flex gap-2 items-center bg-white">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Search leads by name, company..." 
                        className="pl-9 border-none focus:ring-0 shadow-none bg-transparent" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="h-6 w-px bg-gray-200"></div>
                <Button 
                    variant={showFilters ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className={showFilters ? "text-white" : "text-gray-500"}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="h-4 w-4 mr-2"/> Filter
                </Button>
            </Card>

            {showFilters && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-500">Min Score: {filterScore}</span>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={filterScore} 
                            onChange={(e) => setFilterScore(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-yellow"
                        />
                    </div>
                </div>
            )}
        </div>

        {viewMode === 'list' ? (
            <Card className="flex-1 overflow-hidden flex flex-col border-ph-border">
                <div className="overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Person</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredContacts.map((contact) => (
                                <tr 
                                    key={contact.id} 
                                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedContact?.id === contact.id ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => setSelectedContact(contact)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-9 w-9 bg-gray-100 rounded flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                                                {contact.firstName[0]}{contact.lastName[0]}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-bold text-gray-900">{contact.firstName} {contact.lastName}</div>
                                                <div className="text-xs text-gray-500">{contact.company}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                                                contact.score > 80 ? 'bg-red-50 text-red-600 border border-red-100' : 
                                                contact.score > 50 ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' : 
                                                'bg-gray-50 text-gray-600 border border-gray-100'
                                            }`}>
                                                {contact.score}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge status={contact.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); openEditModal(contact); }}
                                                className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={(e) => handleDeleteLead(e, contact.id)}
                                                className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        ) : (
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2">
                <div className="flex h-full gap-4 min-w-max">
                    {BOARD_COLUMNS.map(column => (
                        <div 
                            key={column.id} 
                            className="w-72 bg-gray-100/50 rounded-lg flex flex-col h-full border border-gray-200"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex justify-between items-center sticky top-0">
                                <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${column.color}`}>
                                    {column.label}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                    {filteredContacts.filter(c => c.status === column.id).length}
                                </span>
                            </div>
                            <div className="p-3 space-y-3 overflow-y-auto flex-1">
                                {filteredContacts
                                    .filter(c => c.status === column.id)
                                    .map(contact => (
                                        <div
                                            key={contact.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, contact.id)}
                                            onClick={() => setSelectedContact(contact)}
                                            className={`bg-white p-3 rounded border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${selectedContact?.id === contact.id ? 'ring-2 ring-brand-yellow border-transparent' : 'border-gray-200'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-bold text-sm text-gray-900">{contact.company}</div>
                                                <GripVertical className="h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100" />
                                            </div>
                                            <div className="text-sm text-gray-600 mb-2">{contact.firstName} {contact.lastName}</div>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                    contact.score > 80 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    Score: {contact.score}
                                                </span>
                                                <div className="text-xs text-gray-400">
                                                    {contact.lastActivity.replace('ago', '')}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Detail View */}
      {selectedContact && (
        <div className="w-full lg:w-1/2 flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
             <Card className="h-full overflow-hidden flex flex-col shadow-xl border-gray-300">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-white flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                        <div className="h-14 w-14 bg-brand-yellow rounded-lg flex items-center justify-center text-xl font-bold text-brand-black border border-yellow-500 shadow-sm">
                            {selectedContact.firstName[0]}{selectedContact.lastName[0]}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{selectedContact.firstName} {selectedContact.lastName}</h2>
                            <p className="text-gray-500 text-sm">{selectedContact.role} at <span className="font-semibold text-gray-900">{selectedContact.company}</span></p>
                            <div className="mt-2 flex space-x-2">
                                {selectedContact.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 border border-gray-200 text-gray-600">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <button onClick={() => setSelectedContact(null)} className="text-gray-400 hover:text-gray-600 mb-2 lg:hidden">
                            <X className="h-5 w-5" />
                        </button>
                        <div className="text-2xl font-bold text-gray-900">{selectedContact.score}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Lead Score</div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="px-6 py-3 border-b border-gray-200 flex space-x-2 bg-gray-50 sticky top-0 z-10 items-center">
                    <Button size="sm" variant="outline" onClick={() => setIsEmailOpen(true)} className="flex items-center"><Mail className="h-3 w-3 mr-2"/> Email</Button>
                    <div className="flex-1"></div>
                    <Button size="sm" variant="outline" onClick={() => openEditModal(selectedContact)} className="flex items-center mr-2"><Edit3 className="h-3 w-3 mr-2"/> Edit</Button>
                    {selectedContact.status === 'converted' ? (
                        <span className="flex items-center text-green-700 text-sm font-bold bg-green-50 px-3 py-1.5 rounded border border-green-200 shadow-sm">
                            <CheckCircle className="h-4 w-4 mr-2" /> Converted
                        </span>
                    ) : (
                        <Button size="sm" variant="primary" onClick={handleConvert}>Convert to Deal</Button>
                    )}
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto bg-white flex-1">
                    {/* Insights */}
                    <div className="bg-blue-50 border border-blue-200 rounded p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <CheckCircle className="h-24 w-24 text-blue-500" />
                        </div>
                        <h4 className="text-sm font-bold text-blue-900 flex items-center mb-2 z-10 relative">
                            Next Best Action
                        </h4>
                        <p className="text-sm text-blue-800 leading-relaxed z-10 relative">
                            {selectedContact.score > 80 
                                ? "Lead is hot! Recommend immediate follow-up or scheduling a demo." 
                                : "Nurture with case studies relevant to their industry."}
                        </p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div className="border-b pb-2">
                            <span className="text-gray-500 block text-xs uppercase font-bold mb-1">Email</span>
                            <span className="font-medium text-gray-900">{selectedContact.email}</span>
                        </div>
                        <div className="border-b pb-2">
                            <span className="text-gray-500 block text-xs uppercase font-bold mb-1">Phone</span>
                            <span className="font-medium text-gray-900">+1 (555) 012-3456</span>
                        </div>
                        <div className="border-b pb-2">
                            <span className="text-gray-500 block text-xs uppercase font-bold mb-1">Industry</span>
                            <span className="font-medium text-gray-900">{selectedContact.industry}</span>
                        </div>
                         <div className="border-b pb-2">
                            <span className="text-gray-500 block text-xs uppercase font-bold mb-1">Location</span>
                            <span className="font-medium text-gray-900">New York, USA</span>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Activity Timeline</h3>
                        <div className="flow-root pl-2">
                            <ul className="-mb-8">
                                {selectedContact.history.map((event, i) => (
                                    <li key={event.id}>
                                        <div className="relative pb-8">
                                            {i !== selectedContact.history.length - 1 ? (
                                                <span className="absolute top-4 left-4 -ml-px h-full w-px bg-gray-200" aria-hidden="true"></span>
                                            ) : null}
                                            <div className="relative flex space-x-3">
                                                <div>
                                                    <span className={`h-8 w-8 rounded flex items-center justify-center border shadow-sm z-10 relative ${event.type === 'score_change' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 text-gray-600'}`}>
                                                        {event.type === 'email_opened' ? <Mail className="h-4 w-4"/> : 
                                                         event.type === 'score_change' ? <ArrowRight className="h-4 w-4 transform -rotate-45"/> :
                                                         <User className="h-4 w-4"/>}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-1.5 space-y-1">
                                                    <div>
                                                        <p className="text-sm text-gray-900 font-medium">{event.description}</p>
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono">
                                                        {new Date(event.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {selectedContact.history.length === 0 && (
                                    <li className="text-sm text-gray-500 italic">No activity recorded yet.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
             </Card>
        </div>
      )}

      {/* Add/Edit Lead Modal */}
      <Modal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} title={editingLeadId ? "Edit Lead" : "Add New Lead"}>
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <Input value={leadFormData.firstName} onChange={e => setLeadFormData({...leadFormData, firstName: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <Input value={leadFormData.lastName} onChange={e => setLeadFormData({...leadFormData, lastName: e.target.value})} />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <Input type="email" value={leadFormData.email} onChange={e => setLeadFormData({...leadFormData, email: e.target.value})} />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <Input value={leadFormData.company} onChange={e => setLeadFormData({...leadFormData, company: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <Input value={leadFormData.role} onChange={e => setLeadFormData({...leadFormData, role: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                      <Input value={leadFormData.industry} onChange={e => setLeadFormData({...leadFormData, industry: e.target.value})} />
                  </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                  <Button variant="ghost" onClick={() => setIsLeadModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveLead}>{editingLeadId ? "Update Lead" : "Add Lead"}</Button>
              </div>
          </div>
      </Modal>

      {/* Email Modal */}
      <Modal isOpen={isEmailOpen} onClose={() => setIsEmailOpen(false)} title={`Email to ${selectedContact?.firstName}`}>
          <div className="space-y-4">
              <Input value={`Re: Follow up regarding ${selectedContact?.company}`} readOnly className="bg-gray-50" />
              <textarea 
                  className="w-full h-40 border border-gray-300 rounded p-3 text-sm focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow"
                  placeholder="Type your message..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
              ></textarea>
              <div className="flex justify-between items-center pt-2">
                  <Button variant="ghost" size="sm">Attach File</Button>
                  <div className="flex space-x-3">
                      <Button variant="ghost" onClick={() => setIsEmailOpen(false)}>Cancel</Button>
                      <Button onClick={handleSendEmail}><Mail className="h-4 w-4 mr-2"/> Send</Button>
                  </div>
              </div>
          </div>
      </Modal>
    </div>
  );
};