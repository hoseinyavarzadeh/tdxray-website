/* ============================================================
   TDXRay — main.js
   ============================================================ */

/* ── Heatmap Canvas — ember spread + token reveal ───────────── */
(function () {
  const canvas = document.getElementById('heatmap-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const CELL = 60;

  const TOKENS = [
    // --- Confidential Computing & Architecture ---
    // Kept the heavy hitters, added stronger action words like 'flush', 'evict', 'snoop'
    'TDX', 'TEE', 'CVM', 'VMM', 'L1D', 'LLC', 'GPA', 'HPA',
    'cache', 'trace', 'fault', 'probe', 'flush', 'evict', 'snoop',
    'hit', 'miss', 'trap', 'exit', 'sync', 'core', 'node', 

    // --- AI/LLM & Tokenizer (High-Level) ---
    // Dropped the weird syllables ('ing', 'tion') in favor of strong ML concepts
    'LLM', 'BPE', 'vocab', 'token', 'prompt', 'infer', 'llama', 
    'gemma', 'bert', 'layer', 'attn', 'mask', 'logit', 'embed', 
    'tensor', 'weight', 'bias', 'head', 'temp', 'ctx',

    // --- Data Exfil, Cryptography & "The Loot" ---
    // Swapped random numbers/dates for classic hex and clear PII targets
    'AES', 'RSA', 'key', 'hash', 'root', 'admin', 'flag', 'creds',
    'byte', 'hex', '0x4f', '0xFF', '0x00', 'addr', 'dump', 'leak',
    'SSN', 'CVC', 'auth', 'pass', 'mail', 'oracle', 'noise', 'lock', 
    'sniff', 'steal', 'pwn', 'zero', 'true', 'false'
  ];

  let cols, rows, cells, tokenMap;
  // Safe zone in cell coords — no spawns here (covers hero-inner content)
  let szL = 0, szR = 0, szT = 0, szB = 0;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    cols     = Math.ceil(canvas.width  / CELL) + 1;
    rows     = Math.ceil(canvas.height / CELL) + 1;
    cells    = new Float32Array(cols * rows);
    tokenMap = {};

    // Compute safe zone around the hero logo + half-cell breathing room.
    // We target the logo (not the full hero-inner) so narrow viewports still
    // have edge cells available to spawn in.
    const logo = document.querySelector('.hero-logo');
    const ref  = logo || document.querySelector('.hero-inner');
    if (ref) {
      const cr  = canvas.getBoundingClientRect();
      const lr  = ref.getBoundingClientRect();
      const pad = CELL * 0.5; // half-cell buffer — tight but non-intrusive
      szL = Math.floor((lr.left   - cr.left  - pad) / CELL);
      szR = Math.ceil ((lr.right  - cr.left  + pad) / CELL);
      szT = Math.floor((lr.top    - cr.top   - pad) / CELL);
      szB = Math.ceil ((lr.bottom - cr.top   + pad) / CELL);
    }
  }

  function idx(x, y) { return y * cols + x; }

  function ignite(cx, cy) {
    if (cx < 0 || cx >= cols || cy < 0 || cy >= rows) return;
    cells[idx(cx, cy)] = Math.min(1, cells[idx(cx, cy)] + 0.9 + Math.random() * 0.1);
  }

  function spawnCluster() {
    let cx, cy, tries = 0;
    do {
      cx = Math.floor(Math.random() * cols);
      cy = Math.floor(Math.random() * rows);
      tries++;
      // Keep trying until we land outside the hero-inner safe zone
    } while (tries < 60 && cx >= szL && cx <= szR && cy >= szT && cy <= szB);

    // If canvas is too narrow to find a clear spot, skip this spawn
    if (tries >= 60) return;

    const key = cx + ',' + cy;
    tokenMap[key] = TOKENS[Math.floor(Math.random() * TOKENS.length)];
    ignite(cx, cy);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const v = cells[idx(x, y)];
        if (v < 0.015) continue;

        // No vignette — safe-zone exclusion handles placement;
        // let every spawn flash at full intensity.
        const a = v;
        if (a < 0.01) continue;

        let r, g, b;
        if (v < 0.4) {
          const t = v / 0.4;
          r = 0; g = Math.round(t * 185); b = Math.round(90 + t * 130);
        } else if (v < 0.75) {
          const t = (v - 0.4) / 0.35;
          r = Math.round(t * 20); g = Math.round(185 + t * 55); b = Math.round(220 - t * 10);
        } else {
          const t = (v - 0.75) / 0.25;
          r = Math.round(20 + t * 215); g = Math.round(240 + t * 15); b = Math.round(210 + t * 45);
        }

        // Boost alpha for a brighter, more vivid flash
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, a * 2.4).toFixed(3)})`;
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);

        // Bright-peak glow: radial gradient instead of a visible filled rect
        if (v > 0.60) {
          const t = (v - 0.60) / 0.40;
          const grad = ctx.createRadialGradient(
            x * CELL + CELL / 2, y * CELL + CELL / 2, 0,
            x * CELL + CELL / 2, y * CELL + CELL / 2, CELL * 0.6
          );
          grad.addColorStop(0, `rgba(200,255,255,${(t * a * 0.95).toFixed(3)})`);
          grad.addColorStop(1, 'rgba(200,255,255,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        }

        const key = x + ',' + y;
        if (tokenMap[key] && v > 0.05) {
          const textAlpha = Math.min(1, (v - 0.05) / 0.15);
          const isLight = document.documentElement.getAttribute('data-theme') === 'light';
          ctx.save();
          ctx.font = '600 12px "DM Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          // Theme-aware text: light cyan on dark, dark teal on light
          if (isLight) {
            ctx.fillStyle = `rgba(0,30,45,${textAlpha.toFixed(3)})`;
            ctx.shadowColor = 'rgba(0,100,130,0.5)';
          } else {
            ctx.fillStyle = `rgba(210,255,255,${textAlpha.toFixed(3)})`;
            ctx.shadowColor = 'rgba(0,220,220,0.9)';
          }
          ctx.shadowBlur = 10;
          ctx.fillText(tokenMap[key], x * CELL + CELL / 2, y * CELL + CELL / 2);
          ctx.restore();
          if (v < 0.02) delete tokenMap[key];
        }
      }
    }
  }

  function loop() {
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] > 0) {
        cells[i] *= 0.986;
        if (cells[i] < 0.01) cells[i] = 0;
      }
    }
    draw();
    requestAnimationFrame(loop);
  }

  function scheduleNext() {
    setTimeout(() => { spawnCluster(); scheduleNext(); }, 600 + Math.random() * 1200);
  }

  resize();
  // Re-measure safe zone after layout settles (fonts/images may shift things)
  requestAnimationFrame(() => { resize(); for (let i = 0; i < 4; i++) spawnCluster(); });
  window.addEventListener('resize', resize);
  scheduleNext();
  loop();
})();

/* ── Cache table synced with scan ───────────────────────────── */
function animateCacheLines() {
  const cls = document.querySelectorAll('td.cl');
  if (!cls.length) return;
  cls.forEach(cl => cl.classList.remove('hit'));

  // fire hits at the halfway point so they land as the line sweeps through
  const count = 3 + Math.floor(Math.random() * 5);
  [...cls].sort(() => Math.random() - 0.5).slice(0, count)
    .forEach((cl, i) => setTimeout(() => cl.classList.add('hit'), 3000 + i * 20));
}
setInterval(animateCacheLines, 3000);
animateCacheLines();

/* ── Scroll reveal ──────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Bar chart animation on scroll ─────────────────────────── */
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.bar-fill').forEach((bar, i) => {
        setTimeout(() => bar.classList.add('animate'), i * 150);
      });
      barObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.accuracy-bar-group').forEach(el => barObserver.observe(el));

/* ── Cache-line animation ───────────────────────────────────── */
function animateCacheLines() {
  const cls = document.querySelectorAll('.cl');
  if (!cls.length) return;
  cls.forEach(cl => cl.classList.remove('hit'));
  const count = Math.floor(Math.random() * 4) + 2;
  const indices = [];
  while (indices.length < count) {
    const r = Math.floor(Math.random() * cls.length);
    if (!indices.includes(r)) indices.push(r);
  }
  indices.forEach((idx, i) => {
    setTimeout(() => cls[idx].classList.add('hit'), i * 180);
  });
}
setInterval(animateCacheLines, 2200);
animateCacheLines();

/* ── FAQ accordion ──────────────────────────────────────────── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ── Smooth active nav highlighting ────────────────────────── */
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === '#' + entry.target.id) {
          a.style.color = 'var(--teal)';
        }
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

/* ── Copy BibTeX ────────────────────────────────────────────── */
const copyBtn = document.getElementById('copy-bibtex');
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    const bib = document.getElementById('bibtex-content').textContent;
    navigator.clipboard.writeText(bib).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy BibTeX', 2500);
    });
  });
}

/* ── Terminal typewriter ────────────────────────────────────── */
function typewriterEffect() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const lines = el.querySelectorAll('.tw-line');
  let i = 0;
  function showNext() {
    if (i < lines.length) {
      lines[i].style.opacity = '1';
      i++;
      setTimeout(showNext, 400 + Math.random() * 300);
    }
  }
  const twObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setTimeout(showNext, 400);
      twObserver.disconnect();
    }
  }, { threshold: 0.5 });
  twObserver.observe(el);
}
typewriterEffect();

/* ── Number counter ─────────────────────────────────────────── */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const val = target * ease;
    el.textContent = (val % 1 === 0 ? Math.floor(val) : val.toFixed(1)) + suffix;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.number[data-target]').forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stats-row').forEach(el => counterObserver.observe(el));

/* ── Tokenization pipeline animation ───────────────────────── */
(function () {
  const viz       = document.getElementById('tok-viz');
  if (!viz) return;

  const DEFAULT_PROMPT = 'Is someone else reading this?';
  const GCOLS = 20, GROWS = 6;          // 120 visible tiles

  const PALETTE = [
    '#00d2d2','#00c4a8','#22bcd0','#00a8c8','#18d0b4',
    '#4db8d0','#00b4e0','#17c4a0','#36b8d8','#00ccc4',
    '#20d0a8','#50b8e0'
  ];

  // DOM refs
  const elInput      = document.getElementById('tvInput');
  const elRunBtn     = document.getElementById('tvRunBtn');
  const elWordCount  = document.getElementById('tvWordCount');
  const elArrow1     = document.getElementById('tvArrow1');
  const elArrow2     = document.getElementById('tvArrow2');
  const elRecover    = document.getElementById('tvRecover');
  const elRecText    = document.getElementById('tvRecoveredText');
  const elReplayBtn  = document.getElementById('tok-replay-btn');
  const elChipsStage = document.getElementById('tvChipsStage');
  const elChips      = document.getElementById('tvChips');
  const elGridWrap   = document.getElementById('tvGridWrap');
  const elGrid       = document.getElementById('tvGrid');
  const elSweep      = document.getElementById('tvSweep');

  const wait = ms => new Promise(r => setTimeout(r, ms));

  // ── BPE-style tokenizer (GPT-2 Ġ convention) ─────────────────
  function hashId(tok) {
    let h = 0x811c9dc5 >>> 0;
    for (let i = 0; i < tok.length; i++) {
      h ^= tok.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return (h % 28000) + 200;
  }

  function naiveTokenize(text) {
    const out = [];
    const re = /[a-zA-Z0-9]+(?:'[a-zA-Z]+)*|[^\w\s]/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const space = m.index > 0 && /\s/.test(text[m.index - 1]);
      const t = (space ? 'Ġ' : '') + m[0];
      out.push({ text: t, id: hashId(t) });
    }
    return out;
  }

  function getWords(s) { return s.trim().split(/\s+/).filter(Boolean); }
  function trimTo10(s) {
    const w = getWords(s);
    return w.length <= 10 ? s.trim() : w.slice(0, 10).join(' ');
  }

  // ── Word-count live update ────────────────────────────────────
  function updateWordCount() {
    const n = getWords(elInput.value).length;
    elWordCount.textContent = `${Math.min(n, 10)} / 10`;
    elWordCount.classList.toggle('warn', n > 10);
  }
  elInput.addEventListener('input', updateWordCount);

  // ── Build 120 DOM tiles once at init ─────────────────────────
  const TOTAL = GCOLS * GROWS;
  const cellEls = [];
  for (let i = 0; i < TOTAL; i++) {
    const c = document.createElement('div');
    c.className = 'tvg-cell';
    elGrid.appendChild(c);
    cellEls.push(c);
  }

  // Map vocab ID → tile index (no collisions)
  function buildCellMap(tokens) {
    const used = new Set();
    return tokens.map(({ text, id }) => {
      let idx = id % TOTAL;
      while (used.has(idx)) idx = (idx + 1) % TOTAL;
      used.add(idx);
      return { text, idx, col: idx % GCOLS };
    });
  }

  // ── Main animation ────────────────────────────────────────────
  let running = false;

  async function run(promptOverride) {
    if (running) return;
    running = true;

    const prompt = trimTo10(promptOverride !== undefined ? promptOverride : elInput.value);
    if (!prompt) { running = false; return; }
    const tokens = naiveTokenize(prompt);
    if (!tokens.length) { running = false; return; }

    // — reset —
    if (elReplayBtn) elReplayBtn.style.display = 'none';
    elInput.readOnly = true;
    elArrow1.classList.remove('show');
    elArrow2.classList.remove('show');
    elRecover.classList.remove('show');
    elRecText.textContent = '';
    elChips.innerHTML = '';
    elChipsStage.style.opacity = '1';
    cellEls.forEach(c => { c.className = 'tvg-cell'; c.textContent = ''; });
    elSweep.style.transition = 'none';
    elSweep.style.transform  = 'translateX(-4px)';
    elSweep.style.opacity    = '0';
    await wait(280);

    // — phase 1: BPE arrow —
    elArrow1.classList.add('show');
    await wait(400);

    // — phase 2: token chips appear one by one —
    const chipEls = [];
    for (let i = 0; i < tokens.length; i++) {
      const tc = PALETTE[i % PALETTE.length];
      const chip = document.createElement('div');
      chip.className = 'tok-chip';
      chip.style.cssText = `--tc:${tc}; opacity:0; transform:translateY(7px);
                            transition:opacity .2s,transform .2s`;
      chip.textContent = tokens[i].text;
      elChips.appendChild(chip);
      await wait(22);
      chip.style.opacity   = '1';
      chip.style.transform = 'translateY(0)';
      chipEls.push(chip);
      await wait(140);
    }
    await wait(320);

    // — phase 3: each chip pulses → its tile lights up cyan —
    const cellMap = buildCellMap(tokens);
    for (let i = 0; i < tokens.length; i++) {
      const chip = chipEls[i];
      const { idx } = cellMap[i];
      chip.classList.add('firing');           // chip pulses bright
      await wait(110);
      cellEls[idx].classList.add('cyan');     // exactly one tile glows
      chip.classList.remove('firing');
      await wait(240);
    }
    await wait(460);

    // — phase 4: chips stage fades out —
    // elChipsStage.style.opacity = '0';
    await wait(420);

    // — phase 5: attacker flush+reload sweep —
    const W = elGridWrap.offsetWidth || 340;
    const sweepMs = Math.max(1500, tokens.length * 240);

    elSweep.offsetHeight;                     // force reflow
    elSweep.style.transition = `transform ${sweepMs}ms linear`;
    elSweep.style.opacity    = '1';
    elSweep.style.transform  = `translateX(${W + 4}px)`;

    // as sweep crosses each column → tile flips red + word appears inside
    cellMap.forEach(({ idx, col, text }) => {
      const delay = (col / (GCOLS - 1)) * sweepMs * 0.88;
      setTimeout(() => {
        const cell = cellEls[idx];
        cell.textContent = text.replace(/^Ġ/, '');
        cell.classList.remove('cyan');
        cell.classList.add('red');
      }, delay);
    });

    await wait(sweepMs + 220);
    elSweep.style.transition = 'opacity 0.35s';
    elSweep.style.opacity    = '0';
    await wait(350);

    // — phase 6: reconstruction —
    elArrow2.classList.add('show');
    await wait(500);
    elRecover.classList.add('show');
    elRecText.textContent = prompt;
    await wait(2600);

    // — done —
    elInput.readOnly = false;
    running = false;
    // if (elReplayBtn) elReplayBtn.style.display = '';
  }

  // Keyboard / button triggers
  elInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); run(); }
  });
  if (elRunBtn) elRunBtn.addEventListener('click', () => run());

  if (elReplayBtn) {
    elReplayBtn.addEventListener('click', () => {
      elReplayBtn.style.display = 'none';
      run();
    });
  }

  // Auto-start on scroll: typewriter fills the input then animates
  let autoStarted = false;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !autoStarted) {
      autoStarted = true;
      obs.disconnect();
      (async () => {
        await wait(300);
        for (const ch of DEFAULT_PROMPT) {
          elInput.value += ch;
          updateWordCount();
          await wait(40);
        }
        await wait(380);
        run(DEFAULT_PROMPT);
      })();
    }
  }, { threshold: 0.35 });
  obs.observe(viz);
})();

/* ── Demo GIF controlled player ─────────────────────────────── */
(function () {
  const canvas     = document.getElementById('demo-canvas');
  const gifImg     = document.getElementById('demo-gif');
  const overlay    = document.getElementById('demo-overlay');
  const playBtn    = document.getElementById('demo-play-btn');
  const replayBtn  = document.getElementById('demo-replay-btn');
  if (!canvas || !gifImg || !overlay) return;

  const GIF_SRC        = 'assets/demo.gif';
  const GIF_DURATION_MS = 30000; // GIF is exactly 30 seconds

  let playing    = false;
  let stopTimer  = null;

  function stopGif() {
    playing = false;
    gifImg.style.display    = 'none';
    replayBtn.style.display = '';
  }

  function playGif() {
    if (playing) return;
    playing = true;

    // Reset state
    overlay.style.display   = 'none';
    replayBtn.style.display = 'none';
    canvas.style.display    = 'none';

    // Cache-bust so the GIF always restarts from frame 0
    gifImg.src = GIF_SRC + '?t=' + Date.now();
    gifImg.style.display = 'block';

    // After exactly 30 s, hide the GIF and show Replay
    clearTimeout(stopTimer);
    stopTimer = setTimeout(stopGif, GIF_DURATION_MS);
  }

  // Play on click of overlay / play button
  overlay.addEventListener('click', playGif);
  if (playBtn) playBtn.addEventListener('click', playGif);

  // Replay button restarts the GIF
  if (replayBtn) {
    replayBtn.style.display = 'none'; // hidden initially
    replayBtn.addEventListener('click', () => {
      playing = false;
      playGif();
    });
  }

  // Initial state: overlay visible, GIF and canvas hidden
  canvas.style.display = 'none';
  gifImg.style.display = 'none';
})();

/* ── Theme toggle ────────────────────────────────────────────── */
(function () {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const saved = localStorage.getItem('tdxray-theme');
  if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');

  btn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('tdxray-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('tdxray-theme', 'light');
    }
  });
})();