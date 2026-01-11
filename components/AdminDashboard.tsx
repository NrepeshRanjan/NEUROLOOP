
import React, { useState, useEffect } from 'react';
import { AuthSession } from '@supabase/supabase-js';
import { Button } from './Button';
import { supabase, fetchAppConfig, fetchPublicPages } from '../services/supabaseService';
import { AppConfig, PublicPage } from '../types';

interface AdminDashboardProps {
  onClose: () => void;
  onSignOut: () => void;
  session: AuthSession;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onSignOut, session }) => {
  const [activeTab, setActiveTab] = useState<'ads' | 'cms'>('ads');
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [pages, setPages] = useState<PublicPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [cfg, pgs] = await Promise.all([fetchAppConfig(), fetchPublicPages()]);
    setConfig(cfg);
    setPages(pgs);
    setLoading(false);
  };

  const updateConfig = async (key: keyof AppConfig, value: any) => {
    if (!config) return;
    setStatusMsg('Syncing...');
    
    // Optimistic update
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);

    const { error } = await supabase
      .from('app_config')
      .update({ [key]: value, updated_by: session.user.id })
      .eq('id', config.id);

    if (error) {
      console.error('Update failed:', error);
      setStatusMsg('Failed to sync.');
      // Revert logic would go here
    } else {
      setStatusMsg('Synced.');
      setTimeout(() => setStatusMsg(''), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl relative border border-indigo-500/30 text-white flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 rounded-t-xl">
          <div>
             <h3 className="text-xl font-black text-indigo-400 tracking-tight">SYSTEM TERMINAL</h3>
             <p className="text-xs text-gray-500 font-mono">Admin: {session.user.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button 
            onClick={() => setActiveTab('ads')}
            className={`flex-1 py-3 text-sm font-bold tracking-wide ${activeTab === 'ads' ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            AD CONTROL NODE
          </button>
          <button 
            onClick={() => setActiveTab('cms')}
            className={`flex-1 py-3 text-sm font-bold tracking-wide ${activeTab === 'cms' ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            CMS / PAGES
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && <p className="text-center text-gray-500 animate-pulse">Establishing uplink...</p>}

          {activeTab === 'ads' && config && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase">Global Ad Switches</h4>
                <div className="space-y-3">
                  <Toggle 
                    label="Global Ads Enabled" 
                    checked={config.global_ads_enabled} 
                    onChange={(v) => updateConfig('global_ads_enabled', v)} 
                  />
                  <Toggle 
                    label="Interstitial Ads" 
                    checked={config.interstitial_enabled} 
                    onChange={(v) => updateConfig('interstitial_enabled', v)} 
                  />
                  <Toggle 
                    label="Rewarded Ads" 
                    checked={config.rewarded_enabled} 
                    onChange={(v) => updateConfig('rewarded_enabled', v)} 
                  />
                   <Toggle 
                    label="Banner Ads" 
                    checked={config.banner_enabled} 
                    onChange={(v) => updateConfig('banner_enabled', v)} 
                  />
                </div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase">Frequency Config</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Min Gap (Seconds)</span>
                  <input 
                    type="number" 
                    value={config.min_gap_seconds}
                    onChange={(e) => updateConfig('min_gap_seconds', parseInt(e.target.value))}
                    className="bg-gray-900 border border-gray-600 rounded w-20 px-2 py-1 text-right"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cms' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-gray-300 uppercase">Active Public Pages</h4>
                <span className="text-xs text-gray-500">{pages.length} records</span>
              </div>
              
              {pages.map(page => (
                <div key={page.id} className="bg-gray-800/30 p-3 rounded border border-gray-700 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-indigo-300 text-sm">{page.title}</p>
                    <p className="text-xs text-gray-500 font-mono">/{page.slug}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${page.is_active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    {page.is_active ? 'Active' : 'Draft'}
                  </span>
                </div>
              ))}
              
              {pages.length === 0 && !loading && (
                <p className="text-sm text-gray-500 text-center py-4">No pages found in registry.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900 rounded-b-xl flex justify-between items-center">
          <span className="text-xs text-indigo-400 font-mono">{statusMsg}</span>
          <Button onClick={onSignOut} className="bg-red-900/50 hover:bg-red-800 text-xs py-2 px-4 border border-red-500/30">
            DISCONNECT
          </Button>
        </div>
      </div>
    </div>
  );
};

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (val: boolean) => void }> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-300">{label}</span>
    <button 
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${checked ? 'bg-indigo-600' : 'bg-gray-700'}`}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  </div>
);

export { AdminDashboard };
