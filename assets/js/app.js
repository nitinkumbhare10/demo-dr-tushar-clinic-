/**
 * Dr Tushar Chandak Family Dental Care - Automated Web App Logic
 * Enhanced with Tier 1 & Tier 2 UI/UX Implementations
 */

document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  initLiveClinicHours();
  initHighlightTodayTimings();
  initMobileMenu();
  initServiceFilters();
  initBookingSystem();
  initDraftAutoSave();
  initAdminDashboard();
  initBackToTop();
  initKeyboardModalDismiss();
  initSmoothScroll();
  initAnimatedCounters();
  initNavbarScrollState();
});

/* ---------------- 0. INITIALIZE ANIMATIONS (AOS) ---------------- */
function initAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
      delay: 40
    });
  }
}

/* ---------------- 1. TOAST NOTIFICATION SYSTEM (UX-14) ---------------- */
window.showToast = function(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';

  toast.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
};

/* ---------------- 2. ANIMATED NUMBER COUNTERS ---------------- */
function initAnimatedCounters() {
  const statElements = document.querySelectorAll('.stat-number');
  if (!statElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetValue = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        if (isNaN(targetValue)) return;

        let current = 0;
        const duration = 1800;
        const steps = 40;
        const increment = targetValue / steps;
        const stepTime = duration / steps;

        const counterTimer = setInterval(() => {
          current += increment;
          if (current >= targetValue) {
            el.textContent = targetValue.toLocaleString() + suffix;
            clearInterval(counterTimer);
          } else {
            el.textContent = Math.floor(current).toLocaleString() + suffix;
          }
        }, stepTime);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  statElements.forEach(el => observer.observe(el));
}

/* ---------------- 3. NAVBAR SCROLL EFFECT & ACTIVE STATE ---------------- */
function initNavbarScrollState() {
  const navbar = document.getElementById('mainHeader');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    if (navbar) {
      if (scrollY > 50) {
        navbar.style.boxShadow = '0 10px 25px rgba(14, 35, 56, 0.1)';
        navbar.style.height = '74px';
      } else {
        navbar.style.boxShadow = '0 4px 20px rgba(14, 35, 56, 0.06)';
        navbar.style.height = '84px';
      }
    }

    let currentId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 130;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

/* ---------------- 4. LIVE CLINIC HOURS & ACTIONABLE STATUS (UX-7) ---------------- */
function initLiveClinicHours() {
  const statusEl = document.getElementById('liveStatusPill');
  if (!statusEl) return;

  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  let isOpen = false;
  let closeTimeStr = '';

  if (day >= 1 && day <= 5) {
    // Mon - Fri: 9:30 AM - 7:30 PM
    const openTime = 9 * 60 + 30; // 570 mins
    const closeTime = 19 * 60 + 30; // 1170 mins
    if (timeInMinutes >= openTime && timeInMinutes < closeTime) {
      isOpen = true;
      closeTimeStr = '7:30 PM';
    }
  } else if (day === 6) {
    // Saturday: 10:00 AM - 8:00 PM
    const openTime = 10 * 60; // 600 mins
    const closeTime = 20 * 60; // 1200 mins
    if (timeInMinutes >= openTime && timeInMinutes < closeTime) {
      isOpen = true;
      closeTimeStr = '8:00 PM';
    }
  }

  if (isOpen) {
    statusEl.className = 'topbar-item topbar-pill pill-open';
    statusEl.innerHTML = `<span class="dot-pulse"></span> Open Now • Closes ${closeTimeStr}`;
  } else {
    statusEl.className = 'topbar-item topbar-pill pill-closed';
    let nextText = '';
    if (day === 0) {
      nextText = 'Opens Mon 9:30 AM';
    } else if (day >= 1 && day <= 5) {
      const openTime = 9 * 60 + 30;
      nextText = timeInMinutes < openTime ? 'Opens Today 9:30 AM' : (day === 5 ? 'Opens Sat 10:00 AM' : 'Opens Tomorrow 9:30 AM');
    } else if (day === 6) {
      const openTime = 10 * 60;
      nextText = timeInMinutes < openTime ? 'Opens Today 10:00 AM' : 'Opens Mon 9:30 AM';
    }
    statusEl.innerHTML = `<i class="fas fa-clock"></i> Closed • ${nextText}`;
  }
}

/* ---------------- 5. DYNAMIC TODAY ROW HIGHLIGHT IN TIMINGS (UI-12, UX-13) ---------------- */
function initHighlightTodayTimings() {
  const table = document.getElementById('timingsTable');
  if (!table) return;

  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  // Mapping index in table: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  const rowIdx = (dayOfWeek === 0) ? 6 : (dayOfWeek - 1);

  const rows = table.querySelectorAll('tbody tr');
  if (rows && rows[rowIdx]) {
    rows[rowIdx].classList.add('today-row');
    const firstCell = rows[rowIdx].querySelector('td');
    if (firstCell && !firstCell.querySelector('.today-pill')) {
      const pill = document.createElement('span');
      pill.className = 'today-pill';
      pill.textContent = 'Today';
      firstCell.appendChild(pill);
    }
  }
}

/* ---------------- 6. MOBILE MENU & OUTSIDE CLICK AUTO-COLLAPSE (UX-6) ---------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('navToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('mobileDrawerBackdrop');
  const closeBtn = document.getElementById('mobileDrawerClose');
  const drawerLinks = document.querySelectorAll('.mobile-drawer-link, .mobile-drawer-cta, .mobile-drawer-wa');
  const legacyNavMenu = document.getElementById('navMenu');

  function openDrawer() {
    if (drawer) {
      drawer.classList.add('active');
      drawer.setAttribute('aria-hidden', 'false');
    }
    if (backdrop) backdrop.classList.add('active');
    if (toggleBtn) {
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (drawer) {
      drawer.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
    }
    if (backdrop) backdrop.classList.remove('active');
    if (toggleBtn) {
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
    if (legacyNavMenu) legacyNavMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = drawer && drawer.classList.contains('active');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDrawer();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
  }

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });
}

/* ---------------- LIGHT THEME ENFORCEMENT ---------------- */
try {
  localStorage.removeItem('theme');
  document.documentElement.classList.remove('dark');
} catch (e) {}

/* ---------------- 7. SERVICE FILTERS & DYNAMIC COUNTS (UX-15) ---------------- */
function initServiceFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const serviceCards = document.querySelectorAll('.service-card');

  // Update counts on filter buttons
  const counts = { all: serviceCards.length, cosmetic: 0, implants: 0, restorative: 0, ortho: 0 };
  serviceCards.forEach(card => {
    const cat = card.getAttribute('data-category') || '';
    if (cat.includes('cosmetic')) counts.cosmetic++;
    if (cat.includes('implants') || cat.includes('surgery')) counts.implants++;
    if (cat.includes('restorative')) counts.restorative++;
    if (cat.includes('ortho') || cat.includes('pediatric')) counts.ortho++;
  });

  filterBtns.forEach(btn => {
    const filterValue = btn.getAttribute('data-filter');
    const countSpan = btn.querySelector('.filter-count');
    if (countSpan && counts[filterValue] !== undefined) {
      countSpan.textContent = counts[filterValue];
    }

    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      serviceCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue || category.includes(filterValue)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Global helper to select service from card, pulse field and scroll (UX-2)
window.selectServiceAndBook = function(serviceName) {
  const serviceSelect = document.getElementById('bookingService');
  if (serviceSelect) {
    serviceSelect.value = serviceName;
    serviceSelect.classList.add('field-flash');
    setTimeout(() => {
      serviceSelect.classList.remove('field-flash');
    }, 2500);
  }
  const bookingSec = document.getElementById('appointment');
  if (bookingSec) {
    bookingSec.scrollIntoView({ behavior: 'smooth' });
    showToast(`Selected "${serviceName}". Please choose date & time.`, 'info');
  }
};

/* ---------------- 8. DRAFT AUTO-SAVE IN SESSIONSTORAGE (UX-10) ---------------- */
function initDraftAutoSave() {
  const form = document.getElementById('appointmentForm');
  if (!form) return;

  const fields = ['bookingName', 'bookingPhone', 'bookingEmail', 'bookingService', 'bookingDate', 'bookingNotes'];
  
  // Restore draft if available
  fields.forEach(fieldId => {
    const el = document.getElementById(fieldId);
    if (el) {
      const saved = sessionStorage.getItem(`draft_${fieldId}`);
      if (saved && !el.value) {
        el.value = saved;
      }
      // Save changes live
      el.addEventListener('input', () => {
        sessionStorage.setItem(`draft_${fieldId}`, el.value);
      });
      el.addEventListener('change', () => {
        sessionStorage.setItem(`draft_${fieldId}`, el.value);
      });
    }
  });
}

function clearDraft() {
  const fields = ['bookingName', 'bookingPhone', 'bookingEmail', 'bookingService', 'bookingDate', 'bookingNotes'];
  fields.forEach(fieldId => sessionStorage.removeItem(`draft_${fieldId}`));
}

/* ---------------- 9. APPOINTMENT BOOKING & INLINE VALIDATION (UX-1, UX-3) ---------------- */
const STORAGE_KEY = 'dr_tushar_chandak_appointments_v1';

function getStoredAppointments() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getInitialDummyAppointments();
  } catch (e) {
    return getInitialDummyAppointments();
  }
}

function saveAppointments(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getInitialDummyAppointments() {
  return [
    {
      id: 'TC-2026-8812',
      name: 'Kartik Sarker',
      phone: '+91 9309592373',
      email: 'kartik.s@example.com',
      service: 'Root Canal Treatment (RCT)',
      date: '2026-11-09',
      slot: 'Morning (10:00 AM - 01:00 PM)',
      notes: 'Severe pain on molar tooth',
      status: 'Confirmed',
      timestamp: '2026-11-06 14:30'
    },
    {
      id: 'TC-2026-8813',
      name: 'Ashutosh Sharma',
      phone: '+91 9309592373',
      email: 'ashutosh@example.com',
      service: 'Teeth Whitening',
      date: '2026-11-10',
      slot: 'Evening (05:00 PM - 08:30 PM)',
      notes: 'Consultation for smile makeover',
      status: 'Pending',
      timestamp: '2026-11-06 16:15'
    }
  ];
}

function initBookingSystem() {
  const form = document.getElementById('appointmentForm');
  const nameInput = document.getElementById('bookingName');
  const phoneInput = document.getElementById('bookingPhone');
  const dateInput = document.getElementById('bookingDate');
  const serviceSelect = document.getElementById('bookingService');
  const sundayNotice = document.getElementById('sundayNotice');

  // Set minimum date to today (UX-3)
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Check if user picks Sunday
    dateInput.addEventListener('change', () => {
      if (!dateInput.value) return;
      const pickedDate = new Date(dateInput.value);
      if (pickedDate.getUTCDay() === 0) { // Sunday
        if (sundayNotice) sundayNotice.style.display = 'flex';
      } else {
        if (sundayNotice) sundayNotice.style.display = 'none';
      }
    });
  }

  // Inline Validation Listeners (UX-1)
  if (phoneInput) {
    phoneInput.addEventListener('blur', () => {
      validatePhone(phoneInput);
    });
  }
  if (nameInput) {
    nameInput.addEventListener('blur', () => {
      validateName(nameInput);
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateName(nameInput);
      const isPhoneValid = validatePhone(phoneInput);

      if (!isNameValid || !isPhoneValid || !dateInput.value) {
        showToast('Please correct the highlighted fields before submitting.', 'error');
        return;
      }

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const email = document.getElementById('bookingEmail').value.trim();
      const service = (serviceSelect && serviceSelect.value) ? serviceSelect.value : 'General Consultation / Checkup';
      const date = dateInput.value;
      const notes = document.getElementById('bookingNotes').value.trim();
      const sendWhatsApp = document.getElementById('notifyWhatsApp').checked;

      const selectedSlotEl = document.querySelector('input[name="bookingSlot"]:checked');
      const slot = selectedSlotEl ? selectedSlotEl.value : 'Any Available Slot';

      // Generate Reference Code
      const refId = 'AY-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

      const newAppointment = {
        id: refId,
        name,
        phone,
        email: email || 'Not provided',
        service,
        date,
        slot,
        notes: notes || 'None',
        status: 'Pending',
        timestamp: new Date().toLocaleString()
      };

      // Save to localStorage
      const list = getStoredAppointments();
      list.unshift(newAppointment);
      saveAppointments(list);

      // Clear draft
      clearDraft();

      // Trigger Confirmation Modal
      showConfirmationModal(newAppointment, sendWhatsApp);

      // Reset form classes
      form.reset();
      nameInput.classList.remove('is-valid');
      phoneInput.classList.remove('is-valid');
      if (sundayNotice) sundayNotice.style.display = 'none';

      showToast('Appointment successfully scheduled!', 'success');
    });
  }
}

function validateName(input) {
  if (!input) return false;
  const val = input.value.trim();
  const errorEl = document.getElementById('nameError');
  if (val.length < 2) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    if (errorEl) {
      errorEl.textContent = 'Please enter at least 2 characters.';
      errorEl.classList.add('visible');
    }
    return false;
  } else {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    if (errorEl) errorEl.classList.remove('visible');
    return true;
  }
}

function validatePhone(input) {
  if (!input) return false;
  const val = input.value.trim().replace(/[^0-9]/g, '');
  const errorEl = document.getElementById('phoneError');
  if (val.length < 10) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    if (errorEl) {
      errorEl.textContent = 'Please enter a valid 10-digit phone number.';
      errorEl.classList.add('visible');
    }
    return false;
  } else {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    if (errorEl) errorEl.classList.remove('visible');
    return true;
  }
}

