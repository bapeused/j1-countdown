const TARGET = new Date(2027, 5, 1, 0, 0, 0);
const START = new Date(2026, 9, 1, 0, 0, 0);
const IMG = (file, w) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${w}`;

const POSTCARDS = [
  { file: 'Statue_of_Liberty_7.jpg', ar: '4 / 5', hand: 'Первым делом к ней', place: 'New York, NY', mark: 'NEW YORK' },
  { file: 'Golden_Gate_Bridge_as_seen_from_Battery_East.jpg', hand: 'Проехать по мосту на велике', place: 'San Francisco, CA', mark: 'SAN FRANCISCO' },
  { file: 'Grand_Canyon_view_from_Pima_Point_2010.jpg', hand: 'Встретить рассвет над каньоном', place: 'Grand Canyon, AZ', mark: 'ARIZONA' },
  { file: 'Hollywood_Sign_(Zuschnitt).jpg', hand: 'Фотка на фоне надписи', place: 'Los Angeles, CA', mark: 'HOLLYWOOD' },
  { file: 'Brooklyn_Bridge_Manhattan.jpg', ar: '4 / 5', hand: 'Пройти мост пешком на закате', place: 'Brooklyn, NY', mark: 'BROOKLYN' },
  { file: 'Chicago_Skyline_Hi-Res.jpg', ar: '16 / 9', hand: 'Deep dish пицца и небоскрёбы', place: 'Chicago, IL', mark: 'CHICAGO' },
  { file: 'Miami_Beach_-_panoramio.jpg', hand: 'Океан, пальмы и выходной', place: 'Miami Beach, FL', mark: 'MIAMI' },
  { file: 'Las_Vegas_Strip.png', hand: 'Вегас, хотя бы одну ночь', place: 'Las Vegas, NV', mark: 'LAS VEGAS' },
  { file: 'Lower_Manhattan_skyline_-_June_2017.jpg', ar: '16 / 9', hand: 'Манхэттен с воды', place: 'Manhattan, NY', mark: 'MANHATTAN' },
];

/* ---------- Split-flap digits ---------- */

function makeFlap() {
  const el = document.createElement('div');
  el.className = 'flap';
  el.dataset.v = '0';
  el.innerHTML = '<div class="half t"><span>0</span></div><div class="half b"><span>0</span></div>';
  return el;
}

function setFlap(el, v, animate) {
  const old = el.dataset.v;
  if (old === v) return;
  el.dataset.v = v;
  el.querySelectorAll('.leaf').forEach(n => n.remove());
  const [top, bottom] = el.querySelectorAll('.half > span');
  top.textContent = v;
  if (!animate) {
    bottom.textContent = v;
    return;
  }
  bottom.textContent = old;
  const leafTop = document.createElement('div');
  leafTop.className = 'half t leaf';
  leafTop.innerHTML = `<span>${old}</span>`;
  const leafBottom = document.createElement('div');
  leafBottom.className = 'half b leaf';
  leafBottom.innerHTML = `<span>${v}</span>`;
  leafBottom.addEventListener('animationend', () => {
    bottom.textContent = v;
    leafTop.remove();
    leafBottom.remove();
  });
  el.append(leafTop, leafBottom);
}

const groups = {};
document.querySelectorAll('.group').forEach(g => {
  const unit = g.dataset.unit;
  const count = unit === 'd' ? 3 : 2;
  const box = g.querySelector('.flaps');
  groups[unit] = Array.from({ length: count }, () => box.appendChild(makeFlap()));
});

function showNumber(unit, n, animate) {
  const flaps = groups[unit];
  const str = String(n).padStart(flaps.length, '0');
  flaps.forEach((f, i) => setFlap(f, str[i], animate));
}

/* ---------- Destination letters ---------- */

function scramble(el, text) {
  const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  el.innerHTML = '';
  [...text].forEach((c, i) => {
    const span = document.createElement('span');
    span.className = c === ' ' ? 'ch space' : 'ch';
    el.appendChild(span);
    if (c === ' ') return;
    const steps = 6 + i * 2 + Math.floor(Math.random() * 4);
    let k = 0;
    const id = setInterval(() => {
      k++;
      span.textContent = k >= steps ? c : pool[Math.floor(Math.random() * pool.length)];
      if (k >= steps) clearInterval(id);
    }, 55);
  });
}

/* ---------- Postcards ---------- */

function postmark(text, i) {
  return `<svg class="postmark" viewBox="0 0 100 100" aria-hidden="true">
    <defs><path id="pm${i}" d="M50,50 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0"/></defs>
    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="2.2"/>
    <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <text font-family="Oswald, sans-serif" font-size="9.5" letter-spacing="1.4" fill="currentColor">
      <textPath href="#pm${i}" startOffset="25%" text-anchor="middle">${text}</textPath>
    </text>
    <text x="50" y="47" text-anchor="middle" font-family="Oswald, sans-serif" font-size="10" fill="currentColor">JUN</text>
    <text x="50" y="60" text-anchor="middle" font-family="Oswald, sans-serif" font-size="10" fill="currentColor">2027</text>
  </svg>`;
}

function renderPostcards() {
  const box = document.getElementById('postcards');
  const tilts = [-2.2, 1.6, -1, 2.4, -1.8, 1.1, -2.6, 1.9, -0.8];
  box.innerHTML = POSTCARDS.map((p, i) => `
    <figure class="card" style="--r:${tilts[i % tilts.length]}deg;${p.ar ? `--ar:${p.ar}` : ''}">
      <div class="photo"><img loading="lazy" src="${IMG(p.file, 900)}" alt="${p.place}"></div>
      <div class="stamp" aria-hidden="true"><div class="stamp-inner"><span class="st">★</span><span class="usa">USA</span><span class="bar"></span><span class="yr">J-1 · 27</span></div></div>
      ${postmark(p.mark + ' · USA', i)}
      <figcaption class="note"><span class="hand">${p.hand}</span><span class="place">${p.place}</span></figcaption>
    </figure>`).join('');
}

/* ---------- Barcode ---------- */

function drawBarcode() {
  const c = document.getElementById('barcode');
  const ctx = c.getContext('2d');
  let seed = 20270601;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--sky-ink').trim() || '#1d2b45';
  let x = 0;
  while (x < c.width) {
    const w = 1 + Math.floor(rnd() * 3);
    if (x > c.width - 4) break;
    if (rnd() > 0.22) ctx.fillRect(x, 0, w, c.height);
    x += w + 1;
  }
}

/* ---------- Tick ---------- */

let landed = false;

function tick(animate = true) {
  const now = new Date();
  document.getElementById('clock').textContent =
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const pct = Math.min(100, Math.max(0, (now - START) / (TARGET - START) * 100));
  document.getElementById('trackDone').style.width = pct + '%';
  document.getElementById('jet').style.left = pct + '%';
  document.getElementById('pct').textContent = pct.toFixed(1) + '%';

  const diff = Math.max(0, TARGET - now);
  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / 86400);
  showNumber('d', days, animate);
  showNumber('h', Math.floor(sec % 86400 / 3600), animate);
  showNumber('m', Math.floor(sec % 3600 / 60), animate);
  showNumber('s', sec % 60, animate);
  document.getElementById('stubDays').textContent = String(days).padStart(3, '0');

  const status = document.getElementById('status');
  if (diff === 0 && !landed) {
    landed = true;
    status.textContent = 'Landed';
    document.getElementById('headline').innerHTML = 'Welcome to<br>America.';
    document.getElementById('gate').textContent = 'USA';
  } else if (!landed) {
    status.textContent = days <= 1 ? 'Boarding' : days <= 30 ? 'Check-in' : 'On time';
    document.getElementById('gate').textContent = days <= 30 ? 'J1' : 'TBA';
  }
}

renderPostcards();
drawBarcode();
tick(false);
scramble(document.getElementById('dest'), 'UNITED STATES');
setInterval(tick, 1000);
