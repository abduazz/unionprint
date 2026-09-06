import React from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { OrdersList } from './components/orders/OrdersList';
import { CreateOrderModal } from './components/orders/CreateOrderModal';
import { OrderDetailModal } from './components/orders/OrderDetailModal';
import { ClientsView } from './components/clients/ClientsView';
import { EmployeesView } from './components/employees/EmployeesView';
import { AccountingView } from './components/accounting/AccountingView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SuperAdminView } from './components/superadmin/SuperAdminView';
import { LoginView } from './components/auth/LoginView';

const MainContent: React.FC = () => {
  const { activeTab } = useCRM();
  const { hasTabAccess, currentUser } = useAuth();

  return (
    <main className="flex-1 min-w-0 bg-neutral-50 p-4 md:p-8 min-h-screen overflow-y-auto">
      <Header />
      
      {activeTab === 'kanban' && hasTabAccess('kanban') && <KanbanBoard />}
      {activeTab === 'orders' && hasTabAccess('orders') && <OrdersList />}
      {activeTab === 'clients' && hasTabAccess('clients') && <ClientsView />}
      {activeTab === 'employees' && hasTabAccess('employees') && <EmployeesView />}
      {activeTab === 'accounting' && hasTabAccess('accounting') && <AccountingView />}
      {activeTab === 'analytics' && hasTabAccess('analytics') && <AnalyticsView />}
      {activeTab === 'superadmin' && currentUser?.isSuperAdmin && <SuperAdminView />}

      {/* Access Denied Warning if tab is not permitted */}
      {!hasTabAccess(activeTab) && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center max-w-md mx-auto mt-12 space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-base font-black">
            ✕
          </div>
          <h3 className="text-sm font-black text-neutral-900">Доступ ограничен</h3>
          <p className="text-xs text-neutral-500 font-bold leading-relaxed">
            У вашей учетной записи нет разрешения на просмотр данного модуля CRM. Обратитесь к главному администратору.
          </p>
        </div>
      )}

      {/* Global Modals */}
      <CreateOrderModal />
      <OrderDetailModal />
    </main>
  );
};

const CRMApp: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 font-mono text-neutral-800 antialiased selection:bg-black selection:text-white">
      <Sidebar />
      <MainContent />
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CRMProvider>
          <CRMApp />
        </CRMProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
