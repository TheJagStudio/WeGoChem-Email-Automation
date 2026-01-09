import React, { useState, useEffect } from 'react';
import { Card, Button, Input, toast } from './UIComponents';
import { db } from '../mockData';
import { Campaign, EmailTemplate, Contact } from '../types';
import { 
    Check, Layout, Users, Zap, Mail, Clock, 
    GitBranch, X, Settings2, FileText, Trash2, Plus, 
    PlayCircle, Split, Search
} from 'lucide-react';

interface CampaignBuilderProps {
  onClose: () => void;
  campaignId?: string | null;
}

// --- Types for the Internal Builder State ---
export type NodeType = 'trigger' | 'email' | 'delay' | 'condition' | 'action' | 'end';

export interface FunnelNode {
  id: string;
  type: NodeType;
  title: string;
  subtitle?: string;
  config: Record<string, any>;
  children?: FunnelNode[]; // Linear flow
  branches?: { true: FunnelNode[]; false: FunnelNode[] }; // For conditions
}

const STEPS = [
  { id: 1, name: 'Essentials', icon: Layout },
  { id: 2, name: 'Audience', icon: Users },
  { id: 3, name: 'Content', icon: FileText },
  { id: 4, name: 'Flow Builder', icon: GitBranch },
  { id: 5, name: 'Review', icon: Check },
];

