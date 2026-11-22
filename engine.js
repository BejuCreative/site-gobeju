// Beju Creative (gobeju.com): the engine scroll story, the hero phones and the timeline. Loads after /base.js and /pages.js.
// Scroll position becomes CSS variables (--lp, --gp, --tp, --mx, --my, --hs); /engine.css does all the drawing with transform and opacity.
// Debug hook: ?demo=0..1 jumps the engine to that progress (0 = stage 1 starts, 1 = stage 7 ends) and turns entrance transitions off.
(() => {
  const root = document.documentElement;
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const qs = new URLSearchParams(location.search);
  const demo = qs.has('demo') ? Math.min(1, Math.max(0, parseFloat(qs.get('demo')) || 0)) : null;
  if (demo !== null) root.classList.add('demo');
  const c01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  // write a CSS variable only when it changes, so idle frames cost nothing
  const memo = new WeakMap();
  const put = (el, k, v) => { let m = memo.get(el); if (!m) memo.set(el, (m = {})); if (m[k] !== v) { m[k] = v; el.style.setProperty(k, v); } };

  // phones run their small loops only while on screen
  const run = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('run', e.isIntersecting)), { rootMargin: '15% 0px' });
  const seen = (el, cb) => new IntersectionObserver(es => cb(es[0].isIntersecting), { rootMargin: '20% 0px' }).observe(el);

  const steps = $$('.es');
  const small = steps.map(s => s.querySelector('.es-dev .phone'));
  const smallScr = steps.map(s => s.querySelector('.es-dev .scr'));

  // ---- hero: three phones, cloned from the engine's own screens
  const heroBox = document.querySelector('.hero2-ph');
  const heroScr = $$('.hero2 [data-clone]').map(ph => {
    const c = smallScr[+ph.dataset.clone - 1].cloneNode(true);
    ph.querySelector('.scrw').append(c); run.observe(ph); return c;
  });
  const heroStart = performance.now() + 900;
  let heroLp = calm || demo !== null ? 1 : 0, heroSeen = true;
  heroScr.forEach(s => put(s, '--lp', String(heroLp)));
  if (heroBox) seen(heroBox, v => (heroSeen = v));

  // ---- engine: one sticky phone on wide screens, one phone per stage on small ones
  const list = document.querySelector('.eng-steps'), stage = document.querySelector('.eng-stage');
  const host = stage.querySelector('.scrw'), tilt = stage.querySelector('.tilt');
  const chips = $$('.chg', stage), nums = $$('.eng-big span', stage), pipe = $$('.pipe button', stage);
  small.forEach(p => run.observe(p)); run.observe(stage.querySelector('.phone'));
  const big = [];
  const wide = matchMedia('(min-width:980px)');
  let sticky = false, cur = -1, lpS = 0, engineSeen = true, first = true;
  const mode = () => {
    sticky = wide.matches && !calm;
    if (sticky && !big.length) smallScr.forEach(s => { const c = s.cloneNode(true); c.style.removeProperty('--lp'); host.append(c); big.push(c); });
    root.classList.toggle('eng-on', sticky); cur = -1; first = true;
  };
  mode(); wide.addEventListener('change', mode);
  seen(document.getElementById('engine'), v => (engineSeen = v));

  const setStep = k => {
    cur = k;
    big.forEach((s, i) => { s.classList.toggle('on', i === k); s.classList.toggle('past', i < k); });
    steps.forEach((s, i) => { s.classList.toggle('on', i === k); s.classList.toggle('done', i < k); });
    chips.forEach((c, i) => c.classList.toggle('on', i === k));
    nums.forEach((n, i) => n.classList.toggle('on', i === k));
    pipe.forEach((b, i) => { b.classList.toggle('on', i === k); b.classList.toggle('done', i < k); b.setAttribute('aria-current', i === k ? 'step' : 'false'); });
  };
  // stage k is "live" from when its top reaches mid-screen; t runs 0..1 until its bottom does
  const where = vh => {
    let k = 0, t = 0;
    for (let i = 0; i < steps.length; i++) { const r = steps[i].getBoundingClientRect(), ti = (vh * .5 - r.top) / r.height; if (ti >= 0) { k = i; t = ti; } }
    return [k, c01(t)];
  };
  const lpOf = t => c01((t - .02) / .55);   // the screen finishes building just past the middle of its stage, then holds
  pipe.forEach((b, i) => b.addEventListener('click', () => {
    const r = steps[i].getBoundingClientRect();
    scrollTo({ top: scrollY + r.top + r.height * .45 - innerHeight * .5, behavior: calm ? 'auto' : 'smooth' });
  }));

  let px = 0, py = 0, sx = 0, sy = 0;
  if (fine && !calm) addEventListener('pointermove', e => { px = e.clientX / innerWidth - .5; py = e.clientY / innerHeight - .5; }, { passive: true });

  const engine = vh => {
    const [k, t] = where(vh);
    if (sticky) {
      if (k !== cur) { setStep(k); lpS = lpOf(t); }
      lpS += (lpOf(t) - lpS) * (demo !== null ? 1 : .2);
      put(big[k], '--lp', lpS.toFixed(3));
      put(list, '--gp', ((k + t) / steps.length).toFixed(4));
      put(tilt, '--rx', (sx * 12).toFixed(2)); put(tilt, '--ry', (sy * -8).toFixed(2));
    } else {
      if (k !== cur) { cur = k; steps.forEach((s, i) => { s.classList.toggle('on', i === k); s.classList.toggle('done', i < k); }); }
      small.forEach((p, i) => {
        if (!first && !p.classList.contains('run')) return;
        const r = p.getBoundingClientRect();
        put(smallScr[i], '--lp', calm ? '1' : c01((vh * .66 - r.top) / (vh * .52)).toFixed(3));
      });
      const r = list.getBoundingClientRect();
      put(list, '--gp', c01((vh * .5 - r.top) / r.height).toFixed(4));
    }
  };

  const hero = vh => {
    if (heroLp < 1) { heroLp = c01((performance.now() - heroStart) / 2600); heroScr.forEach(s => put(s, '--lp', heroLp.toFixed(3))); }
    if (!heroBox || calm) return;
    put(heroBox, '--mx', sx.toFixed(3)); put(heroBox, '--my', sy.toFixed(3));
    put(heroBox, '--hs', c01(scrollY / vh).toFixed(3));
  };

  // ---- "how we work": the line fills as you read down
  const tline = document.querySelector('.tline');
  let lineSeen = false;
  if (tline) seen(tline, v => (lineSeen = v));
  const line = vh => { const r = tline.getBoundingClientRect(); put(tline, '--tp', calm ? '1' : c01((vh * .62 - r.top) / r.height).toFixed(4)); };

  const tick = () => {
    const vh = innerHeight;
    sx += (px - sx) * .06; sy += (py - sy) * .06;
    if (engineSeen || first) engine(vh);
    if (heroSeen || first) hero(vh);
    if (tline && (lineSeen || first)) line(vh);
    first = false;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // ---- debug hook for screenshots
  if (demo !== null) {
    const report = () => {
      root.dataset.sw = String(root.scrollWidth);
      root.dataset.over = $$('body *').filter(el => {
        if (el.closest('.band,.hero2-ph,.phone,.defs,.loop,.eng-stage,#tl')) return false;
        const b = el.getBoundingClientRect(); return b.width > 0 && b.right > innerWidth + 1;
      }).slice(0, 8).map(el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '')).join(' ');
    };
    const jump = () => {
      const vh = innerHeight, n = steps.length, k = Math.min(n - 1, Math.floor(demo * n)), t = Math.min(.999, demo * n - k);
      let y;
      if (sticky) { const r = steps[k].getBoundingClientRect(); y = scrollY + r.top - vh * .5 + t * r.height; }
      else { const r = small[k].getBoundingClientRect(); y = scrollY + r.top - (vh * .66 - lpOf(t) * vh * .52); }
      scrollTo(0, Math.max(0, Math.round(y))); first = true;
      requestAnimationFrame(() => requestAnimationFrame(report));
    };
    const ready = document.fonts ? document.fonts.ready : Promise.resolve();
    ready.then(() => requestAnimationFrame(location.hash ? report : jump));
  }
})();
