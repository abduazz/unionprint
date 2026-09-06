import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserAccount, UserPermissions, UserRole, ActiveTab, AuditLogItem } from '../types/crm';

export const DEFAULT_FULL_PERMISSIONS: UserPermissions = {
  kanban: true,
  orders: true,
  clients: true,
  employees: true,
  accounting: true,
  analytics: true,
  canDeleteOrders: true,
  canEditFinances: true,
  canManageStaff: true,
};

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  super_admin: { ...DEFAULT_FULL_PERMISSIONS },
  admin: {
    kanban: true,
    orders: true,
    clients: true,
    employees: true,
    accounting: true,
    analytics: true,
    canDeleteOrders: true,
    canEditFinances: true,
    canManageStaff: true,
  },
  sales: {
    kanban: true,
    orders: true,
    clients: true,
    employees: false,
    accounting: false,
    analytics: false,
    canDeleteOrders: false,
    canEditFinances: false,
    canManageStaff: false,
  },
  operator: {
    kanban: true,
    orders: true,
    clients: false,
    employees: false,
    accounting: false,
    analytics: false,
    canDeleteOrders: false,
    canEditFinances: false,
    canManageStaff: false,
  },
  designer: {
    kanban: true,
    orders: true,
    clients: false,
    employees: false,
    accounting: false,
    analytics: false,
    canDeleteOrders: false,
    canEditFinances: false,
    canManageStaff: false,
  },
  postpress: {
    kanban: true,
    orders: true,
    clients: false,
    employees: false,
    accounting: false,
    analytics: false,
    canDeleteOrders: false,
    canEditFinances: false,
    canManageStaff: false,
  },
  accountant: {
    kanban: false,
    orders: true,
    clients: true,
    employees: true,
    accounting: true,
    analytics: true,
    canDeleteOrders: false,
    canEditFinances: true,
    canManageStaff: false,
  },
};

const SUPER_ADMIN_ACCOUNT: UserAccount = {
  id: 'usr-super-admin-01',
  email: 'abdulazizmurodkosimov@gmail.com',
  password: '10022002mm',
  name: 'Абдулазиз Муродкосимов',
  phone: '+998 90 000-00-00',
  role: 'super_admin',
  isSuperAdmin: true,
  isActive: true,
  permissions: { ...DEFAULT_FULL_PERMISSIONS },
  createdAt: '2026-01-01',
  avatarBg: 'bg-black',
  notes: 'Главный супер администратор системы UnionPrint CRM',
};

const AUTH_DB_VERSION = 'v3_fresh_start';

