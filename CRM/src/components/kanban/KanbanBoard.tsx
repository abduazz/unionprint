import React, { useState } from 'react';
import { 
  User, 
  ChevronRight, 
  ChevronLeft, 
  Calendar,
  Settings
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useLanguage } from '../../context/LanguageContext';
import type { OrderStage, Priority } from '../../types/crm';
import { Badge, type BadgeVariant } from '../ui/Badge';
import { ManageStagesModal } from './ManageStagesModal';

export const KanbanBoard: React.FC = () => {
  const { 
    orders, 
    stages,
    searchQuery, 
    categoryFilter, 
    updateOrderStage, 
    setSelectedOrder 
  } = useCRM();

  const { t } = useLanguage();
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<OrderStage | null>(null);
  const [isManageStagesOpen, setIsManageStagesOpen] = useState(false);

  // Filter orders based on search and category
  const filteredOrders = orders.filter(ord => {
    const matchesSearch = 
      ord.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.clientCompany && ord.clientCompany.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || ord.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Priority badge helper
  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="rose">СРОЧНО</Badge>;
      case 'high':
        return <Badge variant="amber">ВЫСОКИЙ</Badge>;
      case 'medium':
        return <Badge variant="neutral">СРЕДНИЙ</Badge>;
      default:
        return <Badge variant="neutral">ОБЫЧНЫЙ</Badge>;
    }
  };

  // Category badge helper
  const getCategoryBadge = (category: string) => {
    const map: Record<string, { labelKey: string; variant: BadgeVariant }> = {
      business_cards: { labelKey: 'cat_business_cards', variant: 'indigo' },
      flyers: { labelKey: 'cat_flyers', variant: 'teal' },
      catalogs: { labelKey: 'cat_catalogs', variant: 'purple' },
      banners: { labelKey: 'cat_banners', variant: 'amber' },
      packaging: { labelKey: 'cat_packaging', variant: 'rose' },
      souvenirs: { labelKey: 'cat_souvenirs', variant: 'fuchsia' },
      large_format: { labelKey: 'cat_large_format', variant: 'sky' },
    };
    const item = map[category] || { labelKey: category, variant: 'neutral' };
    return <Badge variant={item.variant}>{t(item.labelKey)}</Badge>;
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.setData('text/plain', orderId);
  };

  const handleDragOver = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    setDragOverStage(stageKey);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain') || draggedOrderId;
    if (orderId) {
      updateOrderStage(orderId, stageKey);
    }
    setDraggedOrderId(null);
    setDragOverStage(null);
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ' + t('currency_symbol');
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar for Kanban */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="text-xs font-bold text-neutral-500">
          Всего этапов воронки: <span className="font-black text-neutral-900">{stages.length}</span>
        </div>

        <button
          onClick={() => setIsManageStagesOpen(true)}
          className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-neutral-500" />
          <span>Настройка колонок</span>
        </button>
      </div>

      {/* Kanban Board Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-6 items-start">
        {stages.map((stg, stgIdx) => {
          const stageOrders = filteredOrders.filter(o => o.stage === stg.key);
          const stageTotalSum = stageOrders.reduce((sum, o) => sum + o.totalAmount, 0);
          const isTarget = dragOverStage === stg.key;

          return (
            <div
              key={stg.id}
              onDragOver={(e) => handleDragOver(e, stg.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stg.key)}
              className={`w-[320px] min-w-[300px] shrink-0 bg-white rounded-xl border transition-all duration-200 p-4 flex flex-col min-h-[550px] shadow-2xs ${
                isTarget ? 'border-black ring-2 ring-black/10 bg-neutral-50/80' : 'border-neutral-200'
              }`}
            >
              {/* Column Header */}
              <div className="border-b border-neutral-100 pb-3 mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant={stg.variant}>
                    {t(`stage_${stg.key}`) || stg.title}
                  </Badge>
                  <span className="text-[11px] font-black text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                    {stageOrders.length}
                  </span>
                </div>
                <div className="text-[12px] font-black text-neutral-900 truncate">
                  {formatMoney(stageTotalSum)}
                </div>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1">
                {stageOrders.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-neutral-100 rounded-lg flex items-center justify-center text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    Пусто
                  </div>
                ) : (
                  stageOrders.map(ord => (
                    <div
                      key={ord.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, ord.id)}
                      onClick={() => setSelectedOrder(ord)}
                      className="bg-white border border-neutral-200 hover:border-neutral-400 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer space-y-2.5 group relative"
                    >
                      {/* Top Row: Order Number & Priority */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-neutral-400 group-hover:text-black transition">
                          {ord.orderNumber}
                        </span>
                        {getPriorityBadge(ord.priority)}
                      </div>

                      {/* Product Title */}
                      <h4 className="text-xs font-black text-neutral-900 leading-snug line-clamp-2">
                        {ord.title}
                      </h4>

                      {/* Client & Specs */}
                      <div className="text-[11px] font-bold text-neutral-600 space-y-0.5">
                        <div className="truncate flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{ord.clientName} {ord.clientCompany ? `(${ord.clientCompany})` : ''}</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-normal">
                          Тираж: {ord.quantity.toLocaleString('ru-RU')} шт • {ord.format}
                        </div>
                      </div>

                      {/* Category & Prepayment Badges */}
                      <div className="flex flex-wrap gap-1 items-center">
                        {getCategoryBadge(ord.category)}
                        {ord.paidAmount >= ord.totalAmount ? (
                          <Badge variant="emerald">100% Оплата</Badge>
                        ) : ord.paidAmount > 0 ? (
                          <Badge variant="amber">Аванс {Math.round((ord.paidAmount / ord.totalAmount) * 100)}%</Badge>
                        ) : (
                          <Badge variant="rose">Без оплаты</Badge>
                        )}
                      </div>

                      {/* Footer: Price & Deadline */}
                      <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between">
                        <div className="text-xs font-black text-neutral-900">
                          {formatMoney(ord.totalAmount)}
                        </div>

                        <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>{ord.deadline.slice(5)}</span>
                        </div>
                      </div>

                      {/* Stage quick move controls on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 flex items-center gap-1 bg-white/95 p-1 rounded-md border border-neutral-200 shadow-xs" onClick={e => e.stopPropagation()}>
                        {stgIdx > 0 && (
                          <button
                            onClick={() => {
                              updateOrderStage(ord.id, stages[stgIdx - 1].key);
                            }}
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-black cursor-pointer"
                            title="Назад"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {stgIdx < stages.length - 1 && (
                          <button
                            onClick={() => {
                              updateOrderStage(ord.id, stages[stgIdx + 1].key);
                            }}
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-black cursor-pointer"
                            title="Вперед"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manage Stages Modal */}
      <ManageStagesModal
        isOpen={isManageStagesOpen}
        onClose={() => setIsManageStagesOpen(false)}
      />
    </div>
  );
};
