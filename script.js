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

var POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*~+-=.:';
var DURATION = 650;
var isScrambling = false;

function scramble(el) {
  if (isScrambling) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var final = el.getAttribute('data-text') || el.textContent || '';
  el.setAttribute('data-text', final);
  el.style.minWidth = el.offsetWidth + 'px';

  isScrambling = true;
  var start = performance.now();

  function tick(now) {
    var progress = Math.min((now - start) / DURATION, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var resolved = Math.floor(eased * final.length);

    var out = '';
    for (var i = 0; i < final.length; i++) {
      if (i < resolved) {
        out += final[i];
      } else if (final[i] === ' ') {
        out += ' ';
      } else {
        out += POOL[Math.floor(Math.random() * POOL.length)];
      }
    }
    el.textContent = out;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = final;
      el.style.minWidth = '';
      isScrambling = false;
    }
  }

  requestAnimationFrame(tick);
}

window.addEventListener('load', function() {
  var el = document.getElementById('scramble-heading');
  if (el) {
    setTimeout(function() { scramble(el); }, 120);
  }
});

var heading = document.getElementById('scramble-heading');
if (heading) {
  heading.addEventListener('mouseenter', function() { scramble(this); });
  heading.addEventListener('touchstart', function() { scramble(this); }, { passive: true });
}
