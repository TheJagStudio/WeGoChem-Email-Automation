import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../types';
import { Button, Input, toast } from './UIComponents';
import { db } from '../mockData';
import { Save, Code, Eye, FileText, Zap, Sparkles } from 'lucide-react';

interface TemplateEditorProps {
  templateId?: string | null;
  onClose: () => void;
  onSave: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ templateId, onClose, onSave }) => {
  // Initialize with default values
  const [formData, setFormData] = useState<{
    name: string;
    subject: string;
    category: EmailTemplate['category'];
    content: string;
  }>({
    name: '',
    subject: '',
    category: 'Outreach',
    content: 'Hi {{firstName}},\n\nStart writing your email here...',
  });

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Effect to load data if editing
  useEffect(() => {
    if (templateId) {
      const tmpl = db.getTemplate(templateId);
      if (tmpl) {
        setFormData({
          name: tmpl.name,
          subject: tmpl.subject,
          category: tmpl.category,
          content: tmpl.content,
        });
      }
    }
  }, [templateId]);

  const handleSave = () => {
    if (!formData.name || !formData.content) {
      toast.error("Name and Content are required.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      db.saveTemplate({
        id: templateId || undefined,
        name: formData.name,
        subject: formData.subject,
        category: formData.category,
        content: formData.content,
        tags: ['Custom'],
      });
      setIsSaving(false);
      toast.success("Template saved successfully!");
      onSave();
    }, 500);
  };

  const handleOptimizeSubject = () => {
      setIsOptimizing(true);
      setTimeout(() => {
          const suggestions = [
              "Quick question regarding {{company}}",
              "Invitation: Exclusive {{industry}} opportunity",
              "Touching base: {{company}} logistics",
          ];
          // Pick random
          const random = suggestions[Math.floor(Math.random() * suggestions.length)];
          setFormData(prev => ({ ...prev, subject: random }));
          setIsOptimizing(false);
          toast.success("Subject optimized by AI");
      }, 1000);
  };

  // Simple parser to render basic Markdown for preview
  const parseMarkdown = (text: string) => {
    let html = text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replace(/\n/gim, '<br />');
    
    // Highlight variables
    html = html.replace(/{{(.*?)}}/g, '<span class="bg-yellow-100 text-yellow-800 px-1 rounded font-mono text-sm border border-yellow-200">{{$1}}</span>');
    
    return html;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-3">
             <div className="bg-brand-yellow p-2 rounded-lg">
                <FileText className="h-5 w-5 text-brand-black" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-900">{templateId ? 'Edit Template' : 'Create New Template'}</h2>
                <p className="text-xs text-gray-500">Markdown supported • AI enabled</p>
             </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center"><span className="animate-spin mr-2">⟳</span> Saving...</span>
              ) : (
                <span className="flex items-center"><Save className="h-4 w-4 mr-2" /> Save Template</span>
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Metadata Sidebar */}
          <div className="w-80 border-r bg-gray-50 p-6 flex flex-col space-y-6 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="e.g. Q1 Follow-up"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow sm:text-sm p-2 border"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as any})}
              >
                <option value="Outreach">Outreach</option>
                <option value="Newsletter">Newsletter</option>
                <option value="Nurture">Nurture</option>
                <option value="Transactional">Transactional</option>
                <option value="Event">Event</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
              <Input 
                value={formData.subject} 
                onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                placeholder="Subject..."
              />
              <button 
                  onClick={handleOptimizeSubject}
                  disabled={isOptimizing}
                  className="mt-2 text-xs text-brand-black flex items-center hover:bg-gray-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
              >
                 {isOptimizing ? <span className="animate-spin mr-1">⟳</span> : <Sparkles className="h-3 w-3 mr-1 text-yellow-600" />} 
                 {isOptimizing ? "Optimizing..." : "AI: Optimize Subject"}
              </button>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Variables</h4>
                <div className="flex flex-wrap gap-2">
                    {['{{firstName}}', '{{company}}', '{{industry}}', '{{senderName}}'].map(v => (
                        <span key={v} 
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded cursor-pointer hover:bg-gray-200 border border-gray-300 font-mono"
                              onClick={() => setFormData({...formData, content: formData.content + ' ' + v})}
                        >
                            {v}
                        </span>
                    ))}
                </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col min-w-0">
             {/* Toolbar */}
             <div className="border-b px-4 py-2 flex items-center space-x-2 bg-white">
                <button 
                    onClick={() => setActiveTab('write')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${activeTab === 'write' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Code className="h-4 w-4 mr-2" /> Write
                </button>
                <button 
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${activeTab === 'preview' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Eye className="h-4 w-4 mr-2" /> Preview
                </button>
             </div>

             <div className="flex-1 relative">
                {activeTab === 'write' ? (
                    <textarea 
                        className="absolute inset-0 w-full h-full p-6 resize-none focus:outline-none font-mono text-sm text-gray-800 leading-relaxed"
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        placeholder="Type your email content here using Markdown..."
                    />
                ) : (
                    <div className="absolute inset-0 w-full h-full p-8 overflow-y-auto bg-gray-50">
                        <div className="max-w-2xl mx-auto bg-white shadow-sm border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 border-b px-6 py-3">
                                <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Subject:</span>
                                <span className="ml-2 text-sm text-gray-900 font-medium">{formData.subject}</span>
                            </div>
                            <div className="p-8 prose prose-sm max-w-none text-gray-800"
                                 dangerouslySetInnerHTML={{ __html: parseMarkdown(formData.content) }}
                            />
                        </div>
                    </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};