import React from 'react';
import { SocietyProvider, useSociety } from './context/SocietyContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomeView } from './components/views/HomeView';
import { MembersView } from './components/views/MembersView';
import { RegisterView } from './components/views/RegisterView';
import { LoansView } from './components/views/LoansView';
import { ManageView } from './components/views/ManageView';
import { CreateActionModal } from './components/modals/CreateActionModal';
import { QrModal } from './components/common/QrModal';
import { WhatsAppModal } from './components/common/WhatsAppModal';
import { LoginModal } from './components/auth/LoginModal';
import { PasswordChangeModal } from './components/modals/PasswordChangeModal';
import { BroadcastNotificationModal } from './components/modals/BroadcastNotificationModal';
import { PwaInstallModal } from './components/modals/PwaInstallModal';

const MainRouter: React.FC = () => {
  const { activeTab } = useSociety();

  return (
    <AppLayout>
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'members' && <MembersView />}
      {activeTab === 'register' && <RegisterView />}
      {activeTab === 'loans' && <LoansView />}
      {activeTab === 'manage' && <ManageView />}

      {/* Global Modals */}
      <CreateActionModal />
      <QrModal />
      <WhatsAppModal />
      <LoginModal />
      <PasswordChangeModal />
      <BroadcastNotificationModal />
      <PwaInstallModal />
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
