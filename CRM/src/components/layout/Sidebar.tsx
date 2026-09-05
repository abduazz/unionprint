import React from 'react';
import { 
  Kanban, 
  Layers, 
  Users, 
  UserCheck, 
  CreditCard, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  User as UserIcon 
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useLanguage } from '../../context/LanguageContext';
import type { ActiveTab, Language } from '../../types/crm';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    orders, 
    clients, 
    employees, 
    transactions 
  } = useCRM();

  const { language, setLanguage, t } = useLanguage();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { 
      id: 'kanban', 
      label: t('nav_kanban'), 
      icon: <Kanban className="w-4 h-4" />, 
      count: orders.filter(o => o.stage !== 'completed' && o.stage !== 'canceled').length 
    },
    { 
      id: 'orders', 
      label: t('nav_orders'), 
      icon: <Layers className="w-4 h-4" />, 
      count: orders.length 
    },
    { 
      id: 'clients', 
      label: t('nav_clients'), 
      icon: <Users className="w-4 h-4" />, 
      count: clients.length 
    },
    { 
      id: 'employees', 
      label: t('nav_employees'), 
      icon: <UserCheck className="w-4 h-4" />, 
      count: employees.filter(e => e.status === 'on_shift' || e.status === 'in_production').length 
    },
    { 
      id: 'accounting', 
      label: t('nav_accounting'), 
      icon: <CreditCard className="w-4 h-4" />, 
      count: transactions.length 
    },
    { 
      id: 'analytics', 
      label: t('nav_analytics'), 
      icon: <BarChart3 className="w-4 h-4" /> 
    },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: 'ru', label: 'RU' },
    { code: 'uz', label: 'UZ' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <aside 
      className={`h-screen sticky top-0 bg-white border-r border-neutral-200 flex flex-col justify-between transition-all duration-300 ease-in-out z-40 ${
        sidebarCollapsed ? 'w-20 p-3' : 'w-80 p-4'
      }`}
    >
      {/* Top Brand Header with Official UnionPrint Logo */}
      <div>
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-6 pb-4 border-b border-neutral-100`}>
          <div className="flex items-center gap-3 overflow-hidden">
            {!sidebarCollapsed ? (
              <div className="flex flex-col">
                <img 
                  src="/logo.png" 
                  alt="UnionPrint" 
                  className="h-10 w-auto object-contain max-w-[180px]" 
                />
                <span className="text-[8px] uppercase font-bold text-neutral-400 tracking-widest mt-1">
                  CRM & POLYGRAPHY
                </span>
              </div>
            ) : (
              <img 
                src="/logo.png" 
                alt="UnionPrint" 
                className="w-9 h-9 object-contain shrink-0" 
              />
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(prev => !prev)}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-black transition cursor-pointer shrink-0"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full transition-all duration-150 cursor-pointer ${
                  sidebarCollapsed 
                    ? `p-3 justify-center flex rounded-lg ${isActive ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'}`
                    : `px-4 py-2.5 flex items-center justify-between rounded-lg text-xs font-bold ${
                        isActive 
                          ? 'bg-black text-white shadow-xs' 
                          : 'hover:bg-neutral-100 text-neutral-600 hover:text-black'
                      }`
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 truncate">
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.count !== undefined && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Language Switcher & Profile Card */}
      <div className="space-y-3 pt-4 border-t border-neutral-100">
        {/* Language Switcher */}
        {!sidebarCollapsed ? (
          <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-1 rounded-lg">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`py-1 text-[10px] font-extrabold uppercase rounded-md transition cursor-pointer ${
                  language === lang.code 
                    ? 'bg-black text-white shadow-xs' 
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex justify-center">
            <button 
              onClick={() => {
                const nextLang: Record<Language, Language> = { ru: 'uz', uz: 'en', en: 'ru' };
                setLanguage(nextLang[language]);
              }}
              className="text-[10px] font-extrabold uppercase bg-neutral-100 hover:bg-black hover:text-white px-2 py-1 rounded-md text-neutral-700 transition cursor-pointer"
            >
              {language}
            </button>
          </div>
        )}

        {/* User profile card */}
        {!sidebarCollapsed ? (
          <div className="border border-neutral-200/60 p-3 rounded-xl shadow-2xs bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-[11px] font-black text-neutral-900 truncate leading-tight">
                  a.rakhimov@unionprint.uz
                </div>
                <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">
                  {t('user_role')}
                </div>
              </div>
            </div>
            <button 
              className="hover:bg-red-50 hover:text-red-600 p-1.5 rounded-lg text-neutral-400 transition cursor-pointer"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
              <UserIcon className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
