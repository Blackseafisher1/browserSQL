const TOUR_KEY = 'browSQL-tour-done';

const STEPS = [
  {
    id: 'welcome',
    title: 'Willkommen bei browSQL',
    text: 'Eine vollständige SQL-IDE, die komplett im Browser läuft — kein Server nötig. Lass uns einen kurzen Rundgang machen.',
    target: null,
  },
  {
    id: 'ops',
    title: 'Operations & Sidebar',
    text: 'Die <b>Operations</b>-Leiste bietet schnellen Zugriff auf: Neue DB, Öffnen, Exportieren, Templates laden und mehr.<br><br>Alles in der Sidebar ist <b>resizable</b> — ziehe an den Trennern zwischen den Abschnitten, um die Größe anzupassen. Auch die Sidebar selbst kannst du beliebig breit ziehen.',
    target: '.section-header[data-section="ops"]',
  },
  {
    id: 'recent',
    title: 'Datenbank wechseln',
    text: 'Über <b>Recent</b> in der Operations-Leiste kannst du schnell zwischen gespeicherten Datenbanken wechseln. Praktisch, wenn du mit mehreren Projekten arbeitest.',
    target: '#btn-schema-recent',
  },
  {
    id: 'files',
    title: 'Dateien (Files)',
    text: 'Hier kannst du SQL- und <b>.md-Dateien</b> (Markdown) verwalten — browSQL hat einen integrierten Markdown-Preview, perfekt für Notizen und Dokumentation.<br><br>Erstelle, öffne und organisiere deine Dateien in Ordnern.',
    target: '.section-header[data-section="files"]',
  },
  {
    id: 'schema',
    title: 'Schema-Browser',
    text: 'Zeigt alle Tabellen der aktuellen Datenbank. Klicke auf eine Tabelle, um Daten vorzusehen, oder expandiere sie für Spalten, Typen und Constraints.<br><br>Auch dieser Bereich ist <b>in der Höhe veränderbar</b> — perfekt, wenn du mehr Platz für Tabellen oder Dateien brauchst.',
    target: '.section-header[data-section="schema"]',
  },
  {
    id: 'tutorial',
    title: 'Tutorials',
    text: 'Lerne SQL Schritt für Schritt mit interaktiven Lektionen — von SELECT bis zu komplexen JOINs und CTEs. Jede Lektion enthält Aufgaben, die automatisch geprüft werden.',
    target: '.section-header[data-section="tutorial"]',
  },
  {
    id: 'challenges',
    title: 'Challenges',
    text: 'Teste dein Wissen mit vorgefertigten Challenges. Jede Aufgabe gibt XP bei Erfolg.<br><br>Du kannst auch <b>eigene Challenges erstellen</b> und importieren — perfekt für Lehrer und Kurse.',
    target: '.section-header[data-section="challenges"]',
  },
  {
    id: 'resize',
    title: 'Alles ist resizable',
    text: 'Die <b>gesamte Sidebar</b> kannst du per Drag an der rechten Kante verändern. Auch der <b>Editor</b> und die <b>Ergebnisse</b> sind durch einen horizontalen Teiler getrennt — einfach ziehen und anpassen.<br><br>So kannst du dir den Arbeitsbereich genau nach Wunsch einrichten.',
    target: '#schema-resize-handle',
  },
  {
    id: 'editor',
    title: 'SQL-Editor',
    text: 'Schreibe SQL hier. <kbd>Ctrl+Enter</kbd> führt die Abfrage unter dem Cursor aus, <kbd>Ctrl+Shift+Enter</kbd> führt alles aus.<br><br>Der Editor hat Autocomplete für Tabellen, Spalten und Aliase. Probier es einfach aus!',
    target: '#editor-container-0 .cm-editor',
  },
  {
    id: 'execute',
    title: 'Ausführen & Ergebnisse',
    text: 'Klicke <b>Execute</b> oder drücke <kbd>Ctrl+Enter</kbd>. Das Ergebnis erscheint unten als Tabelle — exportierbar als CSV. Auch die Ergebnisgröße ist über den Zoom-Regler einstellbar.',
    target: '#btn-execute',
  },
  {
    id: 'settings',
    title: 'Einstellungen anpassen',
    text: 'Hier kannst du alles nach deinem Geschmack einstellen: Editor, Autocomplete, Sidebar-Sektionen ein-/ausblenden, Header verstecken, SQL-Formatierung, Cursor-Farben und vieles mehr.<br><br>Nimm dir einen Moment Zeit und stell es so ein, wie du es magst!',
    target: '#btn-schema-settings',
    openSettings: true,
  },
  {
    id: 'done',
    title: 'Fertig!',
    text: 'Du kannst jetzt loslegen: Starte mit einer leeren DB, lade eine Vorlage unter <b>Templates</b>, beginne ein <b>Tutorial</b> oder stelle deine <b>Einstellungen</b> fertig ein. Du kannst z.B. bestimmte Sectionen der Sidebar ausblenden oder den Header und weiteres<br><br>Viel Erfolg mit browSQL!',
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

  card.innerHTML = `
    ${!isFirst && !isLast ? `<div class="tour-card-step">Schritt ${index} von ${total - 2}</div>` : ''}
    <div class="tour-card-title">${step.title}</div>
    <div class="tour-card-text">${step.text}</div>
    <div class="tour-card-actions">
      <button class="tour-skip" id="tour-skip">Überspringen</button>
      <div>
        ${!isFirst ? `<button class="tour-btn" id="tour-prev" style="margin-right:6px">← Zurück</button>` : ''}
        ${isLast ? `<button class="tour-btn tour-btn-settings" id="tour-open-settings" style="margin-right:6px">⚙ Settings</button>` : ''}
        <button class="tour-btn ${isLast ? 'tour-btn-done' : 'tour-btn-primary'}" id="tour-next">
          ${isLast ? 'Fertig!' : isFirst ? 'Starten' : 'Weiter'}
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