const NODE_TYPES = [
    { type: 'email', label: 'Send Email', icon: Mail, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { type: 'delay', label: 'Wait Timer', icon: Clock, color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { type: 'condition', label: 'If / Else', icon: Split, color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { type: 'action', label: 'Update Lead', icon: Zap, color: 'bg-green-100 text-green-700 border-green-200' },
];

// --- Recursive Flow Renderer (Exported) ---
export const FlowRenderer: React.FC<{ 
    nodes: FunnelNode[]; 
    onAdd?: (parentId: string | null, branch?: 'true' | 'false') => void; 
    onSelect?: (node: FunnelNode) => void;
    onDelete?: (nodeId: string) => void;
    parentId?: string | null;
    readOnly?: boolean;
    activeNodeId?: string | null; // For visualization in inspection
}> = ({ nodes, onAdd, onSelect, onDelete, parentId = null, readOnly = false, activeNodeId }) => {
    return (
        <div className="flex flex-col items-center">
            {nodes.map((node) => (
                <div key={node.id} className="flex flex-col items-center relative group">
                    {/* Vertical Line Connector */}
                    <div className={`h-6 w-0.5 ${activeNodeId === node.id ? 'bg-brand-yellow' : 'bg-gray-300'}`}></div>

                    {/* The Node Card */}
                    <div 
                        onClick={() => !readOnly && onSelect && onSelect(node)}
                        className={`
                            relative w-64 p-3 rounded-lg border-2 shadow-sm transition-all bg-white z-10
                            ${!readOnly ? 'cursor-pointer hover:scale-[1.02] hover:border-brand-yellow' : ''}
                            ${node.type === 'trigger' ? 'border-brand-black ring-1 ring-gray-200' : 'border-gray-200'}
                            ${activeNodeId === node.id ? 'ring-4 ring-brand-yellow/30 border-brand-yellow' : ''}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md ${
                                node.type === 'trigger' ? 'bg-brand-black text-white' :
                                node.type === 'email' ? 'bg-blue-50 text-blue-600' :
                                node.type === 'delay' ? 'bg-orange-50 text-orange-600' :
                                node.type === 'condition' ? 'bg-purple-50 text-purple-600' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {node.type === 'trigger' ? <PlayCircle size={16}/> :
                                 node.type === 'email' ? <Mail size={16}/> :
                                 node.type === 'delay' ? <Clock size={16}/> :
                                 node.type === 'condition' ? <Split size={16}/> : <Zap size={16}/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-gray-900 truncate">{node.title}</div>
                                {node.subtitle && <div className="text-xs text-gray-500 truncate">{node.subtitle}</div>}
                            </div>
                            {!readOnly && node.type !== 'trigger' && onDelete && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Conditional Branching Logic */}
                    {node.type === 'condition' && node.branches && (
                        <div className="flex flex-col items-center w-full">
                            <div className="h-6 w-0.5 bg-gray-300"></div>
                            {/* Horizontal Spreader */}
                            <div className="relative w-[800px] border-t-2 border-gray-300 h-0">
                                <div className="absolute -top-3 left-20 bg-green-100 text-green-800 text-[10px] font-bold px-2 rounded">YES</div>
                                <div className="absolute -top-3 right-20 bg-red-100 text-red-800 text-[10px] font-bold px-2 rounded">NO</div>
                            </div>
                            
                            <div className="flex justify-between w-[800px]">
                                {/* YES Branch */}
                                <div className="flex flex-col items-center w-1/2 border-r border-dashed border-gray-200 pb-4 px-4">
                                    <div className="h-4 w-0.5 bg-gray-300"></div>
                                    <FlowRenderer 
                                        nodes={node.branches.true} 
                                        onAdd={onAdd ? () => onAdd(node.id, 'true') : undefined} 
                                        onSelect={onSelect} 
                                        onDelete={onDelete}
                                        readOnly={readOnly}
                                    />
                                </div>
                                
                                {/* NO Branch */}
                                <div className="flex flex-col items-center w-1/2 border-l border-dashed border-gray-200 pb-4 px-4">
                                    <div className="h-4 w-0.5 bg-gray-300"></div>
                                    <FlowRenderer 
                                        nodes={node.branches.false} 
                                        onAdd={onAdd ? () => onAdd(node.id, 'false') : undefined} 
                                        onSelect={onSelect} 
                                        onDelete={onDelete}
                                        readOnly={readOnly}
                                    />
                                </div>
                            </div>
                             <div className="w-[780px] border-b-2 border-gray-300 h-4 rounded-b-xl border-l-2 border-r-2 opacity-20"></div>
                        </div>
                    )}
                </div>
            ))}

            {/* Add Button (Only if not readOnly) */}
            {!readOnly && onAdd && (
                <div className="flex flex-col items-center">
                    <div className="h-6 w-0.5 bg-gray-300"></div>
                    <button 
                        onClick={() => onAdd(parentId, undefined)}
                        className="group flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300 text-gray-400 hover:border-brand-yellow hover:text-brand-black hover:bg-brand-yellow transition-all shadow-sm z-20"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};


export const CampaignBuilder: React.FC<CampaignBuilderProps> = ({ onClose, campaignId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    name: 'Untitled Campaign',
    subject: '',
    segment: 'All Contacts',
    sender: 'Sales Team <sales@wegochem.com>'
  });
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  
  // Flow Builder State
  const [nodes, setNodes] = useState<FunnelNode[]>([
      { id: 'start', type: 'trigger', title: 'Start Campaign', subtitle: 'Trigger: Segment Match', config: {} }
  ]);
  const [selectedNode, setSelectedNode] = useState<FunnelNode | null>(null);
  const [addNodeModal, setAddNodeModal] = useState<{ parentId: string | null; branch?: 'true' | 'false' } | null>(null);

  // Initialize
  useEffect(() => {
    setTemplates(db.getTemplates());
    setContacts(db.getContacts());
    if (campaignId) {
        const campaign = db.getCampaign(campaignId);
        if (campaign) {
            setFormData({
                name: campaign.name,
                subject: campaign.subject,
                segment: campaign.segment,
                sender: 'Sales Team <sales@wegochem.com>'
            });
            if (campaign.templateId) setSelectedTemplateId(campaign.templateId);
            if (campaign.funnelConfig?.customNodes && campaign.funnelConfig.customNodes.length > 0) {
                setNodes(campaign.funnelConfig.customNodes);
            }
        }
    } else if (templates.length > 0) {
        setSelectedTemplateId(templates[0].id);
    }
  }, [campaignId, templates.length]);

  // --- Handlers ---

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(c => c + 1);
    else handleSave();
  };

  const handleSave = () => {
      setLoading(true);
      setTimeout(() => {
        const campaignData: Campaign = {
            id: campaignId || `c-${Date.now()}`,
            name: formData.name,
            subject: formData.subject,
            segment: formData.segment,
            status: 'draft',
            sent: 0, 
            opened: 0, 
            clicked: 0, 
            converted: 0, 
            audienceSize: Math.floor(Math.random() * 2000) + 500,
            lastUpdated: 'Just now',
            templateId: selectedTemplateId || undefined,
            funnelConfig: { customNodes: nodes } // Save the tree
        };
        db.addCampaign(campaignData);
        toast.success(campaignId ? "Campaign updated!" : "Campaign launched!");
        setLoading(false);
        onClose();
      }, 800);
  };

  // Node Manipulation Logic
  const addNode = (type: NodeType, label: string) => {
      if (!addNodeModal) return;

      const newNode: FunnelNode = {
          id: `node-${Date.now()}`,
          type,
          title: label,
          subtitle: 'Click to configure',
          config: {},
          branches: type === 'condition' ? { true: [], false: [] } : undefined
      };

      // Helper to traverse and add
      const addNodeRecursive = (list: FunnelNode[]): FunnelNode[] => {
          if (addNodeModal.parentId === null) {
               return [...list, newNode];
          }

          return list.map(node => {
              if (node.id === addNodeModal.parentId) {
                 if (node.type === 'condition' && addNodeModal.branch) {
                     // Add to specific branch
                     return {
                         ...node,
                         branches: {
                             ...node.branches!,
                             [addNodeModal.branch]: [...node.branches![addNodeModal.branch], newNode]
                         }
                     };
                 }
              }
              // Traverse children/branches
              if (node.branches) {
                  return {
                      ...node,
                      branches: {
                          true: addNodeRecursive(node.branches.true),
                          false: addNodeRecursive(node.branches.false)
                      }
                  };
              }
              return node;
          });
      };
      
      if (addNodeModal.parentId === null) {
         setNodes(prev => [...prev, newNode]);
      } else {
         setNodes(prev => addNodeRecursive(prev));
      }

      setAddNodeModal(null);
      setSelectedNode(newNode); // Open config immediately
  };

  const deleteNode = (id: string) => {
      // Recursive delete
      const deleteRecursive = (list: FunnelNode[]): FunnelNode[] => {
          return list.filter(n => n.id !== id).map(node => {
              if (node.branches) {
                  return {
                      ...node,
                      branches: {
                          true: deleteRecursive(node.branches.true),
                          false: deleteRecursive(node.branches.false)
                      }
                  };
              }
              return node;
          });
      };
      setNodes(prev => deleteRecursive(prev));
      if (selectedNode?.id === id) setSelectedNode(null);
  };
  
  const updateNodeConfig = (key: string, value: any) => {
      if (!selectedNode) return;
      const updated = { ...selectedNode, config: { ...selectedNode.config, [key]: value }, subtitle: `${key}: ${value}` };
      setSelectedNode(updated); // Update local view
      
      // Update tree
      const updateRecursive = (list: FunnelNode[]): FunnelNode[] => {
          return list.map(node => {
              if (node.id === selectedNode.id) return updated;
              if (node.branches) {
                  return {
                      ...node,
                      branches: {
                          true: updateRecursive(node.branches.true),
                          false: updateRecursive(node.branches.false)
                      }
                  };
              }
              return node;
          });
      };
      setNodes(prev => updateRecursive(prev));
  };


  // --- Render Steps ---

  const renderSidebar = () => {
      if (!selectedNode) return (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
              <GitBranch className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">Select a node in the flow to configure its properties.</p>
          </div>
      );

      return (
          <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-sm">
                      <Settings2 size={16}/> {selectedNode.title}
                  </div>
                  <button onClick={() => setSelectedNode(null)}><X size={16} className="text-gray-400 hover:text-gray-900"/></button>
              </div>
              
              <div className="p-4 space-y-6 overflow-y-auto flex-1">
                  {selectedNode.type === 'trigger' && (
                      <div className="text-sm text-gray-600">
                          This campaign starts immediately when a contact matches the <strong>"{formData.segment}"</strong> segment.
                      </div>
                  )}

                  {selectedNode.type === 'email' && (
                      <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject Line</label>
                            <Input 
                                value={selectedNode.config.subject || formData.subject} 
                                onChange={e => updateNodeConfig('subject', e.target.value)} 
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Template</label>
                             <select className="w-full text-sm border-gray-300 rounded p-2">
                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                             </select>
                        </div>
                        <div className="bg-blue-50 p-3 rounded text-xs text-blue-700">
                            AI Optimization is active. We will send this email at the best time for each recipient.
                        </div>
                      </>
                  )}

                  {selectedNode.type === 'delay' && (
                      <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Wait Duration</label>
                            <div className="flex gap-2">
                                <Input type="number" className="w-20" defaultValue={2} onChange={e => updateNodeConfig('duration', e.target.value)} />
                                <select className="flex-1 text-sm border-gray-300 rounded" onChange={e => updateNodeConfig('unit', e.target.value)}>
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                    <option value="weeks">Weeks</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="skipWknd" className="rounded text-brand-yellow focus:ring-brand-yellow"/>
                            <label htmlFor="skipWknd" className="text-sm text-gray-700">Skip Weekends</label>
                        </div>
                      </>
                  )}

                  {selectedNode.type === 'condition' && (
                      <>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Condition Type</label>
                             <select className="w-full text-sm border-gray-300 rounded p-2" onChange={e => updateNodeConfig('conditionType', e.target.value)}>
                                <option>Has Opened Email</option>
                                <option>Has Clicked Link</option>
                                <option>Lead Score &gt; 50</option>
                             </select>
                        </div>
                        <div className="text-xs text-gray-500">
                            Split the flow based on user behavior.
                        </div>
                      </>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <Card className="w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-white shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-brand-yellow p-2 rounded-lg">
                        <Zap className="h-5 w-5 text-brand-black" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{campaignId ? "Edit Campaign" : "New Campaign"}</h2>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                             <span>Draft</span>
                             <span>•</span>
                             <span>Last saved just now</span>
                        </div>
                    </div>
                </div>
                
                {/* Step Indicator */}
                <div className="hidden md:flex items-center bg-gray-100 rounded-full p-1">
                    {STEPS.map((step) => (
                        <button
                            key={step.id}
                            onClick={() => setCurrentStep(step.id)}
                            className={`flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                currentStep === step.id ? 'bg-white text-brand-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <step.icon size={14} className="mr-2"/> {step.name}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={onClose} size="sm">Cancel</Button>
                    <Button onClick={handleNext} disabled={loading} size="sm">
                        {loading ? 'Saving...' : currentStep === 5 ? 'Launch' : 'Next'}
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Step 1-3 & 5: Standard Forms */}
                {currentStep !== 4 && (
                    <div className="w-full max-w-3xl mx-auto p-8 overflow-y-auto bg-white m-4 rounded-xl shadow-sm border border-gray-200 h-fit self-start">
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4">
                                <h3 className="text-xl font-bold">Campaign Essentials</h3>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Campaign Name</label>
                                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Subject Line</label>
                                    <Input value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="e.g. Exclusive Invitation"/>
                                </div>
                                <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-1">Sender</label>
                                     <Input value={formData.sender} readOnly className="bg-gray-50 text-gray-500"/>
                                </div>
                            </div>
                        )}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4">
                                <h3 className="text-xl font-bold">Target Audience</h3>
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                                    <Users className="text-blue-600 mt-1"/>
                                    <div>
                                        <p className="text-sm font-bold text-blue-900">1,240 Contacts Selected</p>
                                        <p className="text-xs text-blue-700 mt-1">Based on your selection, we estimate a 24% open rate.</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Segment</label>
                                    <select 
                                        className="w-full border-gray-300 rounded p-2.5"
                                        value={formData.segment}
                                        onChange={e => setFormData({...formData, segment: e.target.value})}
                                    >
                                        <option>All Contacts</option>
                                        <option>Pharma Industry Leads</option>
                                        <option>Engaged in Last 30 Days</option>
                                    </select>
                                </div>
                                
                                <div className="mt-6 border-t pt-6">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3">Manual Selection</h4>
                                    <div className="relative mb-3">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input 
                                            placeholder="Search specific contacts..." 
                                            className="pl-9"
                                            value={contactSearch}
                                            onChange={e => setContactSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="border rounded-md overflow-hidden max-h-60 overflow-y-auto bg-gray-50">
                                        {contacts.length > 0 ? (
                                            contacts
                                            .filter(c => c.email.toLowerCase().includes(contactSearch.toLowerCase()) || c.firstName.toLowerCase().includes(contactSearch.toLowerCase()))
                                            .map(contact => (
                                            <div key={contact.id} className="flex items-center p-3 border-b last:border-b-0 bg-white hover:bg-gray-50">
                                                <input type="checkbox" className="h-4 w-4 text-brand-yellow rounded border-gray-300 focus:ring-brand-yellow" />
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{contact.firstName} {contact.lastName}</div>
                                                    <div className="text-xs text-gray-500">{contact.email} • {contact.company}</div>
                                                </div>
                                            </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-gray-500 text-sm">No contacts found.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                         {currentStep === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4">
                                <h3 className="text-xl font-bold">Content Template</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {templates.map(t => (
                                        <div 
                                            key={t.id}
                                            onClick={() => setSelectedTemplateId(t.id)}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedTemplateId === t.id ? 'border-brand-yellow bg-yellow-50/50' : 'border-gray-200 bg-white'}`}
                                        >
                                            <div className="font-bold text-gray-900">{t.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">{t.subject}</div>
                                        </div>
                                    ))}
                                </div>
                                {selectedTemplateId && (
                                    <div className="mt-8 border-t pt-6 animate-in slide-in-from-bottom-2">
                                        <h4 className="text-sm font-bold text-gray-900 mb-3">Template Preview</h4>
                                        <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                                            {(() => {
                                                const tmpl = templates.find(t => t.id === selectedTemplateId);
                                                if (!tmpl) return null;
                                                return (
                                                    <div className="bg-white rounded shadow-sm overflow-hidden max-w-2xl mx-auto">
                                                        <div className="bg-gray-50 border-b px-4 py-3 text-xs text-gray-500">
                                                            <span className="font-bold">Subject:</span> {tmpl.subject}
                                                        </div>
                                                        <div className="p-6 text-sm text-gray-800 whitespace-pre-wrap font-mono">
                                                            {tmpl.content}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {currentStep === 5 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4">
                                <h3 className="text-xl font-bold">Review & Launch</h3>
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                        <span className="text-gray-500">Campaign Name</span>
                                        <span className="font-bold">{formData.name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                        <span className="text-gray-500">Audience</span>
                                        <span className="font-bold">{formData.segment}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                        <span className="text-gray-500">Flow Complexity</span>
                                        <span className="font-bold">Agentic ({nodes.length + 3} steps)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Send Time</span>
                                        <span className="font-bold text-green-600 flex items-center"><Zap size={14} className="mr-1"/> AI Optimized</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: The Flow Builder */}
                {currentStep === 4 && (
                    <>
                        {/* Canvas */}
                        <div className="flex-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-gray-50 overflow-auto relative p-10 cursor-grab active:cursor-grabbing">
                            {/* Grid Background */}
                            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                            
                            <div className="relative z-10 min-h-full min-w-full w-fit flex justify-center pb-20 mx-auto">
                                <FlowRenderer 
                                    nodes={nodes} 
                                    onAdd={(parentId, branch) => setAddNodeModal({ parentId, branch })}
                                    onSelect={setSelectedNode}
                                    onDelete={deleteNode}
                                />
                            </div>
                        </div>

                        {/* Settings Panel (Right Sidebar) */}
                        <div className="w-80 bg-white border-l shadow-xl shrink-0 z-20 transition-all duration-300 ease-in-out transform translate-x-0">
                            {renderSidebar()}
                        </div>
                    </>
                )}
            </div>

            {/* Floating Node Selector Modal */}
            {addNodeModal && (
                <div 
                    className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
                    onClick={() => setAddNodeModal(null)}
                >
                    <div className="bg-white p-4 rounded-xl shadow-2xl w-[320px] animate-in zoom-in-95 duration-100" onClick={e => e.stopPropagation()}>
                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 px-2">Add Step</h4>
                        <div className="grid grid-cols-1 gap-2">
                            {NODE_TYPES.map(type => (
                                <button 
                                    key={type.type}
                                    onClick={() => addNode(type.type as NodeType, type.label)}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group text-left"
                                >
                                    <div className={`p-2 rounded-md ${type.color}`}>
                                        <type.icon size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-900">{type.label}</div>
                                        <div className="text-xs text-gray-500">
                                            {type.type === 'condition' ? 'Split flow based on logic' : 'Standard action'}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </Card>
    </div>
  );
};