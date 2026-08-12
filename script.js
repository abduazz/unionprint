/* ==========================================================================
   UNION PRINT - INTERACTIVE SCRIPT
   Handles Status, Modals, Copy Clipboard, Price Calculator & Order Form
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  checkWorkingStatus();
  calculatePrice();
  setupKeyboardEsc();
});

/* 1. REAL-TIME WORKING STATUS INDICATOR */
function checkWorkingStatus() {
  const statusBadge = document.getElementById('live-status-badge');
  const statusText = document.getElementById('status-text');

  if (!statusBadge || !statusText) return;

  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Mon, ..., 6 = Sat
  const hour = now.getHours();
  const minute = now.getMinutes();

  const currentMinutes = hour * 60 + minute;
  const openMinutes = 9 * 60;   // 09:00
  const closeMinutes = 19 * 60; // 19:00

  // Working Days: Monday (1) to Saturday (6)
  const isWorkingDay = day >= 1 && day <= 6;
  const isOpenHours = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  if (isWorkingDay && isOpenHours) {
    statusBadge.style.background = 'rgba(156, 226, 20, 0.15)';
    statusBadge.style.borderColor = '#9CE214';
    statusBadge.style.color = '#9CE214';
    statusText.textContent = "Hozir ochiq";
  } else {
    statusBadge.style.background = 'rgba(255, 77, 77, 0.15)';
    statusBadge.style.borderColor = '#FF4D4D';
    statusBadge.style.color = '#FF4D4D';
    const statusDot = statusBadge.querySelector('.status-dot');
    if (statusDot) {
      statusDot.style.background = '#FF4D4D';
      statusDot.style.boxShadow = '0 0 10px #FF4D4D';
    }
    statusText.textContent = "Hozir yopiq";
  }
}

/* 2. COPY TO CLIPBOARD & TOAST NOTIFICATION */
function copyToClipboard(text, customMessage) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(customMessage || "Nusxalandi!");
    }).catch(err => {
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
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('toast-hidden');
  toast.classList.add('toast-visible');

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-hidden');
  }, 2800);
}

/* 3. MODALS MANAGEMENT */
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
    }
  });
}

function openCatalogModal() {
  openModal('catalog-modal');
}

function openOrderModal(serviceName) {
  if (serviceName) {
    const select = document.getElementById('order-service-select');
    if (select) {
      for (let option of select.options) {
        if (option.value.toLowerCase().includes(serviceName.toLowerCase())) {
          option.selected = true;
          break;
        }
      }
    }
  }
  openModal('order-modal');
}

function openMapModal() {
  openModal('map-modal');
}

/* 4. INTERACTIVE PRICE CALCULATOR */
function calculatePrice() {
  const service = document.getElementById('calc-service').value;
  const qty = parseInt(document.getElementById('calc-qty').value) || 1;
  const output = document.getElementById('calc-price-output');

  let unitPrice = 35000;

  switch (service) {
    case 'uv_dtf':
      unitPrice = 35000; // 35,000 UZS per A4 sheet
      break;
    case 'banner':
      unitPrice = 45000; // 45,000 UZS per sq.m
      break;
    case 'vizitka':
      unitPrice = 60000; // 60,000 UZS per 100 pcs
      break;
    case 'flayer':
      unitPrice = 50000; // 50,000 UZS per 100 pcs
      break;
  }

  const totalPrice = unitPrice * qty;
  output.textContent = totalPrice.toLocaleString('uz-UZ') + " UZS";
}

/* 5. ORDER FORM SUBMISSION */
function handleOrderSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('order-name').value;
  const phone = document.getElementById('order-phone').value;
  const service = document.getElementById('order-service-select').value;
  const details = document.getElementById('order-details').value;

  const textMessage = `Arizachi: ${name}\nTel: ${phone}\nXizmat: ${service}\nTafsilot: ${details}`;
  
  // Open Telegram with prefilled message to @unionprint_uz
  const tgUrl = `https://t.me/unionprint_uz?text=${encodeURIComponent(textMessage)}`;
  
  showToast("Telegram boti ochilmoqda...");
  
  setTimeout(() => {
    window.open(tgUrl, '_blank');
    closeModal('order-modal');
  }, 1000);
}

/* 6. DUMMY CATALOG PDF DOWNLOAD GENERATOR */
function triggerCatalogDownload() {
  showToast("Katalog tayyorlanmoqda...");
  
  const catalogText = `
UNION PRINT - MAHSULOTLAR KATALOGI 2026
Manzil: Rudakiy 168, Brilliant city
Telefon: +998 88 416 99 88
Telegram: @unionprint_uz | Instagram: @unionprint.uz

1. UV DTF Stiker (A4) - 35,000 UZS
2. Banner Bosma (1 kv.m) - 45,000 UZS
3. 3D Yoritgichli Harflar (1 sm) - 12,000 UZS
4. Vizitkalar (100 dona) - 60,000 UZS
5. Flayerlar A5 (1000 dona) - 380,000 UZS
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
    showToast("Katalog yuklab olindi!");
  }, 1200);
}
