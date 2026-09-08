/* ==========================================================================
   UNION PRINT — MAIN JAVASCRIPT APPLICATION
   Handles:
   - Real-time Working Hours & Status
   - Interactive Price Calculator with Direct Telegram Order
   - Portfolio Filter & Lightbox Preview
   - Quick Lead Order Form
   - Live Catalog Search Filter & Download
   - Copy to Clipboard & Toast Notifications
   - Mobile Nav Menu Drawer & Smooth Scroll
   - Modal System
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Initialize Core Features
  initWorkingStatus();
  initCalculator();
  initPortfolioFilter();
  initCatalogSearch();
  initMobileMenu();
  setupKeyboardEsc();
  initSmoothScroll();
});

/* ==========================================================================
   1. REAL-TIME WORKING STATUS INDICATOR (09:00 - 19:00, Mon - Sat)
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
      if (textElem) textElem.textContent = "Hozir ochiq • 09:00 - 19:00";
    } else {
      badge.style.background = 'rgba(255, 77, 77, 0.12)';
      badge.style.borderColor = 'rgba(255, 77, 77, 0.5)';
      badge.style.color = '#FF7070';
      if (dotElem) {
        dotElem.style.background = '#FF4D4D';
        dotElem.style.boxShadow = '0 0 10px #FF4D4D';
      }
      if (textElem) textElem.textContent = isWorkingDay ? "Hozir yopiq • 09:00 da ochiladi" : "Bugun dam olish kuni";
    }
  });
}

/* ==========================================================================
   2. INTERACTIVE PRICE CALCULATOR
   ========================================================================== */
const PRICING_RATES = {
  'uv_dtf_a4': { name: "UV DTF Stiker (A4)", unitPrice: 25000, unitLabel: "dona (A4)" },
  'uv_dtf_a3': { name: "UV DTF Stiker (A3)", unitPrice: 45000, unitLabel: "dona (A3)" },
  'banner_std': { name: "Katta formatli Banner", unitPrice: 35000, unitLabel: "kv.m" },
  'banner_prem': { name: "Yuqori sifatli Banner (Litsiey)", unitPrice: 50000, unitLabel: "kv.m" },
  'orakal': { name: "Orakal (Samokleyka) Bosma", unitPrice: 40000, unitLabel: "kv.m" },
  'letters_3d': { name: "3D Yoritgichli Harf", unitPrice: 12000, unitLabel: "1 sm balandlik" },
  'vizitka_100': { name: "Vizitka (Ikki tomonlama, 100 dona)", unitPrice: 60000, unitLabel: "to'plam (100 ta)" },
  'vizitka_1000': { name: "Vizitka (Ofset bosma, 1000 dona)", unitPrice: 280000, unitLabel: "to'plam (1000 ta)" },
  'flayer_500': { name: "Flayer A5 (Ikki tomonlama, 500 dona)", unitPrice: 240000, unitLabel: "to'plam (500 ta)" },
  'neon_custom': { name: "Neon Signboard (Boshlang'ich)", unitPrice: 350000, unitLabel: "loyihadan boshlab" }
};

function initCalculator() {
  const serviceSelect = document.getElementById('calc-service');
  const qtyInput = document.getElementById('calc-qty');
  const designCheckbox = document.getElementById('calc-design');

  if (!serviceSelect || !qtyInput) return;

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
  const formattedUnit = config.unitPrice.toLocaleString('uz-UZ') + " UZS / " + config.unitLabel;

  if (breakdownService) breakdownService.textContent = config.name;
  if (breakdownQty) breakdownQty.textContent = qty + " " + (config.unitLabel.includes('kv.m') ? 'kv.m' : 'dona/to‘plam');
  if (breakdownUnit) breakdownUnit.textContent = formattedUnit;
  if (totalAmountElem) totalAmountElem.textContent = formattedTotal;

  // Telegram order link update
  if (orderTgBtn) {
    const message = `Assalomu alaykum UNION PRINT!
Men saytingizdagi kalkulyatordan hisobladim:
• Xizmat: ${config.name}
• Miqdori: ${qty}
• Qo‘shimcha dizayn: ${designCost > 0 ? "Ha (+30 000 UZS)" : "Mavjud maket"}
• Taxminiy jami summa: ${formattedTotal}

Buyurtma tafsilotlarini kelishib olsak bo'ladimi?`;

    orderTgBtn.href = `https://t.me/unionprint_uz?text=${encodeURIComponent(message)}`;
  }
}

/* ==========================================================================
   3. PORTFOLIO FILTERING & LIGHTBOX MODAL
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
  if (titleElem) titleElem.textContent = title || "UNION PRINT Mahsuloti";
  if (catElem) catElem.textContent = category || "Poligrafiya";

  if (tgBtn) {
    const text = `Assalomu alaykum UNION PRINT! Saytingizdagi "${title}" namunasi bo'yicha buyurtma bermoqchiman.`;
    tgBtn.href = `https://t.me/unionprint_uz?text=${encodeURIComponent(text)}`;
  }

  openModal('lightbox-modal');
}

/* ==========================================================================
   4. CATALOG LIVE SEARCH FILTER
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
   5. MODALS MANAGEMENT
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
   6. COPY TO CLIPBOARD & TOAST NOTIFICATION
   ========================================================================== */
function copyToClipboard(text, customMessage) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(customMessage || "Nusxalandi!");
    }).catch(() => {
      fallbackCopyText(text, customMessage);
    });
  } else {
    fallbackCopyText(text, customMessage);
  }
}

function fallbackCopyText(text, customMessage) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(customMessage || "Nusxalandi!");
  } catch (err) {
    showToast("Nusxalash imkoni bo'lmadi");
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
   7. DIRECT LEAD / ORDER SUBMISSION
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
    showToast("Iltimos, ism va telefon raqamingizni kiriting");
    return;
  }

  const messageText = `Yangi buyurtma (Saytdan):
• Buyurtmachi: ${name}
• Telefon: ${phone}
• Xizmat turi: ${service}
• Qo'shimcha ma'lumot: ${details || "Kiritilmagan"}`;

  const tgUrl = `https://t.me/unionprint_uz?text=${encodeURIComponent(messageText)}`;

  showToast("Telegram boti ochilmoqda...");

  setTimeout(() => {
    window.open(tgUrl, '_blank');
    closeModal('order-modal');
    if (e.target && e.target.reset) e.target.reset();
  }, 800);
}

/* ==========================================================================
   8. MOBILE MENU TOGGLE & SMOOTH SCROLL
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
   9. CATALOG DOWNLOAD GENERATOR
   ========================================================================== */
function triggerCatalogDownload() {
  showToast("Katalog tayyorlanmoqda...");

  const catalogText = `
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

  const blob = new Blob([catalogText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'UNION_PRINT_Katalog_2026.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  setTimeout(() => {
    showToast("Katalog muvaffaqiyatli yuklab olindi!");
  }, 1000);
}
