import React, { useState } from 'react';
import { 
  ShieldAlert, 
  UserPlus, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Search, 
  Lock, 
  Unlock, 
  LogIn, 
  Trash2, 
  Edit3, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { useAuth, ROLE_DEFAULT_PERMISSIONS } from '../../context/AuthContext';
import { useCRM } from '../../context/CRMContext';
import type { UserAccount, UserPermissions, UserRole } from '../../types/crm';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

export const SuperAdminView: React.FC = () => {
  const { 
    currentUser, 
    accounts, 
    auditLogs, 
    createWorkerAccount, 
    updateAccount, 
    deleteAccount, 
    toggleAccountStatus, 
    impersonateUser,
    clearAuditLogs 
  } = useAuth();

  const { addEmployee } = useCRM();

  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'matrix' | 'audit'>('accounts');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuperAdminPasswordModalOpen, setIsSuperAdminPasswordModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);

  // Passwords visibility toggle map (accountId -> boolean)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Worker Form state
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [newWorkerPassword, setNewWorkerPassword] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('+998 ');
  const [newWorkerRole, setNewWorkerRole] = useState<UserRole>('sales');
  const [newWorkerPermissions, setNewWorkerPermissions] = useState<UserPermissions>({
    ...ROLE_DEFAULT_PERMISSIONS['sales'],
  });
  const [syncWithProductionRoster, setSyncWithProductionRoster] = useState(true);
  const [newWorkerNotes, setNewWorkerNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('sales');
  const [editPermissions, setEditPermissions] = useState<UserPermissions>({
    ...ROLE_DEFAULT_PERMISSIONS['sales'],
  });
  const [editNotes, setEditNotes] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Super admin password form state
  const [superNewPassword, setSuperNewPassword] = useState('');
  const [superConfirmPassword, setSuperConfirmPassword] = useState('');
  const [superSuccessMsg, setSuperSuccessMsg] = useState<string | null>(null);
  const [superErrorMsg, setSuperErrorMsg] = useState<string | null>(null);

  // Helper functions
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = 'UP-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleApplyRolePreset = (role: UserRole, isEdit: boolean = false) => {
    const preset = ROLE_DEFAULT_PERMISSIONS[role] || ROLE_DEFAULT_PERMISSIONS['sales'];
    if (isEdit) {
      setEditRole(role);
      setEditPermissions({ ...preset });
    } else {
      setNewWorkerRole(role);
      setNewWorkerPermissions({ ...preset });
    }
  };

  const handleCopyPassword = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenCreate = () => {
    setNewWorkerName('');
    setNewWorkerEmail('');
    setNewWorkerPassword(generateRandomPassword());
    setNewWorkerPhone('+998 ');
    setNewWorkerRole('sales');
    setNewWorkerPermissions({ ...ROLE_DEFAULT_PERMISSIONS['sales'] });
    setNewWorkerNotes('');
    setSyncWithProductionRoster(true);
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const res = createWorkerAccount({
      name: newWorkerName,
      email: newWorkerEmail,
      password: newWorkerPassword,
      phone: newWorkerPhone,
      role: newWorkerRole,
      permissions: newWorkerPermissions,
      notes: newWorkerNotes,
    });

    if (!res.success) {
      setFormError(res.error || 'Ошибка при создании аккаунта');
      return;
    }

    if (syncWithProductionRoster) {
      addEmployee({
        name: newWorkerName,
        email: newWorkerEmail,
        phone: newWorkerPhone,
        role: newWorkerRole === 'super_admin' ? 'admin' : newWorkerRole,
        status: 'on_shift',
        monthlyTargetAmount: 50000000,
        avatarBg: 'bg-black',
      });
    }

    setIsCreateModalOpen(false);
  };

  const handleOpenEdit = (acc: UserAccount) => {
    setEditingAccount(acc);
    setEditName(acc.name);
    setEditEmail(acc.email);
    setEditPassword(acc.password);
    setEditPhone(acc.phone || '');
    setEditRole(acc.role);
    setEditPermissions({ ...acc.permissions });
    setEditNotes(acc.notes || '');
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    setEditError(null);

    if (!editName.trim() || !editEmail.trim() || !editPassword.trim()) {
      setEditError('Заполните обязательные поля');
      return;
    }

    updateAccount(editingAccount.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      password: editPassword,
      phone: editPhone.trim(),
      role: editRole,
      permissions: editPermissions,
      notes: editNotes.trim(),
    });

    setIsEditModalOpen(false);
    setEditingAccount(null);
  };

  const handleChangeSuperAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSuperErrorMsg(null);
    setSuperSuccessMsg(null);

    if (!superNewPassword || superNewPassword.length < 4) {
      setSuperErrorMsg('Пароль должен быть не менее 4 символов');
      return;
    }
    if (superNewPassword !== superConfirmPassword) {
      setSuperErrorMsg('Пароли не совпадают');
      return;
    }

    const superAcc = accounts.find(a => a.isSuperAdmin);
    if (superAcc) {
      updateAccount(superAcc.id, { password: superNewPassword });
      setSuperSuccessMsg('Пароль Супер Администратора успешно обновлен!');
      setTimeout(() => {
        setIsSuperAdminPasswordModalOpen(false);
        setSuperNewPassword('');
        setSuperConfirmPassword('');
        setSuperSuccessMsg(null);
      }, 1500);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'black';
      case 'admin':
        return 'purple';
      case 'sales':
        return 'emerald';
      case 'operator':
        return 'sky';
      case 'designer':
        return 'indigo';
      case 'postpress':
        return 'amber';
      case 'accountant':
        return 'teal';
      default:
        return 'neutral';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    const map: Record<UserRole, string> = {
      super_admin: 'Супер Администратор',
      admin: 'Администратор',
      sales: 'Менеджер продаж',
      operator: 'Печатник (Оператор)',
      designer: 'Графический дизайнер',
      postpress: 'Мастер постпресса',
      accountant: 'Бухгалтер',
    };
    return map[role] || role;
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = 
      acc.name.toLowerCase().includes(search.toLowerCase()) ||
      acc.email.toLowerCase().includes(search.toLowerCase()) ||
      (acc.phone && acc.phone.includes(search));

    const matchesRole = roleFilter === 'all' || acc.role === roleFilter;
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && acc.isActive) ||
      (statusFilter === 'blocked' && !acc.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(a => a.isActive).length;
  const superAdminsCount = accounts.filter(a => a.isSuperAdmin).length;
  const workersCount = accounts.filter(a => !a.isSuperAdmin).length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Super Admin Center */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 border border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-neutral-800/40 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-white text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <ShieldAlert className="w-3 h-3 text-red-600" />
                Панель Супер Администратора
              </span>
              <span className="text-neutral-400 text-xs font-bold">
                Вход: {currentUser?.email}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Центр управления доступом и персоналом
            </h2>
            <p className="text-xs text-neutral-300 font-bold leading-relaxed">
              Создавайте профили работников с индивидуальными логинами и паролями, назначайте персональные права доступа к модулям CRM и контролируйте безопасность типографии.
            </p>
          </div>

          {/* Quick Super Admin Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsSuperAdminPasswordModalOpen(true)}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-neutral-400" />
              <span>Сменить пароль Супер Админа</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="bg-white hover:bg-neutral-100 text-black rounded-xl px-4 py-2 text-xs font-black flex items-center gap-2 shadow-sm transition cursor-pointer active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              <span>Создать профиль работника</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-neutral-800/80">
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
            <div className="text-[10px] uppercase font-bold text-neutral-400">Всего аккаунтов</div>
            <div className="text-xl font-black text-white mt-1">{totalAccounts}</div>
          </div>
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
            <div className="text-[10px] uppercase font-bold text-neutral-400">Сотрудников в CRM</div>
            <div className="text-xl font-black text-emerald-400 mt-1">{workersCount}</div>
          </div>
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
            <div className="text-[10px] uppercase font-bold text-neutral-400">Активных сессий</div>
            <div className="text-xl font-black text-white mt-1">{activeAccounts}</div>
          </div>
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
            <div className="text-[10px] uppercase font-bold text-neutral-400">Супер Администраторов</div>
            <div className="text-xl font-black text-white mt-1">{superAdminsCount}</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'accounts'
              ? 'bg-black text-white shadow-xs'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Учетные записи работников ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'matrix'
              ? 'bg-black text-white shadow-xs'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Матрица прав доступа по ролям</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'audit'
              ? 'bg-black text-white shadow-xs'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Журнал безопасности ({auditLogs.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: Accounts List */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-4">
          {/* Filters and Search Bar */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Поиск по имени, логину, телефону..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold outline-none focus:border-black"
                />
              </div>

              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-700 outline-none cursor-pointer"
              >
                <option value="all">Все должности / роли</option>
                <option value="super_admin">Супер Администратор</option>
                <option value="sales">Менеджер продаж</option>
                <option value="operator">Печатник (Оператор)</option>
                <option value="designer">Графический дизайнер</option>
                <option value="postpress">Мастер постпресса</option>
                <option value="accountant">Бухгалтер</option>
                <option value="admin">Администратор</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-700 outline-none cursor-pointer"
              >
                <option value="all">Все статусы</option>
                <option value="active">Только активные</option>
                <option value="blocked">Заблокированные</option>
              </select>
            </div>

            <button
              onClick={handleOpenCreate}
              className="bg-black hover:bg-neutral-800 text-white rounded-lg px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer self-end md:self-auto shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Новый работник</span>
            </button>
          </div>

          {/* Accounts Table */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[10px] font-black text-neutral-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Сотрудник / Профиль</th>
                    <th className="py-3 px-4">Логин (Email)</th>
                    <th className="py-3 px-4">Пароль</th>
                    <th className="py-3 px-4">Должность</th>
                    <th className="py-3 px-4">Разрешенные разделы CRM</th>
                    <th className="py-3 px-4 text-center">Статус</th>
                    <th className="py-3 px-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs font-bold">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-400 font-bold">
                        Аккаунты не найдены. Создайте первый профиль работника.
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map(acc => {
                      const isPwVisible = Boolean(visiblePasswords[acc.id]);

                      return (
                        <tr key={acc.id} className="hover:bg-neutral-50/70 transition-colors">
                          {/* Name & Avatar */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl ${
                                  acc.avatarBg || 'bg-black'
                                } text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}
                              >
                                {acc.name
                                  .split(' ')
                                  .map(w => w[0])
                                  .slice(0, 2)
                                  .join('')}
                              </div>
                              <div>
                                <div className="font-black text-neutral-900 flex items-center gap-2">
                                  <span>{acc.name}</span>
                                  {acc.isSuperAdmin && (
                                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                      Супер Админ
                                    </span>
                                  )}
                                </div>
                                {acc.phone && (
                                  <div className="text-[11px] text-neutral-400 font-mono">
                                    {acc.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Email / Login */}
                          <td className="py-3 px-4 font-mono text-neutral-800">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate max-w-[200px]">{acc.email}</span>
                              <button
                                onClick={() => handleCopyPassword(acc.id + '-email', acc.email)}
                                title="Скопировать логин"
                                className="text-neutral-400 hover:text-black transition cursor-pointer p-0.5"
                              >
                                {copiedId === acc.id + '-email' ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Password */}
                          <td className="py-3 px-4 font-mono">
                            <div className="inline-flex items-center gap-1.5 bg-neutral-100 px-2 py-1 rounded-lg border border-neutral-200/80">
                              <span className="text-xs font-black text-neutral-900">
                                {isPwVisible ? acc.password : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(acc.id)}
                                className="text-neutral-400 hover:text-black transition cursor-pointer p-0.5"
                                title={isPwVisible ? 'Скрыть пароль' : 'Показать пароль'}
                              >
                                {isPwVisible ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleCopyPassword(acc.id, acc.password)}
                                title="Скопировать пароль"
                                className="text-neutral-400 hover:text-black transition cursor-pointer p-0.5"
                              >
                                {copiedId === acc.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-4">
                            <Badge variant={getRoleBadgeVariant(acc.role)}>
                              {getRoleLabel(acc.role)}
                            </Badge>
                          </td>

                          {/* Permissions badging */}
                          <td className="py-3 px-4">
                            {acc.isSuperAdmin ? (
                              <span className="text-[10px] font-black text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 uppercase">
                                Полный доступ ко всем разделам (Root)
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {acc.permissions.kanban && (
                                  <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                                    Канбан
                                  </span>
                                )}
                                {acc.permissions.orders && (
                                  <span className="text-[9px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                                    Заказы
                                  </span>
                                )}
                                {acc.permissions.clients && (
                                  <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                    Клиенты
                                  </span>
                                )}
                                {acc.permissions.employees && (
                                  <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                                    Персонал
                                  </span>
                                )}
                                {acc.permissions.accounting && (
                                  <span className="text-[9px] font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                                    Учет & Склад
                                  </span>
                                )}
                                {acc.permissions.analytics && (
                                  <span className="text-[9px] font-bold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
                                    Аналитика
                                  </span>
                                )}
                                {acc.permissions.canDeleteOrders && (
                                  <span className="text-[9px] font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                                    Удаление
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center">
                            {acc.isSuperAdmin ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                Бессрочно
                              </span>
                            ) : (
                              <button
                                onClick={() => toggleAccountStatus(acc.id)}
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition cursor-pointer ${
                                  acc.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                }`}
                                title={acc.isActive ? 'Заблокировать доступ' : 'Активировать доступ'}
                              >
                                {acc.isActive ? (
                                  <>
                                    <Unlock className="w-3 h-3" />
                                    <span>Активен</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3 h-3" />
                                    <span>Заблокирован</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!acc.isSuperAdmin && (
                                <button
                                  onClick={() => impersonateUser(acc.id)}
                                  className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                                  title="Войти под этим сотрудником (Проверить вид интерфейса)"
                                >
                                  <LogIn className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEdit(acc)}
                                className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                                title="Редактировать данные и права"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {!acc.isSuperAdmin && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Удалить учетную запись "${acc.name}" (${acc.email})?`)) {
                                      deleteAccount(acc.id);
                                    }
                                  }}
                                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                  title="Удалить аккаунт"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Role Permissions Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-neutral-900">
              Стандартная матрица шаблонов доступа по должностям
            </h3>
            <p className="text-xs text-neutral-500 font-bold">
              При создании работника выбор должности автоматически применяет рекомендованные права доступа. При необходимости вы можете изменить любые галочки индивидуально.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3">
              {(['sales', 'operator', 'designer', 'postpress', 'accountant', 'admin'] as UserRole[]).map(role => {
                const perms = ROLE_DEFAULT_PERMISSIONS[role];
                return (
                  <div
                    key={role}
                    className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/50 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={getRoleBadgeVariant(role)}>
                          {getRoleLabel(role)}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 text-[11px] font-bold text-neutral-600">
                        <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                          <span>Канбан воронка:</span>
                          <span>{perms.kanban ? '✅ Да' : '❌ Нет'}</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                          <span>Реестр заказов:</span>
                          <span>{perms.orders ? '✅ Да' : '❌ Нет'}</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                          <span>Клиенты & Лиды:</span>
                          <span>{perms.clients ? '✅ Да' : '❌ Нет'}</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                          <span>Персонал & Смены:</span>
                          <span>{perms.employees ? '✅ Да' : '❌ Нет'}</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                          <span>Учет & Склад сырья:</span>
                          <span>{perms.accounting ? '✅ Да' : '❌ Нет'}</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                          <span>Аналитика & Отчеты:</span>
                          <span>{perms.analytics ? '✅ Да' : '❌ Нет'}</span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                          <span>Удаление заказов:</span>
                          <span>{perms.canDeleteOrders ? '⚠️ Разрешено' : '❌ Запрещено'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        handleOpenCreate();
                        handleApplyRolePreset(role, false);
                      }}
                      className="w-full mt-3 bg-neutral-200 hover:bg-neutral-800 hover:text-white text-neutral-800 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer"
                    >
                      Создать работника ({getRoleLabel(role)})
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Audit Logs */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-neutral-900">
                  Журнал безопасности и активности пользователей
                </h3>
                <p className="text-xs text-neutral-500 font-bold">
                  Логирование входов в систему, создания аккаунтов, смены паролей и изменения прав
                </p>
              </div>
              <button
                onClick={clearAuditLogs}
                className="text-xs font-bold text-neutral-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition cursor-pointer"
              >
                Очистить журнал
              </button>
            </div>

            <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100 max-h-[550px] overflow-y-auto font-mono">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-400 font-bold">
                  Журнал пока пуст
                </div>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="p-3 text-xs flex items-start justify-between gap-4 hover:bg-neutral-50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-neutral-900">{log.action}</span>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-neutral-100 text-neutral-600">
                          {log.actorEmail}
                        </span>
                      </div>
                      <div className="text-neutral-600">{log.details}</div>
                    </div>
                    <div className="text-[10px] text-neutral-400 shrink-0">
                      {new Date(log.timestamp).toLocaleString('ru-RU')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE WORKER ACCOUNT */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Создание профиля работника"
        subtitle="Добавление учетной записи с логином, паролем и персональными правами доступа"
        maxWidthClass="max-w-3xl"
      >
        <form onSubmit={handleSubmitCreate} className="space-y-5">
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-1.5">
              1. Данные для авторизации и профиль
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  ФИО Сотрудника *
                </label>
                <input
                  type="text"
                  required
                  value={newWorkerName}
                  onChange={e => setNewWorkerName(e.target.value)}
                  placeholder="Сардор Ахмедов"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Email / Логин (для входа в систему) *
                </label>
                <input
                  type="email"
                  required
                  value={newWorkerEmail}
                  onChange={e => setNewWorkerEmail(e.target.value)}
                  placeholder="sardor@unionprint.uz"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold outline-none focus:border-black"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-neutral-700">
                    Пароль учетной записи *
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewWorkerPassword(generateRandomPassword())}
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Сгенерировать</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newWorkerPassword}
                  onChange={e => setNewWorkerPassword(e.target.value)}
                  placeholder="UP-7x8k2"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-mono font-bold outline-none focus:border-black bg-neutral-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Телефон сотрудника
                </label>
                <input
                  type="text"
                  value={newWorkerPhone}
                  onChange={e => setNewWorkerPhone(e.target.value)}
                  placeholder="+998 90 123-45-67"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Role and Presets */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-1.5">
              <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                2. Должность и быстрые шаблоны
              </h4>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-neutral-400">Шаблоны:</span>
                {(['sales', 'operator', 'designer', 'postpress', 'accountant', 'admin'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleApplyRolePreset(r, false)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border transition cursor-pointer ${
                      newWorkerRole === r
                        ? 'bg-black text-white border-black'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                    }`}
                  >
                    {getRoleLabel(r)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Основная роль / должность
              </label>
              <select
                value={newWorkerRole}
                onChange={e => handleApplyRolePreset(e.target.value as UserRole, false)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-800 outline-none cursor-pointer"
              >
                <option value="sales">Менеджер продаж</option>
                <option value="operator">Печатник (Оператор)</option>
                <option value="designer">Графический дизайнер</option>
                <option value="postpress">Мастер постпресса</option>
                <option value="accountant">Бухгалтер</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
          </div>

          {/* Section 3: Granular Permissions */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-1.5">
              3. Настройка разрешений и доступа к модулям CRM
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={newWorkerPermissions.kanban}
                  onChange={e =>
                    setNewWorkerPermissions(prev => ({ ...prev, kanban: e.target.checked }))
                  }
                  className="mt-0.5 rounded accent-black cursor-pointer"
                />
                <div>
                  <div className="text-xs font-black text-neutral-900">Канбан Доска</div>
                  <div className="text-[10px] text-neutral-500 font-bold">
                    Воронка заказов типографии
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={newWorkerPermissions.orders}
                  onChange={e =>
                    setNewWorkerPermissions(prev => ({ ...prev, orders: e.target.checked }))
                  }
                  className="mt-0.5 rounded accent-black cursor-pointer"
                />
                <div>
                  <div className="text-xs font-black text-neutral-900">Все Заказы</div>
                  <div className="text-[10px] text-neutral-500 font-bold">
                    Реестр и карточки заказов
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={newWorkerPermissions.clients}
                  onChange={e =>
                    setNewWorkerPermissions(prev => ({ ...prev, clients: e.target.checked }))
                  }
                  className="mt-0.5 rounded accent-black cursor-pointer"
                />
                <div>
                  <div className="text-xs font-black text-neutral-900">Клиенты & Лиды</div>
                  <div className="text-[10px] text-neutral-500 font-bold">
                    База заказчиков и VIP-клиентов
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={newWorkerPermissions.employees}
                  onChange={e =>
                    setNewWorkerPermissions(prev => ({ ...prev, employees: e.target.checked }))
                  }
                  className="mt-0.5 rounded accent-black cursor-pointer"
                />
                <div>
                  <div className="text-xs font-black text-neutral-900">Персонал & Производство</div>
                  <div className="text-[10px] text-neutral-500 font-bold">
                    Смены и загрузка мастеров
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={newWorkerPermissions.accounting}
                  onChange={e =>
                    setNewWorkerPermissions(prev => ({ ...prev, accounting: e.target.checked }))
                  }
                  className="mt-0.5 rounded accent-black cursor-pointer"
                />
                <div>
                  <div className="text-xs font-black text-neutral-900">Учет & Склад сырья</div>
                  <div className="text-[10px] text-neutral-500 font-bold">
                    Касса, остатки бумаги и расходников
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={newWorkerPermissions.analytics}
                  onChange={e =>
                    setNewWorkerPermissions(prev => ({ ...prev, analytics: e.target.checked }))
                  }
                  className="mt-0.5 rounded accent-black cursor-pointer"
                />
                <div>
                  <div className="text-xs font-black text-neutral-900">Аналитика & Отчеты</div>
                  <div className="text-[10px] text-neutral-500 font-bold">
                    Графики выручки и топ изделий
                  </div>
                </div>
              </label>
            </div>

            {/* Special permissions */}
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-2 mt-2">
              <div className="text-[11px] font-black text-neutral-700 uppercase">
                Специальные привилегии безопасности:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={newWorkerPermissions.canDeleteOrders}
                    onChange={e =>
                      setNewWorkerPermissions(prev => ({
                        ...prev,
                        canDeleteOrders: e.target.checked,
                      }))
                    }
                    className="rounded accent-black"
                  />
                  <span>Удаление заказов</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={newWorkerPermissions.canEditFinances}
                    onChange={e =>
                      setNewWorkerPermissions(prev => ({
                        ...prev,
                        canEditFinances: e.target.checked,
                      }))
                    }
                    className="rounded accent-black"
                  />
                  <span>Проведение кассы / оплат</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={newWorkerPermissions.canManageStaff}
                    onChange={e =>
                      setNewWorkerPermissions(prev => ({
                        ...prev,
                        canManageStaff: e.target.checked,
                      }))
                    }
                    className="rounded accent-black"
                  />
                  <span>Управление сменами</span>
                </label>
              </div>
            </div>

            {/* Sync with production roster option */}
            <label className="flex items-center gap-2 pt-2 cursor-pointer text-xs font-bold text-neutral-800">
              <input
                type="checkbox"
                checked={syncWithProductionRoster}
                onChange={e => setSyncWithProductionRoster(e.target.checked)}
                className="rounded accent-black"
              />
              <span>
                Автоматически добавить сотрудника в производственный список (для распределения заказов)
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bg-black hover:bg-neutral-800 text-white px-5 py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Создать профиль</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT WORKER ACCOUNT */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Редактирование профиля и прав доступа"
        subtitle={`Изменение параметров для: ${editingAccount?.name}`}
        maxWidthClass="max-w-3xl"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-5">
          {editError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">ФИО *</label>
              <input
                type="text"
                required
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Email / Логин *
              </label>
              <input
                type="email"
                required
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold outline-none focus:border-black"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-neutral-700">Пароль *</label>
                <button
                  type="button"
                  onClick={() => setEditPassword(generateRandomPassword())}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Сгенерировать</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={editPassword}
                onChange={e => setEditPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-mono font-bold outline-none focus:border-black bg-neutral-50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Телефон</label>
              <input
                type="text"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">Должность</label>
            <select
              value={editRole}
              onChange={e => handleApplyRolePreset(e.target.value as UserRole, true)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-800 outline-none cursor-pointer"
            >
              <option value="sales">Менеджер продаж</option>
              <option value="operator">Печатник (Оператор)</option>
              <option value="designer">Графический дизайнер</option>
              <option value="postpress">Мастер постпресса</option>
              <option value="accountant">Бухгалтер</option>
              <option value="admin">Администратор</option>
            </select>
          </div>

          {/* Permissions */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-1.5">
              Права доступа к модулям
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editPermissions.kanban}
                  onChange={e =>
                    setEditPermissions(prev => ({ ...prev, kanban: e.target.checked }))
                  }
                  className="rounded accent-black"
                />
                <span>Канбан Доска</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editPermissions.orders}
                  onChange={e =>
                    setEditPermissions(prev => ({ ...prev, orders: e.target.checked }))
                  }
                  className="rounded accent-black"
                />
                <span>Все Заказы</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editPermissions.clients}
                  onChange={e =>
                    setEditPermissions(prev => ({ ...prev, clients: e.target.checked }))
                  }
                  className="rounded accent-black"
                />
                <span>Клиенты & Лиды</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editPermissions.employees}
                  onChange={e =>
                    setEditPermissions(prev => ({ ...prev, employees: e.target.checked }))
                  }
                  className="rounded accent-black"
                />
                <span>Персонал & Смены</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editPermissions.accounting}
                  onChange={e =>
                    setEditPermissions(prev => ({ ...prev, accounting: e.target.checked }))
                  }
                  className="rounded accent-black"
                />
                <span>Учет & Склад</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editPermissions.analytics}
                  onChange={e =>
                    setEditPermissions(prev => ({ ...prev, analytics: e.target.checked }))
                  }
                  className="rounded accent-black"
                />
                <span>Аналитика & Отчеты</span>
              </label>
            </div>

            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-2 mt-2">
              <div className="text-[11px] font-black text-neutral-700 uppercase">
                Специальные полномочия:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={editPermissions.canDeleteOrders}
                    onChange={e =>
                      setEditPermissions(prev => ({ ...prev, canDeleteOrders: e.target.checked }))
                    }
                    className="rounded accent-black"
                  />
                  <span>Удаление заказов</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={editPermissions.canEditFinances}
                    onChange={e =>
                      setEditPermissions(prev => ({ ...prev, canEditFinances: e.target.checked }))
                    }
                    className="rounded accent-black"
                  />
                  <span>Финансовые проводки</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={editPermissions.canManageStaff}
                    onChange={e =>
                      setEditPermissions(prev => ({ ...prev, canManageStaff: e.target.checked }))
                    }
                    className="rounded accent-black"
                  />
                  <span>Управление сменами</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bg-black hover:bg-neutral-800 text-white px-5 py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Сохранить изменения
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: CHANGE SUPER ADMIN PASSWORD */}
      <Modal
        isOpen={isSuperAdminPasswordModalOpen}
        onClose={() => setIsSuperAdminPasswordModalOpen(false)}
        title="Смена пароля Супер Администратора"
        subtitle="Учетная запись: abdulazizmurodkosimov@gmail.com"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleChangeSuperAdminPassword} className="space-y-4">
          {superErrorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{superErrorMsg}</span>
            </div>
          )}
          {superSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{superSuccessMsg}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">
              Новый пароль Супер Админа *
            </label>
            <input
              type="password"
              required
              value={superNewPassword}
              onChange={e => setSuperNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">
              Подтверждение нового пароля *
            </label>
            <input
              type="password"
              required
              value={superConfirmPassword}
              onChange={e => setSuperConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold outline-none focus:border-black"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsSuperAdminPasswordModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bg-black hover:bg-neutral-800 text-white px-5 py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Обновить пароль
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
