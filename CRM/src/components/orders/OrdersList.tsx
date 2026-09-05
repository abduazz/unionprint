import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Trash2, 
  Printer 
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useLanguage } from '../../context/LanguageContext';
import type { OrderStage } from '../../types/crm';
import { Badge, type BadgeVariant } from '../ui/Badge';

export const OrdersList: React.FC = () => {
  const { 
    orders, 
    searchQuery, 
    categoryFilter, 
    deleteOrder, 
    setSelectedOrder 
  } = useCRM();

  const { t } = useLanguage();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter(ord => {
    const matchesSearch = 
      ord.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.clientCompany && ord.clientCompany.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || ord.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const getStageBadge = (stage: OrderStage) => {
    const map: Record<OrderStage, { labelKey: string; variant: BadgeVariant }> = {
      new: { labelKey: 'stage_new', variant: 'indigo' },
      costing: { labelKey: 'stage_costing', variant: 'amber' },
      printing: { labelKey: 'stage_printing', variant: 'purple' },
      postpress: { labelKey: 'stage_postpress', variant: 'sky' },
      ready: { labelKey: 'stage_ready', variant: 'teal' },
      completed: { labelKey: 'stage_completed', variant: 'emerald' },
      canceled: { labelKey: 'stage_canceled', variant: 'rose' },
    };
    const item = map[stage] || { labelKey: stage, variant: 'neutral' };
    return <Badge variant={item.variant}>{t(item.labelKey)}</Badge>;
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ' + t('currency_symbol');
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50/70 border-b border-neutral-200">
              <th className="w-10 p-3"></th>
              <th className="p-3 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                {t('col_order_num')}
              </th>
              <th className="p-3 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                {t('col_client')}
              </th>
              <th className="p-3 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                {t('col_product')}
              </th>
              <th className="p-3 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                {t('col_stage')}
              </th>
              <th className="p-3 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                {t('col_price')}
              </th>
              <th className="p-3 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                {t('col_deadline')}
              </th>
              <th className="p-3 text-[10px] font-bold text-neutral-400 tracking-wider uppercase text-right">
                {t('col_actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  {t('no_orders_found')}
                </td>
              </tr>
            ) : (
              filteredOrders.map(ord => {
                const isExpanded = expandedOrderId === ord.id;
                return (
                  <React.Fragment key={ord.id}>
                    <tr 
                      onClick={() => setSelectedOrder(ord)}
                      className="border-b border-neutral-100 hover:bg-neutral-50/60 transition text-xs font-bold text-neutral-700 cursor-pointer group"
                    >
                      <td className="p-3 text-center" onClick={(e) => toggleExpand(ord.id, e)}>
                        <button className="p-1 hover:bg-neutral-200 rounded transition text-neutral-400 hover:text-black">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-3 font-black text-neutral-900">
                        {ord.orderNumber}
                      </td>
                      <td className="p-3">
                        <div className="text-neutral-900 font-bold">{ord.clientName}</div>
                        {ord.clientCompany && (
                          <div className="text-[10px] text-neutral-400 font-normal">{ord.clientCompany}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="text-neutral-900 line-clamp-1">{ord.title}</div>
                        <div className="text-[10px] text-neutral-400 font-normal">
                          {ord.quantity.toLocaleString('ru-RU')} шт • {ord.format}
                        </div>
                      </td>
                      <td className="p-3">
                        {getStageBadge(ord.stage)}
                      </td>
                      <td className="p-3">
                        <div className="text-neutral-900 font-black">{formatMoney(ord.totalAmount)}</div>
                        <div className="text-[10px] text-neutral-400">
                          Аванс: {formatMoney(ord.paidAmount)}
                        </div>
                      </td>
                      <td className="p-3 text-neutral-500 font-normal">
                        {ord.deadline}
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-black rounded-lg transition cursor-pointer"
                            title={t('modal_order_details')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Удалить заказ ${ord.orderNumber}?`)) {
                                deleteOrder(ord.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable accordion details row */}
                    {isExpanded && (
                      <tr className="bg-neutral-50/90 border-b border-neutral-200">
                        <td colSpan={8} className="p-4 pl-12">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
                            {/* Column 1: Print Tech Specs */}
                            <div>
                              <div className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider mb-2">
                                Полиграфические характеристики
                              </div>
                              <div className="space-y-1 text-neutral-700">
                                <div><span className="text-neutral-400">Бумага:</span> {ord.paperType}</div>
                                <div><span className="text-neutral-400">Цветность:</span> {ord.colorMode}</div>
                                <div><span className="text-neutral-400">Формат:</span> {ord.format}</div>
                                <div><span className="text-neutral-400">Тираж:</span> {ord.quantity.toLocaleString('ru-RU')} экз.</div>
                              </div>
                            </div>

                            {/* Column 2: Finishings & Staff */}
                            <div>
                              <div className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider mb-2">
                                Постпресс & Ответственный
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap gap-1">
                                  {ord.finishings.length > 0 ? (
                                    ord.finishings.map((f, i) => (
                                      <Badge key={i} variant="purple">{f}</Badge>
                                    ))
                                  ) : (
                                    <span className="text-neutral-400">Без постпресса</span>
                                  )}
                                </div>
                                <div className="text-neutral-600 pt-1">
                                  <span className="text-neutral-400">Оператор:</span> {ord.assignedStaffName}
                                </div>
                              </div>
                            </div>

                            {/* Column 3: Notes & Action */}
                            <div className="flex flex-col justify-between">
                              <div>
                                <div className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider mb-1">
                                  Техническое задание
                                </div>
                                <p className="text-neutral-600 text-[11px] italic bg-neutral-50 p-2 rounded border border-neutral-100">
                                  {ord.notes || 'Примечания отсутствуют'}
                                </p>
                              </div>
                              <div className="pt-2 flex justify-end">
                                <button
                                  onClick={() => setSelectedOrder(ord)}
                                  className="bg-black hover:bg-neutral-800 text-white px-3 py-1.5 text-[11px] font-bold rounded-md flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>{t('btn_print_ticket')}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
