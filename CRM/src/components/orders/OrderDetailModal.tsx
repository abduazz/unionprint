import React from 'react';
import { 
  Printer, 
  Trash2
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

export const OrderDetailModal: React.FC = () => {
  const { selectedOrder, setSelectedOrder, deleteOrder, updateOrderStage } = useCRM();
  const { t } = useLanguage();

  if (!selectedOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ' + t('currency_symbol');
  };

  return (
    <Modal
      isOpen={!!selectedOrder}
      onClose={() => setSelectedOrder(null)}
      title={`${selectedOrder.orderNumber} — ${selectedOrder.title}`}
      subtitle="Технологический бланк полиграфического заказа"
      maxWidthClass="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Top Status Banner */}
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500">Этап:</span>
            <select
              value={selectedOrder.stage}
              onChange={(e) => updateOrderStage(selectedOrder.id, e.target.value as any)}
              className="px-3 py-1 rounded-lg border border-neutral-300 text-xs font-black bg-white text-neutral-900 focus:ring-1 focus:ring-black outline-none"
            >
              <option value="new">{t('stage_new')}</option>
              <option value="costing">{t('stage_costing')}</option>
              <option value="printing">{t('stage_printing')}</option>
              <option value="postpress">{t('stage_postpress')}</option>
              <option value="ready">{t('stage_ready')}</option>
              <option value="completed">{t('stage_completed')}</option>
              <option value="canceled">{t('stage_canceled')}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-black hover:bg-neutral-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Печать бланка</span>
            </button>
            <button
              onClick={() => {
                if (confirm(`Удалить заказ ${selectedOrder.orderNumber}?`)) {
                  deleteOrder(selectedOrder.id);
                }
              }}
              className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg transition cursor-pointer"
              title="Удалить заказ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Job Ticket Area */}
        <div className="space-y-4 border border-neutral-200 p-5 rounded-xl bg-white shadow-2xs">
          {/* Header info */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-100">
            <div>
              <div className="text-[10px] font-black uppercase text-neutral-400">Типография</div>
              <div className="font-black text-lg text-neutral-900">UnionPrint</div>
              <div className="text-xs text-neutral-500 font-bold">CRM & Polygraphy System</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black uppercase text-neutral-400">Заказ №</div>
              <div className="font-black text-lg text-neutral-900">{selectedOrder.orderNumber}</div>
              <div className="text-xs text-neutral-500 font-bold">Дата: {selectedOrder.createdAt}</div>
            </div>
          </div>

          {/* Client & Operator info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-neutral-100">
            <div>
              <div className="text-[10px] font-black uppercase text-neutral-400 mb-1">Информация о Заказчике</div>
              <div className="text-xs font-black text-neutral-900">{selectedOrder.clientName}</div>
              {selectedOrder.clientCompany && (
                <div className="text-xs font-bold text-neutral-600">{selectedOrder.clientCompany}</div>
              )}
              <div className="text-xs font-bold text-neutral-500">{selectedOrder.clientPhone}</div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase text-neutral-400 mb-1">Сроки & Исполнитель</div>
              <div className="text-xs font-bold text-neutral-800">Дедлайн: <span className="font-black">{selectedOrder.deadline}</span></div>
              <div className="text-xs font-bold text-neutral-600">Ответственный: {selectedOrder.assignedStaffName}</div>
            </div>
          </div>

          {/* Technical Specs */}
          <div>
            <div className="text-[10px] font-black uppercase text-neutral-400 mb-2">Технические характеристики изделия</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-100 text-xs">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">Тираж</span>
                <span className="font-black text-neutral-900">{selectedOrder.quantity.toLocaleString('ru-RU')} шт</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">Формат</span>
                <span className="font-black text-neutral-900">{selectedOrder.format}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">Материал</span>
                <span className="font-black text-neutral-900">{selectedOrder.paperType}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">Цветность</span>
                <span className="font-black text-neutral-900">{selectedOrder.colorMode}</span>
              </div>
            </div>
          </div>

          {/* Finishings list */}
          <div>
            <div className="text-[10px] font-black uppercase text-neutral-400 mb-1.5">Постпечатная обработка (Постпресс)</div>
            <div className="flex flex-wrap gap-1.5">
              {selectedOrder.finishings.length > 0 ? (
                selectedOrder.finishings.map((f, i) => (
                  <Badge key={i} variant="purple">{f}</Badge>
                ))
              ) : (
                <span className="text-xs text-neutral-400 font-bold">Нет дополнительных операций</span>
              )}
            </div>
          </div>

          {/* Notes */}
          {selectedOrder.notes && (
            <div>
              <div className="text-[10px] font-black uppercase text-neutral-400 mb-1">Техническое задание / Примечания</div>
              <div className="text-xs font-bold text-neutral-700 bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
                {selectedOrder.notes}
              </div>
            </div>
          )}

          {/* Cost Summary */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase text-neutral-400">Предоплата</div>
              <div className="text-sm font-black text-neutral-800">{formatMoney(selectedOrder.paidAmount)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black uppercase text-neutral-400">Итого к оплате</div>
              <div className="text-lg font-black text-neutral-900">{formatMoney(selectedOrder.totalAmount)}</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
