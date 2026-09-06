import type { Language } from '../types/crm';

export const translations: Record<Language, Record<string, string>> = {
  ru: {
    // Navigation
    nav_kanban: 'Канбан Доска',
    nav_orders: 'Все Заказы',
    nav_clients: 'Клиенты & Лиды',
    nav_employees: 'Сотрудники & Производство',
    nav_accounting: 'Учет & Материалы',
    nav_analytics: 'Аналитика & Отчеты',
    nav_superadmin: 'Супер Админ',

    // Titles & Subtitles
    kanban_subtitle: 'Интерактивное управление воронкой полиграфических заказов',
    orders_subtitle: 'Реестр спецификаций, расчетов и статусов типографии',
    clients_subtitle: 'База заказчиков, VIP-клиентов и потенциальных лидов',
    employees_subtitle: 'Загрузка персонала, смены и продуктивность производства',
    accounting_subtitle: 'Финансовый учет, кассовые операции и остатки сырья',
    analytics_subtitle: 'Анализ выручки, популярных услуг и эффективности',
    superadmin_subtitle: 'Управление доступом, учетными записями работников и безопасностью',

    // Kanban Stages
    stage_new: 'Новый запрос',
    stage_costing: 'Расчет стоимости',
    stage_printing: 'В печати',
    stage_postpress: 'Постпресс & Сборка',
    stage_ready: 'Готов к выдаче',
    stage_completed: 'Выдан & Оплачен',
    stage_canceled: 'Отменен',

    // Client Pipeline Stages
    client_lead: 'Первичный контакт',
    client_spec_approval: 'Согласование ТЗ',
    client_vip: 'VIP Клиент',
    client_pending_payment: 'Ожидает оплаты',
    client_regular: 'Постоянный',

    // Categories
    cat_business_cards: 'Визитки',
    cat_flyers: 'Флаеры / Листовки',
    cat_catalogs: 'Буклеты & Каталоги',
    cat_banners: 'Баннеры & Наружка',
    cat_packaging: 'Упаковка & Коробки',
    cat_souvenirs: 'Сувениры & Мерч',
    cat_large_format: 'Широкоформатка',

    // Metrics
    metric_total_revenue: 'Выручка за месяц',
    metric_active_orders: 'Заказов в работе',
    metric_net_profit: 'Чистая прибыль',
    metric_debtors: 'Дебиторская задолженность',
    metric_paper_stock: 'Остаток бумаги',
    metric_completed_this_month: 'Выполнено заказов',

    // Actions
    btn_new_order: 'Новый Заказ',
    btn_new_client: 'Новый Клиент',
    btn_new_employee: 'Добавить Сотрудника',
    btn_add_transaction: 'Кассовая операция',
    btn_add_stock: 'Пополнить склад',
    btn_export: 'Экспорт Excel',
    btn_filter: 'Фильтры',
    btn_cancel: 'Отмена',
    btn_save: 'Сохранить',
    btn_search: 'Поиск по названию, клиенту...',
    btn_calculate: 'Рассчитать стоимость',
    btn_print_ticket: 'Печать бланка заказа',

    // Modal Labels
    modal_create_order_title: 'Создание нового полиграфического заказа',
    modal_order_details: 'Карточка заказа & Спецификация',
    modal_create_client_title: 'Добавление нового клиента',
    modal_create_employee_title: 'Карточка сотрудника',
    modal_add_transaction_title: 'Учет доходов / расходов',

    // Form fields
    field_client_name: 'ФИО Клиента',
    field_phone: 'Телефон',
    field_company: 'Компания / Организация',
    field_order_title: 'Наименование заказа',
    field_category: 'Категория изделия',
    field_quantity: 'Тираж (шт)',
    field_format: 'Формат изделия',
    field_paper_type: 'Тип и плотность бумаги',
    field_color_mode: 'Цветность печати',
    field_finishings: 'Постпечатная обработка',
    field_priority: 'Приоритет',
    field_total_amount: 'Итоговая стоимость (сум)',
    field_paid_amount: 'Внесенная предоплата (сум)',
    field_assigned_staff: 'Ответственный сотрудник',
    field_deadline: 'Срок выполнения',
    field_notes: 'Техническое задание / Примечание',

    // Table Columns
    col_order_num: '№ Заказа',
    col_client: 'Заказчик',
    col_product: 'Изделие / Тираж',
    col_specs: 'Спецификация',
    col_stage: 'Этап воронки',
    col_priority: 'Приоритет',
    col_price: 'Стоимость',
    col_prepayment: 'Предоплата',
    col_deadline: 'Дедлайн',
    col_actions: 'Действия',

    // General UI
    search_placeholder: 'Поиск...',
    all_categories: 'Все категории',
    all_stages: 'Все этапы',
    all_roles: 'Все должности',
    logout: 'Выйти',
    user_role: 'Администратор CRM',
    language: 'Язык',
    no_orders_found: 'Заказов не найдено',
    stock_warning: 'Внимание: Ниже порога!',
    currency_symbol: 'сум',
  },
  uz: {
    // Navigation
    nav_kanban: 'Kanban Doskasi',
    nav_orders: 'Barcha Buyurtmalar',
    nav_clients: 'Mijozlar & Lids',
    nav_employees: 'Xodimlar & Ishlab chiqarish',
    nav_accounting: 'Hisob & Materiallar',
    nav_analytics: 'Tahlil & Hisobotlar',
    nav_superadmin: 'Super Admin',

    // Titles & Subtitles
    kanban_subtitle: 'Matbaa buyurtmalari voronkasini boshqarish',
    orders_subtitle: 'Bosmaxona spetsifikatsiyalari va hisob-kitoblar roʻyxati',
    clients_subtitle: 'Buyurtmachilar, VIP-mijozlar va lidlar bazasi',
    employees_subtitle: 'Xodimlar yuklamasi va mahsuldorlik',
    accounting_subtitle: 'Moliyaviy hisob, kassa operatsiyalari va xomashyo zaxirasi',
    analytics_subtitle: 'Tushum va samaradorlik tahlili',
    superadmin_subtitle: 'Xodimlar akkauntlari, ruxsatlar va xavfsizlik boshqaruvi',

    // Kanban Stages
    stage_new: 'Yangi soʻrov',
    stage_costing: 'Narx hisoblash',
    stage_printing: 'Chop etish jarayonida',
    stage_postpress: 'Postpress & Yigʻuv',
    stage_ready: 'Topshirishga tayyor',
    stage_completed: 'Topshirildi & Toʻlandi',
    stage_canceled: 'Bekor qilindi',

    // Client Pipeline Stages
    client_lead: 'Birinchi muloqot',
    client_spec_approval: 'TZ kelishish',
    client_vip: 'VIP Mijoz',
    client_pending_payment: 'Toʻlov kutilmoqda',
    client_regular: 'Doimiy',

    // Categories
    cat_business_cards: 'Vizitkalar',
    cat_flyers: 'Flayerlar / Bukletlar',
    cat_catalogs: 'Kataloglar',
    cat_banners: 'Bannerlar',
    cat_packaging: 'Qadoqlash & Qutilar',
    cat_souvenirs: 'Esdalik sovgʻalari',
    cat_large_format: 'Katta format',

    // Metrics
    metric_total_revenue: 'Oylik tushum',
    metric_active_orders: 'Jarayondagi buyurtmalar',
    metric_net_profit: 'Sof foyda',
    metric_debtors: 'Debitorlik qarzi',
    metric_paper_stock: 'Qogʻoz zaxirasi',
    metric_completed_this_month: 'Bajarilgan buyurtmalar',

    // Actions
    btn_new_order: 'Yangi Buyurtma',
    btn_new_client: 'Yangi Mijoz',
    btn_new_employee: 'Xodim Qoʻshish',
    btn_add_transaction: 'Kassa operatsiyasi',
    btn_add_stock: 'Omborni toʻldirish',
    btn_export: 'Excel Eksport',
    btn_filter: 'Filtrlar',
    btn_cancel: 'Bekor qilish',
    btn_save: 'Saqlash',
    btn_search: 'Nomi yoki mijoz boʻyicha qidiruv...',
    btn_calculate: 'Narxni hisoblash',
    btn_print_ticket: 'Buyurtma blankini chop etish',

    // Modal Labels
    modal_create_order_title: 'Yangi matbaa buyurtmasini yaratish',
    modal_order_details: 'Buyurtma kartasi & Spetsifikatsiya',
    modal_create_client_title: 'Yangi mijoz qoʻshish',
    modal_create_employee_title: 'Xodim kartasi',
    modal_add_transaction_title: 'Kirim / Chiqim hisobi',

    // Form fields
    field_client_name: 'Mijoz F.I.Sh',
    field_phone: 'Telefon',
    field_company: 'Kompaniya',
    field_order_title: 'Buyurtma nomi',
    field_category: 'Mahsulot kategoriyasi',
    field_quantity: 'Adad (dona)',
    field_format: 'Mahsulot formati',
    field_paper_type: 'Qogʻoz turi va zichligi',
    field_color_mode: 'Chop etish rangliligi',
    field_finishings: 'Poshot chop etish ishlovi',
    field_priority: 'Muhimlik',
    field_total_amount: 'Jami summa (soʻm)',
    field_paid_amount: 'Oldindan toʻlov (soʻm)',
    field_assigned_staff: 'Masʼul xodim',
    field_deadline: 'Topshirish muddati',
    field_notes: 'Texnik topshiriq / Izoh',

    // Table Columns
    col_order_num: 'Buyurtma №',
    col_client: 'Buyurtmachi',
    col_product: 'Mahsulot / Adad',
    col_specs: 'Spetsifikatsiya',
    col_stage: 'Bosqich',
    col_priority: 'Muhimlik',
    col_price: 'Narx',
    col_prepayment: 'Oldindan toʻlov',
    col_deadline: 'Muddat',
    col_actions: 'Harakatlar',

    // General UI
    search_placeholder: 'Qidiruv...',
    all_categories: 'Barcha kategoriyalar',
    all_stages: 'Barcha bosqichlar',
    all_roles: 'Barcha lavozimlar',
    logout: 'Chiqish',
    user_role: 'CRM Administratori',
    language: 'Til',
    no_orders_found: 'Buyurtmalar topilmadi',
    stock_warning: 'Diqqat: Chegaradan kam!',
    currency_symbol: 'soʻm',
  },
  en: {
    // Navigation
    nav_kanban: 'Kanban Board',
    nav_orders: 'All Orders',
    nav_clients: 'Clients & Leads',
    nav_employees: 'Staff & Production',
    nav_accounting: 'Accounting & Stock',
    nav_analytics: 'Analytics & Reports',
    nav_superadmin: 'Super Admin',

    // Titles & Subtitles
    kanban_subtitle: 'Interactive printing order pipeline management',
    orders_subtitle: 'Registry of specs, calculations, and print job statuses',
    clients_subtitle: 'Database of buyers, VIP clients, and sales leads',
    employees_subtitle: 'Staff workload, shifts, and production efficiency',
    accounting_subtitle: 'Financial accounting, cash transactions, and raw materials',
    analytics_subtitle: 'Revenue analysis, top services, and efficiency metrics',
    superadmin_subtitle: 'Access control, staff worker accounts, and security management',

    // Kanban Stages
    stage_new: 'New Lead',
    stage_costing: 'Costing & Specs',
    stage_printing: 'In Production',
    stage_postpress: 'Post-press & Assembly',
    stage_ready: 'Ready for Pickup',
    stage_completed: 'Delivered & Paid',
    stage_canceled: 'Canceled',

    // Client Pipeline Stages
    client_lead: 'First Contact',
    client_spec_approval: 'Spec Approval',
    client_vip: 'VIP Client',
    client_pending_payment: 'Pending Payment',
    client_regular: 'Regular Buyer',

    // Categories
    cat_business_cards: 'Business Cards',
    cat_flyers: 'Flyers & Leaflets',
    cat_catalogs: 'Brochures & Catalogs',
    cat_banners: 'Banners & Signs',
    cat_packaging: 'Packaging & Boxes',
    cat_souvenirs: 'Souvenirs & Merch',
    cat_large_format: 'Large Format',

    // Metrics
    metric_total_revenue: 'Monthly Revenue',
    metric_active_orders: 'Active In Production',
    metric_net_profit: 'Net Profit',
    metric_debtors: 'Accounts Receivable',
    metric_paper_stock: 'Paper Stock Level',
    metric_completed_this_month: 'Completed Orders',

    // Actions
    btn_new_order: 'New Order',
    btn_new_client: 'New Client',
    btn_new_employee: 'Add Employee',
    btn_add_transaction: 'Transaction',
    btn_add_stock: 'Restock Inventory',
    btn_export: 'Export Excel',
    btn_filter: 'Filters',
    btn_cancel: 'Cancel',
    btn_save: 'Save',
    btn_search: 'Search by title, client...',
    btn_calculate: 'Calculate Price',
    btn_print_ticket: 'Print Job Ticket',

    // Modal Labels
    modal_create_order_title: 'Create New Printing Order',
    modal_order_details: 'Order Ticket & Specifications',
    modal_create_client_title: 'Add New Client',
    modal_create_employee_title: 'Employee Profile',
    modal_add_transaction_title: 'Income / Expense Entry',

    // Form fields
    field_client_name: 'Client Name',
    field_phone: 'Phone Number',
    field_company: 'Company / Organization',
    field_order_title: 'Job Title',
    field_category: 'Product Category',
    field_quantity: 'Circulation / Quantity',
    field_format: 'Dimensions / Format',
    field_paper_type: 'Paper Type & Density',
    field_color_mode: 'Print Color Mode',
    field_finishings: 'Post-press Finishing',
    field_priority: 'Priority',
    field_total_amount: 'Total Price (UZS)',
    field_paid_amount: 'Prepayment Received (UZS)',
    field_assigned_staff: 'Assigned Operator',
    field_deadline: 'Deadline Date',
    field_notes: 'Production Notes / Spec Details',

    // Table Columns
    col_order_num: 'Order #',
    col_client: 'Client',
    col_product: 'Product / Quantity',
    col_specs: 'Specifications',
    col_stage: 'Stage',
    col_priority: 'Priority',
    col_price: 'Price',
    col_prepayment: 'Prepayment',
    col_deadline: 'Deadline',
    col_actions: 'Actions',

    // General UI
    search_placeholder: 'Search...',
    all_categories: 'All Categories',
    all_stages: 'All Stages',
    all_roles: 'All Roles',
    logout: 'Logout',
    user_role: 'CRM Administrator',
    language: 'Language',
    no_orders_found: 'No orders found',
    stock_warning: 'Warning: Low Stock!',
    currency_symbol: 'UZS',
  }
};
