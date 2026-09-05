import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Package
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useLanguage } from '../../context/LanguageContext';
import type { TransactionCategory, TransactionType, MaterialCategory } from '../../types/crm';
import { Badge, type BadgeVariant } from '../ui/Badge';
import { MetricCard } from '../ui/MetricCard';
import { Modal } from '../ui/Modal';

export const AccountingView: React.FC = () => {
  const { 
    transactions, 
    stock, 
    orders, 
    addTransaction, 
    restockMaterial,
    addStockItem,
    isTransactionModalOpen,
    setIsTransactionModalOpen 
  } = useCRM();

  const { t } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState<'transactions' | 'stock'>('transactions');
  
  // Transaction modal state
  const [trxType, setTrxType] = useState<TransactionType>('income');
  const [trxCategory, setTrxCategory] = useState<TransactionCategory>('order_prepayment');
  const [trxAmount, setTrxAmount] = useState<number>(1000000);
  const [trxDescription, setTrxDescription] = useState('');
  const [trxOperator, setTrxOperator] = useState('');

  // Restock / New Material modal state
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(stock[0]?.id || '');
  const [restockQty, setRestockQty] = useState(100);
  const [isNewMaterial, setIsNewMaterial] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatCategory, setNewMatCategory] = useState<MaterialCategory>('paper');
  const [newMatUnit, setNewMatUnit] = useState('лист');
  const [newMatMinThreshold, setNewMatMinThreshold] = useState(100);
  const [newMatCost, setNewMatCost] = useState(1000);

  // Totals calculations
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const accountsReceivable = orders.reduce((sum, o) => sum + (o.totalAmount - o.paidAmount), 0);

  const getTrxCategoryBadge = (cat: TransactionCategory) => {
    const map: Record<TransactionCategory, { label: string; variant: BadgeVariant }> = {
      order_prepayment: { label: 'Предоплата заказа', variant: 'emerald' },
      order_final: { label: 'Окончательный расчет', variant: 'teal' },
      raw_materials: { label: 'Закупка сырья', variant: 'rose' },
      equipment_maint: { label: 'Обслуживание станков', variant: 'amber' },
      salary: { label: 'Зарплатный фонд', variant: 'indigo' },
      utilities: { label: 'Коммунальные & Аренда', variant: 'neutral' },
    };
    const item = map[cat] || { label: cat, variant: 'neutral' };
    return <Badge variant={item.variant}>{item.label}</Badge>;
  };

  const getStockStatusBadge = (st: string) => {
    if (st === 'critical') return <Badge variant="rose">КРИТИЧЕСКИЙ ОСТАТОК</Badge>;
    if (st === 'low') return <Badge variant="amber">НИЖЕ ПОРОГА</Badge>;
    return <Badge variant="emerald">НОРМА</Badge>;
  };

  const handleAddTrx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxDescription || trxAmount <= 0) {
      alert('Заполните описание и корректную сумму');
      return;
    }
    addTransaction({
      type: trxType,
      category: trxCategory,
      amount: trxAmount,
      description: trxDescription,
      operatorName: trxOperator.trim() || 'Кассир',
    });
    setIsTransactionModalOpen(false);
    setTrxDescription('');
    setTrxOperator('');
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNewMaterial || stock.length === 0) {
      if (!newMatName.trim()) {
        alert('Введите название материала');
        return;
      }
      addStockItem({
        name: newMatName.trim(),
        category: newMatCategory,
        quantity: Number(restockQty) || 0,
        unit: newMatUnit.trim() || 'шт',
        minThreshold: Number(newMatMinThreshold) || 10,
        costPerUnit: Number(newMatCost) || 0,
      });
      setNewMatName('');
      setIsNewMaterial(false);
    } else {
      if (restockQty <= 0 || !selectedStockId) return;
      restockMaterial(selectedStockId, restockQty);
    }
    setRestockModalOpen(false);
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ' + t('currency_symbol');
  };

  return (
    <div className="space-y-6">
      {/* 4 Key Accounting KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t('metric_total_revenue')}
          value={formatMoney(totalIncome)}
          subtitle="Доходы по кассе"
          icon={TrendingUp}
          trend={{ value: '18%', isPositive: true }}
        />
        <MetricCard
          title={t('metric_net_profit')}
          value={formatMoney(netProfit)}
          subtitle="После расходов"
          icon={DollarSign}
          trend={{ value: '12%', isPositive: true }}
        />
        <MetricCard
          title="Затраты на сырье"
          value={formatMoney(totalExpense)}
          subtitle="Бумага, тонер, пленка"
          icon={TrendingDown}
        />
        <MetricCard
          title={t('metric_debtors')}
          value={formatMoney(accountsReceivable)}
          subtitle="Ожидается от клиентов"
          icon={AlertTriangle}
        />
      </div>

      {/* Subnav & Action buttons */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSubTab('transactions')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
              activeSubTab === 'transactions' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Кассовые Операции ({transactions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('stock')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'stock' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
            }`}
          >
            <span>Учет Материалов ({stock.length})</span>
            {stock.some(s => s.status !== 'ok') && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'transactions' ? (
            <button
              onClick={() => setIsTransactionModalOpen(true)}
              className="bg-black hover:bg-neutral-800 text-white rounded-lg px-4 py-2 text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('btn_add_transaction')}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsNewMaterial(stock.length === 0);
                setRestockModalOpen(true);
              }}
              className="bg-black hover:bg-neutral-800 text-white rounded-lg px-4 py-2 text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('btn_add_stock')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtab 1: Transactions Table */}
      {activeSubTab === 'transactions' && (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200">
                <th className="p-3 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">Дата</th>
                <th className="p-3 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">Тип</th>
                <th className="p-3 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">Категория</th>
                <th className="p-3 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">Описание</th>
                <th className="p-3 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">Оператор</th>
                <th className="p-3 text-[10px] font-bold text-neutral-400 tracking-wider uppercase text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Кассовых операций пока нет
                  </td>
                </tr>
              ) : (
                transactions.map(trx => (
                  <tr key={trx.id} className="border-b border-neutral-100 hover:bg-neutral-50/60 text-xs font-bold text-neutral-700">
                    <td className="p-3 text-neutral-500 font-normal">{trx.date}</td>
                    <td className="p-3">
                      {trx.type === 'income' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-black">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Доход
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-black">
                          <ArrowDownRight className="w-3.5 h-3.5" /> Расход
                        </span>
                      )}
                    </td>
                    <td className="p-3">{getTrxCategoryBadge(trx.category)}</td>
                    <td className="p-3 text-neutral-900 font-bold">{trx.description}</td>
                    <td className="p-3 text-neutral-500 font-normal">{trx.operatorName}</td>
                    <td className="p-3 text-right font-black">
                      <span className={trx.type === 'income' ? 'text-neutral-900' : 'text-rose-600'}>
                        {trx.type === 'income' ? '+' : '-'}{formatMoney(trx.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Subtab 2: Material Inventory Stock */}
      {activeSubTab === 'stock' && (
        stock.length === 0 ? (
          <div className="bg-white border border-dashed border-neutral-200 rounded-xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <div className="text-sm font-black text-neutral-900">Склад материалов пуст</div>
            <p className="text-xs text-neutral-500 font-bold max-w-sm mx-auto">
              Внесите первую партию сырья (бумагу, краску, баннерную ткань или пленку)
            </p>
            <button
              onClick={() => {
                setIsNewMaterial(true);
                setRestockModalOpen(true);
              }}
              className="mt-2 bg-black hover:bg-neutral-800 text-white rounded-lg px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>+ Добавить материал на склад</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stock.map(item => (
              <div 
                key={item.id}
                className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-all duration-150 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-neutral-400">
                      {item.category}
                    </span>
                    {getStockStatusBadge(item.status)}
                  </div>

                  <h3 className="text-sm font-black text-neutral-900 leading-tight mb-2">
                    {item.name}
                  </h3>

                  <div className="text-2xl font-black text-neutral-900 tracking-tight">
                    {item.quantity.toLocaleString('ru-RU')} <span className="text-xs font-normal text-neutral-500">{item.unit}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-500">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-normal uppercase">Порог предупреждения</span>
                    <span>{item.minThreshold} {item.unit}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsNewMaterial(false);
                      setSelectedStockId(item.id);
                      setRestockModalOpen(true);
                    }}
                    className="px-3 py-1 bg-black text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition cursor-pointer"
                  >
                    Пополнить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal Add Transaction */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title={t('modal_add_transaction_title')}
        subtitle="Фиксация прихода или расхода в кассе UnionPrint"
      >
        <form onSubmit={handleAddTrx} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">Тип операции</label>
              <select
                value={trxType}
                onChange={(e) => setTrxType(e.target.value as TransactionType)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-700 outline-none"
              >
                <option value="income">Приход (Доход)</option>
                <option value="expense">Расход (Затраты)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">Категория</label>
              <select
                value={trxCategory}
                onChange={(e) => setTrxCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-700 outline-none"
              >
                <option value="order_prepayment">Предоплата заказа</option>
                <option value="order_final">Окончательный расчет</option>
                <option value="raw_materials">Закупка сырья</option>
                <option value="equipment_maint">Обслуживание оборудования</option>
                <option value="salary">Зарплата сотрудникам</option>
                <option value="utilities">Аренда и коммунальные</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">Сумма (сум) *</label>
              <input
                type="number"
                required
                min={1}
                value={trxAmount}
                onChange={(e) => setTrxAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-black focus:ring-1 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">Кассир / Ответственный</label>
              <input
                type="text"
                value={trxOperator}
                onChange={(e) => setTrxOperator(e.target.value)}
                placeholder="Имя кассира"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 mb-1 block">Описание операции *</label>
            <input
              type="text"
              required
              value={trxDescription}
              onChange={(e) => setTrxDescription(e.target.value)}
              placeholder="Закупка 20 пачек мелованной бумаги 300g..."
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsTransactionModalOpen(false)}
              className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              className="bg-black hover:bg-neutral-800 text-white px-5 py-2 text-xs font-bold rounded-lg shadow-xs cursor-pointer"
            >
              {t('btn_save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Restock / Add Inventory */}
      <Modal
        isOpen={restockModalOpen}
        onClose={() => {
          setRestockModalOpen(false);
          setIsNewMaterial(false);
        }}
        title={isNewMaterial || stock.length === 0 ? "Добавление материала на склад" : "Пополнение складского запаса"}
        subtitle={isNewMaterial || stock.length === 0 ? "Укажите характеристики сырья и начальный остаток" : "Занесите количество поступившего сырья"}
      >
        <form onSubmit={handleRestockSubmit} className="space-y-4">
          {stock.length > 0 && (
            <div className="flex rounded-lg bg-neutral-100 p-1 mb-2">
              <button
                type="button"
                onClick={() => setIsNewMaterial(false)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${!isNewMaterial ? 'bg-white shadow-xs text-black' : 'text-neutral-500'}`}
              >
                Пополнить существующий
              </button>
              <button
                type="button"
                onClick={() => setIsNewMaterial(true)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${isNewMaterial ? 'bg-white shadow-xs text-black' : 'text-neutral-500'}`}
              >
                + Новый материал
              </button>
            </div>
          )}

          {isNewMaterial || stock.length === 0 ? (
            <>
              <div>
                <label className="text-xs font-bold text-neutral-700 mb-1 block">Название материала *</label>
                <input
                  type="text"
                  required
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  placeholder="Например: Мелованная бумага 300g"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 mb-1 block">Категория</label>
                  <select
                    value={newMatCategory}
                    onChange={(e) => setNewMatCategory(e.target.value as MaterialCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-700 outline-none"
                  >
                    <option value="paper">Бумага и картон</option>
                    <option value="ink">Краска и тонер</option>
                    <option value="film">Ламинация и пленка</option>
                    <option value="plates">Печатные формы</option>
                    <option value="packaging">Упаковка и фурнитура</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 mb-1 block">Единица измерения</label>
                  <input
                    type="text"
                    value={newMatUnit}
                    onChange={(e) => setNewMatUnit(e.target.value)}
                    placeholder="лист / кг / рулон / м²"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 mb-1 block">Начальный остаток</label>
                  <input
                    type="number"
                    min={0}
                    value={restockQty}
                    onChange={(e) => setRestockQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 mb-1 block">Порог остатка</label>
                  <input
                    type="number"
                    min={1}
                    value={newMatMinThreshold}
                    onChange={(e) => setNewMatMinThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 mb-1 block">Себестоимость</label>
                  <input
                    type="number"
                    min={0}
                    value={newMatCost}
                    onChange={(e) => setNewMatCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-neutral-700 mb-1 block">Выберите материал</label>
                <select
                  value={selectedStockId}
                  onChange={(e) => setSelectedStockId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-700 outline-none"
                >
                  {stock.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (текущий: {s.quantity} {s.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 mb-1 block">Количество к добавлению</label>
                <input
                  type="number"
                  min={1}
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-black focus:ring-1 focus:ring-black outline-none"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => {
                setRestockModalOpen(false);
                setIsNewMaterial(false);
              }}
              className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              className="bg-black hover:bg-neutral-800 text-white px-5 py-2 text-xs font-bold rounded-lg shadow-xs cursor-pointer"
            >
              {isNewMaterial || stock.length === 0 ? "Создать материал" : "Пополнить склад"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
