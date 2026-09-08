/* ==========================================================================
   UNION PRINT — MAIN JAVASCRIPT APPLICATION (MULTILINGUAL)
   Handles:
   - Language Switching (UZ, RU, EN) with localStorage persistence
   - Real-time Working Hours & Status (Multilingual)
   - Interactive Price Calculator with Multilingual Telegram Order
   - Portfolio Filter & Lightbox Preview
   - Quick Lead Order Form
   - Live Catalog Search Filter & Multilingual Catalog Download
   - Copy to Clipboard & Localized Toast Notifications
   - Mobile Nav Menu Drawer & Smooth Scroll
   - Modal System
   ========================================================================== */

let currentLang = 'uz';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Language
  const savedLang = localStorage.getItem('unionprint_lang');
  if (savedLang && (savedLang === 'uz' || savedLang === 'ru' || savedLang === 'en')) {
    currentLang = savedLang;
  }
  applyLanguage(currentLang);

  // 2. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 3. Initialize Core Features
  initWorkingStatus();
  initCalculator();
  initPortfolioFilter();
  initCatalogSearch();
  initMobileMenu();
  setupKeyboardEsc();
  initSmoothScroll();
});

/* ==========================================================================
   1. LANGUAGE SWITCHING SYSTEM
   ========================================================================== */
function setLanguage(lang) {
  if (!window.TRANSLATIONS || !window.TRANSLATIONS[lang]) return;
  currentLang = lang;
  localStorage.setItem('unionprint_lang', lang);
  document.documentElement.lang = lang;

  applyLanguage(lang);
  updateCalculatorOptions(lang);
  updateCalculator();
  initWorkingStatus();

  // Re-create icons in case any were re-rendered
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function applyLanguage(lang) {
  const dict = window.TRANSLATIONS ? window.TRANSLATIONS[lang] : null;
  if (!dict) return;

  // 1. Update active states on language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 2. Text translations with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      elem.innerHTML = dict[key];
    }
  });

  // 3. Placeholder translations with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
    const key = elem.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) {
      elem.placeholder = dict[key];
    }
  });

  // 4. Value / Titles
  document.querySelectorAll('[data-i18n-title]').forEach(elem => {
    const key = elem.getAttribute('data-i18n-title');
    if (dict[key] !== undefined) {
      elem.title = dict[key];
    }
  });
}

function t(key, fallback) {
  if (window.TRANSLATIONS && window.TRANSLATIONS[currentLang] && window.TRANSLATIONS[currentLang][key]) {
    return window.TRANSLATIONS[currentLang][key];
  }
  return fallback || key;
}

/* ==========================================================================
   2. REAL-TIME WORKING STATUS INDICATOR (09:00 - 19:00, Mon - Sat)
   ========================================================================== */
function initWorkingStatus() {
  const statusBadges = document.querySelectorAll('.live-status-pill, #live-status-badge');
  if (!statusBadges.length) return;

  const now = new Date();
  const day = now.getDay(); // 0: Sun, 1: Mon ... 6: Sat
  const hour = now.getHours();
  const minute = now.getMinutes();

  const currentMinutes = hour * 60 + minute;
  const openMinutes = 9 * 60;   // 09:00
  const closeMinutes = 19 * 60; // 19:00

  const isWorkingDay = day >= 1 && day <= 6; // Mon-Sat
  const isOpen = isWorkingDay && currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  statusBadges.forEach(badge => {
    const textElem = badge.querySelector('.status-text') || badge.querySelector('span:not(.status-dot)');
    const dotElem = badge.querySelector('.status-dot');

    if (isOpen) {
      badge.style.background = 'rgba(156, 226, 20, 0.14)';
      badge.style.borderColor = '#9CE214';
      badge.style.color = '#9CE214';
      if (dotElem) {
        dotElem.style.background = '#9CE214';
        dotElem.style.boxShadow = '0 0 10px #9CE214';
      }
      if (textElem) textElem.textContent = t('status.open', "Hozir ochiq • 09:00 - 19:00");
    } else {
      badge.style.background = 'rgba(255, 77, 77, 0.12)';
      badge.style.borderColor = 'rgba(255, 77, 77, 0.5)';
      badge.style.color = '#FF7070';
      if (dotElem) {
        dotElem.style.background = '#FF4D4D';
        dotElem.style.boxShadow = '0 0 10px #FF4D4D';
      }
      if (textElem) {
        textElem.textContent = isWorkingDay
          ? t('status.closed_workday', "Hozir yopiq • 09:00 da ochiladi")
          : t('status.closed_sunday', "Bugun dam olish kuni");
      }
    }
  });
}

