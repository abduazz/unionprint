import React from 'react';
import { ToggleLeft, ToggleRight, Users } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useLanguage } from '../../context/LanguageContext';
import type { EmployeeRole, ShiftStatus } from '../../types/crm';
import { Modal } from '../ui/Modal';

export const EmployeesView: React.FC = () => {
  const { 
    employees, 
    searchQuery, 
    toggleEmployeeShift, 
    setEmployeeStatus,
    isCreateEmployeeModalOpen, 
    setIsCreateEmployeeModalOpen,
    addEmployee 
  } = useCRM();

  const { t } = useLanguage();

  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState<EmployeeRole>('sales');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [status] = React.useState<ShiftStatus>('on_shift');
  const [monthlyTargetAmount, setMonthlyTargetAmount] = React.useState(100000000);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleLabel = (role: EmployeeRole) => {
    const map: Record<EmployeeRole, string> = {
      sales: 'Менеджер продаж',
      operator: 'Печатник (Оператор)',
      designer: 'Графический Дизайнер',
      postpress: 'Мастер Постпресса',
      accountant: 'Бухгалтер',
      admin: 'Администратор CRM',
    };
    return map[role] || role;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Заполните Имя и Email сотрудника');
      return;
    }
    addEmployee({
      name,
      role,
      phone,
      email,
      status,
      monthlyTargetAmount,
      avatarBg: 'bg-black',
    });
    setIsCreateEmployeeModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ' + t('currency_symbol');
  };

  return (
    <div className="space-y-6">
      {/* Employee Roster Cards */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white border border-dashed border-neutral-200 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-sm font-black text-neutral-900">Сотрудников пока нет</div>
          <p className="text-xs text-neutral-500 font-bold max-w-sm mx-auto">
            Добавьте членов вашей команды (печатников, дизайнеров, менеджеров продаж), чтобы распределять заказы
          </p>
          <button
            onClick={() => setIsCreateEmployeeModalOpen(true)}
            className="mt-2 bg-black hover:bg-neutral-800 text-white rounded-lg px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>+ Добавить первого сотрудника</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(emp => {
            const progressPercent = Math.min(Math.round((emp.monthlyCurrentAmount / (emp.monthlyTargetAmount || 1)) * 100), 100);

            return (
              <div 
                key={emp.id}
                className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-all duration-150 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${emp.avatarBg || 'bg-black'} text-white font-black text-xs flex items-center justify-center shadow-xs`}>
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-neutral-900 leading-tight">{emp.name}</h3>
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          {getRoleLabel(emp.role)}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Status Selector */}
                    <select
                      value={emp.status}
                      onChange={(e) => setEmployeeStatus(emp.id, e.target.value as ShiftStatus)}
                      className="text-[10px] font-extrabold px-2 py-1 rounded-md border outline-none bg-neutral-50 hover:bg-white transition cursor-pointer"
                    >
                      <option value="on_shift">🟢 НА СМЕНЕ</option>
                      <option value="in_production">🟣 В ПЕЧАТИ</option>
                      <option value="off_duty">⚪ ВЫХОДНОЙ</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs font-bold text-neutral-600 pt-2 border-t border-neutral-100">
                    <div className="flex items-center justify-between text-neutral-500">
                      <span>Текущие заказы:</span>
                      <span className="font-black text-neutral-900">{emp.activeOrdersCount} в работе</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-500">
                      <span>Выполнено всего:</span>
                      <span className="font-black text-neutral-900">{emp.completedOrdersCount} заказов</span>
                    </div>
                  </div>

                  {/* Performance Plan Bar */}
                  <div className="pt-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 mb-1">
                      <span>ПЛАН ПРОДАЖ / ПЕЧАТИ</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-black transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-bold text-neutral-500 mt-1 flex justify-between">
                      <span>{formatMoney(emp.monthlyCurrentAmount)}</span>
                      <span>{formatMoney(emp.monthlyTargetAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom shift toggle */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500">Переключить смену</span>
                  <button
                    onClick={() => toggleEmployeeShift(emp.id)}
                    className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                  >
                    {emp.status === 'on_shift' ? (
                      <ToggleRight className="w-4 h-4 text-emerald-600" />
                    ) : emp.status === 'in_production' ? (
                      <ToggleRight className="w-4 h-4 text-purple-600" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-neutral-400" />
                    )}
                    <span>
                      {emp.status === 'on_shift' ? 'На смене' : emp.status === 'in_production' ? 'В печати' : 'Выходной'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal create employee */}
      <Modal
        isOpen={isCreateEmployeeModalOpen}
        onClose={() => setIsCreateEmployeeModalOpen(false)}
        title={t('modal_create_employee_title')}
        subtitle="Добавление нового сотрудника производства или офиса"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">ФИО Сотрудника *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Сардор Ахмедов"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">Должность / Роль</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as EmployeeRole)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-700 outline-none"
              >
                <option value="sales">Менеджер продаж</option>
                <option value="operator">Печатник (Оператор)</option>
                <option value="designer">Графический Дизайнер</option>
                <option value="postpress">Мастер Постпресса</option>
                <option value="accountant">Бухгалтер</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">Телефон</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123-45-67"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">Корпоративный Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="s.akhmedov@unionprint.uz"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 mb-1 block">Месячный план производства (сум)</label>
            <input
              type="number"
              value={monthlyTargetAmount}
              onChange={(e) => setMonthlyTargetAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsCreateEmployeeModalOpen(false)}
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
    </div>
  );
};
