import React, { useEffect } from 'react';
import { 
  Kanban, 
  Layers, 
  Users, 
  UserCheck, 
  CreditCard, 
  BarChart3, 
  ShieldAlert,
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  ArrowLeftCircle
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useAuth } from '../../context/AuthContext';
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

  const { 
    currentUser, 
    hasTabAccess, 
    logout, 
    isImpersonating, 
    stopImpersonating 
  } = useAuth();

  const { language, setLanguage, t } = useLanguage();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; count?: number; highlight?: boolean }[] = [
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
    {
      id: 'superadmin',
      label: t('nav_superadmin'),
      icon: <ShieldAlert className="w-4 h-4 text-amber-500" />,
      highlight: true
    },
  ];

  const visibleNavItems = navItems.filter(item => hasTabAccess(item.id));

  // If currently active tab is not allowed, switch to first allowed tab
  useEffect(() => {
    if (visibleNavItems.length > 0 && !hasTabAccess(activeTab)) {
      setActiveTab(visibleNavItems[0].id);
    }
  }, [activeTab, visibleNavItems, hasTabAccess, setActiveTab]);

  const languages: { code: Language; label: string }[] = [
    { code: 'ru', label: 'RU' },
    { code: 'uz', label: 'UZ' },
    { code: 'en', label: 'EN' },
  ];

  const getRoleLabel = () => {
    if (!currentUser) return '';
    if (currentUser.isSuperAdmin) return 'СУПЕР АДМИНИСТРАТОР';
    const map: Record<string, string> = {
      admin: 'АДМИНИСТРАТОР',
      sales: 'МЕНЕДЖЕР ПРОДАЖ',
      operator: 'ПЕЧАТНИК / ОПЕРАТОР',
      designer: 'ГРАФИЧЕСКИЙ ДИЗАЙНЕР',
      postpress: 'МАСТЕР ПОСТПРЕССА',
      accountant: 'БУХГАЛТЕР',
    };
    return map[currentUser.role] || currentUser.role.toUpperCase();
  };

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
                src="/logo-icon.png" 
                alt="UnionPrint" 
                className="w-10 h-10 object-contain shrink-0" 
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

        {/* Impersonation Banner if super admin is viewing as worker */}
        {isImpersonating && !sidebarCollapsed && (
          <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
            <div className="text-[10px] font-black text-amber-900 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Просмотр под сотрудником
            </div>
            <p className="text-[10px] text-amber-800 font-bold leading-tight">
              Вы вошли от имени {currentUser?.name}
            </p>
            <button
              onClick={stopImpersonating}
              className="w-full mt-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg py-1 px-2 text-[10px] font-black transition cursor-pointer flex items-center justify-center gap-1"
            >
              <ArrowLeftCircle className="w-3 h-3" />
              <span>Вернуться в Супер Админ</span>
            </button>
          </div>
        )}

        {/* Navigation items */}
        <nav className="space-y-1">
          {visibleNavItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full transition-all duration-150 cursor-pointer ${
                  sidebarCollapsed 
                    ? `p-3 justify-center flex rounded-lg ${
                        isActive 
                          ? 'bg-black text-white' 
                          : item.highlight 
                          ? 'text-amber-600 hover:bg-amber-50' 
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                      }`
                    : `px-4 py-2.5 flex items-center justify-between rounded-lg text-xs font-bold ${
                        isActive 
                          ? 'bg-black text-white shadow-xs' 
                          : item.highlight
                          ? 'bg-amber-50/70 text-amber-900 hover:bg-amber-100/70 border border-amber-200/60'
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
                {!sidebarCollapsed && item.highlight && !isActive && (
                  <span className="text-[9px] font-black uppercase bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                    Root
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

        {/* Real User profile card with active session */}
        {currentUser && (
          !sidebarCollapsed ? (
            <div className="border border-neutral-200/60 p-3 rounded-xl shadow-2xs bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className={`w-8 h-8 rounded-lg ${currentUser.avatarBg || 'bg-black'} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}>
                  {currentUser.name
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-black text-neutral-900 truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[9px] font-bold text-neutral-400 truncate mt-0.5">
                    {currentUser.email}
                  </div>
                  <div className="text-[8px] font-black text-neutral-500 uppercase tracking-wider mt-0.5">
                    {getRoleLabel()}
                  </div>
                </div>
              </div>
              <button 
                onClick={logout}
                className="hover:bg-red-50 hover:text-red-600 p-1.5 rounded-lg text-neutral-400 transition cursor-pointer shrink-0"
                title="Выйти из системы"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div 
                className={`w-8 h-8 rounded-lg ${currentUser.avatarBg || 'bg-black'} text-white flex items-center justify-center shadow-xs font-black text-xs`}
                title={`${currentUser.name} (${currentUser.email})`}
              >
                {currentUser.name
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <button 
                onClick={logout}
                className="text-neutral-400 hover:text-red-600 p-1 transition cursor-pointer"
                title="Выйти"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        )}
      </div>
    </aside>
  );
};