function showConfirmationModal(booking, sendWhatsApp) {
  const modal = document.getElementById('confirmationModal');
  if (!modal) return;

  document.getElementById('slipRefId').textContent = booking.id;
  document.getElementById('slipName').textContent = booking.name;
  document.getElementById('slipPhone').textContent = booking.phone;
  document.getElementById('slipService').textContent = booking.service;
  document.getElementById('slipDateTime').textContent = `${booking.date} | ${booking.slot}`;
  document.getElementById('slipStatus').textContent = booking.status;

  // WhatsApp formatted message
  const waText = encodeURIComponent(
    `🏥 *NEW APPOINTMENT BOOKING - Dr Tushar Chandak Family Dental Care*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Patient:* ${booking.name}\n` +
    `📞 *Phone:* ${booking.phone}\n` +
    `🦷 *Treatment:* ${booking.service}\n` +
    `📅 *Date:* ${booking.date}\n` +
    `⏰ *Preferred Slot:* ${booking.slot}\n` +
    `📝 *Notes:* ${booking.notes}\n` +
    `🆔 *Booking Ref:* ${booking.id}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `_Sent via Dr Tushar Chandak Family Dental Care Online Portal_`
  );

  const clinicPhone = '919309592373';
  const waUrl = `https://wa.me/${clinicPhone}?text=${waText}`;

  const sendBtn = document.getElementById('modalWhatsAppBtn');
  if (sendBtn) {
    sendBtn.href = waUrl;
  }

  // Setup Google Calendar Link
  const gCalBtn = document.getElementById('modalCalendarBtn');
  if (gCalBtn) {
    const title = encodeURIComponent(`Dental Appointment: ${booking.service} - Dr Tushar Chandak Family Dental Care`);
    const details = encodeURIComponent(`Dr Tushar Chandak Family Dental Care Appointment\nDoctor: Dr. Tushar Chandak\nService: ${booking.service}\nPatient: ${booking.name}\nRef: ${booking.id}\nClinic Contact: +91 9309592373`);
    const location = encodeURIComponent(`Ground floor primices, shri Ayurvedic College, DENTAL UNIT Dant-vibhag, Krida Chowk, Hanuman Nagar, Nagpur, Maharashtra 440024`);
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    gCalBtn.href = calUrl;
  }

  modal.classList.add('active');

  if (sendWhatsApp) {
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 600);
  }
}

