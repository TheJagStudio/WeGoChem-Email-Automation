import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Campaigns } from './components/Campaigns';
import { Leads } from './components/Leads';
import { Templates } from './components/Templates';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { BulkEmail } from './components/BulkEmail';
import { Documentation } from './components/Documentation';
import { Support } from './components/Support';
import { Inbox } from './components/Inbox';
import { ViewState } from './types';
import { ToastContainer } from './components/UIComponents';
import { initDB } from './mockData';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const startDB = async () => {
      await initDB();
      setDbReady(true);
    };
    startDB();
  }, []);

  const renderContent = () => {
    if (!dbReady) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inbox':
        return <Inbox />;
      case 'campaigns':
        return <Campaigns />;
      case 'leads':
        return <Leads />;
      case 'templates':
        return <Templates />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'bulk-email':
        return <BulkEmail />;
      case 'documentation':
        return <Documentation />;
      case 'support':
        return <Support />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
        <Layout currentView={currentView} onChangeView={setCurrentView}>
          {renderContent()}
        </Layout>
        <ToastContainer />
    </>
  );
};

export default App;