/* ==========================================================================
   3. MULTILINGUAL PRICE CALCULATOR
   ========================================================================== */
const PRICING_RATES = {
  'uv_dtf_a4': {
    names: { uz: "UV DTF Stiker (A4)", ru: "УФ ДТФ Стикер (A4)", en: "UV DTF Sticker (A4)" },
    unitPrice: 25000,
    unitLabels: { uz: "dona (A4)", ru: "шт (A4)", en: "pc (A4)" }
  },
  'uv_dtf_a3': {
    names: { uz: "UV DTF Stiker (A3)", ru: "УФ ДТФ Стикер (A3)", en: "UV DTF Sticker (A3)" },
    unitPrice: 45000,
    unitLabels: { uz: "dona (A3)", ru: "шт (A3)", en: "pc (A3)" }
  },
  'banner_std': {
    names: { uz: "Katta formatli Banner", ru: "Широкоформатный Баннер", en: "Large-Format Banner" },
    unitPrice: 35000,
    unitLabels: { uz: "kv.m", ru: "кв.м", en: "sq.m" }
  },
  'banner_prem': {
    names: { uz: "Yuqori sifatli Banner (Litsiey)", ru: "Премиум Баннер (Литой)", en: "Premium Cast Banner" },
    unitPrice: 50000,
    unitLabels: { uz: "kv.m", ru: "кв.м", en: "sq.m" }
  },
  'orakal': {
    names: { uz: "Orakal (Samokleyka) Bosma", ru: "Печать на Оракале (Самоклейка)", en: "Vinyl Sticker Print (Oracal)" },
    unitPrice: 40000,
    unitLabels: { uz: "kv.m", ru: "кв.м", en: "sq.m" }
  },
  'letters_3d': {
    names: { uz: "3D Yoritgichli Harf", ru: "Объемная 3D Световая Буква", en: "3D Illuminated Channel Letter" },
    unitPrice: 12000,
    unitLabels: { uz: "1 sm balandlik", ru: "1 см высоты", en: "1 cm height" }
  },
  'vizitka_100': {
    names: { uz: "Vizitka (Ikki tomonlama, 100 dona)", ru: "Визитки (Двусторонние, 100 шт)", en: "Business Cards (Double-sided, 100 pcs)" },
    unitPrice: 60000,
    unitLabels: { uz: "to'plam (100 ta)", ru: "комплект (100 шт)", en: "set (100 pcs)" }
  },
  'vizitka_1000': {
    names: { uz: "Vizitka (Ofset bosma, 1000 dona)", ru: "Визитки (Офсет, 1000 шт)", en: "Business Cards (Offset, 1000 pcs)" },
    unitPrice: 280000,
    unitLabels: { uz: "to'plam (1000 ta)", ru: "комплект (1000 шт)", en: "set (1000 pcs)" }
  },
  'flayer_500': {
    names: { uz: "Flayer A5 (Ikki tomonlama, 500 dona)", ru: "Флаеры A5 (Двусторонние, 500 шт)", en: "Flyers A5 (Double-sided, 500 pcs)" },
    unitPrice: 240000,
    unitLabels: { uz: "to'plam (500 ta)", ru: "комплект (500 шт)", en: "set (500 pcs)" }
  },
  'neon_custom': {
    names: { uz: "Neon Signboard (Boshlang'ich)", ru: "Неоновая Вывеска (Базовая)", en: "Custom Neon Sign (Starting)" },
    unitPrice: 350000,
    unitLabels: { uz: "loyihadan boshlab", ru: "от проекта", en: "per project" }
  }
};