interface AuthContextType {
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  auditLogs: AuditLogItem[];
  isImpersonating: boolean;
  impersonatorAccount: UserAccount | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  createWorkerAccount: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: UserRole;
    permissions: UserPermissions;
    notes?: string;
  }) => { success: boolean; error?: string };
  updateAccount: (id: string, updates: Partial<UserAccount>) => void;
  deleteAccount: (id: string) => { success: boolean; error?: string };
  toggleAccountStatus: (id: string) => void;
  impersonateUser: (id: string) => void;
  stopImpersonating: () => void;
  hasPermission: (key: keyof UserPermissions) => boolean;
  hasTabAccess: (tab: ActiveTab) => boolean;
  clearAuditLogs: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purge any legacy accounts once
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('unionprint_auth_db_version') !== AUTH_DB_VERSION) {
      localStorage.removeItem('unionprint_accounts');
      localStorage.removeItem('unionprint_accounts_v2');
      localStorage.removeItem('unionprint_current_user_id');
      localStorage.setItem('unionprint_auth_db_version', AUTH_DB_VERSION);
    }
  }

  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('unionprint_accounts_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserAccount[];
        // Ensure super admin exists and has the requested credentials
        const hasSuperAdmin = parsed.some(
          acc => acc.email.toLowerCase() === SUPER_ADMIN_ACCOUNT.email.toLowerCase()
        );
        if (!hasSuperAdmin) {
          return [SUPER_ADMIN_ACCOUNT, ...parsed];
        }
        return parsed;
      } catch {
        return [SUPER_ADMIN_ACCOUNT];
      }
    }
    return [SUPER_ADMIN_ACCOUNT];
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const savedUserId = localStorage.getItem('unionprint_session_user_id');
    if (savedUserId) {
      const found = accounts.find(a => a.id === savedUserId && a.isActive);
      if (found) return found;
    }
    // Default to Super Admin on initial load for seamless onboarding
    return SUPER_ADMIN_ACCOUNT;
  });

  const [impersonatorAccount, setImpersonatorAccount] = useState<UserAccount | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('unionprint_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'log-init',
        timestamp: new Date().toISOString(),
        actorEmail: SUPER_ADMIN_ACCOUNT.email,
        action: 'Инициализация системы',
        details: 'Главный аккаунт Супер Администратора успешно активирован',
        type: 'system',
      },
    ];
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('unionprint_accounts_v3', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('unionprint_session_user_id', currentUser.id);
    } else {
      localStorage.removeItem('unionprint_session_user_id');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('unionprint_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addAuditLog = (
    action: string,
    details: string,
    type: AuditLogItem['type'] = 'account',
    actorOverride?: string
  ) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorEmail: actorOverride || currentUser?.email || 'Система',
      action,
      details,
      type,
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 199)]); // keep last 200 logs
  };

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = accounts.find(a => a.email.trim().toLowerCase() === normalizedEmail);

    if (!account) {
      addAuditLog('Неудачный вход', `Пользователь с email "${email}" не найден`, 'auth', email);
      return { success: false, error: 'Пользователь с таким email не найден' };
    }

    if (account.password !== password) {
      addAuditLog('Неудачный вход', `Неверный пароль для "${email}"`, 'auth', email);
      return { success: false, error: 'Неверный пароль' };
    }

    if (!account.isActive) {
      addAuditLog('Вход заблокирован', `Попытка входа в деактивированный аккаунт "${email}"`, 'auth', email);
      return { success: false, error: 'Данный аккаунт деактивирован администратором' };
    }

    const updatedAccount = {
      ...account,
      lastLoginAt: new Date().toISOString(),
    };

    setAccounts(prev => prev.map(a => (a.id === account.id ? updatedAccount : a)));
    setCurrentUser(updatedAccount);
    setImpersonatorAccount(null);

    addAuditLog('Успешный вход в систему', `Пользователь ${account.name} (${account.role}) авторизован`, 'auth', account.email);
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('Выход из системы', `Пользователь ${currentUser.name} завершил сеанс`, 'auth');
    }
    setCurrentUser(null);
    setImpersonatorAccount(null);
    localStorage.removeItem('unionprint_session_user_id');
  };

  const createWorkerAccount = (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: UserRole;
    permissions: UserPermissions;
    notes?: string;
  }): { success: boolean; error?: string } => {
    const normalizedEmail = data.email.trim().toLowerCase();
    if (!data.name.trim()) return { success: false, error: 'Укажите ФИО сотрудника' };
    if (!normalizedEmail) return { success: false, error: 'Укажите email/логин сотрудника' };
    if (!data.password || data.password.length < 4) {
      return { success: false, error: 'Пароль должен содержать минимум 4 символа' };
    }

    if (accounts.some(a => a.email.trim().toLowerCase() === normalizedEmail)) {
      return { success: false, error: `Аккаунт с email "${data.email}" уже существует` };
    }

    const avatarColors = [
      'bg-indigo-600',
      'bg-emerald-600',
      'bg-purple-600',
      'bg-amber-600',
      'bg-rose-600',
      'bg-sky-600',
      'bg-teal-600',
    ];
    const randomAvatarBg = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const newAccount: UserAccount = {
      id: `usr-${Date.now()}`,
      email: data.email.trim(),
      password: data.password,
      name: data.name.trim(),
      phone: data.phone?.trim() || '',
      role: data.role,
      isSuperAdmin: false,
      isActive: true,
      permissions: { ...data.permissions },
      createdAt: new Date().toISOString().split('T')[0],
      avatarBg: randomAvatarBg,
      notes: data.notes?.trim() || '',
    };

    setAccounts(prev => [...prev, newAccount]);
    addAuditLog(
      'Создан профиль работника',
      `Создан аккаунт для ${newAccount.name} (${newAccount.email}), роль: ${newAccount.role}`,
      'account'
    );

    return { success: true };
  };

  const updateAccount = (id: string, updates: Partial<UserAccount>) => {
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === id) {
          const updated = { ...acc, ...updates };
          if (currentUser?.id === id) {
            setCurrentUser(updated);
          }
          addAuditLog(
            'Обновление аккаунта',
            `Изменены данные аккаунта ${acc.name} (${acc.email})`,
            'account'
          );
          return updated;
        }
        return acc;
      })
    );
  };

  const deleteAccount = (id: string): { success: boolean; error?: string } => {
    const target = accounts.find(a => a.id === id);
    if (!target) return { success: false, error: 'Аккаунт не найден' };
    if (target.isSuperAdmin) {
      return { success: false, error: 'Невозможно удалить аккаунт Супер Администратора' };
    }
    if (currentUser?.id === id) {
      return { success: false, error: 'Невозможно удалить текущий активный аккаунт' };
    }

    setAccounts(prev => prev.filter(a => a.id !== id));
    addAuditLog(
      'Удаление аккаунта',
      `Удален аккаунт сотрудника ${target.name} (${target.email})`,
      'account'
    );
    return { success: true };
  };

  const toggleAccountStatus = (id: string) => {
    const target = accounts.find(a => a.id === id);
    if (!target) return;
    if (target.isSuperAdmin) {
      alert('Невозможно отключить аккаунт главного Супер Администратора');
      return;
    }

    const nextStatus = !target.isActive;
    updateAccount(id, { isActive: nextStatus });
    addAuditLog(
      nextStatus ? 'Активация аккаунта' : 'Блокировка аккаунта',
      `Аккаунт ${target.name} (${target.email}) ${nextStatus ? 'активирован' : 'заблокирован'}`,
      'permission'
    );
  };

  const impersonateUser = (id: string) => {
    const target = accounts.find(a => a.id === id);
    if (!target || !currentUser?.isSuperAdmin) return;

    setImpersonatorAccount(currentUser);
    setCurrentUser(target);
    addAuditLog(
      'Режим просмотра сотрудника',
      `Супер-админ вошел под профилем ${target.name} (${target.email})`,
      'permission'
    );
  };

  const stopImpersonating = () => {
    if (impersonatorAccount) {
      setCurrentUser(impersonatorAccount);
      setImpersonatorAccount(null);
      addAuditLog(
        'Возврат из режима просмотра',
        'Возврат в профиль Супер Администратора',
        'permission'
      );
    }
  };

  const hasPermission = (key: keyof UserPermissions): boolean => {
    if (!currentUser) return false;
    if (currentUser.isSuperAdmin) return true;
    return Boolean(currentUser.permissions[key]);
  };

  const hasTabAccess = (tab: ActiveTab): boolean => {
    if (!currentUser) return false;
    if (tab === 'superadmin') {
      return currentUser.isSuperAdmin;
    }
    if (currentUser.isSuperAdmin) return true;
    return Boolean(currentUser.permissions[tab as keyof UserPermissions]);
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    localStorage.removeItem('unionprint_audit_logs');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        accounts,
        auditLogs,
        isImpersonating: Boolean(impersonatorAccount),
        impersonatorAccount,
        login,
        logout,
        createWorkerAccount,
        updateAccount,
        deleteAccount,
        toggleAccountStatus,
        impersonateUser,
        stopImpersonating,
        hasPermission,
        hasTabAccess,
        clearAuditLogs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