// Copy Reference ID to Clipboard (UX-4)
window.copyBookingCode = function() {
  const codeEl = document.getElementById('slipRefId');
  if (!codeEl) return;
  const code = codeEl.textContent.trim();
  navigator.clipboard.writeText(code).then(() => {
    showToast(`Booking Code ${code} copied to clipboard!`, 'success');
  }).catch(() => {
    showToast(`Code: ${code}`, 'info');
  });
};

window.printBookingSlip = function() {
  window.print();
};

/* ---------------- 10. CLINIC ADMIN PORTAL & PASSCODE (UX-8, UX-9) ---------------- */
let currentAdminTab = 'all';
let currentAdminSearch = '';

function initAdminDashboard() {
  const adminModal = document.getElementById('adminModal');
  const passcodeModal = document.getElementById('passcodeModal');
  const adminBtn = document.getElementById('adminPortalBtn');
  const closeAdminBtn = document.getElementById('closeAdminBtn');
  const closePasscodeBtn = document.getElementById('closePasscodeBtn');
  const passcodeForm = document.getElementById('passcodeForm');
  const exportBtn = document.getElementById('exportCsvBtn');
  const searchInput = document.getElementById('adminSearchInput');
  const tabBtns = document.querySelectorAll('.admin-tab');

  // Trigger PIN Prompt (UX-8)
  if (adminBtn) {
    adminBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // If already authorized in this session, open directly
      if (sessionStorage.getItem('staff_auth') === 'true') {
        renderAdminAppointments();
        adminModal.classList.add('active');
      } else {
        if (passcodeModal) passcodeModal.classList.add('active');
        const pinInput = document.getElementById('staffPinInput');
        if (pinInput) setTimeout(() => pinInput.focus(), 150);
      }
    });
  }

  if (passcodeForm) {
    passcodeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pin = document.getElementById('staffPinInput').value.trim();
      if (pin === '1234') {
        sessionStorage.setItem('staff_auth', 'true');
        passcodeModal.classList.remove('active');
        renderAdminAppointments();
        adminModal.classList.add('active');
        showToast('Staff Access Granted', 'success');
      } else {
        showToast('Invalid PIN! Default passcode is 1234.', 'error');
        document.getElementById('staffPinInput').value = '';
      }
    });
  }

  if (closeAdminBtn) {
    closeAdminBtn.addEventListener('click', () => adminModal.classList.remove('active'));
  }
  if (closePasscodeBtn) {
    closePasscodeBtn.addEventListener('click', () => passcodeModal.classList.remove('active'));
  }

  // Search input filter (UX-9)
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentAdminSearch = searchInput.value.toLowerCase().trim();
      renderAdminAppointments();
    });
  }

  // Status Filter tabs (UX-9)
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAdminTab = btn.getAttribute('data-tab');
      renderAdminAppointments();
    });
  });

  if (exportBtn) {
    exportBtn.addEventListener('click', exportAppointmentsToCSV);
  }
}