function updateCalculatorOptions(lang) {
  const serviceSelect = document.getElementById('calc-service');
  if (!serviceSelect) return;

  const currentVal = serviceSelect.value;
  serviceSelect.innerHTML = '';

  for (const [key, item] of Object.entries(PRICING_RATES)) {
    const opt = document.createElement('option');
    opt.value = key;
    const name = item.names[lang] || item.names['uz'];
    const unit = item.unitLabels[lang] || item.unitLabels['uz'];
    opt.textContent = `${name} — ${item.unitPrice.toLocaleString('uz-UZ')} UZS / ${unit}`;
    if (key === currentVal) opt.selected = true;
    serviceSelect.appendChild(opt);
  }
}

function initCalculator() {
  const serviceSelect = document.getElementById('calc-service');
  const qtyInput = document.getElementById('calc-qty');
  const designCheckbox = document.getElementById('calc-design');

  if (!serviceSelect || !qtyInput) return;

  updateCalculatorOptions(currentLang);

  serviceSelect.addEventListener('change', updateCalculator);
  qtyInput.addEventListener('input', updateCalculator);
  if (designCheckbox) {
    designCheckbox.addEventListener('change', updateCalculator);
  }

  updateCalculator();
}

function updateCalculator() {
  const serviceSelect = document.getElementById('calc-service');
  const qtyInput = document.getElementById('calc-qty');
  const designCheckbox = document.getElementById('calc-design');

  const breakdownService = document.getElementById('calc-breakdown-service');
  const breakdownQty = document.getElementById('calc-breakdown-qty');
  const breakdownUnit = document.getElementById('calc-breakdown-unit');
  const totalAmountElem = document.getElementById('calc-total-amount');
  const orderTgBtn = document.getElementById('calc-order-tg-btn');

  if (!serviceSelect || !qtyInput || !totalAmountElem) return;

  const selectedKey = serviceSelect.value;
  const config = PRICING_RATES[selectedKey] || PRICING_RATES['uv_dtf_a4'];
  let qty = parseFloat(qtyInput.value) || 1;
  if (qty < 1) qty = 1;

  const baseTotal = config.unitPrice * qty;
  const designCost = (designCheckbox && designCheckbox.checked) ? 30000 : 0;
  const grandTotal = baseTotal + designCost;

  // Format currency
  const formattedTotal = grandTotal.toLocaleString('uz-UZ') + " UZS";
  const name = config.names[currentLang] || config.names['uz'];
  const unitLabel = config.unitLabels[currentLang] || config.unitLabels['uz'];
  const formattedUnit = config.unitPrice.toLocaleString('uz-UZ') + " UZS / " + unitLabel;

  if (breakdownService) breakdownService.textContent = name;
  if (breakdownQty) breakdownQty.textContent = qty + " " + unitLabel;
  if (breakdownUnit) breakdownUnit.textContent = formattedUnit;
  if (totalAmountElem) totalAmountElem.textContent = formattedTotal;

  // Telegram order message by language
  if (orderTgBtn) {
    let message = "";
    if (currentLang === 'ru') {
      message = `Здравствуйте, UNION PRINT!
Я сделал расчет на вашем сайте:
• Услуга: ${name}
• Количество: ${qty} ${unitLabel}
• Разработка дизайна: ${designCost > 0 ? "Да (+30 000 сум)" : "Готовый макет"}
• Примерная стоимость: ${formattedTotal}

Хочу обсудить и оформить заказ.`;
    } else if (currentLang === 'en') {
      message = `Hello UNION PRINT!
I calculated an estimate on your website:
• Service: ${name}
• Quantity: ${qty} ${unitLabel}
• Graphic design: ${designCost > 0 ? "Yes (+30,000 UZS)" : "Ready layout"}
• Estimated Total: ${formattedTotal}

I would like to discuss and place this order.`;
    } else {
      message = `Assalomu alaykum UNION PRINT!
Men saytingizdagi kalkulyatordan hisobladim:
• Xizmat: ${name}
• Miqdori: ${qty} ${unitLabel}
• Qo‘shimcha dizayn: ${designCost > 0 ? "Ha (+30 000 UZS)" : "Mavjud maket"}
• Taxminiy jami summa: ${formattedTotal}

Buyurtma tafsilotlarini kelishib olsak bo'ladimi?`;
    }

    orderTgBtn.href = `https://t.me/unionprint_uz?text=${encodeURIComponent(message)}`;
  }
}

