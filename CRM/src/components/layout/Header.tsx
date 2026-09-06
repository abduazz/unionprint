import React from 'react';
import { Plus, Download, Search, ArrowLeftCircle, AlertTriangle } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { exportOrdersToCSV, exportClientsToCSV, exportTransactionsToCSV } from '../../utils/exportToCsv';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    orders,
    clients,
    transactions,
    searchQuery, 
    setSearchQuery, 
    categoryFilter, 
    setCategoryFilter,
    setIsCreateOrderModalOpen,
    setIsCreateClientModalOpen,
    setIsCreateEmployeeModalOpen,
    setIsTransactionModalOpen
  } = useCRM();

  const { isImpersonating, currentUser, stopImpersonating } = useAuth();
  const { t } = useLanguage();

  const getPageInfo = () => {
    switch (activeTab) {
      case 'kanban':
        return { title: t('nav_kanban'), subtitle: t('kanban_subtitle') };
      case 'orders':
        return { title: t('nav_orders'), subtitle: t('orders_subtitle') };
      case 'clients':
        return { title: t('nav_clients'), subtitle: t('clients_subtitle') };
      case 'employees':
        return { title: t('nav_employees'), subtitle: t('employees_subtitle') };
      case 'accounting':
        return { title: t('nav_accounting'), subtitle: t('accounting_subtitle') };
      case 'analytics':
        return { title: t('nav_analytics'), subtitle: t('analytics_subtitle') };
      case 'superadmin':
        return { title: t('nav_superadmin'), subtitle: t('superadmin_subtitle') };
      default:
        return { title: 'UnionPrint CRM', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageInfo();

  const handlePrimaryAction = () => {
    if (activeTab === 'clients') {
      setIsCreateClientModalOpen(true);
    } else if (activeTab === 'employees') {
      setIsCreateEmployeeModalOpen(true);
    } else if (activeTab === 'accounting') {
      setIsTransactionModalOpen(true);
    } else {
      setIsCreateOrderModalOpen(true);
    }
  };

  const handleExport = () => {
    if (activeTab === 'clients') {
      exportClientsToCSV(clients);
    } else if (activeTab === 'accounting') {
      exportTransactionsToCSV(transactions);
    } else {
      exportOrdersToCSV(orders);
    }
  };

  const getPrimaryButtonText = () => {
    if (activeTab === 'clients') return t('btn_new_client');
    if (activeTab === 'employees') return t('btn_new_employee');
    if (activeTab === 'accounting') return t('btn_add_transaction');
    return t('btn_new_order');
  };

  return (
    <div>
      {/* Impersonation alert banner */}
      {isImpersonating && (
        <div className="mb-4 bg-amber-500 text-black px-4 py-2.5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs font-black">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-black shrink-0" />
            <span>
              Внимание: Вы находитесь в режиме проверки интерфейса от имени сотрудника: {currentUser?.name} ({currentUser?.email})
            </span>
          </div>
          <button
            onClick={stopImpersonating}
            className="bg-black text-white hover:bg-neutral-800 px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ArrowLeftCircle className="w-3.5 h-3.5" />
            <span>Вернуться в профиль Супер Админа</span>
          </button>
        </div>
      )}

      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left side title & subtitle */}
        <div>
          <h1 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-neutral-500 font-bold mt-0.5">
            {subtitle}
          </p>
        </div>

      {/* Right side actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="pl-9 pr-4 py-2 rounded-lg border border-neutral-200 text-xs focus:ring-1 focus:ring-black focus:border-black outline-none w-48 md:w-64 bg-white shadow-2xs font-bold transition"
          />
        </div>

        {/* Category filter select */}
        {(activeTab === 'kanban' || activeTab === 'orders') && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-700 hover:bg-neutral-50 focus:ring-1 focus:ring-black outline-none shadow-2xs transition cursor-pointer"
          >
            <option value="all">{t('all_categories')}</option>
            <option value="business_cards">{t('cat_business_cards')}</option>
            <option value="flyers">{t('cat_flyers')}</option>
            <option value="catalogs">{t('cat_catalogs')}</option>
            <option value="banners">{t('cat_banners')}</option>
            <option value="packaging">{t('cat_packaging')}</option>
            <option value="souvenirs">{t('cat_souvenirs')}</option>
            <option value="large_format">{t('cat_large_format')}</option>
          </select>
        )}

        {/* Export action button */}
        <button 
          onClick={handleExport}
          className="bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-lg px-4 py-2 text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer active:scale-[0.98]"
        >
          <Download className="w-4 h-4 text-neutral-500" />
          <span className="hidden sm:inline">{t('btn_export')}</span>
        </button>

        {/* Primary Action Button */}
        <button
          onClick={handlePrimaryAction}
          className="bg-black hover:bg-neutral-800 text-white rounded-lg px-4 py-2 text-xs font-bold shadow-xs active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{getPrimaryButtonText()}</span>
        </button>
      </div>
    </header>
    </div>
  );
};

