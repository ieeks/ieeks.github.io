// === Theme ===

// Muss zu --bg in styles.css und zum Init-Script im <head> passen. Die
// Dopplung ist nicht zu vermeiden: das Init-Script muss inline und blockierend
// laufen, also bevor diese Datei geladen ist.
var THEME_COLOR = { light: '#eee8db', dark: '#1e2024' };

function toggleTheme() {
  var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLOR[next]);
  try { localStorage.setItem('theme', next); } catch(e) {}
}

// === Live Clock (Vienna) ===
// Das Zonenkürzel wird mitformatiert statt hardcodiert — Wien ist von Ende März
// bis Ende Oktober CEST, nicht CET.

var clockFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Vienna',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZoneName: 'short'
});

function updateTime() {
  var parts = clockFormat.formatToParts(new Date());
  var time = '';
  var zone = '';
  parts.forEach(function(p) {
    if (p.type === 'hour' || p.type === 'minute') time += (time ? ':' : '') + p.value;
    else if (p.type === 'timeZoneName') zone = p.value;
  });

  var timeEl = document.getElementById('current-time');
  if (timeEl && time) timeEl.textContent = time;
  var zoneEl = document.getElementById('current-tz');
  if (zoneEl && zone) zoneEl.textContent = zone;
}

// Auf die Minutengrenze getaktet und nach jedem Tick neu gestellt: kein Drift,
// und der angezeigte Wert ist nie älter als die laufende Minute.
function scheduleClock() {
  updateTime();
  var now = new Date();
  setTimeout(scheduleClock, (60 - now.getSeconds()) * 1000 - now.getMilliseconds());
}

scheduleClock();

// === Copyright-Jahr ===

var yearEl = document.getElementById('current-year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// === Scramble ===

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

// === Persönliche Reihenfolge nach Tool-Klicks ===

// Nur lokale Klickzahlen; keine Übertragung an einen Server.
var TOOL_CLICK_STORAGE_KEY = 'toolbox:tool-clicks:v1';
var toolClickCounts = Object.create(null);

function readToolClicks() {
  try {
    var parsed = JSON.parse(localStorage.getItem(TOOL_CLICK_STORAGE_KEY) || '{}');
    var counts = Object.create(null);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      Object.keys(parsed).forEach(function(key) {
        var value = parsed[key];
        if (Number.isSafeInteger(value) && value >= 0) counts[key] = value;
      });
    }
    return counts;
  } catch (e) {
    return toolClickCounts;
  }
}

function toolClickKey(card) {
  return card.getAttribute('href');
}

function recordToolClick(card) {
  // Vor jedem Schreiben neu lesen, damit andere offene Tabs berücksichtigt werden.
  toolClickCounts = readToolClicks();
  var key = toolClickKey(card);
  toolClickCounts[key] = Math.min(
    (toolClickCounts[key] || 0) + 1,
    Number.MAX_SAFE_INTEGER
  );
  try {
    localStorage.setItem(TOOL_CLICK_STORAGE_KEY, JSON.stringify(toolClickCounts));
  } catch (e) {
    // Bei blockiertem Speicher funktionieren Links und Filter weiter.
  }
}

function initToolRanking() {
  var grid = document.getElementById('tools-grid');
  if (!grid) return;
  toolClickCounts = readToolClicks();
  var ranked = [].slice.call(grid.querySelectorAll('.tool-card')).map(function(card, index) {
    return { card: card, index: index, clicks: toolClickCounts[toolClickKey(card)] || 0 };
  });
  ranked.sort(function(a, b) {
    return b.clicks - a.clicks || a.index - b.index;
  });
  ranked.forEach(function(entry) {
    grid.appendChild(entry.card);
    entry.card.addEventListener('click', function(event) {
      // Normaler Klick, Touch, Enter sowie Strg-/Cmd-Klick.
      if (!event.defaultPrevented && event.button === 0) recordToolClick(entry.card);
    });
    entry.card.addEventListener('auxclick', function(event) {
      // Mittelklick zählt, das Öffnen des Kontextmenüs nicht.
      if (!event.defaultPrevented && event.button === 1) recordToolClick(entry.card);
    });
  });
  // Nur beim Laden sortieren, damit beim Klicken keine Kacheln wegspringen.
}

// === Tool-Filter ===

function applyFilter(filter) {
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

document.addEventListener('DOMContentLoaded', function() {
  initToolRanking();
  document.querySelectorAll('.tool-filters button').forEach(function(btn) {
    btn.addEventListener('click', function() { applyFilter(btn.dataset.filter); });
  });
  applyFilter('all');
});
