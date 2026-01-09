import React, { useState, useEffect } from 'react';
import { Card, Button, Input, toast } from './UIComponents';
import { db } from '../mockData';
import { AppSettings } from '../types';
import { Save, Settings as SettingsIcon, Globe, Mail, Shield } from 'lucide-react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    organizationName: '',
    timezone: '',
    dailySendLimit: 0,
    autoResponders: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = () => {
      const data = db.getSettings();
      setSettings(data);
      setLoading(false);
    };
    loadSettings();
  }, []);

  const handleSave = () => {
    db.saveSettings(settings);
    toast.success("Settings saved successfully");
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage organization details and system configurations.</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar (Visual only for demo) */}
        <Card className="p-4 h-fit">
          <nav className="space-y-1">
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md bg-brand-light text-brand-black font-medium">
              <SettingsIcon className="h-4 w-4" />
              <span>General</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50">
              <Mail className="h-4 w-4" />
              <span>Email Setup</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </button>
          </nav>
        </Card>

        {/* Form Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Organization Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <Input 
                  value={settings.organizationName} 
                  onChange={(e) => setSettings({...settings, organizationName: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Default Timezone</label>
                   <select 
                      className="block w-full rounded border-gray-300 bg-white shadow-sm focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow sm:text-sm p-2"
                      value={settings.timezone}
                      onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                   >
                     <option>UTC-5 (EST)</option>
                     <option>UTC-8 (PST)</option>
                     <option>UTC+0 (GMT)</option>
                     <option>UTC+1 (CET)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                   <Input value="USD" disabled className="bg-gray-50 text-gray-500" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Sending Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Email Limit</label>
                <div className="flex items-center">
                  <Input 
                    type="number"
                    value={settings.dailySendLimit} 
                    onChange={(e) => setSettings({...settings, dailySendLimit: parseInt(e.target.value)})} 
                    className="max-w-[150px]"
                  />
                  <span className="ml-3 text-sm text-gray-500">emails / day</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Limits help maintain domain reputation during warm-up.</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                 <div>
                    <h4 className="text-sm font-medium text-gray-900">Auto-Responders</h4>
                    <p className="text-xs text-gray-500">Automatically reply to common queries using AI.</p>
                 </div>
                 <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                      type="checkbox" 
                      name="toggle" 
                      id="toggle" 
                      checked={settings.autoResponders}
                      onChange={(e) => setSettings({...settings, autoResponders: e.target.checked})}
                      className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-brand-yellow"
                    />
                    <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${settings.autoResponders ? 'bg-brand-yellow' : 'bg-gray-300'}`}></label>
                 </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};