function renderAdminAppointments() {
  const tableBody = document.getElementById('adminTableBody');
  const totalCountEl = document.getElementById('adminTotalCount');
  const pendingCountEl = document.getElementById('adminPendingCount');
  const confirmedCountEl = document.getElementById('adminConfirmedCount');

  if (!tableBody) return;

  const appointments = getStoredAppointments();

  let pending = 0;
  let confirmed = 0;

  appointments.forEach(item => {
    if (item.status === 'Pending') pending++;
    if (item.status === 'Confirmed') confirmed++;
  });

  // Filter list
  const filtered = appointments.filter(item => {
    const matchesTab = (currentAdminTab === 'all') || (item.status.toLowerCase() === currentAdminTab);
    const matchesSearch = !currentAdminSearch || 
      item.name.toLowerCase().includes(currentAdminSearch) || 
      item.phone.toLowerCase().includes(currentAdminSearch) ||
      item.id.toLowerCase().includes(currentAdminSearch) ||
      item.service.toLowerCase().includes(currentAdminSearch);
    return matchesTab && matchesSearch;
  });

  tableBody.innerHTML = '';

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2.2rem; color: #94a3b8;">No matching appointments found.</td></tr>`;
  } else {
    filtered.forEach((item, index) => {
      const originalIndex = appointments.indexOf(item);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.id}</strong><br><small style="color:#94a3b8">${item.timestamp || ''}</small></td>
        <td>
          <strong>${item.name}</strong><br>
          <a href="tel:${item.phone}" style="color:var(--primary); font-size:0.8rem; font-weight:600;"><i class="fas fa-phone-alt"></i> ${item.phone}</a>
        </td>
        <td>${item.service}</td>
        <td>${item.date}<br><small style="color:#64748b">${item.slot}</small></td>
        <td>
          <span class="status-badge ${item.status === 'Confirmed' ? 'status-confirmed' : (item.status === 'Completed' ? 'status-completed' : 'status-pending')}">
            ${item.status}
          </span>
        </td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <a href="https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(item.name)},%20this%20is%20Dr%20Tushar%20Chandak%20Family%20Dental%20Care%20regarding%20your%20appointment." target="_blank" class="btn btn-whatsapp" style="padding:0.25rem 0.6rem; font-size:0.75rem;" title="Chat WhatsApp">
              <i class="fab fa-whatsapp"></i>
            </a>
            <button onclick="toggleAppointmentStatus(${originalIndex})" class="btn btn-outline" style="padding:0.25rem 0.6rem; font-size:0.75rem;" title="Change Status">
              <i class="fas fa-sync-alt"></i>
            </button>
            <button onclick="deleteAppointment(${originalIndex})" class="btn" style="padding:0.25rem 0.6rem; font-size:0.75rem; background:#fee2e2; color:#b91c1c;" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  if (totalCountEl) totalCountEl.textContent = appointments.length;
  if (pendingCountEl) pendingCountEl.textContent = pending;
  if (confirmedCountEl) confirmedCountEl.textContent = confirmed;
}

window.toggleAppointmentStatus = function(index) {
  const list = getStoredAppointments();
  if (list[index]) {
    const current = list[index].status;
    if (current === 'Pending') list[index].status = 'Confirmed';
    else if (current === 'Confirmed') list[index].status = 'Completed';
    else list[index].status = 'Pending';

    saveAppointments(list);
    renderAdminAppointments();
    showToast(`Status updated to ${list[index].status}`, 'info');
  }
};

window.deleteAppointment = function(index) {
  if (confirm('Are you sure you want to remove this appointment record?')) {
    const list = getStoredAppointments();
    list.splice(index, 1);
    saveAppointments(list);
    renderAdminAppointments();
    showToast('Appointment removed', 'info');
  }
};

function exportAppointmentsToCSV() {
  const appointments = getStoredAppointments();
  if (!appointments || appointments.length === 0) {
    showToast('No appointment data to export.', 'error');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Reference ID,Patient Name,Phone,Email,Service,Appointment Date,Time Slot,Notes,Status,Created At\n";

  appointments.forEach(row => {
    const line = [
      `"${row.id}"`,
      `"${row.name}"`,
      `"${row.phone}"`,
      `"${row.email}"`,
      `"${row.service}"`,
      `"${row.date}"`,
      `"${row.slot}"`,
      `"${(row.notes || '').replace(/"/g, '""')}"`,
      `"${row.status}"`,
      `"${row.timestamp || ''}"`
    ].join(',');
    csvContent += line + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Dr_Tushar_Chandak_Appointments_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Appointments exported to CSV spreadsheet!', 'success');
}

/* ---------------- 11. CALL CHOOSER MODAL (UX-11) ---------------- */
window.openCallChooser = function() {
  const modal = document.getElementById('callChooserModal');
  if (modal) modal.classList.add('active');
};

/* ---------------- 12. BACK TO TOP BUTTON (UX-12) ---------------- */
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 380) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------------- 13. KEYBOARD ACCESSIBILITY & ESCAPE DISMISS (UX-5) ---------------- */
function initKeyboardModalDismiss() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModals = document.querySelectorAll('.modal-overlay.active, .lightbox-modal.active');
      activeModals.forEach(m => m.classList.remove('active'));
      document.body.style.overflow = '';
    }
  });
}

