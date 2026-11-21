/* Kanji writing practice: prompt with katakana / romaji + English, reveal the kanji,
 * and animate stroke order from KanjiVG data. */
(function () {
  const $ = (s) => document.querySelector(s);
  const LIST = window.KANJI_WORDS.map(([kanji, kana, meaning]) => ({ kanji, kana, meaning }));
  // Bundled data (js/stroke-data.js) is used first; anything missing is fetched from KanjiVG on GitHub.
  const KVG = "https://raw.githubusercontent.com/KanjiVG/kanjivg/r20260714/kanji/";
  const SVGNS = "http://www.w3.org/2000/svg";

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  const toKatakana = (s) => (window.wanakana ? wanakana.toKatakana(s)
    : s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60)));
  const toRomaji = (s) => (window.wanakana ? wanakana.toRomaji(s) : s);

  /* ---------------- Deck ---------------- */
  let mode = store.get("jc-write-mode", "kata");
  let order = [], pos = 0, revealed = false;

  function shuffle() {
    order = LIST.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    pos = 0;
  }

  const current = () => LIST[order[pos]];

  function renderReading() {
    const w = current();
    const el = $("#w-reading");
    if (mode === "kata") { el.textContent = toKatakana(w.kana); el.lang = "ja"; el.classList.remove("romaji"); }
    else { el.textContent = toRomaji(w.kana); el.lang = "en"; el.classList.add("romaji"); }
    document.querySelectorAll("#w-mode button").forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
  }

  function show() {
    const w = current();
    revealed = false;
    player.stop();
    $("#stroke-panel").hidden = true;
    $("#w-answer").hidden = true;
    $("#w-prompt-actions").hidden = false;
    $("#w-progress").textContent = `${pos + 1} / ${order.length}`;
    $("#w-meaning").textContent = w.meaning;
    $("#w-kanji").textContent = w.kanji;
    $("#w-kana").textContent = w.kana;
    renderReading();
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    $("#w-answer").hidden = false;
    $("#w-prompt-actions").hidden = true;
  }

  function go(delta) {
    pos = (pos + delta + order.length) % order.length;
    if (delta > 0 && pos === 0) shuffle(); // new round after finishing the deck
    show();
  }

  /* ---------------- Stroke data ---------------- */
  const cache = new Map();
  function loadChar(ch) {
    const local = window.KANJI_STROKES && window.KANJI_STROKES[ch];
    if (local) return Promise.resolve({ strokes: local.s, nums: local.n.map(([x, y], i) => ({ x, y, n: i + 1 })) });
    if (!cache.has(ch)) {
      const hex = ch.codePointAt(0).toString(16).padStart(5, "0");
      cache.set(ch, fetch(KVG + hex + ".svg")
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then((txt) => {
          const doc = new DOMParser().parseFromString(txt, "image/svg+xml");
          const strokes = [...doc.querySelectorAll('[id^="kvg:StrokePaths"] path')].map((p) => p.getAttribute("d"));
          const nums = [...doc.querySelectorAll('[id^="kvg:StrokeNumbers"] text')].map((t) => {
            const m = /matrix\(1 0 0 1 ([\d.-]+) ([\d.-]+)\)/.exec(t.getAttribute("transform") || "");
            return m ? { x: +m[1], y: +m[2], n: t.textContent } : null;
          });
          if (!strokes.length) throw new Error("no strokes");
          return { strokes, nums };
        })
        .catch((e) => { cache.delete(ch); throw e; }));
    }
    return cache.get(ch);
  }

  /* ---------------- Stroke player ---------------- */
  const BASE_SPEED = 90;   // SVG units per second at 1×
  const STROKE_GAP = 0.2;  // pause between strokes (s)
  const CHAR_GAP = 0.45;   // extra pause between characters (s)
  const FF_RATE = 5;       // fast-forward multiplier

  const player = {
    strokes: [], total: 0, t: 0, playing: false, ff: false, speed: 1, raf: 0, last: 0, token: 0,

    async load(word) {
      const token = ++this.token;
      this.stop();
      const box = $("#stroke-chars");
      box.innerHTML = "";
      $("#stroke-status").textContent = "Loading stroke data…";
      const chars = [...word];
      const results = await Promise.all(chars.map((c) => loadChar(c).catch(() => null)));
      if (token !== this.token) return; // a newer word was loaded meanwhile

      this.strokes = [];
      let t = 0;
      chars.forEach((ch, ci) => {
        const data = results[ci];
        const cell = document.createElement("div");
        cell.className = "stroke-cell";
        if (!data) {
          cell.innerHTML = `<div class="stroke-missing">${ch}</div>`;
          box.appendChild(cell);
          return;
        }
        const svg = document.createElementNS(SVGNS, "svg");
        svg.setAttribute("viewBox", "0 0 109 109");
        svg.innerHTML = `<g class="grid"><rect x="1" y="1" width="107" height="107" rx="4"/>
          <line x1="54.5" y1="1" x2="54.5" y2="108"/><line x1="1" y1="54.5" x2="108" y2="54.5"/></g>`;
        const mk = (cls) => { const g = document.createElementNS(SVGNS, "g"); g.setAttribute("class", cls); svg.appendChild(g); return g; };
        const ghost = mk("ghost"), ink = mk("ink"), nums = mk("nums");
        cell.appendChild(svg);
        box.appendChild(cell);
        if (this.strokes.length) t += CHAR_GAP;
        data.strokes.forEach((d, si) => {
          const g = document.createElementNS(SVGNS, "path");
          g.setAttribute("d", d);
          ghost.appendChild(g);
          const p = document.createElementNS(SVGNS, "path");
          p.setAttribute("d", d);
          ink.appendChild(p);
          const len = p.getTotalLength();
          p.style.strokeDasharray = `${len} ${len}`;
          p.style.strokeDashoffset = len;
          let num = null;
          const nd = data.nums[si];
          if (nd) {
            num = document.createElementNS(SVGNS, "text");
            num.setAttribute("x", nd.x); num.setAttribute("y", nd.y);
            num.textContent = nd.n;
            nums.appendChild(num);
          }
          const dur = Math.max(0.25, len / BASE_SPEED);
          this.strokes.push({ el: p, num, len, start: t, dur, ch, ci, si, count: data.strokes.length });
          t += dur + STROKE_GAP;
        });
      });
      this.total = Math.max(0, t - STROKE_GAP);
      if (!this.strokes.length) {
        $("#stroke-status").textContent = "Stroke data couldn't be loaded (check your connection).";
        updatePlayBtn();
        return;
      }
      this.t = 0;
      this.render();
      this.play();
    },

    render() {
      let active = null, drawn = 0;
      for (const s of this.strokes) {
        const p = Math.min(1, Math.max(0, (this.t - s.start) / s.dur));
        s.el.style.strokeDashoffset = s.len * (1 - p);
        s.el.classList.toggle("current", p > 0 && p < 1);
        s.el.style.visibility = p > 0 ? "visible" : "hidden";
        if (s.num) s.num.classList.toggle("on", p > 0);
        if (p > 0) { drawn++; active = s; }
      }
      const st = $("#stroke-status");
      if (!active) st.textContent = "Ready";
      else if (this.t >= this.total) st.textContent = `Done — ${this.strokes.length} stroke${this.strokes.length > 1 ? "s" : ""} total`;
      else st.innerHTML = `<span lang="ja">${active.ch}</span> · stroke ${active.si + 1} of ${active.count}`;
    },

    tick(now) {
      const dt = Math.min(0.25, (now - this.last) / 1000);
      this.last = now;
      if (this.playing) {
        this.t += dt * this.speed * (this.ff ? FF_RATE : 1);
        if (this.t >= this.total) { this.t = this.total; this.playing = false; }
        this.render();
      }
      updatePlayBtn();
      if (this.playing) this.raf = requestAnimationFrame((n) => this.tick(n));
    },

    play() {
      if (!this.strokes.length) return;
      if (this.t >= this.total) this.t = 0;
      if (this.playing) return;
      this.playing = true;
      this.last = performance.now();
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame((n) => this.tick(n));
    },
    pause() { this.playing = false; cancelAnimationFrame(this.raf); updatePlayBtn(); },
    replay() { this.t = 0; this.render(); this.playing = false; this.play(); },
    stop() { this.playing = false; this.ff = false; cancelAnimationFrame(this.raf); },
  };

  function updatePlayBtn() {
    const b = $("#s-play");
    b.textContent = player.playing ? "⏸" : (player.t >= player.total && player.total ? "↻" : "▶");
    b.title = player.playing ? "Pause" : "Play";
    $("#s-ff").classList.toggle("held", player.ff);
  }

  function openStrokes() {
    const panel = $("#stroke-panel");
    if (!panel.hidden) { player.replay(); return; }
    panel.hidden = false;
    player.load(current().kanji);
  }

  /* ---------------- Wiring ---------------- */
  function init() {
    shuffle();
    show();

    $("#w-mode").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-mode]");
      if (!b) return;
      mode = b.dataset.mode;
      store.set("jc-write-mode", mode);
      renderReading();
      b.blur();
    });
    const click = (sel, fn) => $(sel).addEventListener("click", (e) => { e.currentTarget.blur(); fn(); });
    click("#w-reveal", reveal);
    click("#w-next", () => go(1));
    click("#w-skip", () => go(1));
    click("#w-prev", () => go(-1));
    click("#w-shuffle", () => { shuffle(); show(); });
    click("#w-stroke-btn", openStrokes);
    click("#s-play", () => (player.playing ? player.pause() : player.play()));
    click("#s-replay", () => player.replay());

    const ff = $("#s-ff");
    const ffOn = (e) => {
      e.preventDefault();
      if (e.pointerId !== undefined) ff.setPointerCapture?.(e.pointerId);
      player.ff = true;
      player.play();
      updatePlayBtn();
    };
    const ffOff = () => { player.ff = false; updatePlayBtn(); };
    ff.addEventListener("pointerdown", ffOn);
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => ff.addEventListener(ev, ffOff));
    ff.addEventListener("contextmenu", (e) => e.preventDefault());

    const speed = $("#s-speed");
    const setSpeed = (v) => { player.speed = v; speed.value = v; $("#s-speed-val").textContent = v + "×"; };
    setSpeed(store.get("jc-stroke-speed", 1));
    speed.addEventListener("input", () => { setSpeed(+speed.value); store.set("jc-stroke-speed", +speed.value); });

    const nums = $("#s-nums");
    nums.checked = store.get("jc-stroke-nums", true);
    const applyNums = () => $("#stroke-panel").classList.toggle("hide-nums", !nums.checked);
    applyNums();
    nums.addEventListener("change", () => { store.set("jc-stroke-nums", nums.checked); applyNums(); });

    document.addEventListener("keydown", (e) => {
      if ($("#view-write").hidden || $("#table-dialog").open) return;
      const t = e.target;
      if (t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && !["range", "checkbox"].includes(t.type))) return;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
        if (e.repeat) return;
        revealed ? go(1) : reveal();
      } else if (t.type === "range") {
        return;
      } else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    });
  }

  init();
})();
