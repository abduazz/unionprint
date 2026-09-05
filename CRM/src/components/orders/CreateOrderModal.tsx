import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { useLanguage } from '../../context/LanguageContext';
import type { OrderCategory, Priority } from '../../types/crm';
import { Modal } from '../ui/Modal';

export const CreateOrderModal: React.FC = () => {
  const { 
    isCreateOrderModalOpen, 
    setIsCreateOrderModalOpen, 
    addOrder, 
    employees, 
    clients 
  } = useCRM();

  const { t } = useLanguage();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<OrderCategory>('business_cards');
  const [quantity, setQuantity] = useState<number>(1000);
  const [format, setFormat] = useState('90x50 мм');
  const [paperType, setPaperType] = useState('Мелованная 300g');
  const [colorMode, setColorMode] = useState('4+4 (Цветная 2-стор)');
  const [selectedFinishings, setSelectedFinishings] = useState<string[]>(['Матовая ламинация']);
  const [priority] = useState<Priority>('medium');
  const [assignedStaffId, setAssignedStaffId] = useState(employees[0]?.id || '');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [totalAmount, setTotalAmount] = useState<number>(1500000);
  const [paidAmount, setPaidAmount] = useState<number>(750000);
  const [notes, setNotes] = useState('');

  // Available finishings options
  const finishingOptions = [
    'Матовая ламинация',
    'Глянцевая ламинация',
    'Тиснение фольгой (золото/серебро)',
    'УФ-лак выборочный',
    'Вырубка / Штамп',
    'Биговка / Фальцовка',
    'Сборка на пружину',
  ];

  // Auto-calculate price based on polygraphy specs
  useEffect(() => {
    let basePricePerUnit = 1500;
    if (category === 'flyers') basePricePerUnit = 600;
    if (category === 'catalogs') basePricePerUnit = 18000;
    if (category === 'banners') basePricePerUnit = 120000;
    if (category === 'packaging') basePricePerUnit = 4500;
    if (category === 'souvenirs') basePricePerUnit = 65000;
    if (category === 'large_format') basePricePerUnit = 95000;

    // Quantity discount multiplier
    let qtyMultiplier = 1.0;
    if (quantity >= 5000) qtyMultiplier = 0.75;
    else if (quantity >= 1000) qtyMultiplier = 0.85;

    let subtotal = quantity * basePricePerUnit * qtyMultiplier;

    // Add finishing costs
    if (selectedFinishings.includes('Тиснение фольгой (золото/серебро)')) subtotal *= 1.35;
    if (selectedFinishings.includes('УФ-лак выборочный')) subtotal *= 1.20;
    if (selectedFinishings.includes('Вырубка / Штамп')) subtotal *= 1.15;
    if (selectedFinishings.includes('Матовая ламинация') || selectedFinishings.includes('Глянцевая ламинация')) subtotal *= 1.15;

    const roundedTotal = Math.round(subtotal / 1000) * 1000;
    setTotalAmount(roundedTotal);
    setPaidAmount(Math.round(roundedTotal * 0.5));
  }, [category, quantity, selectedFinishings]);

  // Client quick fill handler
  const handleClientSelect = (clientId: string) => {
    const cli = clients.find(c => c.id === clientId);
    if (cli) {
      setClientName(cli.name);
      setClientPhone(cli.phone);
      setClientCompany(cli.company);
    }
  };

  const toggleFinishing = (item: string) => {
    setSelectedFinishings(prev => 
      prev.includes(item) ? prev.filter(f => f !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) {
      alert('Заполните наименование заказа и имя клиента');
      return;
    }

    const assignedStaff = employees.find(e => e.id === assignedStaffId);

    addOrder({
      clientName,
      clientPhone,
      clientCompany: clientCompany || undefined,
      title,
      category,
      stage: 'new',
      priority,
      quantity,
      format,
      paperType,
      colorMode,
      finishings: selectedFinishings,
      totalAmount,
      paidAmount,
      assignedStaffId: assignedStaffId || 'emp-1',
      assignedStaffName: assignedStaff ? `${assignedStaff.name} (${t(`all_roles`).slice(0, 4)})` : 'Азиз Рахимов',
      deadline,
      notes,
    });

    setIsCreateOrderModalOpen(false);
  };

  return (
    <Modal
      isOpen={isCreateOrderModalOpen}
      onClose={() => setIsCreateOrderModalOpen(false)}
      title={t('modal_create_order_title')}
      subtitle="Заполните параметры изделия для автоматического расчета сметы"
      maxWidthClass="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick select client from database */}
        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
          <label className="text-[10px] font-extrabold uppercase text-neutral-400 block mb-1">
            Выбрать существующего клиента из базы
          </label>
          <select
            onChange={(e) => handleClientSelect(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-700 outline-none"
          >
            <option value="">-- Новый клиент (ввести вручную ниже) --</option>
            {clients.map(cli => (
              <option key={cli.id} value={cli.id}>
                {cli.name} {cli.company ? `(${cli.company})` : ''} - {cli.phone}
              </option>
            ))}
          </select>
        </div>

        {/* Section 1: Client details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-neutral-700 mb-1 block">
              {t('field_client_name')} *
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Алишер Каримов"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-700 mb-1 block">
              {t('field_phone')}
            </label>
            <input
              type="text"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="+998 90 123-45-67"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-700 mb-1 block">
              {t('field_company')}
            </label>
            <input
              type="text"
              value={clientCompany}
              onChange={(e) => setClientCompany(e.target.value)}
              placeholder="ООО Enterprise"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
            />
          </div>
        </div>

        {/* Section 2: Order & Polygraphy Specs */}
        <div className="space-y-4 pt-2 border-t border-neutral-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">
                {t('field_order_title')} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Визитки премиум с золото тиснением 1000 шт"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">
                {t('field_category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as OrderCategory)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-700 outline-none"
              >
                <option value="business_cards">{t('cat_business_cards')}</option>
                <option value="flyers">{t('cat_flyers')}</option>
                <option value="catalogs">{t('cat_catalogs')}</option>
                <option value="banners">{t('cat_banners')}</option>
                <option value="packaging">{t('cat_packaging')}</option>
                <option value="souvenirs">{t('cat_souvenirs')}</option>
                <option value="large_format">{t('cat_large_format')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">
                {t('field_quantity')}
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">
                {t('field_format')}
              </label>
              <input
                type="text"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                placeholder="90x50 мм / А4"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">
                {t('field_paper_type')}
              </label>
              <select
                value={paperType}
                onChange={(e) => setPaperType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-700 outline-none"
              >
                <option value="Мелованная 300g">Мелованная 300g</option>
                <option value="Мелованная 150g">Мелованная 150g</option>
                <option value="Touche Cover 301g">Touche Cover 301g</option>
                <option value="Дизайнерский картон 350g">Дизайнерский картон 350g</option>
                <option value="Самоклейка Gloss">Самоклейка Gloss</option>
                <option value="Баннер 510g">Баннер 510g</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 mb-1 block">
                {t('field_color_mode')}
              </label>
              <select
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-700 outline-none"
              >
                <option value="4+4 (Цветная 2-стор)">4+4 (Цветная 2-стор)</option>
                <option value="4+0 (Цветная 1-стор)">4+0 (Цветная 1-стор)</option>
                <option value="1+1 (Ч/Б 2-стор)">1+1 (Ч/Б 2-стор)</option>
                <option value="1+0 (Ч/Б 1-стор)">1+0 (Ч/Б 1-стор)</option>
              </select>
            </div>
          </div>

          {/* Finishings Selection */}
          <div>
            <label className="text-xs font-bold text-neutral-700 mb-2 block">
              {t('field_finishings')}
            </label>
            <div className="flex flex-wrap gap-2">
              {finishingOptions.map((item) => {
                const isChecked = selectedFinishings.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleFinishing(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      isChecked
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Financial & Staff assignment */}
        <div className="pt-2 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-neutral-700 mb-1 block">
              {t('field_total_amount')}
            </label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-black bg-neutral-50 text-neutral-900 focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-700 mb-1 block">
              {t('field_paid_amount')}
            </label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-700 mb-1 block">
              {t('field_assigned_staff')}
            </label>
            <select
              value={assignedStaffId}
              onChange={(e) => setAssignedStaffId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-700 outline-none"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-700 mb-1 block">
              {t('field_deadline')}
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
            />
          </div>
        </div>

        {/* Section 4: Notes */}
        <div>
          <label className="text-xs font-bold text-neutral-700 mb-1 block">
            {t('field_notes')}
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Особые требования к цветопробе, сопряжению лака или фальцовке..."
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold focus:ring-1 focus:ring-black outline-none"
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => setIsCreateOrderModalOpen(false)}
            className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            {t('btn_cancel')}
          </button>
          <button
            type="submit"
            className="bg-black hover:bg-neutral-800 text-white px-5 py-2 text-xs font-bold rounded-lg shadow-xs active:scale-[0.98] transition cursor-pointer"
          >
            {t('btn_save')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
