import React from 'react';
import { Phone, Mail, Building, Users } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useLanguage } from '../../context/LanguageContext';
import type { ClientStatus } from '../../types/crm';
import { Badge, type BadgeVariant } from '../ui/Badge';
import { Modal } from '../ui/Modal';

export const ClientsView: React.FC = () => {
  const { 
    clients, 
    searchQuery, 
    isCreateClientModalOpen, 
    setIsCreateClientModalOpen,
    addClient 
  } = useCRM();

  const { t } = useLanguage();

  const [name, setName] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<ClientStatus>('lead');
  const [assignedStaffName, setAssignedStaffName] = React.useState('');
  const [notes] = React.useState('');

  const filteredClients = clients.filter(cli => 
    cli.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cli.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cli.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cli.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (st: ClientStatus) => {
    const map: Record<ClientStatus, { labelKey: string; variant: BadgeVariant }> = {
      lead: { labelKey: 'client_lead', variant: 'indigo' },
      spec_approval: { labelKey: 'client_spec_approval', variant: 'amber' },
      vip: { labelKey: 'client_vip', variant: 'fuchsia' },
      pending_payment: { labelKey: 'client_pending_payment', variant: 'rose' },
      regular: { labelKey: 'client_regular', variant: 'emerald' },
    };
    const item = map[st] || { labelKey: st, variant: 'neutral' };
    return <Badge variant={item.variant}>{t(item.labelKey)}</Badge>;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Заполните Имя и Телефон клиента');
      return;
    }
    addClient({
      name,
      company,
      phone,
      email,
      status,
      assignedStaffName,
      notes,
    });
    setIsCreateClientModalOpen(false);
    setName('');
    setCompany('');
    setPhone('');
    setEmail('');
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ' + t('currency_symbol');
  };

  return (
    <div className="space-y-6">
      {/* Grid of Client Cards */}
      {filteredClients.length === 0 ? (
        <div className="bg-white border border-dashed border-neutral-200 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-sm font-black text-neutral-900">Клиентов пока нет</div>
          <p className="text-xs text-neutral-500 font-bold max-w-sm mx-auto">
            Зарегистрируйте первого заказчика, чтобы оформлять заказы и сохранять контактные данные
          </p>
          <button
            onClick={() => setIsCreateClientModalOpen(true)}
            className="mt-2 bg-black hover:bg-neutral-800 text-white rounded-lg px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>+ Добавить первого клиента</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(cli => (
            <div 
              key={cli.id}
              className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-all duration-150 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-black text-white font-black text-xs flex items-center justify-center">
                      {cli.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-neutral-900 leading-tight">{cli.name}</h3>
                      {cli.company && (
                        <div className="text-[10px] font-bold text-neutral-400 flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          <span>{cli.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(cli.status)}
                </div>

                <div className="space-y-1 text-xs font-bold text-neutral-600 pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{cli.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{cli.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-normal uppercase">Выполнено заказов</span>
                  <span className="font-black text-neutral-900">{cli.totalOrdersCount} шт</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 block font-normal uppercase">LTV (Всего заказов)</span>
                  <span className="font-black text-neutral-900">{formatMoney(cli.totalSpent)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Client Modal */}
      <Modal
        isOpen={isCreateClientModalOpen}
        onClose={() => setIsCreateClientModalOpen(false)}
        title={t('modal_create_client_title')}
        subtitle="Регистрация нового заказчика в базе UnionPrint"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">
                {t('field_client_name')} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Иванов"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">
                {t('field_company')}
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="ООО Прогресс"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">
                {t('field_phone')} *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 000-00-00"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@company.uz"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">
                Статус воронки
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-700 outline-none"
              >
                <option value="lead">{t('client_lead')}</option>
                <option value="spec_approval">{t('client_spec_approval')}</option>
                <option value="regular">{t('client_regular')}</option>
                <option value="vip">{t('client_vip')}</option>
                <option value="pending_payment">{t('client_pending_payment')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">
                Персональный менеджер
              </label>
              <input
                type="text"
                value={assignedStaffName}
                onChange={(e) => setAssignedStaffName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsCreateClientModalOpen(false)}
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