/* ---------------- 14. DIGITAL VCARD DOWNLOAD ---------------- */
window.downloadClinicVCard = function() {
  const vcardData = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:Dr Tushar Chandak Family Dental Care (Dr. Tushar Chandak)',
    'N:Chandak;Tushar;Dr.;;',
    'ORG:Dr Tushar Chandak Family Dental Care',
    'TITLE:Dental Surgeon & Implantologist',
    'TEL;TYPE=CELL,VOICE:+919309592373',
    'EMAIL;TYPE=PREF,INTERNET:drtusharchandak@gmail.com',
    'ADR;TYPE=WORK:;;Ground floor primices, shri Ayurvedic College, DENTAL UNIT Dant-vibhag, Krida Chowk, Hanuman Nagar;Nagpur;Maharashtra;440024;India',
    'URL:https://maps.google.com/?cid=291838327018789849',
    'NOTE:Advanced Dental Care • Implants • Root Canal • Teeth Whitening • Pediatric Care',
    'END:VCARD'
  ].join('\r\n');

  const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Dr_Tushar_Chandak_Family_Dental_Care.vcf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Clinic Contact Card downloaded!', 'success');
};

/* ---------------- 15. MODAL UTILITIES ---------------- */
window.closeModal = function(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
};

/* ---------------- 16. SMOOTH SCROLL ---------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/* ---------------- 17. GALLERY CONTINUOUS MARQUEE & LIGHTBOX ---------------- */
let isMarqueePaused = false;
let currentMarqueeDuration = 105; // seconds (smooth, calm glide)