/* ==========================================================================
   4. PORTFOLIO FILTERING & LIGHTBOX MODAL
   ========================================================================== */
function initPortfolioFilter() {
  const tabBtns = document.querySelectorAll('.portfolio-tab-btn');
  const items = document.querySelectorAll('.portfolio-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          item.style.opacity = '0';
          setTimeout(() => {
            item.style.opacity = '1';
          }, 50);
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

function openLightbox(imgSrc, title, category) {
  const modal = document.getElementById('lightbox-modal');
  const imgElem = document.getElementById('lightbox-img');
  const titleElem = document.getElementById('lightbox-title');
  const catElem = document.getElementById('lightbox-category');
  const tgBtn = document.getElementById('lightbox-order-btn');

  if (!modal || !imgElem) return;

  imgElem.src = imgSrc;
  if (titleElem) titleElem.textContent = title || "UNION PRINT";
  if (catElem) catElem.textContent = category || "Poligrafiya";

  if (tgBtn) {
    let text = "";
    if (currentLang === 'ru') {
      text = `Здравствуйте, UNION PRINT! Хочу заказать аналогичную работу по образцу "${title}".`;
    } else if (currentLang === 'en') {
      text = `Hello UNION PRINT! I would like to order a similar product matching "${title}".`;
    } else {
      text = `Assalomu alaykum UNION PRINT! Saytingizdagi "${title}" namunasi bo'yicha buyurtma bermoqchiman.`;
    }
    tgBtn.href = `https://t.me/unionprint_uz?text=${encodeURIComponent(text)}`;
  }

  openModal('lightbox-modal');
}

/* ==========================================================================
   5. CATALOG LIVE SEARCH FILTER
   ========================================================================== */
function initCatalogSearch() {
  const searchInput = document.getElementById('catalog-search-input');
  const tableRows = document.querySelectorAll('.catalog-table-full tbody tr');

  if (!searchInput || !tableRows.length) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();

    tableRows.forEach(row => {
      const text = row.textContent.toLowerCase();
      if (text.includes(term)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
}

/* ==========================================================================
   6. MODALS MANAGEMENT
   ========================================================================== */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function closeModalOnOverlay(event, modalId) {
  if (event.target.classList.contains('modal-overlay')) {
    closeModal(modalId);
  }
}

function setupKeyboardEsc() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModals = document.querySelectorAll('.modal-overlay.active');
      activeModals.forEach(m => closeModal(m.id));

      const drawer = document.getElementById('mobile-nav-drawer');
      if (drawer && drawer.classList.contains('active')) {
        drawer.classList.remove('active');
      }
    }
  });
}

function openOrderModal(serviceName) {
  const select = document.getElementById('order-service-select');
  if (select && serviceName) {
    for (let option of select.options) {
      if (option.value.toLowerCase().includes(serviceName.toLowerCase())) {
        option.selected = true;
        break;
      }
    }
  }
  openModal('order-modal');
}

/* ==========================================================================
   7. COPY TO CLIPBOARD & LOCALIZED TOAST NOTIFICATION
   ========================================================================== */
function copyToClipboard(text, customMessageKey) {
  const message = customMessageKey ? t(customMessageKey, customMessageKey) : t('contacts.copied_default', "Nusxalandi!");

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(message);
    }).catch(() => {
      fallbackCopyText(text, message);
    });
  } else {
    fallbackCopyText(text, message);
  }
}

