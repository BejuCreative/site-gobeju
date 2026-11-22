// Beju Creative offer sites v4: the hero becomes the story as you scroll.
// One long video -> Shorts -> every platform -> viewers -> DM gift -> emails -> booked or bought -> a new client.
// Each drawn element has a pose (x, y, scale, rotation, opacity) for each of the 8 scenes; scroll blends between them.
// Writes only transform and opacity. Reduced motion: no pinning, the finished picture is shown.
(() => {
  const story = document.querySelector('.story');
  const root = document.documentElement;
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const c01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // long-video waveform (same every visit)
  document.querySelectorAll('[data-wave]').forEach(w => {
    if (w.children.length) return;
    let x = 11, h = '';
    for (let i = 0, n = +w.dataset.wave; i < n; i++) { x = (x * 9301 + 49297) % 233280; h += `<i style="--a:${(.18 + .82 * (x / 233280) * (.35 + .65 * Math.abs(Math.sin(i * .37)))).toFixed(2)}"></i>`; }
    w.innerHTML = h;
  });

  // lines that draw as you read down (the map, the first-month timeline) and map steps that light up
  const lines = [...document.querySelectorAll('[data-draw]')];
  const steps = [...document.querySelectorAll('.cm-step,.az-step')];
  const drawLines = () => {
    const vh = innerHeight;
    lines.forEach(el => { const r = el.getBoundingClientRect(); el.style.setProperty('--e', calm ? 1 : c01((vh * .62 - r.top) / r.height).toFixed(3)); });
    steps.forEach(s => s.classList.toggle('lit', calm || s.getBoundingClientRect().top < vh * .62));
  };

  if (!story) { addEventListener('scroll', drawLines, { passive: true }); drawLines(); return; }

  const pin = story.querySelector('.story-pin'), box = story.querySelector('.st-box'), cv = story.querySelector('.st-cv');
  const copy = story.querySelector('.story-copy'), hint = story.querySelector('.story-hint'), end = story.querySelector('.story-end');
  const high = story.dataset.tier === 'high';
  const els = {};
  cv.querySelectorAll('[data-e]').forEach(e => (els[e.dataset.e] = e));

  // ---- poses. Each row: 8 scenes (0 = hero ... 7 = the whole chain). null = same as the scene before.
  // A pose is [x, y, scale, rotate, opacity] in the design space (desktop 1200x760, phone 390x780).
  const D = {}, M = {};
  const H = (x, y, s = 1, r = 0) => [x, y, s, r, 0];   // hidden at a place
  const S = (x, y, s = 1, r = 0, o = 1) => [x, y, s, r, o];

  // desktop: the chain at the end sits on y=470
  const DX = [120, 280, 440, 600, 760, 920, 1080], DY = 455;
  D.aura = [S(870, 420), S(600, 420), S(600, 420), S(600, 420), S(640, 500), S(620, 450), S(780, 450), S(600, 455)];
  D.ph = [S(870, 425, 1.25, -6), S(600, 440, 1.6), H(600, 640, .72), H(600, 700, .6), null, null, null, S(DX[0], DY, .25)];
  const shR = [-11, -4, 4, 11];
  ['sh1', 'sh2', 'sh3', 'sh4'].forEach((k, i) => {
    D[k] = [H(870, 425, .2), H(600 - 90 + i * 60, 440, .25),
      S(330 + i * 180, 420 - (i === 1 || i === 2 ? 16 : 0), i === 1 || i === 2 ? 1.06 : .96, shR[i]),
      S(300 + i * 200, 410, .92), S(300 + i * 200, 296, .5), H(300 + i * 200, 240, .42), null,
      S(DX[1] - 18 + i * 12, DY, .3, -9 + i * 6)];
  });
  ['pl1', 'pl2', 'pl3', 'pl4'].forEach((k, i) => {
    D[k] = [H(300 + i * 200, 580, .9), null, null, S(300 + i * 200, 580), S(300 + i * 200, 382, .9, 0, .85), H(300 + i * 200, 300, .8), null,
      S(DX[2] + (i % 2 ? 40 : -40), DY + (i < 2 ? -16 : 16), .55)];
  });
  const dotXY = [[372, 432], [430, 420], [512, 446], [560, 424], [618, 450], [676, 426], [720, 444], [790, 430], [842, 448], [470, 456], [650, 458], [560, 462]];
  dotXY.forEach(([x, y], i) => {
    const k = 'd' + i, sx = 300 + (i % 4) * 200;
    D[k] = [H(sx, 395, .5), null, null, H(sx, 380, .5), S(x, y), H(i % 2 ? 470 : 760, 520, .4), null, H(DX[3], DY, .3)];
  });
  D.cm = [H(470, 600, .9), null, null, null, S(440, 520), H(420, 520, .8), null, H(DX[3], DY, .3)];
  D.dm = [H(780, 620, .9), null, null, null, S(770, 560, .9), S(380, 455, .86, 0, .42), H(300, 455, .7), S(DX[3], DY, .3)];
  D.em = [H(800, 470, .9), null, null, null, null, S(770, 455, 1.06), S(300, 455, .82, 0, .35), S(DX[4], DY, .3)];
  D.bk = [H(620, 380, .9), null, null, null, null, null, S(600, 385), S(DX[5], DY - 18, .34)];
  D.by = [H(620, 525, .9), null, null, null, null, null, S(600, 525), S(DX[5], DY + 18, .34)];
  D.cl = [H(910, 455, .8), null, null, null, null, null, S(910, 455, 1.06), S(DX[6], DY, .4)];
  D.ln = [H(600, DY, 1), null, null, null, null, null, null, S(600, DY)];
  for (let i = 0; i < 7; i++) D['lb' + i] = [H(DX[i], DY + 112), null, null, null, null, null, null, S(DX[i], DY + 92)];
  for (let i = 1; i <= 7; i++) {
    const at = S(600, 160), off = H(600, 176), off2 = H(600, 142);
    D['c' + i] = Array.from({ length: 8 }, (_, k) => (k === i ? at : k < i ? off : off2));
  }
  D.c7 = [H(600, 220), null, null, null, null, null, null, S(600, 200)];

  // phone: the chain at the end runs down the left side
  const MY = [236, 300, 364, 428, 492, 556, 620], MX = 92;
  M.aura = [S(195, 690, .7), S(195, 420, .7), S(195, 430, .7), S(195, 420, .7), S(195, 520, .7), S(195, 500, .7), S(195, 470, .7), S(195, 460, .7)];
  M.ph = [S(195, 702, .8, -4), S(195, 420, .97), H(195, 690, .6), H(195, 720, .5), null, null, null, S(MX, MY[0], .2)];
  ['sh1', 'sh2', 'sh3', 'sh4'].forEach((k, i) => {
    M[k] = [H(195, 702, .2), H(150 + i * 30, 420, .2),
      S(66 + i * 86, 420 - (i === 1 || i === 2 ? 10 : 0), i === 1 || i === 2 ? .66 : .6, shR[i]),
      S(56 + i * 93, 400, .55), S(56 + i * 93, 252, .38), H(56 + i * 93, 214, .3), null,
      S(MX - 10 + i * 7, MY[1], .22, -9 + i * 6)];
  });
  ['pl1', 'pl2', 'pl3', 'pl4'].forEach((k, i) => {
    M[k] = [H(56 + i * 93, 520, .62), null, null, S(56 + i * 93, 510, .58), S(56 + i * 93, 324, .5, 0, .85), H(56 + i * 93, 300, .5), null,
      S(MX + (i % 2 ? 26 : -26), MY[2] + (i < 2 ? -10 : 10), .36)];
  });
  dotXY.forEach((_, i) => {
    const k = 'd' + i, sx = 56 + (i % 4) * 93;
    M[k] = [H(sx, 400, .4), null, null, H(sx, 400, .4), S(40 + (i * 29) % 310, 352 + (i * 17) % 34, .8), H(195, 560, .3), null, H(MX, MY[3], .3)];
  });
  M.cm = [H(195, 470, .8), null, null, null, S(195, 440, .9), H(195, 380, .7), null, H(MX, MY[3], .3)];
  M.dm = [H(195, 640, .8), null, null, null, S(195, 632, .8), S(195, 330, .62, 0, .3), H(195, 300, .5), S(MX, MY[3], .22)];
  M.em = [H(195, 560, .8), null, null, null, null, S(195, 540, .98), H(195, 400, .7), S(MX, MY[4], .22)];
  M.bk = [H(195, 300, .8), null, null, null, null, null, S(195, 292, .92), S(MX, MY[5] - 12, .24)];
  M.by = [H(195, 384, .8), null, null, null, null, null, S(195, 380, .92), S(MX, MY[5] + 12, .24)];
  M.cl = [H(195, 570, .8), null, null, null, null, null, S(195, 566, .95), S(MX, MY[6], .24)];
  M.ln = [H(MX, 428), null, null, null, null, null, null, S(MX, 428)];
  for (let i = 0; i < 7; i++) M['lb' + i] = [H(240, MY[i] + 10), null, null, null, null, null, null, S(240, MY[i])];
  for (let i = 1; i <= 7; i++) {
    const at = S(195, 142), off = H(195, 158), off2 = H(195, 122);
    M['c' + i] = Array.from({ length: 8 }, (_, k) => (k === i ? at : k < i ? off : off2));
  }
  M.c7 = [H(195, 140), null, null, null, null, null, null, S(195, 128)];

  // fill the gaps: leading nulls copy the first pose (hidden), later nulls copy the one before
  const fill = T => { for (const k in T) { const a = T[k]; const f = a.find(Boolean); for (let i = 0; i < 8; i++) a[i] = a[i] || (i ? a[i - 1] : [...f.slice(0, 4), 0]); } };
  fill(D); fill(M);
  // the line grows instead of fading: scale 0 -> 1 on the last scene
  D.ln[6] = [...D.ln[6]]; M.ln[6] = [...M.ln[6]];

  let T = D, mob = false, cur = {};
  const mode = () => {
    mob = innerWidth < 900;
    T = mob ? M : D;
    cv.classList.toggle('m', mob);
    const cw = mob ? 390 : 1200, ch = mob ? 780 : 760;
    const bw = box.clientWidth, bh = box.clientHeight;
    cv.style.setProperty('--fit', Math.min(bw / cw, bh / ch).toFixed(4));
    cur = {};
  };

  const put = (k, x, y, s, r, o, sx) => {
    const e = els[k]; if (!e) return;
    const tf = k === 'ln'
      ? `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) scale${mob ? 'Y' : 'X'}(${sx.toFixed(3)})`
      : `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(3)})`;
    const op = o.toFixed(3), c = cur[k];
    if (!c || c[0] !== tf) e.style.transform = tf;
    if (!c || c[1] !== op) { e.style.opacity = op; e.style.visibility = o < .005 ? 'hidden' : 'visible'; }
    cur[k] = [tf, op];
  };

  // p: 0..1 through the pinned story
  const render = p => {
    const n = 7, f = p * n, i = Math.min(n - 1, Math.floor(f)), u = f - i;
    const t = ease(c01((u - .16) / .68));
    const drift = Math.sin(f * Math.PI * 2);   // a little life, even while a scene holds
    for (const k in els) {
      const A = T[k] && T[k][i], B = T[k] && T[k][i + 1]; if (!A) continue;
      const L = (a, b) => a + (b - a) * t;
      let y = L(A[1], B[1]);
      if (!/^(c\d|ln|lb\d)$/.test(k)) y -= drift * 5;
      const s = L(A[2], B[2]);
      let sx = 1;
      if (k === 'ln') sx = i === n - 1 ? t : 0;
      let o = L(A[4], B[4]);
      if (/^c\d$/.test(k)) o = A[4] * (1 - c01(t / .42)) + B[4] * c01((t - .58) / .42);   // words: one out, then the next in
      put(k, L(A[0], B[0]), y, s, L(A[3], B[3]), o, sx);
    }
    cv.style.setProperty('--p', p.toFixed(4));
    // the hero's words step aside during the first move
    const h = c01(f / .7);
    copy.style.opacity = (1 - c01(h * 1.5)).toFixed(3);
    copy.style.transform = `translate3d(0,${(-70 * ease(h)).toFixed(1)}px,0)`;
    copy.style.visibility = h >= .67 ? 'hidden' : 'visible';
    if (hint) hint.style.opacity = (1 - c01(f * 4)).toFixed(3);
    const e = c01((f - 6.55) / .35);
    end.style.opacity = e.toFixed(3); end.style.transform = `translate3d(0,${(16 * (1 - e)).toFixed(1)}px,0)`;
    end.classList.toggle('on', e > .5);
  };

  if (calm) {
    story.classList.add('calm');
    const still = () => { mode(); render(1); copy.style.opacity = 1; copy.style.transform = 'none'; copy.style.visibility = 'visible'; end.style.opacity = 1; end.style.transform = 'none'; };
    addEventListener('resize', still); still(); drawLines();
    addEventListener('scroll', drawLines, { passive: true });
    return;
  }

  let raf = 0, last = -1;
  const frame = () => {
    raf = 0;
    const r = story.getBoundingClientRect(), span = Math.max(1, r.height - pin.offsetHeight);
    const p = c01(-r.top / span);
    if (p !== last) { last = p; render(p); }
    drawLines();
  };
  const req = () => { if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', () => { mode(); last = -1; req(); });
  mode(); frame();
  if (document.fonts) document.fonts.ready.then(() => { mode(); last = -1; req(); });

  // ?story=<0..1> jumps to that point of the story (for screenshots)
  const q = new URLSearchParams(location.search).get('story');
  if (q !== null) addEventListener('load', () => { const r = story.getBoundingClientRect(); scrollTo(0, scrollY + r.top + (+q) * (r.height - pin.offsetHeight)); });
})();

// Client wall: an endless row of client faces. Each client is added here only after they agree to be shown.
// Entry: { name: 'Brand or first name', img: '/assets/clients/file.jpg' }  (img: null = a monogram in brand colours)
// Empty list = the whole section stays hidden.
const CLIENT_WALL = [];
(() => {
  const sec = document.getElementById('clients');
  if (!sec || !CLIENT_WALL.length) return;
  const tr = sec.querySelector('.cw-tr'), cols = ['#2F7A5A', '#C9A13A', '#3A6A8A', '#8A5A3A', '#5A3A8A', '#7E9A36', '#8A3A4A'];
  const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ini = n => n.replace(/^(Dr\.?|The)\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const item = (c, k) => `<li class="cw-i">${c.img ? `<img src="${esc(c.img)}" alt="" width="44" height="44" decoding="async">` : `<span class="cw-mono" style="--c:${cols[k % cols.length]}" aria-hidden="true">${esc(ini(c.name))}</span>`}<span class="n">${esc(c.name)}</span></li>`;
  const set = CLIENT_WALL.map(item).join('');
  tr.innerHTML = `<ul class="cw-set" role="list">${set}</ul><ul class="cw-set" aria-hidden="true">${set}</ul>`;
  tr.style.setProperty('--dur', Math.max(30, CLIENT_WALL.length * 3.2) + 's');
  sec.hidden = false;
})();
