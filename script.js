// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
const stickyCta = document.getElementById('sticky-cta');

window.addEventListener('scroll', () => {
  if (nav && stickyCta) {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
      stickyCta.classList.add('visible');
    } else {
      nav.classList.remove('scrolled');
      stickyCta.classList.remove('visible');
    }
  } else if (stickyCta) {
    if (window.scrollY > 60) {
      stickyCta.classList.add('visible');
    } else {
      stickyCta.classList.remove('visible');
    }
  }
});

// ===== REVEAL ON SCROLL =====
const revealEls = document.querySelectorAll('.reveal, .prob-card, .benefit-item, .voice-card');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObserver.observe(el));

// ===== FV IMAGE SLIDE =====
const fvImgs = document.querySelectorAll('.fv-img');
let currentImg = 0;
if (fvImgs.length > 1) {
  setInterval(() => {
    fvImgs[currentImg].classList.remove('active');
    currentImg = (currentImg + 1) % fvImgs.length;
    fvImgs[currentImg].classList.add('active');
  }, 4000);
}

// ===== TAB SWITCH =====
function switchTab(tab, el) {
  document.querySelectorAll('.scene-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
}

// ===== FAQ =====
function toggleFaq(btn) {
  const item = btn.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ===== STEP SLIDER =====
let currentStep = 0;
const steps = document.querySelectorAll('.step-slide');
const dots = document.querySelectorAll('.step-dot');

function updateStep() {
  steps.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  if (steps[currentStep]) steps[currentStep].classList.add('active');
  if (dots[currentStep]) dots[currentStep].classList.add('active');
}

function changeStep(dir) {
  currentStep = (currentStep + dir + steps.length) % steps.length;
  updateStep();
}

function goStep(index) {
  currentStep = index;
  updateStep();
}

// ===== MODAL =====
function openModal() {
  document.getElementById('order-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('order-modal').style.display = 'none';
  document.body.style.overflow = '';
}

// モーダル外クリックで閉じる
document.getElementById('order-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

async function submitOrder() {
  // エラーリセット
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');

  const name     = document.getElementById('f-name').value.trim();
  const email    = document.getElementById('f-email').value.trim();
  const phone    = document.getElementById('f-phone').value.trim();
  const zip      = document.getElementById('f-zip').value.trim();
  const address  = document.getElementById('f-address').value.trim();
  const quantity = document.getElementById('f-quantity').value;

  let hasError = false;

  if (!name)    { document.getElementById('err-name').textContent    = '※お名前を入力してください'; hasError = true; }
  if (!email)   { document.getElementById('err-email').textContent   = '※メールアドレスを入力してください'; hasError = true; }
  if (!phone)   { document.getElementById('err-phone').textContent   = '※電話番号を入力してください'; hasError = true; }
  if (!zip)     { document.getElementById('err-zip').textContent     = '※郵便番号を入力してください'; hasError = true; }
  if (!address) { document.getElementById('err-address').textContent = '※住所を入力してください'; hasError = true; }

  if (hasError) return;

  const GAS_URL = 'https://script.google.com/macros/s/AKfycbzwuMWPGPqMZDCvcEU-UIap5XF5wLTOwNAqZ8cf_r0pPZQ7A8YF1I9akaH73jhdHfoT/exec';

  try {
    await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, zip, address, quantity })
    });
    document.querySelector('.modal-form').style.display = 'none';
    document.getElementById('thanks-msg').style.display = 'block';
  } catch (e) {
    document.getElementById('err-name').textContent = 'エラーが発生しました。もう一度お試しください。';
  }
}

// ===== 自動ハイフン =====
document.addEventListener('DOMContentLoaded', () => {
  const phone = document.getElementById('f-phone');
  const zip   = document.getElementById('f-zip');

  phone?.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 7)      v = v.slice(0,3) + '-' + v.slice(3,7) + '-' + v.slice(7,11);
    else if (v.length > 3) v = v.slice(0,3) + '-' + v.slice(3);
    e.target.value = v;
  });

  zip?.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 3) v = v.slice(0,3) + '-' + v.slice(3,7);
    e.target.value = v;
  });
});