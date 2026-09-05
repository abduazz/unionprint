import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Order, 
  Client, 
  Employee, 
  Transaction, 
  StockItem, 
  ActiveTab, 
  OrderStage,
  ShiftStatus,
  KanbanStageConfig 
} from '../types/crm';
import type { BadgeVariant } from '../components/ui/Badge';
import { 
  initialOrders, 
  initialClients, 
  initialEmployees, 
  initialTransactions, 
  initialStock 
} from '../data/mockData';

const initialStages: KanbanStageConfig[] = [
  { id: 'stg-1', key: 'new', title: 'Новый запрос', variant: 'indigo', order: 1 },
  { id: 'stg-2', key: 'costing', title: 'Расчет стоимости', variant: 'amber', order: 2 },
  { id: 'stg-3', key: 'printing', title: 'В печати', variant: 'purple', order: 3 },
  { id: 'stg-4', key: 'postpress', title: 'Постпресс & Сборка', variant: 'sky', order: 4 },
  { id: 'stg-5', key: 'ready', title: 'Готов к выдаче', variant: 'teal', order: 5 },
  { id: 'stg-6', key: 'completed', title: 'Выдан & Оплачен', variant: 'emerald', order: 6 },
];

interface CRMContextType {
  orders: Order[];
  clients: Client[];
  employees: Employee[];
  transactions: Transaction[];
  stock: StockItem[];
  stages: KanbanStageConfig[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  
  // Modals & Selected
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  isCreateOrderModalOpen: boolean;
  setIsCreateOrderModalOpen: (open: boolean) => void;
  isCreateClientModalOpen: boolean;
  setIsCreateClientModalOpen: (open: boolean) => void;
  isCreateEmployeeModalOpen: boolean;
  setIsCreateEmployeeModalOpen: (open: boolean) => void;
  isTransactionModalOpen: boolean;
  setIsTransactionModalOpen: (open: boolean) => void;

  // Actions
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => void;
  updateOrderStage: (orderId: string, newStage: OrderStage) => void;
  updateOrder: (order: Order) => void;
  deleteOrder: (orderId: string) => void;
  
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalOrdersCount' | 'totalSpent'>) => void;
  updateClient: (client: Client) => void;
  
  addEmployee: (employee: Omit<Employee, 'id' | 'activeOrdersCount' | 'completedOrdersCount' | 'monthlyCurrentAmount'>) => void;
  toggleEmployeeShift: (employeeId: string) => void;
  setEmployeeStatus: (employeeId: string, status: ShiftStatus) => void;
  
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  restockMaterial: (stockId: string, addedQty: number) => void;

  // Stage Actions
  addStage: (title: string, variant: BadgeVariant) => void;
  updateStage: (id: string, title: string, variant: BadgeVariant) => void;
  deleteStage: (id: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('unionprint_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('unionprint_clients');
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('unionprint_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('unionprint_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [stock, setStock] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('unionprint_stock');
    return saved ? JSON.parse(saved) : initialStock;
  });

  const [stages, setStages] = useState<KanbanStageConfig[]>(() => {
    const saved = localStorage.getItem('unionprint_stages');
    return saved ? JSON.parse(saved) : initialStages;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('kanban');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
  const [isCreateEmployeeModalOpen, setIsCreateEmployeeModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Persistence effect
  useEffect(() => {
    localStorage.setItem('unionprint_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('unionprint_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('unionprint_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('unionprint_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('unionprint_stock', JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem('unionprint_stages', JSON.stringify(stages));
  }, [stages]);

  // Actions implementation
  const addOrder = (newOrderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => {
    const id = `ord-${Date.now()}`;
    const num = `UP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    const newOrder: Order = {
      ...newOrderData,
      id,
      orderNumber: num,
      createdAt: today,
    };

    setOrders(prev => [newOrder, ...prev]);

    // Add transaction if prepayment exists
    if (newOrder.paidAmount > 0) {
      addTransaction({
        type: 'income',
        category: 'order_prepayment',
        amount: newOrder.paidAmount,
        description: `Предоплата за заказ ${num} (${newOrder.clientName})`,
        relatedOrderId: id,
        operatorName: newOrder.assignedStaffName || 'Азиз Рахимов',
      });
    }
  };

  const updateOrderStage = (orderId: string, newStage: OrderStage) => {
    setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, stage: newStage } : ord));
  };

  const updateOrder = (updated: Order) => {
    setOrders(prev => prev.map(ord => ord.id === updated.id ? updated : ord));
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(ord => ord.id !== orderId));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }
  };

  const addClient = (newClientData: Omit<Client, 'id' | 'createdAt' | 'totalOrdersCount' | 'totalSpent'>) => {
    const id = `cli-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newClient: Client = {
      ...newClientData,
      id,
      createdAt: today,
      totalOrdersCount: 0,
      totalSpent: 0,
    };
    setClients(prev => [newClient, ...prev]);
  };

  const updateClient = (updated: Client) => {
    setClients(prev => prev.map(cli => cli.id === updated.id ? updated : cli));
  };

  const addEmployee = (newEmpData: Omit<Employee, 'id' | 'activeOrdersCount' | 'completedOrdersCount' | 'monthlyCurrentAmount'>) => {
    const id = `emp-${Date.now()}`;
    const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600', 'bg-sky-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newEmp: Employee = {
      ...newEmpData,
      id,
      activeOrdersCount: 0,
      completedOrdersCount: 0,
      monthlyCurrentAmount: 0,
      avatarBg: randomColor,
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const toggleEmployeeShift = (employeeId: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        const nextStatus: ShiftStatus = emp.status === 'on_shift' ? 'off_duty' : (emp.status === 'off_duty' ? 'in_production' : 'on_shift');
        return { ...emp, status: nextStatus };
      }
      return emp;
    }));
  };

  const setEmployeeStatus = (employeeId: string, status: ShiftStatus) => {
    setEmployees(prev => prev.map(emp => emp.id === employeeId ? { ...emp, status } : emp));
  };

  const addTransaction = (tData: Omit<Transaction, 'id' | 'date'>) => {
    const id = `trx-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newTrx: Transaction = {
      ...tData,
      id,
      date: today,
    };
    setTransactions(prev => [newTrx, ...prev]);
  };

  const restockMaterial = (stockId: string, addedQty: number) => {
    setStock(prev => prev.map(stk => {
      if (stk.id === stockId) {
        const newQty = stk.quantity + addedQty;
        const newStatus = newQty <= stk.minThreshold ? (newQty <= stk.minThreshold / 2 ? 'critical' : 'low') : 'ok';
        return {
          ...stk,
          quantity: newQty,
          status: newStatus,
          lastRestocked: new Date().toISOString().split('T')[0],
        };
      }
      return stk;
    }));
  };

  // Stage Actions
  const addStage = (title: string, variant: BadgeVariant) => {
    const id = `stg-${Date.now()}`;
    const key = `custom_${Date.now()}`;
    const newStg: KanbanStageConfig = {
      id,
      key,
      title,
      variant,
      order: stages.length + 1,
    };
    setStages(prev => [...prev, newStg]);
  };

  const updateStage = (id: string, title: string, variant: BadgeVariant) => {
    setStages(prev => prev.map(stg => stg.id === id ? { ...stg, title, variant } : stg));
  };

  const deleteStage = (id: string) => {
    const target = stages.find(s => s.id === id);
    if (!target) return;

    // Check if orders exist in this stage
    const count = orders.filter(o => o.stage === target.key).length;
    if (count > 0) {
      alert(`Невозможно удалить этап "${target.title}": в нем находится ${count} заказов. Сначала переместите эти заказы в другой этап.`);
      return;
    }

    setStages(prev => prev.filter(s => s.id !== id));
  };

  return (
    <CRMContext.Provider value={{
      orders,
      clients,
      employees,
      transactions,
      stock,
      stages,
      activeTab,
      setActiveTab,
      sidebarCollapsed,
      setSidebarCollapsed,
      searchQuery,
      setSearchQuery,
      categoryFilter,
      setCategoryFilter,
      selectedOrder,
      setSelectedOrder,
      isCreateOrderModalOpen,
      setIsCreateOrderModalOpen,
      isCreateClientModalOpen,
      setIsCreateClientModalOpen,
      isCreateEmployeeModalOpen,
      setIsCreateEmployeeModalOpen,
      isTransactionModalOpen,
      setIsTransactionModalOpen,
      addOrder,
      updateOrderStage,
      updateOrder,
      deleteOrder,
      addClient,
      updateClient,
      addEmployee,
      toggleEmployeeShift,
      setEmployeeStatus,
      addTransaction,
      restockMaterial,
      addStage,
      updateStage,
      deleteStage,
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
