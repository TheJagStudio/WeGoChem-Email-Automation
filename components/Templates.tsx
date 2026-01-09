import React, { useState, useEffect } from 'react';
import { db } from '../mockData';
import { Card, Button, Input } from './UIComponents';
import { Search, Plus, FileText, Clock, Edit3, Trash2 } from 'lucide-react';
import { TemplateEditor } from './TemplateEditor';

export const Templates: React.FC = () => {
  const [templates, setTemplates] = useState(db.getTemplates());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(db.getTemplates());
  }, []);

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    setEditingTemplateId(id);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplateId(null);
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    setTemplates(db.getTemplates()); 
    setIsEditorOpen(false);
    setEditingTemplateId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.confirm('Are you sure you want to delete this template?')) {
          db.deleteTemplate(id);
          setTemplates(current => current.filter(t => t.id !== id));
      }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Template Library</h1>
           <p className="text-gray-500 mt-1 text-sm">Create, manage, and optimize your outreach assets.</p>
        </div>
        <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Template
        </Button>
      </div>

      <div className="flex space-x-4 items-center">
        <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
                placeholder="Search templates..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex space-x-2">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors border ${
                        selectedCategory === cat 
                        ? 'bg-brand-black text-white border-brand-black' 
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {filteredTemplates.map((template) => (
            <Card 
                key={template.id} 
                className="flex flex-col h-full hover:shadow-lg transition-all duration-200 group relative border-gray-200"
            >
                <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded border shadow-sm ${
                            template.category === 'Outreach' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                            template.category === 'Newsletter' ? 'bg-green-50 border-green-100 text-green-600' :
                            template.category === 'Event' ? 'bg-purple-50 border-purple-100 text-purple-600' :
                            'bg-gray-50 border-gray-100 text-gray-600'
                        }`}>
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex space-x-1 relative z-20">
                             <button 
                                onClick={(e) => handleEdit(e, template.id)}
                                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                                title="Edit Template"
                             >
                                <Edit3 className="h-4 w-4" />
                             </button>
                             {template.isSystem !== true && (
                                <button 
                                    onClick={(e) => handleDelete(e, template.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                    title="Delete Template"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                             )}
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-lg text-gray-900 mb-2 leading-tight">{template.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-medium">Subject: {template.subject}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-auto">
                        {template.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600 border border-gray-200">
                                {tag}
                            </span>
                        ))}
                         {template.isSystem === true && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-50 text-yellow-800 border border-yellow-200">
                                System
                            </span>
                        )}
                    </div>
                </div>
                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-lg flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500 font-medium">
                        <Clock className="h-3 w-3 mr-1" />
                        {template.lastModified}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{template.category}</span>
                </div>
            </Card>
        ))}
        
        {filteredTemplates.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-900">No templates found</h3>
                <p className="mb-6 text-sm">Try adjusting your search or create a new one.</p>
                <Button onClick={handleCreate}>Create Template</Button>
            </div>
        )}
      </div>

      {isEditorOpen && (
        <TemplateEditor 
            key={editingTemplateId || 'new'} 
            templateId={editingTemplateId} 
            onClose={() => setIsEditorOpen(false)} 
            onSave={handleSave}
        />
      )}
    </div>
  );
};