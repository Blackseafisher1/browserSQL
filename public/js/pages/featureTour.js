import { t } from '../i18n.js';

const TOUR_KEY = 'browSQL-tour-done';

const STEPS = [
  {
    id: 'welcome',
    title: () => t('tour.1.title'),
    text: () => t('tour.1.text'),
    target: null,
  },
  {
    id: 'ops',
    title: () => t('tour.2.title'),
    text: () => t('tour.2.text'),
    target: '.section-header[data-section="ops"]',
  },
  {
    id: 'recent',
    title: () => t('tour.3.title'),
    text: () => t('tour.3.text'),
    target: '#btn-schema-recent',
  },
  {
    id: 'files',
    title: () => t('tour.4.title'),
    text: () => t('tour.4.text'),
    target: '.section-header[data-section="files"]',
  },
  {
    id: 'schema',
    title: () => t('tour.5.title'),
    text: () => t('tour.5.text'),
    target: '.section-header[data-section="schema"]',
  },
  {
    id: 'tutorial',
    title: () => t('tour.6.title'),
    text: () => t('tour.6.text'),
    target: '.section-header[data-section="tutorial"]',
  },
  {
    id: 'challenges',
    title: () => t('tour.7.title'),
    text: () => t('tour.7.text'),
    target: '.section-header[data-section="challenges"]',
  },
  {
    id: 'resize',
    title: () => t('tour.8.title'),
    text: () => t('tour.8.text'),
    target: '#schema-resize-handle',
  },
  {
    id: 'editor',
    title: () => t('tour.9.title'),
    text: () => t('tour.9.text'),
    target: '#editor-container-0 .cm-editor',
  },
  {
    id: 'execute',
    title: () => t('tour.10.title'),
    text: () => t('tour.10.text'),
    target: '#btn-execute',
  },
  {
    id: 'settings',
    title: () => t('tour.11.title'),
    text: () => t('tour.11.text'),
    target: '#btn-schema-settings',
    openSettings: true,
  },
  {
    id: 'done',
    title: () => t('tour.12.title'),
    text: () => t('tour.12.text'),
    target: '#btn-schema-test',
  },
];

let currentStep = 0;
let overlay = null;
let spotlight = null;
let card = null;
let settingsWasOpen = false;

function create() {
  overlay = document.createElement('div');
  overlay.className = 'tour-overlay';
  overlay.id = 'tour-overlay';

  spotlight = document.createElement('div');
  spotlight.className = 'tour-spotlight';
  spotlight.style.display = 'none';
  overlay.appendChild(spotlight);

  card = document.createElement('div');
  card.className = 'tour-card';
  overlay.appendChild(card);

  document.body.appendChild(overlay);
}

function showStep(index) {
  const step = STEPS[index];
  if (!step) { finish(); return; }

  currentStep = index;
  const total = STEPS.length;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const stepTitle = typeof step.title === 'function' ? step.title() : step.title;
  const stepText = typeof step.text === 'function' ? step.text() : step.text;

  card.innerHTML = `
    ${!isFirst && !isLast ? `<div class="tour-card-step">${t('tour.step', index, total - 2)}</div>` : ''}
    <div class="tour-card-title">${stepTitle}</div>
    <div class="tour-card-text">${stepText}</div>
    <div class="tour-card-actions">
      <button class="tour-skip" id="tour-skip">${t('tour.skip')}</button>
      <div>
        ${!isFirst ? `<button class="tour-btn" id="tour-prev" style="margin-right:6px">${t('tour.back')}</button>` : ''}
        ${isLast ? `<button class="tour-btn tour-btn-settings" id="tour-open-settings" style="margin-right:6px">${t('tour.settings')}</button>` : ''}
        <button class="tour-btn ${isLast ? 'tour-btn-done' : 'tour-btn-primary'}" id="tour-next">
          ${isLast ? t('tour.done') : isFirst ? t('tour.start') : t('tour.next')}
        </button>
      </div>
    </div>
  `;

  card.querySelector('#tour-skip')?.addEventListener('click', skip);
  card.querySelector('#tour-open-settings')?.addEventListener('click', () => {
    finish();
    document.getElementById('settings-modal-overlay')?.classList.remove('hidden');
  });
  card.querySelector('#tour-prev')?.addEventListener('click', () => {
    if (settingsWasOpen) { closeSettings(); settingsWasOpen = false; }
    go(currentStep - 1);
  });
  card.querySelector('#tour-next')?.addEventListener('click', () => {
    if (settingsWasOpen) { closeSettings(); settingsWasOpen = false; }
    isLast ? finish() : go(currentStep + 1);
  });

  if (step.openSettings) {
    settingsWasOpen = true;
    document.getElementById('settings-modal-overlay')?.classList.remove('hidden');
  }

  if (step.target) {
    const el = document.querySelector(step.target);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        spotlight.style.display = '';
        spotlight.style.left = (rect.left - 4) + 'px';
        spotlight.style.top = (rect.top - 4) + 'px';
        spotlight.style.width = (rect.width + 8) + 'px';
        spotlight.style.height = (rect.height + 8) + 'px';
        positionCard(rect);
      });
    } else {
      spotlight.style.display = 'none';
      centerCard();
    }
  } else {
    spotlight.style.display = 'none';
    centerCard();
  }
}

function closeSettings() {
  document.getElementById('settings-modal-overlay')?.classList.add('hidden');
}

function positionCard(targetRect) {
  requestAnimationFrame(() => {
    const cw = Math.min(card.offsetWidth || 320, window.innerWidth - 32);
    const ch = card.offsetHeight || 200;
    const gap = 12;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    let left, top;

    const below = targetRect.bottom + gap;
    if (below + ch + 20 < viewH || below < viewH * 0.6) {
      top = below;
      left = Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - cw / 2, viewW - cw - 16));
    } else {
      top = Math.max(16, targetRect.top - ch - gap);
      left = Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - cw / 2, viewW - cw - 16));
    }

    card.style.left = left + 'px';
    card.style.top = top + 'px';
    card.style.transform = '';
  });
}

function centerCard() {
  card.style.left = '50%';
  card.style.top = '50%';
  card.style.transform = 'translate(-50%, -50%)';
}

function go(idx) {
  if (idx < 0 || idx >= STEPS.length) return;
  showStep(idx);
}

function skip() {
  localStorage.setItem(TOUR_KEY, '1');
  if (settingsWasOpen) closeSettings();
  hide();
}

function finish() {
  localStorage.setItem(TOUR_KEY, '1');
  if (settingsWasOpen) closeSettings();
  hide();
}

function hide() {
  overlay.classList.remove('active');
  setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 300);
  document.body.style.overflow = '';
}

export function startTour() {
  if (localStorage.getItem(TOUR_KEY)) return;
  if (document.getElementById('tour-overlay')) return;

  create();
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    overlay.classList.add('active');
    showStep(0);
  });
}