function fallbackCopyText(text, message) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(message);
  } catch (err) {
    showToast("Error copying");
  }
  document.body.removeChild(textArea);
}

function showToast(message) {
  let toast = document.getElementById('toast-notification');
  let toastMsg = document.getElementById('toast-message');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-notification';
    toast.innerHTML = `<i data-lucide="check-circle" style="color: var(--primary-lime); width: 18px; height: 18px;"></i> <span id="toast-message"></span>`;
    document.body.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();
    toastMsg = document.getElementById('toast-message');
  }

  if (toastMsg) toastMsg.textContent = message;
  toast.classList.remove('toast-hidden');
  toast.classList.add('toast-visible');

  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-hidden');
  }, 2800);
}

/* ==========================================================================
   8. DIRECT LEAD / ORDER SUBMISSION
   ========================================================================== */
function handleOrderSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById('order-name');
  const phoneInput = document.getElementById('order-phone');
  const serviceInput = document.getElementById('order-service-select');
  const detailsInput = document.getElementById('order-details');

  const name = nameInput ? nameInput.value.trim() : "";
  const phone = phoneInput ? phoneInput.value.trim() : "";
  const service = serviceInput ? serviceInput.value : "";
  const details = detailsInput ? detailsInput.value.trim() : "";

  if (!name || !phone) {
    showToast(currentLang === 'ru' ? "Пожалуйста, укажите имя и телефон" : (currentLang === 'en' ? "Please provide your name and phone" : "Iltimos, ism va telefon raqamingizni kiriting"));
    return;
  }

  let messageText = "";
  if (currentLang === 'ru') {
    messageText = `Новая заявка с сайта UNION PRINT:
• Клиент: ${name}
• Телефон: ${phone}
• Услуга: ${service}
• Детали: ${details || "Не указаны"}`;
  } else if (currentLang === 'en') {
    messageText = `New inquiry from UNION PRINT website:
• Client: ${name}
• Phone: ${phone}
• Service: ${service}
• Details: ${details || "None specified"}`;
  } else {
    messageText = `Yangi buyurtma (Saytdan):
• Buyurtmachi: ${name}
• Telefon: ${phone}
• Xizmat turi: ${service}
• Qo'shimcha ma'lumot: ${details || "Kiritilmagan"}`;
  }

  const tgUrl = `https://t.me/unionprint_uz?text=${encodeURIComponent(messageText)}`;
  showToast(currentLang === 'ru' ? "Открываем Telegram..." : (currentLang === 'en' ? "Opening Telegram..." : "Telegram ochilmoqda..."));

  setTimeout(() => {
    window.open(tgUrl, '_blank');
    closeModal('order-modal');
    if (e.target && e.target.reset) e.target.reset();
  }, 700);
}

/* ==========================================================================
   9. MOBILE MENU TOGGLE & SMOOTH SCROLL
   ========================================================================== */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-nav-drawer');

  if (!btn || !drawer) return;

  btn.addEventListener('click', () => {
    drawer.classList.toggle('active');
  });

  const links = drawer.querySelectorAll('a');
  links.forEach(l => {
    l.addEventListener('click', () => {
      drawer.classList.remove('active');
    });
  });
}

function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  const headerHeight = 80;

  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#' || targetId.length < 2) return;

      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        const elementPosition = targetElem.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ==========================================================================
   10. MULTILINGUAL CATALOG DOWNLOAD GENERATOR
   ========================================================================== */
