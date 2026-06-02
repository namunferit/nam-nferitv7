// ============ GOOGLE SHEETS CONFIG ============
const SHEET_ID = '1z5Ruhl7gDza1KGI_7lnkBZ5rVrqGiygkZtocuQTTX_o';
// Apps Script Web App URL — bunu script.google.com üzerinden oluşturup buraya yapıştırın
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbweLbhPQmaaklJVIArPD622iDFHfhc1-H7fFEE8bFIayBMoYcQNNZBX-VSH91yv_auD/exec';

const CATEGORY_MAP = {
  'insan': 'İnsan', 'sehir': 'Şehir', 'fikir': 'Fikir',
  'kultur': 'Kültür', 'deneme': 'Deneme', 'hikaye': 'Hikâye'
};

// ============ NAVBAR SCROLL ============
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 60);
});

// ============ MOBILE MENU ============
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileClose = document.querySelector('.mobile-close');

navToggle?.addEventListener('click', () => mobileMenu?.classList.add('open'));
mobileClose?.addEventListener('click', () => mobileMenu?.classList.remove('open'));
mobileMenu?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ============ SCROLL REVEAL ============
const revealElements = document.querySelectorAll('.reveal, .article-card, .video-card');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// ============ SMOOTH SCROLL FOR ANCHORS ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ============ CATEGORY FILTER ============
const categoryBtns = document.querySelectorAll('.category-btn');
const articleCards = document.querySelectorAll('.article-card[data-category]');
let currentCategory = 'all';

categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;

    // Filter static article cards
    articleCards.forEach(card => {
      if (currentCategory === 'all' || card.dataset.category === currentCategory) {
        card.style.display = '';
        setTimeout(() => card.classList.add('visible'), 50);
      } else {
        card.classList.remove('visible');
        card.style.display = 'none';
      }
    });

    // Filter Google Sheets submission cards
    filterSubmissionCards();
  });
});

function filterSubmissionCards() {
  const cards = document.querySelectorAll('.submission-card[data-category]');
  cards.forEach(card => {
    if (currentCategory === 'all' || card.dataset.category === currentCategory) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// ============ FORM SUBMISSION TO GOOGLE SHEETS ============
const submitForm = document.getElementById('submitForm');
const formSuccess = document.querySelector('.form-success');

submitForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = submitForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  // Get form data
  const formData = {
    isim: document.getElementById('authorName')?.value || '',
    eposta: document.getElementById('authorEmail')?.value || '',
    baslik: document.getElementById('articleTitle')?.value || '',
    kategori: document.getElementById('articleCategory')?.value || '',
    yazi: document.getElementById('articleBody')?.value || '',
    dosyalar: []
  };

  // Convert uploaded files to base64
  if (typeof uploadedFiles !== 'undefined' && uploadedFiles.length > 0) {
    submitBtn.textContent = 'Dosyalar hazırlanıyor...';
    submitBtn.classList.add('btn-loading');

    for (const file of uploadedFiles) {
      const base64 = await fileToBase64(file);
      formData.dosyalar.push({
        isim: file.name,
        tip: file.type,
        veri: base64
      });
    }
  }

  // Check if Apps Script URL is configured
  if (!APPS_SCRIPT_URL) {
    console.warn('Apps Script URL yapılandırılmamış. Form verisi gönderilemedi.');
    submitForm.style.display = 'none';
    formSuccess?.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Show loading state
  submitBtn.textContent = formData.dosyalar.length > 0 ? 'Dosyalar yükleniyor...' : 'Gönderiliyor...';
  submitBtn.classList.add('btn-loading');

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    // no-cors mode always returns opaque response, assume success
    submitForm.style.display = 'none';
    formSuccess?.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('Form gönderim hatası:', error);
    // Show error
    let errorEl = document.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      submitForm.insertBefore(errorEl, submitForm.firstChild);
    }
    errorEl.textContent = 'Gönderim sırasında bir hata oluştu. Lütfen tekrar deneyin.';
    errorEl.classList.add('show');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.classList.remove('btn-loading');
  }
});

// ============ COUNTER ANIMATION ============
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    let current = 0;
    const increment = target / 40;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 30);
  });
}

const counterSection = document.querySelector('.counters');
if (counterSection) {
  const counterObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateCounters();
      counterObserver.disconnect();
    }
  }, { threshold: 0.5 });
  counterObserver.observe(counterSection);
}

// ============ FILE TO BASE64 HELPER ============
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove data URL prefix (e.g. "data:image/png;base64,")
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
