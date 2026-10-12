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

/* ---------- Waving flag inside the day count ---------- */

const daysCanvas = document.getElementById('days');
const dctx = daysCanvas.getContext('2d');
const flagCanvas = document.createElement('canvas');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NUMERAL_FONT = '"Big Shoulders Display", "Oswald", "Arial Narrow", sans-serif';

let label = '';
let geo = null;

function star(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.382 : r;
    const a = Math.PI / 5 * i - Math.PI / 2;
    ctx.lineTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a));
  }
  ctx.closePath();
  ctx.fill();
}

function paintFlag(w, h, pad) {
  flagCanvas.width = w;
  flagCanvas.height = h + pad * 2;
  const f = flagCanvas.getContext('2d');
  const stripe = h / 13;
  f.fillStyle = '#f7f4ec';
  f.fillRect(0, 0, w, h + pad * 2);
  f.fillStyle = '#d0102f';
  f.fillRect(0, 0, w, pad);
  for (let i = 0; i < 13; i += 2) f.fillRect(0, pad + i * stripe, w, stripe);
  f.fillRect(0, pad + h, w, pad);
  const cw = w * 0.4;
  const ch = stripe * 7;
  f.fillStyle = '#0d2f7a';
  f.fillRect(0, 0, cw, pad + ch);
  f.fillStyle = '#f7f4ec';
  const dx = cw / 12, dy = ch / 10;
  for (let row = 0; row < 9; row++) {
    const odd = row % 2 === 1;
    for (let col = 0; col < (odd ? 5 : 6); col++) {
      star(f, dx * (2 * col + (odd ? 2 : 1)), pad + dy * (row + 1), stripe * 0.32);
    }
  }
}

function layoutDays() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssW = daysCanvas.clientWidth;
  const maxCssH = Math.max(160, innerHeight * 0.56);
  dctx.font = `900 100px ${NUMERAL_FONT}`;
  const m = dctx.measureText(label);
  const left = m.actualBoundingBoxLeft || 0;
  const w100 = (m.actualBoundingBoxRight || m.width) + left;
  const asc = m.actualBoundingBoxAscent || 72;
  const desc = m.actualBoundingBoxDescent || 0;
  let fs = 100 * cssW / w100;
  if ((asc + desc) * fs / 100 > maxCssH) fs = 100 * maxCssH / (asc + desc);
  const cssH = Math.ceil((asc + desc) * fs / 100) + 2;
  daysCanvas.style.height = cssH + 'px';
  daysCanvas.width = Math.round(cssW * dpr);
  daysCanvas.height = Math.round(cssH * dpr);
  const s = fs / 100 * dpr;
  const textW = w100 * s;
  const W = daysCanvas.width, H = daysCanvas.height;
  geo = {
    W, H, dpr,
    font: `900 ${fs * dpr}px ${NUMERAL_FONT}`,
    x: (W - textW) / 2 + left * s,
    left: Math.floor((W - textW) / 2),
    textW: Math.ceil(textW),
    y: asc * s + dpr,
    amp: H * 0.035,
    strip: Math.max(2, Math.round(3 * dpr)),
  };
  paintFlag(geo.textW, H, Math.ceil(geo.amp * 1.4));
}

function drawDays(t) {
  if (!geo) return;
  const { W, H, amp, strip, left, textW } = geo;
  const pad = (flagCanvas.height - H) / 2;
  dctx.globalCompositeOperation = 'source-over';
  dctx.clearRect(0, 0, W, H);
  for (let x = 0; x < textW; x += strip) {
    const u = x / textW;
    const phase = u * Math.PI * 2.4 - t * 0.0021;
    const grow = 0.35 + 0.65 * u;
    const dy = Math.sin(phase) * amp * grow;
    dctx.drawImage(flagCanvas, x, 0, strip, flagCanvas.height, left + x, dy - pad, strip, flagCanvas.height);
    const shade = Math.cos(phase) * grow;
    dctx.fillStyle = shade > 0 ? `rgba(255,255,255,${shade * 0.12})` : `rgba(0,0,30,${-shade * 0.26})`;
    dctx.fillRect(left + x, 0, strip, H);
  }
  dctx.globalCompositeOperation = 'destination-in';
  dctx.fillStyle = '#000';
  dctx.font = geo.font;
  dctx.textBaseline = 'alphabetic';
  dctx.fillText(label, geo.x, geo.y);
  dctx.globalCompositeOperation = 'source-over';
}

let heroVisible = true;
new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(daysCanvas);

function loop(t) {
  if (heroVisible) drawDays(t);
  requestAnimationFrame(loop);
}

function setLabel(text) {
  if (text === label) return;
  label = text;
  daysCanvas.setAttribute('aria-label', text);
  layoutDays();
  if (reduceMotion) drawDays(0);
}