function triggerCatalogDownload() {
  showToast(currentLang === 'ru' ? "Формирование каталога..." : (currentLang === 'en' ? "Generating catalog file..." : "Katalog tayyorlanmoqda..."));

  let catalogText = "";

  if (currentLang === 'ru') {
    catalogText = `
============================================================
           UNION PRINT — ОФИЦИАЛЬНЫЙ КАТАЛОГ И ЦЕНЫ
           Профессиональная Полиграфия и Наружная Реклама
============================================================
Адрес: г. Самарканд, ул. Лохутий 3, (Brilliant City)
Телефоны: +998 88 416 99 88 | +998 90 284 66 66
Telegram: @unionprint_uz | Telegram-бот: @unionprint_bot
Instagram: @unionprint.uz
График работы: Понедельник — Суббота, 09:00 — 19:00

------------------------------------------------------------
ОСНОВНЫЕ УСЛУГИ И СТОИМОСТЬ (2026):
------------------------------------------------------------
1. УФ ДТФ ПЕЧАТЬ (Стойкие рельефные наклейки на любые поверхности):
   - Формат A4 (21x29 см): 25 000 сум
   - Формат A3 (29x42 см): 45 000 сум
   - Скидки на оптовые и регулярные объемы

2. ШИРОКОФОРМАТНАЯ ПЕЧАТЬ БАННЕРОВ:
   - Стандартный баннер (1 кв.м): 35 000 сум
   - Премиум литой баннер (1 кв.м): 50 000 сум
   - Печать на самоклеящейся пленке Оракал (1 кв.м): 40 000 сум
   - Роллап-стенд в сборе (85x200 см): 220 000 сум

3. ОБЪЕМНЫЕ СВЕТОВЫЕ 3D БУКВЫ (Наружные вывески):
   - Акриловые светодиодные буквы: 12 000 сум / 1 см высоты
   - Алюминиевый профиль и LED подсветка: Индивидуальный расчет

4. НЕОНОВЫЕ ВЫВЕСКИ И ТАБЛИЧКИ:
   - Гибкий неон (Flex Neon) на прозрачном акриле: от 350 000 сум

5. ВИЗИТКИ И ОПЕРАТИВНАЯ ПОЛИГРАФИЯ:
   - Цифровые визитки (100 шт, 300г бумага): 60 000 сум
   - Офсетные визитки с ламинацией (1000 шт): 280 000 сум
   - Рекламные флаеры A5 (500 шт, двусторонние): 240 000 сум
   - Меню и ресторанные каталоги: По согласованию

6. ГРАФИЧЕСКИЙ ДИЗАЙН И БРЕНДИНГ:
   - Разработка логотипа: от 200 000 сум
   - Допечатная подготовка макетов: 30 000 сум

------------------------------------------------------------
Для оформления заказа свяжитесь с нами в Telegram:
https://t.me/unionprint_uz
============================================================
© UNION PRINT 2026. Все права защищены.
`;
  } else if (currentLang === 'en') {
    catalogText = `
============================================================
           UNION PRINT — OFFICIAL CATALOG & PRICE LIST
           Professional Commercial Printing & Signage
============================================================
Address: Samarkand, Lohutiy St. 3, (Brilliant City)
Phone: +998 88 416 99 88 | +998 90 284 66 66
Telegram: @unionprint_uz | Telegram Bot: @unionprint_bot
Instagram: @unionprint.uz
Hours: Monday - Saturday, 09:00 - 19:00

------------------------------------------------------------
CORE SERVICES & PRICING (2026):
------------------------------------------------------------
1. UV DTF TRANSFER PRINTING (Waterproof 3D stickers for any surface):
   - A4 sheet (21x29 cm): 25,000 UZS
   - A3 sheet (29x42 cm): 45,000 UZS
   - Wholesale volume discounts available

2. LARGE-FORMAT BANNER PRINTING:
   - Standard banner (1 sq.m): 35,000 UZS
   - Premium cast heavy-duty banner (1 sq.m): 50,000 UZS
   - Self-adhesive vinyl sticker Oracal (1 sq.m): 40,000 UZS
   - Rollup banner display stand (85x200 cm): 220,000 UZS

3. 3D ILLUMINATED CHANNEL LETTERS:
   - Acrylic LED letters: 12,000 UZS / 1 cm height
   - Custom aluminum profile fabrication: Custom quote

4. CUSTOM FLEXIBLE NEON SIGNBOARDS:
   - Flexible LED silicone neon on acrylic: from 350,000 UZS

5. BUSINESS CARDS & FAST POLYGRAPHY:
   - Digital business cards (100 pcs, 300gsm): 60,000 UZS
   - Bulk offset business cards (1000 pcs): 280,000 UZS
   - Double-sided flyers A5 (500 pcs): 240,000 UZS
   - Menus, brochures & catalogs: Custom estimate

6. GRAPHIC DESIGN & BRAND IDENTITY:
   - Logo design: from 200,000 UZS
   - Pre-press layout preparation: 30,000 UZS

------------------------------------------------------------
Place your order directly on Telegram:
https://t.me/unionprint_uz
============================================================
© UNION PRINT 2026. All rights reserved.
`;
  } else {
    catalogText = `
============================================================
           UNION PRINT — MAHSULOTLAR VA NARXLAR KATALOGI
           Professional Poligrafiya va Tashqi Reklama
============================================================
Manzil: Samarqand sh., Lohutiy ko'chasi 3, (Brilliant City)
Telefonlar: +998 88 416 99 88 | +998 90 284 66 66
Telegram: @unionprint_uz | Telegram Bot: @unionprint_bot
Instagram: @unionprint.uz
Ish vaqti: Dushanba - Shanba, 09:00 - 19:00

------------------------------------------------------------
ASOSIY XIZMATLAR VA NARXLAR RO'YXATI (2026):
------------------------------------------------------------
1. UV DTF PECHAT (Har qanday silliq yuzaga mustahkam stikerlar):
   - A4 format (21x29 cm): 25,000 UZS
   - A3 format (29x42 cm): 45,000 UZS
   - Yuqori hajmda buyurtmalarga chegirmalar mavjud

2. KENG FORMATLI BANNER CHOP ETISH:
   - Standart sifatli banner (1 kv.m): 35,000 UZS
   - Premium sifatli banner (1 kv.m): 50,000 UZS
   - Orakal samokleyka bosma (1 kv.m): 40,000 UZS
   - Rollup stend (85x200 cm, konstruksiyasi bilan): 220,000 UZS

3. 3D YORITGICHLI HAJMLI HARFLAR (Svetovoy reklama):
   - Akrilli yoritgichli harflar: 12,000 UZS / 1 sm balandlik
   - LED neon va alyuminiy karkas: Individual loyiha asosida

4. NEON REKLAMA VA TABLICHKALAR:
   - Moslashuvchan neon (Flex Neon) signboard: 350,000 UZS dan boshlab

5. VIZITKALAR VA OPERATIV POLIGRAFIYA:
   - Raqamli vizitka (100 dona, 300g qog'oz): 60,000 UZS
   - Ofset vizitka (1000 dona, litsiey): 280,000 UZS
   - Flayerlar A5 (500 dona, ikki tomonlama): 240,000 UZS
   - Bukletlar va Menyu tayyorlash: Kelishilgan narxda

6. GRAFIK DIZAYN VA BRENDING:
   - Logotip dizayni: 200,000 UZS dan boshlab
   - Chop etishga tayyorlash (pre-press): 30,000 UZS

------------------------------------------------------------
Buyurtma berish uchun biz bilan bog'laning yoki Telegram'dan
yozing: https://t.me/unionprint_uz
============================================================
© UNION PRINT 2026. Barcha huquqlar himoyalangan.
`;
  }

  const blob = new Blob([catalogText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `UNION_PRINT_Catalog_${currentLang.toUpperCase()}_2026.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  setTimeout(() => {
    showToast(currentLang === 'ru' ? "Каталог успешно скачан!" : (currentLang === 'en' ? "Catalog successfully downloaded!" : "Katalog muvaffaqiyatli yuklab olindi!"));
  }, 900);
}
