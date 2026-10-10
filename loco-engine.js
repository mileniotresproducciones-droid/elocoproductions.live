/* ============================================================
   LOCO ENGINE — LocoProductions Interactive Core
   ES6+ vanilla | countdown | audio synth | filters | tickets
   ============================================================ */
'use strict';

const LOCO = (() => {

  /* ---------- UTIL ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const pad = n => String(n).padStart(2, '0');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- CONFIG ---------- */
  const NEXT_DROP = (() => {
    const base = new Date('2026-11-14T22:00:00');
    const now = Date.now();
    let target = base.getTime();
    while (target <= now) target += 7 * 24 * 60 * 60 * 1000;
    return target;
  })();

  const TIERS = {
    early: { name: 'EARLY BIRD', price: 290, soldout: true },
    tier1: { name: 'TIER 1 GENERAL', price: 450, soldout: false },
    vip:   { name: 'VIP / BACKSTAGE', price: 950, soldout: false },
    after: { name: 'AFTER-HOURS PASS', price: 300, soldout: false }
  };

  // Pasarela de pago — 'demo' valida y simula; para cobro real cambia a 'live'
  // (endpoint: POST /api/pago -> { checkoutUrl } del backend server/server.js).
  const PAY = { modo: 'demo', endpoint: '/api/pago' };
  const RATE_GTQ_PER_USD = 7.75; // referencia USD -> GTQ

  const ARTISTS = [
    { id: 'a1', name: 'VOLTAGE_KR',   genre: 'cyber-goth',  genreLabel: 'CYBER-GOTH/EBM',   stage: 'MAINFRAME', set: '23:00', root: 110, freq: '40–110 Hz'  },
    { id: 'a2', name: 'NEURON',       genre: 'psytrance',   genreLabel: 'PSYTRANCE/FOREST', stage: 'CORTEX',    set: '01:00', root: 146, freq: '43–146 Hz' },
    { id: 'a3', name: 'HELLGRID',     genre: 'hard-techno', genreLabel: 'HARD TECHNO/IND',  stage: 'MAINFRAME', set: '02:00', root: 98,  freq: '49–196 Hz' },
    { id: 'a4', name: 'MASCHINE',     genre: 'hard-techno', genreLabel: 'HARD TECHNO/IND',  stage: 'REACTOR',   set: '00:00', root: 82,  freq: '41–165 Hz' },
    { id: 'a5', name: 'AETHER WAVE',  genre: 'post-trance', genreLabel: 'POST-TRANCE/RAVE', stage: 'SUNSET',    set: '04:00', root: 130, freq: '65–260 Hz' },
    { id: 'a6', name: 'DEAD CIRCUIT', genre: 'cyber-goth',  genreLabel: 'CYBER-GOTH/EBM',   stage: 'REACTOR',   set: '03:00', root: 73,  freq: '36–147 Hz' },
    { id: 'a7', name: 'PSYCHOGLIDE',  genre: 'psytrance',   genreLabel: 'PSYTRANCE/FOREST', stage: 'CORTEX',    set: '03:30', root: 164, freq: '41–164 Hz' },
    { id: 'a8', name: 'RHYTHM_Ø',     genre: 'cyber-goth',  genreLabel: 'CYBER-GOTH/EBM',   stage: 'REACTOR',   set: '01:30', root: 123, freq: '61–247 Hz' },
    { id: 'a9', name: 'NULL POINTER', genre: 'hard-techno', genreLabel: 'HARD TECHNO/IND',  stage: 'MAINFRAME', set: '04:30', root: 87,  freq: '43–175 Hz' },
    { id: 'a10', name: 'LUCID DRIFT', genre: 'post-trance', genreLabel: 'POST-TRANCE/RAVE', stage: 'SUNSET',    set: '05:00', root: 139, freq: '69–278 Hz' }
  ];

  /* ============================================================
     1. COUNTDOWN (ticker + estados)
     ============================================================ */
  const countdown = (() => {
    const tickerEls = $$('[id="tickerCountdown"], .ticker-timer');
    let lastTickSec = -1;

    function render() {
      const diff = Math.max(0, NEXT_DROP - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const str = `${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`;

      tickerEls.forEach(el => { el.textContent = str; });

      if (s !== lastTickSec && !prefersReducedMotion) {
        tickerEls.forEach(el => {
          el.classList.remove('animate-countdown-tick');
          void el.offsetWidth;
          el.classList.add('animate-countdown-tick');
        });
      }
      lastTickSec = s;
    }

    render();
    const iv = setInterval(render, 1000);
    return { stop: () => clearInterval(iv) };
  })();

  /* ============================================================
     2. HEADER + NAV MÓVIL + SCROLL SPY
     ============================================================ */
  const header = (() => {
    const headerEl = $('#siteHeader');
    const toggle = $('#navToggle');
    const nav = $('#mainNav');

    toggle?.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });

    nav?.addEventListener('click', e => {
      if (e.target.matches('.nav-link')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav?.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        toggle.focus();
      }
    });

    // scroll state
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        headerEl?.classList.toggle('is-scrolled', window.scrollY > 40);
        ticking = false;
      });
    }, { passive: true });

    // scroll spy + modo dual (vertiente 01 eventos / vertiente 02 alquiler)
    const modeBtns = $$('.mode-btn');
    const setMode = m => modeBtns.forEach(b => b.classList.toggle('is-active', b.dataset.mode === m));
    modeBtns.forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));

    const links = $$('.nav-link');
    const sections = links
      .map(l => $(l.getAttribute('href')))
      .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
      const spy = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          const id = en.target.id;
          links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${id}`));
          setMode(id === 'alquiler' || id === 'cotizador' ? 'alquiler' : 'eventos');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(s => spy.observe(s));
    }

    return {};
  })();

  /* ============================================================
     3. AUDIO ENGINE — LocoAudioEngine (Web Audio API, sintetizado)
     Kick: sine 150 -> 40 Hz en 0.08s, amp decay 0.32s
     Bass: sawtooth + lowpass Q=7.5 modulado por envolvente
     Hat: ruido blanco + highpass 7000 Hz
     Secuenciador: 142 BPM, 16 pasos sobre ctx.currentTime
     AnalyserNode fftSize=64 -> <canvas id="waveform">
     ============================================================ */
  class LocoAudioEngine {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.analyser = null;
      this.noiseBuffer = null;
      this.isPlaying = false;
      this.bpm = 142; // Estandar Rave / Hard Techno
      this.currentStep = 0;
      this.timerId = null;
      this.nextTime = 0;
      this.root = 55;
    }

    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5;
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;
        this.master.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
        this.noiseBuffer = this._noise();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    }

    _noise() {
      const len = 0.05;
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      return buf;
    }

    kick(t, f0 = 150) {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(Math.max(45, f0), t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.08);
      g.gain.setValueAtTime(1.0, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 0.35);
    }

    bass(t, root = this.root, dur = 0.22) {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator();
      const f = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(root, t);
      f.type = 'lowpass';
      f.Q.setValueAtTime(7.5, t); // acento resonante ciberpunk
      f.frequency.setValueAtTime(Math.max(60, root * 1.5), t);
      f.frequency.exponentialRampToValueAtTime(Math.max(300, root * 12), t + 0.04);
      f.frequency.exponentialRampToValueAtTime(Math.max(80, root * 2), t + dur);
      g.gain.setValueAtTime(0.75, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(f).connect(g).connect(this.master);
      o.start(t);
      o.stop(t + dur + 0.05);
    }

    hat(t, gain = 0.35) {
      if (!this.ctx) return;
      const src = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      src.buffer = this.noiseBuffer;
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, t);
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      src.connect(filter).connect(g).connect(this.master);
      src.start(t);
      src.stop(t + 0.07);
    }

    stab(t, freq) {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.07, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 0.24);
    }

    setVolume(v) { if (this.master) this.master.gain.value = v; }

    startRadioLoop(root = 55) {
      if (!this.ensure()) return;
      this.root = root;
      if (this.isPlaying) return;
      this.isPlaying = true;
      this.currentStep = 0;
      const stepTime = (60 / this.bpm) / 4; // semicorcheas (16 pasos)
      this.nextTime = this.ctx.currentTime + 0.06;

      const tick = () => {
        if (!this.isPlaying) return;
        const now = this.ctx.currentTime;
        while (this.nextTime < now + 0.12) {
          const s = this.currentStep;
          const t = this.nextTime;
          // patron 16 pasos: kick 0/4/8/12 — hat contratiempo 2/6/10/14 — rolling bass en impares
          if (s % 4 === 0) this.kick(t);
          if (s % 4 === 2) this.hat(t, 0.35);
          if (s % 2 === 1) this.bass(t, this.root, stepTime * 1.5);
          this.currentStep = (s + 1) % 16;
          this.nextTime += stepTime;
        }
        this.timerId = setTimeout(tick, 25);
      };
      tick();
    }

    stop() {
      this.isPlaying = false;
      if (this.timerId) clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  const AudioEngine = new LocoAudioEngine();

  /* ============================================================
     4. HERO RADIO PLAYER (loop sintetizado 142 BPM + waveform canvas)
     ============================================================ */
  const radio = (() => {
    const player = $('#radioPlayer');
    const btn = $('#radioPlay');
    const wave = $('#waveform');
    const fill = $('#radioFill');
    const rail = $('#radioRail');
    const timeEl = $('#radioTime');
    const stateEl = $('#radioState');
    if (!player || !btn || !wave) return {};

    const DURATION = 45;
    const BAR_COUNT = 32; // AnalyserNode fftSize=64 -> 32 bins
    let playing = false;
    let pos = 0;
    let raf = null;
    let drawRaf = null;
    let lastFrame = 0;

    // waveform: canvas sintetizado en tiempo real (sin archivos externos)
    const wctx = wave.getContext ? wave.getContext('2d') : null;
    let wW = 0, wH = 0, wDpr = 1;
    let freqData = null;
    const idleBars = [];
    let seed = 1337;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < BAR_COUNT; i++) idleBars.push(0.1 + rnd() * 0.5);

    function sizeWave() {
      if (!wctx) return;
      wDpr = Math.min(window.devicePixelRatio || 1, 2);
      wW = wave.clientWidth || 320;
      wH = wave.clientHeight || 56;
      wave.width = Math.max(1, Math.floor(wW * wDpr));
      wave.height = Math.max(1, Math.floor(wH * wDpr));
      wctx.setTransform(wDpr, 0, 0, wDpr, 0, 0);
      drawWave(null);
    }

    function drawWave(data) {
      if (!wctx) return;
      const gap = 2;
      const bw = Math.max(2, (wW - gap * (BAR_COUNT - 1)) / BAR_COUNT);
      wctx.clearRect(0, 0, wW, wH);
      for (let i = 0; i < BAR_COUNT; i++) {
        const v = data ? (data[i] || 0) / 255 : idleBars[i] * 0.55;
        const h = Math.max(2, v * (wH - 4));
        if (data) {
          wctx.fillStyle = v > 0.72 ? '#FFFFFF' : '#39FF14'; // --acid-green #39FF14
        } else {
          wctx.fillStyle = 'rgba(42, 42, 50, 0.95)'; // --color-border-bright
        }
        wctx.fillRect(i * (bw + gap), wW ? wH - h : 0, bw, h);
      }
    }

    function drawLoop() {
      if (!playing) return;
      const an = AudioEngine.analyser;
      if (an) {
        if (!freqData || freqData.length !== an.frequencyBinCount) freqData = new Uint8Array(an.frequencyBinCount);
        an.getByteFrequencyData(freqData);
        drawWave(freqData);
      }
      drawRaf = requestAnimationFrame(drawLoop);
    }

    function litUpdate() {
      const ratio = pos / DURATION;
      fill.style.width = `${ratio * 100}%`;
      rail.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
      timeEl.textContent = `00:${pad(Math.floor(pos))}`;
    }

    function frame(ts) {
      if (!playing) return;
      if (!lastFrame) lastFrame = ts;
      const dt = (ts - lastFrame) / 1000;
      lastFrame = ts;
      pos += dt;
      if (pos >= DURATION) pos = 0;
      litUpdate();
      raf = requestAnimationFrame(frame);
    }

    function play() {
      if (!AudioEngine.ensure()) {
        stateEl.textContent = '● AUDIO NO SOPORTADO';
        stateEl.classList.remove('accent-green');
        return;
      }
      playing = true;
      btn.classList.add('is-playing');
      player.classList.add('is-playing');
      btn.setAttribute('aria-label', 'Pausar teaser sonoro');
      stateEl.textContent = '● LIVE — 142 BPM';
      lastFrame = 0;
      AudioEngine.startRadioLoop(55);
      raf = requestAnimationFrame(frame);
      drawLoop();
    }

    function pause() {
      playing = false;
      btn.classList.remove('is-playing');
      player.classList.remove('is-playing');
      btn.setAttribute('aria-label', 'Reproducir teaser sonoro');
      stateEl.textContent = '● PAUSED';
      cancelAnimationFrame(raf);
      cancelAnimationFrame(drawRaf);
      AudioEngine.stop();
      drawWave(null);
    }

    btn.addEventListener('click', () => (playing ? pause() : play()));

    const seek = e => {
      const r = rail.getBoundingClientRect();
      const x = ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width;
      pos = Math.min(DURATION, Math.max(0, x * DURATION));
      litUpdate();
    };
    rail.addEventListener('click', seek);
    rail.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { pos = Math.min(DURATION, pos + 3); litUpdate(); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { pos = Math.max(0, pos - 3); litUpdate(); e.preventDefault(); }
      if (e.key === ' ' || e.key === 'Enter') { playing ? pause() : play(); e.preventDefault(); }
    });

    sizeWave();
    let waveTm;
    window.addEventListener('resize', () => {
      clearTimeout(waveTm);
      waveTm = setTimeout(sizeWave, 150);
    }, { passive: true });
    litUpdate();
    return { pause };
  })();

  /* ============================================================
     5. LINEUP — render + filtros + preview de audio por artista
     ============================================================ */
  const lineup = (() => {
    const grid = $('#lineupGrid');
    const empty = $('#lineupEmpty');
    const filters = $$('.filter-btn');
    if (!grid) return {};

    grid.innerHTML = ARTISTS.map(a => `
      <article class="artist-card" data-genre="${a.genre}" tabindex="0" aria-label="${a.name} — ${a.genreLabel}">
        <div class="artist-visual">
          <span class="badge ${genreBadge(a.genre)} artist-genre-tag">${a.genreLabel}</span>
          <span class="artist-mono" aria-hidden="true">${a.name.replace(/ /g, '_')}</span>
          <div class="artist-reveal">
            <span class="reveal-label">SET TIME</span>
            <span class="reveal-set">${a.set}</span>
            <span class="reveal-stage">// ESCENARIO: ${a.stage}</span>
            <span class="reveal-freq">// FREQ: ${a.freq}</span>
            <button class="artist-audio-btn" data-audio="${a.id}" data-root="${a.root}" aria-label="Reproducir clip de ${a.name}">[ ▶ CLIP AUDIO ]</button>
          </div>
        </div>
        <div class="artist-body">
          <h3 class="artist-name">${a.name}</h3>
          <p class="artist-meta">${a.genreLabel} — ${a.stage} STAGE — ${a.set} HRS</p>
        </div>
      </article>
    `).join('');

    function genreBadge(g) {
      return { 'hard-techno': 'badge-quaternary', psytrance: 'badge-secondary', 'cyber-goth': 'badge-tertiary', 'post-trance': 'badge-primary' }[g] || 'badge-primary';
    }

    // Ajuste de monograma: encoge la fuente hasta que quepa en la tarjeta
    function fitMono() {
      $$('.artist-mono', grid).forEach(el => {
        el.style.fontSize = '';
        let size = parseFloat(getComputedStyle(el).fontSize);
        let guard = 0;
        while (el.scrollWidth > el.clientWidth && size > 11 && guard < 60) {
          size -= 1;
          el.style.fontSize = `${size}px`;
          guard++;
        }
      });
    }
    fitMono();
    if (document.fonts?.ready) document.fonts.ready.then(fitMono);
    let fitTm;
    window.addEventListener('resize', () => {
      clearTimeout(fitTm);
      fitTm = setTimeout(fitMono, 150);
    });

    // filtros
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        filters.forEach(b => {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-selected', String(b === btn));
        });
        let visible = 0;
        $$('.artist-card', grid).forEach(card => {
          const show = f === 'all' || card.dataset.genre === f;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible++;
            if (!prefersReducedMotion) {
              card.style.animation = 'none';
              void card.offsetWidth;
              card.style.animation = '';
            }
          }
        });
        if (empty) empty.hidden = visible > 0;
      });
    });

    // preview de audio (patrón corto por artista)
    let stopClip = null;
    grid.addEventListener('click', e => {
      const b = e.target.closest('.artist-audio-btn');
      if (!b) return;
      e.stopPropagation();

      if (stopClip) { stopClip(); stopClip = null; }
      $$('.artist-audio-btn', grid).forEach(x => { x.classList.remove('is-playing'); x.textContent = '[ ▶ CLIP AUDIO ]'; });

      if (!AudioEngine.ensure()) return;
      const root = Number(b.dataset.root);
      let s = 0;
      const iv = setInterval(() => {
        const ctx = AudioEngine.ctx;
        const t = ctx.currentTime + 0.02;
        if (s % 4 === 0) AudioEngine.kick(t, root / 2);
        if (s % 2 === 1) AudioEngine.hat(t, 0.16);
        if (s % 8 === 0) AudioEngine.bass(t, root / 4, 0.3);
        if (s % 4 === 2) AudioEngine.stab(t, root);
        s++;
      }, (60 / 128) * 4 * 1000 / 2);

      b.classList.add('is-playing');
      b.textContent = '[ ■ PARAR ]';

      const kill = () => {
        clearInterval(iv);
        b.classList.remove('is-playing');
        b.textContent = '[ ▶ CLIP AUDIO ]';
        stopClip = null;
      };
      stopClip = kill;

      setTimeout(() => { if (stopClip === kill) kill(); }, 8000);
    });

    // teclado: Enter en card abre reveal accesible
    grid.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.classList.contains('artist-card')) {
        const btn = $('.artist-audio-btn', e.target);
        btn?.focus();
      }
    });

    return {};
  })();

  /* ============================================================
     6. TICKETS — selector de tier + cantidad + checkout
     ============================================================ */
  const tickets = (() => {
    let selected = null;
    let qty = 1;

    const tierName = $('#coTierName');
    const unit = $('#coUnit');
    const total = $('#coTotal');
    const buy = $('#coBuy');
    const note = $('#coNote');
    const qtyOut = $('#qtyValue');
    const minus = $('#qtyMinus');
    const plus = $('#qtyPlus');

    function format(n) { return n.toLocaleString('es-GT'); }
    function q(n) { return 'Q' + format(n); }
    function usd(n) { return '$' + Math.round(n / RATE_GTQ_PER_USD) + ' USD'; }
    function totalUsd() { const el = $('#coTotalUsd'); return el; }

    function update() {
      qtyOut.textContent = String(qty);
      const usdEl = totalUsd();
      if (!selected) {
        tierName.textContent = 'SIN TIER SELECCIONADO';
        unit.textContent = '—';
        total.textContent = 'Q0';
        if (usdEl) usdEl.textContent = '≈ $0 USD';
        buy.disabled = true;
        note.textContent = '// SELECCIONA UN TIER PARA CONTINUAR';
        document.dispatchEvent(new CustomEvent('loco:tier-change'));
        return;
      }
      const t = TIERS[selected];
      tierName.textContent = t.name;
      unit.textContent = q(t.price);
      total.textContent = q(t.price * qty);
      if (usdEl) usdEl.textContent = '≈ ' + usd(t.price * qty);
      buy.disabled = false;
      note.textContent = `// COORDINADAS SE ENVIARÁN 24H ANTES · ${qty} BOLETO${qty > 1 ? 'S' : ''} · PAGOS EN GTQ`;
      document.dispatchEvent(new CustomEvent('loco:tier-change'));
    }

    $$('.tier-select').forEach(btn => {
      btn.addEventListener('click', () => {
        selected = btn.dataset.tier;
        $$('.tier-card').forEach(c => c.classList.toggle('is-selected', c.dataset.tier === selected));
        update();
        document.getElementById('checkout')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
      });
    });

    minus?.addEventListener('click', () => { qty = Math.max(1, qty - 1); update(); });
    plus?.addEventListener('click', () => { qty = Math.min(10, qty + 1); update(); });

    buy?.addEventListener('click', () => {
      if (!selected) return;
      const sec = $('#pagoSeguro');
      if (sec) {
      sec.hidden = false;
      sec.classList.add('is-open');
      document.body.style.overflow = 'hidden';
        setTimeout(() => $('#payCard')?.focus({ preventScroll: true }), 120);
      }
    });

    update();
    return {
      getState: () => ({
        selected,
        qty,
        name: selected ? TIERS[selected].name : null,
        price: selected ? TIERS[selected].price : 0,
        total: selected ? TIERS[selected].price * qty : 0
      })
    };
  })();

  /* ============================================================
     6B. PAGO SEGURO — métodos de Guatemala + validación de tarjeta
     ============================================================ */
  const pago = (() => {
    const sec = $('#pagoSeguro');
    if (!sec) return {};

    const fmt = n => n.toLocaleString('es-GT');
    const q = n => 'Q' + fmt(n);
    const usdOf = n => '$' + Math.round(n / RATE_GTQ_PER_USD) + ' USD';

    const summary = $('#paySummary');
    const submit = $('#paySubmit');
    const err = $('#payError');
    const card = $('#payCard');
    const exp = $('#payExp');
    const cvv = $('#payCvv');
    const holder = $('#payHolder');
    const email = $('#payEmail');

    function refresh() {
      const s = tickets.getState();
      if (s.selected) {
        summary.textContent = `// ${s.name} × ${s.qty} — TOTAL ${q(s.total)} (≈ ${usdOf(s.total)})`;
        submit.textContent = `[ PAGAR ${q(s.total)} ]`;
      } else {
        summary.textContent = '// SELECCIONA UN TIER Y CONFIRMÁ TU COMPRA';
        submit.textContent = '[ PAGAR — SELECCIONA TIER ]';
      }
    }
    document.addEventListener('loco:tier-change', refresh);
    refresh();

    // métodos
    $$('.pay-method', sec).forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.pay-method', sec).forEach(b => {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-selected', String(b === btn));
        });
        $$('.pay-panel', sec).forEach(p => { p.hidden = p.dataset.paypanel !== btn.dataset.pay; });
        err.hidden = true;
      });
    });

    // formateo de campos
    card?.addEventListener('input', () => {
      const d = card.value.replace(/\D/g, '').slice(0, 16);
      card.value = d.replace(/(.{4})/g, '$1 ').trim();
      card.closest('.pay-field')?.classList.remove('has-error');
    });
    exp?.addEventListener('input', () => {
      const d = exp.value.replace(/\D/g, '').slice(0, 4);
      exp.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
      exp.closest('.pay-field')?.classList.remove('has-error');
    });
    cvv?.addEventListener('input', () => {
      cvv.value = cvv.value.replace(/\D/g, '').slice(0, 4);
      cvv.closest('.pay-field')?.classList.remove('has-error');
    });
    holder?.addEventListener('input', () => holder.closest('.pay-field')?.classList.remove('has-error'));
    email?.addEventListener('input', () => email.closest('.pay-field')?.classList.remove('has-error'));

    function luhn(num) {
      if (num.length < 13) return false;
      let sum = 0, alt = false;
      for (let i = num.length - 1; i >= 0; i--) {
        let n = +num[i];
        if (alt) { n *= 2; if (n > 9) n -= 9; }
        sum += n;
        alt = !alt;
      }
      return sum % 10 === 0;
    }

    function validExp(v) {
      const m = /^(\d{2})\/(\d{2})$/.exec(v);
      if (!m) return false;
      const mm = +m[1], yy = 2000 + +m[2];
      if (mm < 1 || mm > 12) return false;
      return new Date(yy, mm, 1) > new Date();
    }

    function fail(msg, field) {
      err.textContent = '// ' + msg;
      err.hidden = false;
      if (field) {
        field.closest('.pay-field')?.classList.add('has-error');
        field.focus({ preventScroll: false });
      }
      return false;
    }

    function folio() {
      const d = new Date();
      return `LOC-GT-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    function runFlow(kind, s, btn) {
      const label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = '[ PROCESANDO... ]'; }
      const restore = () => { if (btn) { btn.disabled = false; btn.textContent = label; } };

      if (PAY.modo !== 'demo' && PAY.endpoint) {
        fetch(PAY.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: s.selected, qty: s.qty, amount: s.total, currency: 'GTQ', method: kind, email: email?.value || '' })
        })
          .then(r => { if (!r.ok) throw new Error('http'); return r.json(); })
          .then(d => {
            if (d.checkoutUrl) { window.location.href = d.checkoutUrl; return; }
            restore();
            closePay();
            if (d.reference) {
              Modal.open(`// REFERENCIA DE PAGO — ${kind}`,
                `<b>Folio:</b> ${d.folio || folio()}<br><b>Monto:</b> ${q(d.amount || s.total)} (≈ ${usdOf(d.amount || s.total)})<br><b>Válido:</b> 2 horas<br><br>${d.instructions || '// Envía el comprobante a pagos@locoproductions.gt'}`);
            } else {
              Modal.open('// PAGO APROBADO', `<b>Folio:</b> ${d.folio || folio()}<br><b>Total:</b> ${q(s.total)} (≈ ${usdOf(s.total)})`);
            }
          })
          .catch(() => { restore(); Modal.open('// ERROR DE PAGO', 'No se pudo conectar con la pasarela. Intenta de nuevo o usa transferencia/QR.'); });
        return;
      }

      setTimeout(() => {
        restore();
        const f = folio();
        if (kind === 'TRANSFERENCIA' || kind === 'QR') {
          closePay();
          Modal.open(`// REFERENCIA DE PAGO — ${kind}`,
            `<b>Folio:</b> ${f}<br><b>Monto:</b> ${q(s.total)} (≈ ${usdOf(s.total)})<br><b>Válido:</b> 2 horas<br><br>
             // Envía el comprobante a pagos@locoproductions.gt<br>// Liberamos tu entrada al validar el pago.`);
        } else if (PAY.modo === 'demo') {
          closePay();
          Modal.open('// PAGO APROBADO (DEMO)',
            `<b>${kind} · APROBADO</b><br><b>Folio:</b> ${f}<br>
             <b>Tier:</b> ${s.name} × ${s.qty}<br>
             <b>Total:</b> ${q(s.total)} (≈ ${usdOf(s.total)})<br><br>
             // MODO DEMO — sin cargo real. Cambia PAY.modo a 'live' para cobro real.<br>
             // Boletos y coordenadas se envían 24h antes del evento.`);
        }
      }, 1300);
    }

    submit?.addEventListener('click', () => {
      err.hidden = true;
      $$('.pay-field', sec).forEach(f => f.classList.remove('has-error'));
      const s = tickets.getState();
      if (!s.selected) return fail('SELECCIONA UN TIER PRIMERO');
      const digits = (card?.value || '').replace(/\D/g, '');
      if (!luhn(digits)) return fail('NÚMERO DE TARJETA INVÁLIDO — VERIFICA LOS 16 DÍGITOS', card);
      if (!validExp(exp?.value || '')) return fail('VENCIMIENTO INVÁLIDO — FORMATO MM/AA', exp);
      if (!/^\d{3,4}$/.test(cvv?.value || '')) return fail('CVV INVÁLIDO — 3 O 4 DÍGITOS', cvv);
      if ((holder?.value || '').trim().length < 3) return fail('NOMBRE DEL TITULAR REQUERIDO', holder);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email?.value || '')) return fail('CORREO DE CONFIRMACIÓN INVÁLIDO', email);
      runFlow('TARJETA', s, submit);
    });

    $$('[data-payalt]', sec).forEach(btn => {
      btn.addEventListener('click', () => {
        const s = tickets.getState();
        if (!s.selected) {
          Modal.open('// SELECCIONA UN TIER', 'Elige tu tier en la sección de arriba para continuar con el pago.');
          return;
        }
        runFlow(btn.dataset.payalt, s, btn);
      });
    });

    // cerrar modal de pago (botón, backdrop, Escape)
    function closePay() {
      sec.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { sec.hidden = true; }, prefersReducedMotion ? 0 : 260);
      $('#coBuy')?.focus({ preventScroll: true });
    }
    $$('[data-pay-close]', sec).forEach(el => el.addEventListener('click', closePay));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !sec.hidden) closePay();
    });

    return {};
  })();

  /* ============================================================
     6C. COTIZADOR — Tech Rider Builder (vertiente 02 alquiler)
     5 pasos · kits · módulos · servicios · FEL · IVA 12% · USD 7.75
     ============================================================ */
  const cotizador = (() => {
    const root = $('#cotizador');
    if (!root) return {};

    const KITS = {
      boutique:  { name: 'KIT BOUTIQUE / PRIVATE (50–150 PAX)', price: 3500 },
      warehouse: { name: 'KIT UNDERGROUND WAREHOUSE (150–500 PAX)', price: 8000 },
      psycamp:   { name: 'KIT OUTDOOR PSY-CAMP BASE (500–1,000 PAX)', price: 18000 },
      festival:  { name: 'KIT FESTIVAL MAIN STAGE (1,000–2,500+ PAX)', price: 40000 }
    };
    const MODS = {
      laser: { name: 'LÁSER RGB VOLUMÉTRICO (10W–20W // >30 KPPS // FB4-ILDA)', price: 3500 },
      beam:  { name: 'CABEZAS MÓVILES BEAM 1.5°–3° (17R / LED >300W)', price: 600 },
      tubos: { name: 'TUBOS LED PIXEL MAPEADOS (ASTERA / CHAUVET — KIT 8)', price: 2800 },
      uv:    { name: 'PROYECTORES UV 365–395 NM', price: 450 },
      hazer: { name: 'HAZER DMX 1500W BASE AGUA', price: 800 },
      led:   { name: 'PANTALLA LED EXTERIOR 4×2M (PITCH 2.9–3.9 MM)', price: 4500 }
    };
    const SUP = {
      foh:    { name: 'INGENIERO DE SONIDO FOH + AJUSTE', price: 1500 },
      diseno: { name: 'DISEÑADOR LUMÍNICO / OPERADOR LÁSER', price: 1200 },
      nrd:    { name: 'MEMORIA TÉCNICA NRD-2 / NRD-4 CONRED', price: 2500 }
    };
    const POWER_GEN = 4500;
    const IVA = 0.12;
    const TIPOS = {
      ur: '[UR] RAVE SUBTERRÁNEA / ALMACÉN',
      pc: '[PC] ENCUENTRO PSICODÉLICO / CAMPAMENTO',
      cg: '[CG] CYBER-GOTH & INDUSTRIAL WAVE',
      pt: '[PT] POST-TRANCE & NEO-RAVE',
      pv: '[PV] SESIÓN PRIVADA / VILLA / AZOTEA'
    };
    const AFOROS = {
      '50-150': '50 – 150 PAX',
      '150-500': '150 – 500 PAX',
      '500-1000': '500 – 1,000 PAX',
      '1000-2500': '1,000 – 2,500+ PAX'
    };

    const fmt = n => n.toLocaleString('es-GT');
    const q = n => 'Q' + n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const usdOf = n => '≈ $' + fmt(Math.round(n / RATE_GTQ_PER_USD)) + ' USD';

    const linesEl = $('#cotLines');
    const subEl = $('#cotSubtotal');
    const ivaEl = $('#cotIva');
    const totEl = $('#cotTotal');
    const usdEl = $('#cotTotalUsd');
    const errEl = $('#cotError');
    const rawEl = $('#cotRaw');
    const waEl = $('#cotWhatsapp');
    const genBtn = $('#cotGenerate');
    const deptoEl = $('#cotDepto');

    const val = name => {
      const el = root.querySelector(`input[name="${name}"]:checked`);
      return el ? el.value : null;
    };
    const beamQty = () => Math.max(1, Number($('#cotBeamQty')?.value) || 4);
    const round2 = n => Math.round(n * 100) / 100;

    function buildLines() {
      const lines = [];
      const kit = val('cotKit');
      if (kit && KITS[kit]) lines.push({ key: kit, label: KITS[kit].name, amount: KITS[kit].price });
      root.querySelectorAll('input[name="cotMod"]:checked').forEach(cb => {
        const m = MODS[cb.value];
        if (!m) return;
        const qty = cb.value === 'beam' ? beamQty() : 1;
        const label = qty > 1 ? `${m.name} × ${qty} UND` : m.name;
        lines.push({ key: cb.value, label, amount: m.price * qty });
      });
      root.querySelectorAll('input[name="cotSup"]:checked').forEach(cb => {
        const s = SUP[cb.value];
        if (s) lines.push({ key: cb.value, label: s.name, amount: s.price });
      });
      if (val('cotPower') === 'gen') {
        lines.push({ key: 'gen', label: 'PLANTA DE GENERACIÓN ELÉCTRICA DIÉSEL INSONORIZADA / JORNADA', amount: POWER_GEN });
      }
      return lines;
    }

    function compute() {
      const lines = buildLines();
      const subtotal = round2(lines.reduce((a, l) => a + l.amount, 0));
      const iva = round2(subtotal * IVA);
      const total = round2(subtotal + iva);
      const usd = Math.round(total / RATE_GTQ_PER_USD);
      return { lines, subtotal, iva, total, usd };
    }

    function felData() {
      return {
        name: ($('#cotName')?.value || '').trim(),
        nit: ($('#cotNit')?.value || '').trim(),
        email: ($('#cotEmail')?.value || '').trim(),
        phone: ($('#cotPhone')?.value || '').trim()
      };
    }

    function rawText(s) {
      const tipo = val('cotTipo');
      const aforo = val('cotAforo');
      const power = val('cotPower');
      const f = felData();
      const depto = deptoEl && deptoEl.selectedIndex >= 0 ? deptoEl.options[deptoEl.selectedIndex].text : '—';
      const L = [];
      L.push('TECH RIDER // eLoco PRODUCTIONS');
      L.push('================================');
      L.push('TIPO DE EVENTO: ' + (tipo && TIPOS[tipo] ? TIPOS[tipo] : '—'));
      L.push('AFORO: ' + (aforo && AFOROS[aforo] ? AFOROS[aforo] : '—'));
      L.push('LOCACIÓN: ' + depto);
      L.push('SUMINISTRO ELÉCTRICO: ' + (power === 'gen'
        ? 'PLANTA DIÉSEL INSONORIZADA (+Q4,500/JORNADA)'
        : 'RED ELÉCTRICA COMERCIAL ESTABLE EN SITIO (220V TRIFÁSICA)'));
      L.push('');
      L.push('EQUIPO CONFIGURADO:');
      if (!s.lines.length) L.push('  (SIN EQUIPO SELECCIONADO — ELIGE UN KIT BASE)');
      s.lines.forEach(l => L.push('  - ' + l.label + ': ' + q(l.amount)));
      L.push('');
      L.push('SUBTOTAL GTQ: ' + q(s.subtotal));
      L.push('IVA (12%): ' + q(s.iva));
      L.push('TOTAL GTQ: ' + q(s.total));
      L.push('REF. USD (7.75 GTQ/USD): ' + usdOf(s.total));
      L.push('');
      L.push('DATOS FEL:');
      L.push('  RAZÓN SOCIAL: ' + (f.name || '—'));
      L.push('  NIT: ' + (f.nit || '—'));
      L.push('  CORREO: ' + (f.email || '—'));
      L.push('  TEL: ' + (f.phone || '—'));
      L.push('');
      L.push('ENVIADO A: pagos@locoproductions.gt');
      return L.join('\n');
    }

    function render() {
      const s = compute();
      linesEl.innerHTML = s.lines.length
        ? s.lines.map(l => `<li><span>${l.label}</span><b>${q(l.amount)}</b></li>`).join('')
        : '<li class="cot-empty">// SIN EQUIPO SELECCIONADO — ELIGE UN KIT BASE (PASO 02)</li>';
      subEl.textContent = q(s.subtotal);
      ivaEl.textContent = q(s.iva);
      totEl.textContent = q(s.total);
      usdEl.textContent = usdOf(s.total);
      const raw = rawText(s);
      rawEl.textContent = raw;
      if (waEl) waEl.href = 'https://wa.me/?text=' + encodeURIComponent(raw);
      return s;
    }

    root.addEventListener('change', render);
    root.addEventListener('input', render);
    render();

    function fail(msg) {
      errEl.textContent = '// ' + msg;
      errEl.hidden = false;
      errEl.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      return false;
    }

    genBtn?.addEventListener('click', () => {
      errEl.hidden = true;
      const s = render();
      if (!val('cotKit')) return fail('SELECCIONA UN KIT BASE DE AUDIO (PASO 02) PARA CONTINUAR');
      if (!val('cotTipo')) return fail('SELECCIONA EL TIPO DE EVENTO (PASO 01)');
      const f = felData();
      if (f.name.length < 3) return fail('NOMBRE / RAZÓN SOCIAL REQUERIDO (PASO 05)');
      if (!/^[0-9A-Za-z-]{5,15}$/.test(f.nit)) return fail('NIT INVÁLIDO — FORMATO 1234567-8 (PASO 05)');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) return fail('CORREO INVÁLIDO (PASO 05)');
      if (!/^[\d\s+()-]{8,}$/.test(f.phone)) return fail('TELÉFONO INVÁLIDO (PASO 05)');

      const folio = 'RIDER-GT-' + Math.floor(1000 + Math.random() * 9000);
      const raw = rawText(s);
      const mail = 'mailto:pagos@locoproductions.gt?subject=' +
        encodeURIComponent(`TECH RIDER ${folio} — ${f.name}`) + '&body=' + encodeURIComponent(raw);
      const wa = 'https://wa.me/?text=' + encodeURIComponent(raw);

      Modal.open('// TECH RIDER GENERADO — ' + folio,
        `<b>Folio:</b> ${folio}<br>
         <b>Configuración:</b> ${s.lines.length} línea(s) de equipo<br>
         <b>Total:</b> ${q(s.total)} (IVA 12% incl. // ≈ $${fmt(s.usd)} USD)<br>
         <b>Entrega del PDF a:</b> ${f.email}<br><br>
         // LISTO PARA ENVIAR A: pagos@locoproductions.gt<br>
         // REVISIÓN DE VIABILIDAD TÉCNICA EN 24–48 HRS.<br><br>
         <div class="pay-actions">
           <a class="btn btn-primary btn-block" href="${mail}">[ ENVIAR A REVISIÓN POR CORREO ]</a>
           <a class="btn btn-outline btn-block" href="${wa}" target="_blank" rel="noopener">[ ABRIR EN WHATSAPP ]</a>
         </div>`);
      return true;
    });

    return { render, compute };
  })();

  /* ============================================================
     7. ACORDEÓN POLÍTICAS
     ============================================================ */
  const accordion = (() => {
    $$('.acc-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.acc-item');
        const panel = $('.acc-panel', item);
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';

        // cerrar otros (acordeón clásico)
        $$('.acc-item').forEach(other => {
          const t = $('.acc-trigger', other);
          const p = $('.acc-panel', other);
          if (t !== trigger) {
            t.setAttribute('aria-expanded', 'false');
            p.hidden = true;
          }
        });

        trigger.setAttribute('aria-expanded', String(!isOpen));
        panel.hidden = isOpen;
      });
    });
  })();

  /* ============================================================
     8. REVEAL ON SCROLL
     ============================================================ */
  const reveal = (() => {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      els.forEach(el => el.classList.add('is-visible'));
      return {};
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    els.forEach(el => io.observe(el));
    return {};
  })();

  /* ============================================================
     9. COUNTERS (stats hero)
     ============================================================ */
  const counters = (() => {
    const nums = $$('.stat-num');
    if (!nums.length) return {};
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      nums.forEach(n => n.textContent = n.dataset.count);
      return {};
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = Number(el.dataset.count);
        const dur = 1400;
        const start = performance.now();
        const tick = now => {
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(n => io.observe(n));
    return {};
  })();

  /* ============================================================
     10. AFTERTMOVIE TEASER (toggle simulado)
     ============================================================ */
  const aftermovie = (() => {
    const el = $('#aftermovie');
    const btn = $('#aftermoviePlay');
    if (!el || !btn) return {};
    btn.addEventListener('click', () => {
      const on = el.classList.toggle('is-playing');
      btn.setAttribute('aria-label', on ? 'Pausar aftermovie teaser' : 'Reproducir aftermovie teaser');
      btn.innerHTML = on
        ? '<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>'
        : '<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
      if (on) AudioEngine.ensure() && AudioEngine.setVolume(0.35);
      else AudioEngine.setVolume(0.5);
    });
  })();

  /* ============================================================
     11. GUESTLIST FORM
     ============================================================ */
  const form = (() => {
    const f = $('#guestlistForm');
    const input = $('#glEmail');
    const msg = $('#glMsg');
    if (!f) return {};

    const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    const isPhone = v => /^[\d\s+()-]{8,}$/.test(v);

    f.addEventListener('submit', e => {
      e.preventDefault();
      const v = input.value.trim();
      msg.classList.remove('is-ok', 'is-err');

      if (!v) {
        msg.textContent = '// ERROR: CAMPO VACÍO';
        msg.classList.add('is-err');
        input.focus();
        return;
      }
      if (!isEmail(v) && !isPhone(v)) {
        msg.textContent = '// FORMATO INVÁLIDO — USA EMAIL O TELÉFONO';
        msg.classList.add('is-err');
        input.focus();
        return;
      }
      msg.textContent = '// ACCESO CONFIRMADO — BIENVENIDX A LA SECRET GUESTLIST';
      msg.classList.add('is-ok');
      input.value = '';
      Modal.open('// GUESTLIST CONFIRMADA', 'Estás dentro. Recibirás alertas por SMS/email cuando el próximo drop se active.<br><b>NO COMPARTAS ESTE ENLACE.</b>');
    });
  })();

  /* ============================================================
     12. MODAL
     ============================================================ */
  const Modal = (() => {
    const backdrop = $('#modalBackdrop');
    const title = $('#modalTitle');
    const body = $('#modalBody');
    const closeBtn = $('#modalClose');
    let lastFocus = null;

    function open(t, html) {
      lastFocus = document.activeElement;
      title.textContent = t;
      body.innerHTML = html;
      backdrop.hidden = false;
      closeBtn.focus();
      document.body.style.overflow = 'hidden';
    }
    function close() {
      backdrop.hidden = true;
      document.body.style.overflow = '';
      lastFocus?.focus();
    }

    closeBtn?.addEventListener('click', close);
    backdrop?.addEventListener('click', e => { if (e.target === backdrop) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !backdrop.hidden) close(); });

    return { open, close };
  })();

  /* ============================================================
     13. CINEMA FX — efectos cinemáticos 3D psicodélicos
     canvas aurora + cursor + tilt 3D + parallax mouse/scroll
     ============================================================ */
  const cinema = (() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const lowFx = prefersReducedMotion;
    const state = { canvas: false, tilt: 0, cursor: false, progress: false, raf: false };

    // --- barra de progreso de scroll ---
    const bar = document.createElement('div');
    bar.id = 'scrollProgress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    state.progress = true;

    // actualizacion sincrona en scroll (independiente del loop rAF)
    let lastSy = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      const docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      bar.style.width = ((y / docH) * 100).toFixed(2) + '%';
      document.documentElement.style.setProperty('--sy', y.toFixed(0) + 'px');
      scrollV = y - lastSy;
      lastSy = y;
      $('#siteHeader')?.classList.toggle('is-glide', Math.abs(scrollV) > 18);
    }, { passive: true });

    // --- cursor psicodélico ---
    let cur = null, dot = null;
    if (fine && !lowFx) {
      cur = document.createElement('div');
      cur.id = 'locoCursor';
      cur.setAttribute('aria-hidden', 'true');
      dot = document.createElement('div');
      dot.id = 'locoCursorDot';
      dot.setAttribute('aria-hidden', 'true');
      document.body.append(dot, cur);
      state.cursor = true;
      document.addEventListener('pointerover', e => {
        if (e.target.closest && e.target.closest('a, button, input, label, [data-pay], .tier-select')) cur.classList.add('is-hot');
      }, { passive: true });
      document.addEventListener('pointerout', e => {
        if (e.target.closest && e.target.closest('a, button, input, label, [data-pay], .tier-select')) cur.classList.remove('is-hot');
      }, { passive: true });
    }

    // --- canvas aurora ---
    let cv = null, ctx = null, W = 0, H = 0, DPR = 1;
    if (!lowFx) {
      cv = document.createElement('canvas');
      cv.id = 'fxCanvas';
      cv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cv);
      ctx = cv.getContext('2d');
      state.canvas = !!ctx;
    }

    function sizeCanvas() {
      if (!cv) return;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.floor(W * DPR);
      cv.height = Math.floor(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    // --- puntero + vars CSS ---
    const ptr = { x: window.innerWidth / 2, y: window.innerHeight / 2, tx: window.innerWidth / 2, ty: window.innerHeight / 2, speed: 0 };
    let curX = ptr.x, curY = ptr.y, dotX = ptr.x, dotY = ptr.y;
    let scrollY = window.scrollY, lastScroll = window.scrollY, scrollV = 0, energy = 0;

    document.addEventListener('pointermove', e => {
      ptr.tx = e.clientX;
      ptr.ty = e.clientY;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      const rs = document.documentElement.style;
      rs.setProperty('--mx', (nx * 26).toFixed(1) + 'px');
      rs.setProperty('--my', (ny * 18).toFixed(1) + 'px');
      rs.setProperty('--mxn', nx.toFixed(3));
      rs.setProperty('--myn', ny.toFixed(3));
    }, { passive: true });

    // --- tilt 3D en tarjetas ---
    if (fine && !lowFx) {
      const tiltEls = document.querySelectorAll('.event-card, .artist-card, .tier-card, .aftermovie, .manifesto, .gear-set, .fx-card, .cot-kit');
      tiltEls.forEach(el => {
        el.classList.add('tilt');
        el.addEventListener('pointermove', e => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `perspective(900px) rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 11).toFixed(2)}deg)`;
          el.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
          el.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%');
        }, { passive: true });
        el.addEventListener('pointerleave', () => { el.style.transform = ''; }, { passive: true });
      });
      state.tilt = tiltEls.length;
    }

    // --- partículas / blobs ---
    const parts = [];
    const hues = [130, 275, 330, 180];
    function seed() {
      parts.length = 0;
      const n = Math.round(Math.min(Math.max(window.innerWidth / 16, 34), 90));
      for (let i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 1 + Math.random() * 2.2,
          hue: hues[i % hues.length],
          ph: Math.random() * Math.PI * 2
        });
      }
    }

    function frame(t) {
      state.raf = true;
      const time = t * 0.001;

      // lerp de puntero
      ptr.x += (ptr.tx - ptr.x) * 0.16;
      ptr.y += (ptr.ty - ptr.y) * 0.16;
      const dx = ptr.tx - ptr.x, dy = ptr.ty - ptr.y;
      ptr.speed = Math.min(1, Math.hypot(dx, dy) / 60);

      // scroll
      scrollY = window.scrollY;
      scrollV = scrollV * 0.85 + (scrollY - lastScroll) * 0.15;
      lastScroll = scrollY;
      const docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      bar.style.width = ((scrollY / docH) * 100).toFixed(2) + '%';
      document.documentElement.style.setProperty('--sy', scrollY.toFixed(0) + 'px');

      // header glide según velocidad de scroll
      const header = $('#siteHeader');
      if (header) header.classList.toggle('is-glide', Math.abs(scrollV) > 18);

      energy += ((ptr.speed + Math.min(Math.abs(scrollV) / 40, 1)) - energy) * 0.08;

      // cursor
      if (cur) {
        curX += (ptr.x - curX) * 0.2;
        curY += (ptr.y - curY) * 0.2;
        dotX += (ptr.x - dotX) * 0.55;
        dotY += (ptr.y - dotY) * 0.55;
        cur.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0) scale(${(1 + energy * 0.35).toFixed(3)})`;
        dot.style.transform = `translate3d(${dotX.toFixed(1)}px, ${dotY.toFixed(1)}px, 0)`;
      }

      // canvas aurora
      if (ctx) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(6, 6, 10, 0.3)';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';

        // blobs orbitando que siguen al puntero
        const blobs = [
          { h: 130, o: 0.16, orb: 150, sp: 0.55 },
          { h: 275, o: 0.14, orb: 210, sp: -0.4 },
          { h: 330, o: 0.1, orb: 260, sp: 0.28 }
        ];
        for (let i = 0; i < blobs.length; i++) {
          const b = blobs[i];
          const ax = ptr.x + Math.cos(time * b.sp + i * 2.1) * b.orb;
          const ay = ptr.y + Math.sin(time * b.sp * 1.3 + i * 1.7) * b.orb * 0.7 + scrollV * 2;
          const rad = (230 + energy * 170) * (1 + Math.sin(time + i) * 0.12);
          const g = ctx.createRadialGradient(ax, ay, 0, ax, ay, rad);
          g.addColorStop(0, `hsla(${b.h}, 100%, 60%, ${b.o + energy * 0.1})`);
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(ax, ay, rad, 0, Math.PI * 2);
          ctx.fill();
        }

        // partículas que reaccionan a puntero y scroll
        for (const p of parts) {
          const vxTo = ptr.x - p.x, vyTo = ptr.y - p.y;
          const d2 = Math.max(4000, vxTo * vxTo + vyTo * vyTo);
          const pull = (energy * 900) / d2;
          p.vx += (vxTo / Math.sqrt(d2)) * pull * 0.02;
          p.vy += (vyTo / Math.sqrt(d2)) * pull * 0.02;
          p.vx += Math.cos(time * 0.7 + p.ph) * 0.012;
          p.vy += Math.sin(time * 0.9 + p.ph) * 0.012 - scrollV * 0.004;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.x += p.vx * (1 + energy * 2);
          p.y += p.vy * (1 + energy * 2);
          if (p.x < -20) p.x = W + 20;
          if (p.x > W + 20) p.x = -20;
          if (p.y < -20) p.y = H + 20;
          if (p.y > H + 20) p.y = -20;
          const tw = 0.35 + Math.sin(time * 2 + p.ph) * 0.25 + energy * 0.4;
          ctx.fillStyle = `hsla(${p.h}, 100%, 62%, ${Math.min(0.8, tw).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * (1 + energy * 0.8), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      requestAnimationFrame(frame);
    }

    if (!lowFx) {
      sizeCanvas();
      seed();
      window.addEventListener('resize', () => { sizeCanvas(); seed(); }, { passive: true });
      requestAnimationFrame(frame);
    } else {
      // sin animación: solo barra de progreso
      const tick = () => {
        const docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        bar.style.width = ((window.scrollY / docH) * 100).toFixed(2) + '%';
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    return { state };
  })();

  /* ============================================================
     14. CIERRE: pausar audio al perder foco de pestaña
     ============================================================ */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) radio.pause?.();
  });

  return { countdown, Modal, cinema };
})();
