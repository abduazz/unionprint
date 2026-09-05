import React from 'react';
import { BarChart3, Award } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useLanguage } from '../../context/LanguageContext';

export const AnalyticsView: React.FC = () => {
  const { orders, employees } = useCRM();
  const { t } = useLanguage();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCirculation = orders.reduce((sum, o) => sum + o.quantity, 0);

  // Group revenue by category
  const categoriesMap: Record<string, { count: number; sum: number }> = {};
  orders.forEach(o => {
    if (!categoriesMap[o.category]) {
      categoriesMap[o.category] = { count: 0, sum: 0 };
    }
    categoriesMap[o.category].count += 1;
    categoriesMap[o.category].sum += o.totalAmount;
  });

  const categoryList = Object.entries(categoriesMap).map(([key, val]) => ({
    category: key,
    count: val.count,
    sum: val.sum,
    percentage: Math.round((val.sum / (totalRevenue || 1)) * 100),
  })).sort((a, b) => b.sum - a.sum);

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ' + t('currency_symbol');
  };

  return (
    <div className="space-y-6">
      {/* Top metric overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Общий объем заказов</span>
          <div className="text-2xl font-black text-neutral-900 tracking-tight">{formatMoney(totalRevenue)}</div>
          <div className="text-xs text-neutral-500 font-bold">Суммарная смета всех созданных заказов</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Совокупный тираж</span>
          <div className="text-2xl font-black text-neutral-900 tracking-tight">{totalCirculation.toLocaleString('ru-RU')} шт</div>
          <div className="text-xs text-neutral-500 font-bold">Общее количество отпечатанных единиц</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Средний чек заказа</span>
          <div className="text-2xl font-black text-neutral-900 tracking-tight">
            {formatMoney(Math.round(totalRevenue / (orders.length || 1)))}
          </div>
          <div className="text-xs text-neutral-500 font-bold">Средняя стоимость одной полиграфической работы</div>
        </div>
      </div>

      {/* Breakdown by product categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-neutral-900">Выручка по видам изделий</h3>
              <p className="text-xs font-bold text-neutral-500">Доля полиграфической продукции в обороте</p>
            </div>
            <BarChart3 className="w-5 h-5 text-neutral-400" />
          </div>

          <div className="space-y-3">
            {categoryList.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Данных по категориям пока нет
              </div>
            ) : (
              categoryList.map(cat => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-neutral-900">{t(`cat_${cat.category}`) || cat.category}</span>
                    <span className="text-neutral-700">{formatMoney(cat.sum)} ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-black transition-all duration-300"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Manager & Employee production leader board */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-neutral-900">Рейтинг сотрудников производства</h3>
              <p className="text-xs font-bold text-neutral-500">Эффективность выполнения заказов</p>
            </div>
            <Award className="w-5 h-5 text-neutral-400" />
          </div>

          <div className="space-y-3">
            {employees.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Сотрудников пока нет
              </div>
            ) : (
              employees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 bg-neutral-50/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${emp.avatarBg || 'bg-black'} text-white font-black text-xs flex items-center justify-center`}>
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-xs font-black text-neutral-900">{emp.name}</div>
                      <div className="text-[10px] font-bold text-neutral-400">{emp.role}</div>
                    </div>
                  </div>

                  <div className="text-right text-xs font-bold">
                    <div className="text-neutral-900 font-black">{emp.completedOrdersCount} выполненных</div>
                    <div className="text-[10px] text-neutral-400">{formatMoney(emp.monthlyCurrentAmount)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