function plural(n, one, few, many) {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
  return many;
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

/* ---------- Ledger ---------- */

const DAY = 86400000;
const LEDGER = [
  { id: 'years', div: 365.2425 * DAY, dec: 4, forms: ['год', 'года', 'лет'], frac: 'года' },
  { id: 'months', div: 30.436875 * DAY, dec: 3, forms: ['месяц', 'месяца', 'месяцев'], frac: 'месяца' },
  { id: 'weeks', div: 7 * DAY, dec: 3, forms: ['неделя', 'недели', 'недель'], frac: 'недели' },
  { id: 'days', div: DAY, dec: 4, forms: ['день', 'дня', 'дней'], frac: 'дня' },
  { id: 'hours', div: 3600000, dec: 0, forms: ['час', 'часа', 'часов'] },
  { id: 'minutes', div: 60000, dec: 0, forms: ['минута', 'минуты', 'минут'] },
  { id: 'seconds', div: 1000, dec: 0, forms: ['секунда', 'секунды', 'секунд'] },
  { id: 'ms', div: 1, dec: 0, forms: ['миллисекунда', 'миллисекунды', 'миллисекунд'], hot: true },
  { id: 'beats', div: 60000 / 72, dec: 0, forms: ['удар сердца', 'удара сердца', 'ударов сердца'], note: 'если пульс 72 в минуту' },
  { id: 'weekends', count: weekendsLeft, forms: ['суббота дома', 'субботы дома', 'суббот дома'], note: 'последние выходные перед летом' },
];

function weekendsLeft(now) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  let n = 0;
  while (d < TARGET) {
    if (d.getDay() === 6) n++;
    d.setDate(d.getDate() + 1);
  }
  return n;
}

const formats = {};
const fmt = dec => formats[dec] || (formats[dec] = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: dec, maximumFractionDigits: dec }));

const ledgerRows = LEDGER.map(row => {
  const li = document.createElement('li');
  if (row.hot) li.className = 'hot';
  li.innerHTML = `<span class="n">0</span><span class="u"><span class="w"></span>${row.note ? `<small>${row.note}</small>` : ''}</span>`;
  document.getElementById('ledger').appendChild(li);
  return { row, n: li.querySelector('.n'), w: li.querySelector('.w'), last: '' };
});

let ledgerVisible = true;
let weekendCache = { at: 0, value: 0 };
new IntersectionObserver(([e]) => { ledgerVisible = e.isIntersecting; }).observe(document.getElementById('ledger'));

function updateLedger(force) {
  if (!ledgerVisible && !force) return;
  const now = new Date();
  const diff = Math.max(0, TARGET - now);
  for (const r of ledgerRows) {
    let value, text, word;
    if (r.row.count) {
      if (now - weekendCache.at > 60000) weekendCache = { at: +now, value: r.row.count(now) };
      value = weekendCache.value;
      text = fmt(0).format(value);
      word = plural(value, ...r.row.forms);
    } else {
      value = diff / r.row.div;
      if (r.row.dec) {
        text = fmt(r.row.dec).format(value);
        word = r.row.frac;
      } else {
        value = Math.floor(value);
        text = fmt(0).format(value);
        word = plural(value, ...r.row.forms);
      }
    }
    if (text !== r.last) {
      r.n.textContent = text;
      r.w.textContent = word;
      r.last = text;
    }
  }
}

function ledgerLoop() {
  updateLedger(false);
  if (reduceMotion) setTimeout(ledgerLoop, 1000);
  else requestAnimationFrame(ledgerLoop);
}

/* ---------- Tick ---------- */

const pad2 = n => String(n).padStart(2, '0');
let landed = false;

function tick() {
  const now = new Date();
  const pct = Math.min(100, Math.max(0, (now - START) / (TARGET - START) * 100));
  document.getElementById('trackDone').style.width = pct + '%';
  document.getElementById('jet').style.left = pct + '%';
  document.getElementById('pct').textContent = pct.toFixed(1) + '%';

  const diff = Math.max(0, TARGET - now);
  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / 86400);
  document.getElementById('h').textContent = pad2(Math.floor(sec % 86400 / 3600));
  document.getElementById('m').textContent = pad2(Math.floor(sec % 3600 / 60));
  document.getElementById('s').textContent = pad2(sec % 60);
  document.getElementById('stubDays').textContent = String(days).padStart(3, '0');

  if (diff === 0) {
    if (!landed) {
      landed = true;
      setLabel('USA');
      document.getElementById('caption').textContent = 'Добро пожаловать в Америку';
      document.querySelector('.clock').hidden = true;
      document.getElementById('gate').textContent = 'USA';
    }
    return;
  }
  setLabel(String(days));
  document.getElementById('daysWord').textContent = plural(days, 'день', 'дня', 'дней');
  document.getElementById('gate').textContent = days <= 30 ? 'J1' : 'TBA';
}

renderPostcards();
drawBarcode();
updateLedger(true);
ledgerLoop();
tick();
setInterval(tick, 1000);

let resizeTimer;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { layoutDays(); if (reduceMotion) drawDays(0); }, 120);
});

document.fonts.load(`900 100px ${NUMERAL_FONT}`).finally(() => {
  layoutDays();
  if (reduceMotion) drawDays(0);
  else requestAnimationFrame(loop);
});
