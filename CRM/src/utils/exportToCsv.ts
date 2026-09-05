import type { Order, Client, Transaction } from '../types/crm';

export const exportOrdersToCSV = (orders: Order[]) => {
  const headers = [
    'Номер заказа',
    'Клиент',
    'Телефон',
    'Компания',
    'Наименование изделия',
    'Категория',
    'Этап воронки',
    'Приоритет',
    'Тираж (шт)',
    'Формат',
    'Бумага',
    'Цветность',
    'Постпресс',
    'Стоимость (сум)',
    'Предоплата (сум)',
    'Дедлайн',
    'Дата создания'
  ];

  const rows = orders.map(o => [
    o.orderNumber,
    o.clientName,
    o.clientPhone,
    o.clientCompany || '',
    o.title,
    o.category,
    o.stage,
    o.priority,
    o.quantity,
    o.format,
    o.paperType,
    o.colorMode,
    o.finishings.join('; '),
    o.totalAmount,
    o.paidAmount,
    o.deadline,
    o.createdAt
  ]);

  downloadCSV('UnionPrint_Orders_' + new Date().toISOString().split('T')[0] + '.csv', headers, rows);
};

export const exportClientsToCSV = (clients: Client[]) => {
  const headers = [
    'ФИО Клиента',
    'Компания',
    'Телефон',
    'Email',
    'Статус воронки',
    'Выполнено заказов',
    'Общая сумма (сум)',
    'Менеджер'
  ];

  const rows = clients.map(c => [
    c.name,
    c.company || '',
    c.phone,
    c.email,
    c.status,
    c.totalOrdersCount,
    c.totalSpent,
    c.assignedStaffName
  ]);

  downloadCSV('UnionPrint_Clients_' + new Date().toISOString().split('T')[0] + '.csv', headers, rows);
};

export const exportTransactionsToCSV = (transactions: Transaction[]) => {
  const headers = [
    'Дата',
    'Тип',
    'Категория',
    'Сумма (сум)',
    'Описание',
    'Оператор'
  ];

  const rows = transactions.map(t => [
    t.date,
    t.type === 'income' ? 'Приход' : 'Расход',
    t.category,
    t.amount,
    t.description,
    t.operatorName
  ]);

  downloadCSV('UnionPrint_Finances_' + new Date().toISOString().split('T')[0] + '.csv', headers, rows);
};

const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  // UTF-8 BOM for Microsoft Excel Russian & Uzbek text rendering
  const BOM = '\uFEFF';
  const csvContent = 
    BOM +
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(';') + '\n' +
    rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')
    ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
