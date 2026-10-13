import React from 'react';
import { SocietyProvider, useSociety } from './context/SocietyContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomeView } from './components/views/HomeView';
import { MembersView } from './components/views/MembersView';
import { LoansView } from './components/views/LoansView';
import { ManageView } from './components/views/ManageView';
import { CreateActionModal } from './components/modals/CreateActionModal';
import { QrModal } from './components/common/QrModal';
import { WhatsAppModal } from './components/common/WhatsAppModal';

const MainRouter: React.FC = () => {
  const { activeTab } = useSociety();

  return (
    <AppLayout>
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'members' && <MembersView />}
      {activeTab === 'loans' && <LoansView />}
      {activeTab === 'manage' && <ManageView />}

      {/* Global Modals */}
      <CreateActionModal />
      <QrModal />
      <WhatsAppModal />
    </AppLayout>
  );
};

export function App() {
  return (
    <SocietyProvider>
      <MainRouter />
    </SocietyProvider>
  );
}

export default App;