window.toggleGalleryMarquee = function() {
  const track = document.getElementById('galleryMarqueeTrack');
  const btn = document.getElementById('galleryPauseBtn');
  if (!track) return;

  isMarqueePaused = !isMarqueePaused;
  if (isMarqueePaused) {
    track.classList.add('paused');
    if (btn) btn.innerHTML = '<i class="fas fa-play"></i> <span>Resume Motion</span>';
  } else {
    track.classList.remove('paused');
    if (btn) btn.innerHTML = '<i class="fas fa-pause"></i> <span>Pause Animation</span>';
  }
};

window.adjustMarqueeSpeed = function(speedFactor) {
  const track = document.getElementById('galleryMarqueeTrack');
  if (!track) return;
  const newDuration = Math.round(45 / speedFactor);
  track.style.animationDuration = `${newDuration}s`;
  showToast(`Animation speed set: ${speedFactor === 1.5 ? 'Faster' : 'Normal'}`, 'info');
};

window.openLightbox = function(imgSrc, title, desc) {
  const modal = document.getElementById('galleryLightboxModal');
  const imgEl = document.getElementById('lightboxImg');
  const titleEl = document.getElementById('lightboxTitle');
  const descEl = document.getElementById('lightboxDesc');

  if (!modal || !imgEl) return;

  imgEl.src = imgSrc;
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeLightbox = function(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const modal = document.getElementById('galleryLightboxModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

