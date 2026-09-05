import type { BadgeVariant } from '../components/ui/Badge';

export type Language = 'ru' | 'uz' | 'en';

export type OrderCategory = 
  | 'business_cards' 
  | 'flyers' 
  | 'catalogs' 
  | 'banners' 
  | 'packaging' 
  | 'souvenirs' 
  | 'large_format';

export type OrderStage = string;

export interface KanbanStageConfig {
  id: string;
  key: string;
  title: string;
  variant: BadgeVariant;
  order: number;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  clientCompany?: string;
  title: string;
  category: OrderCategory;
  stage: OrderStage;
  priority: Priority;
  quantity: number;
  format: string;
  paperType: string;
  colorMode: string;
  finishings: string[];
  totalAmount: number;
  paidAmount: number;
  assignedStaffId: string;
  assignedStaffName: string;
  deadline: string;
  createdAt: string;
  notes?: string;
}

export type ClientStatus = 'lead' | 'spec_approval' | 'vip' | 'pending_payment' | 'regular';

export interface Client {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  status: ClientStatus;
  totalOrdersCount: number;
  totalSpent: number;
  assignedStaffName: string;
  createdAt: string;
  notes?: string;
}

export type EmployeeRole = 'sales' | 'operator' | 'designer' | 'postpress' | 'accountant' | 'admin';
export type ShiftStatus = 'on_shift' | 'off_duty' | 'in_production';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  status: ShiftStatus;
  activeOrdersCount: number;
  completedOrdersCount: number;
  monthlyTargetAmount: number;
  monthlyCurrentAmount: number;
  avatarBg: string;
}

export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 
  | 'order_prepayment' 
  | 'order_final' 
  | 'raw_materials' 
  | 'equipment_maint' 
  | 'salary' 
  | 'utilities';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  relatedOrderId?: string;
  operatorName: string;
}

export type MaterialCategory = 'paper' | 'ink' | 'film' | 'plates' | 'packaging';
export type StockStatus = 'ok' | 'low' | 'critical';

export interface StockItem {
  id: string;
  name: string;
  category: MaterialCategory;
  quantity: number;
  unit: string;
  minThreshold: number;
  costPerUnit: number;
  status: StockStatus;
  lastRestocked: string;
}

export type ActiveTab = 'kanban' | 'orders' | 'clients' | 'employees' | 'accounting' | 'analytics';
