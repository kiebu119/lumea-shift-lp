// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
const stickyCta = document.getElementById('sticky-cta');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
    stickyCta.classList.add('visible');
  } else {
    nav.classList.remove('scrolled');
    stickyCta.classList.remove('visible');
  }
});

// ===== REVEAL ON SCROLL =====
const revealEls = document.querySelectorAll('.reveal, .prob-card, .benefit-item, .voice-card');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
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
  steps[currentStep].classList.add('active');
  dots[currentStep].classList.add('active');
}

function changeStep(dir) {
  currentStep = (currentStep + dir + steps.length) % steps.length;
  updateStep();
}

function goStep(index) {
  currentStep = index;
  updateStep();
}