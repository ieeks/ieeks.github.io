// === Theme ===

function toggleTheme() {
  var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch(e) {}
}

// === Live Clock (Vienna) ===

function updateTime() {
  var time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Vienna',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date());
  var el = document.getElementById('current-time');
  if (el) el.textContent = time;
}

updateTime();
setInterval(updateTime, 60000);

// === Scramble ===
// Läuft über alle [data-scramble]-Wörter gleichzeitig, damit das Heading
// in v1/v2 einzeilig und in v3 zweizeilig gesetzt werden kann.

var POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*~+-=.:';
var DURATION = 650;
var isScrambling = false;

function scramble() {
  if (isScrambling) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var targets = [].slice.call(document.querySelectorAll('[data-scramble]')).map(function(el) {
    var final = el.getAttribute('data-text') || el.textContent || '';
    el.setAttribute('data-text', final);
    el.style.minWidth = el.offsetWidth + 'px';
    return { el: el, final: final };
  });

  if (!targets.length) return;

  isScrambling = true;
  var start = performance.now();

  function tick(now) {
    var progress = Math.min((now - start) / DURATION, 1);
    var eased = 1 - Math.pow(1 - progress, 3);

    targets.forEach(function(t) {
      var resolved = Math.floor(eased * t.final.length);
      var out = '';
      for (var i = 0; i < t.final.length; i++) {
        if (i < resolved) {
          out += t.final[i];
        } else if (t.final[i] === ' ') {
          out += ' ';
        } else {
          out += POOL[Math.floor(Math.random() * POOL.length)];
        }
      }
      t.el.textContent = out;
    });

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      targets.forEach(function(t) {
        t.el.textContent = t.final;
        t.el.style.minWidth = '';
      });
      isScrambling = false;
    }
  }

  requestAnimationFrame(tick);
}

window.addEventListener('load', function() {
  setTimeout(scramble, 120);
});

var heading = document.getElementById('scramble-heading');
if (heading) {
  heading.addEventListener('mouseenter', scramble);
  heading.addEventListener('touchstart', scramble, { passive: true });
}

// === Tool-Filter (v3) ===

var activeFilter = 'all';

// remember=false rendert nur (z. B. beim Verlassen von v3), ohne die Auswahl zu überschreiben
function renderCards(filter, remember) {
  if (remember) activeFilter = filter;

  var cards = [].slice.call(document.querySelectorAll('.tool-card'));
  var grid = document.getElementById('tools-grid');
  var countEl = document.getElementById('tool-count');

  // Alles ausblenden und Reflow erzwingen, damit die Rise-Animation neu startet
  cards.forEach(function(card) { card.style.display = 'none'; });
  if (grid) void grid.offsetWidth;

  var shown = 0;
  cards.forEach(function(card) {
    var cats = (card.getAttribute('data-cat') || '').split(' ');
    if (filter === 'all' || cats.indexOf(filter) > -1) {
      card.style.setProperty('--i', shown);
      card.style.display = '';
      shown++;
    }
  });

  if (countEl) {
    countEl.textContent = shown + (shown === 1 ? ' Tool' : ' Tools');
  }

  document.querySelectorAll('.tool-filters button').forEach(function(btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.filter === filter));
  });
}

function applyFilter(filter) {
  renderCards(filter, true);
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.tool-filters button').forEach(function(btn) {
    btn.addEventListener('click', function() { applyFilter(btn.dataset.filter); });
  });
  applyFilter('all');
});

// === Design Toggle ===

function setDesign(design) {
  document.documentElement.setAttribute('data-design', design);
  try { localStorage.setItem('design', design); } catch(e) {}
  updateDesignButtons();
  // Filter gibt es nur in v3 — beim Verlassen alles zeigen, Auswahl aber merken
  renderCards(design === 'v3' ? activeFilter : 'all', false);
}

function updateDesignButtons() {
  var current = document.documentElement.getAttribute('data-design') || 'v1';
  document.querySelectorAll('.design-toggle button').forEach(function(btn) {
    var isActive = btn.dataset.design === current;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.design-toggle button').forEach(function(btn) {
    btn.addEventListener('click', function() { setDesign(btn.dataset.design); });
  });
  updateDesignButtons();
});
