import React from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { LanguageProvider } from './context/LanguageContext';
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

const MainContent: React.FC = () => {
  const { activeTab } = useCRM();

  return (
    <main className="flex-1 min-w-0 bg-neutral-50 p-4 md:p-8 min-h-screen overflow-y-auto">
      <Header />
      
      {activeTab === 'kanban' && <KanbanBoard />}
      {activeTab === 'orders' && <OrdersList />}
      {activeTab === 'clients' && <ClientsView />}
      {activeTab === 'employees' && <EmployeesView />}
      {activeTab === 'accounting' && <AccountingView />}
      {activeTab === 'analytics' && <AnalyticsView />}

      {/* Global Modals */}
      <CreateOrderModal />
      <OrderDetailModal />
    </main>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <CRMProvider>
        <div className="flex min-h-screen bg-neutral-50 font-mono text-neutral-800 antialiased selection:bg-black selection:text-white">
          <Sidebar />
          <MainContent />
        </div>
      </CRMProvider>
    </LanguageProvider>
  );
}

export default App;
