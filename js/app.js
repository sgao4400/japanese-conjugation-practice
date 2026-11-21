(function () {
  const { conjugate, keigoDict, toKana, toKanji, toRuby, typeLabel, typeBucket } = window.Conj;
  const WORDS = window.WORDS;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  /* ---------------- Settings ---------------- */
  const DEFAULTS = {
    types: ["godan", "ichidan", "irregular", "suru", "i", "na"], trans: "all",
    tenses: ["present", "past"], pol: ["aff", "neg"], formal: ["plain", "polite"],
    keigo: ["none"], furigana: true, english: true,
  };
  let settings = Object.assign({}, DEFAULTS, store.get("jc-settings", {}));

  function applySettingsToInputs() {
    $$("[data-set]").forEach((el) => {
      const v = settings[el.dataset.set];
      if (el.type === "radio") el.checked = v === el.value;
      else if (Array.isArray(v)) el.checked = v.includes(el.value);
      else el.checked = !!v;
    });
  }
  function readSettingsFromInputs() {
    const s = {};
    $$("[data-set]").forEach((el) => {
      const key = el.dataset.set;
      if (el.type === "radio") { if (el.checked) s[key] = el.value; }
      else if (el.value && el.value !== "on") { (s[key] ||= []); if (el.checked) s[key].push(el.value); }
      else s[key] = el.checked;
    });
    return s;
  }

  /* ---------------- Question pool ---------------- */
  function wordAllowed(w) {
    if (!settings.types.includes(typeBucket(w))) return false;
    if (w.pos === "verb" && settings.trans !== "all") {
      if (settings.trans === "pair") return w.pair !== undefined;
      return w.tr === settings.trans;
    }
    return true;
  }

  function formsFor() {
    const forms = [];
    for (const tense of settings.tenses)
      for (const pol of settings.pol)
        for (const formal of tense === "te" ? ["plain"] : settings.formal)
          for (const keigo of settings.keigo)
            forms.push({ tense, neg: pol === "neg", polite: formal === "polite", keigo });
    // て-form needs at least one formality box ticked too, to stay consistent
    return settings.formal.length ? forms : [];
  }

  let pool = [];
  function buildPool() {
    const forms = formsFor();
    pool = [];
    for (const w of WORDS) {
      if (!wordAllowed(w)) continue;
      for (const f of forms) if (conjugate(w, f)) pool.push({ w, f });
    }
    const words = new Set(pool.map((q) => q.w.id)).size;
    $("#pool-size").textContent = pool.length
      ? `${words} words · ${pool.length} possible questions`
      : "No questions match these settings.";
  }

  /* ---------------- Stats ---------------- */
  let stats = store.get("jc-stats", { correct: 0, total: 0, streak: 0, best: 0 });
  function renderStats() {
    $("#stat-correct").textContent = stats.correct;
    $("#stat-total").textContent = stats.total;
    $("#stat-streak").textContent = stats.streak;
    $("#stat-best").textContent = stats.best;
  }

  /* ---------------- Quiz ---------------- */
  let current = null, answered = false, asked = 0, lastWordId = null;
  const retry = []; // missed questions come back a few questions later

  function pickQuestion() {
    const due = retry.findIndex((r) => r.due <= asked);
    if (due >= 0) {
      const r = retry.splice(due, 1)[0];
      if (pool.some((q) => q.w === r.w && sameForm(q.f, r.f))) return r;
    }
    if (!pool.length) return null;
    for (let tries = 0; tries < 20; tries++) {
      const q = pool[Math.floor(Math.random() * pool.length)];
      if (q.w.id !== lastWordId || tries === 19) return q;
    }
  }
  const sameForm = (a, b) => a.tense === b.tense && a.neg === b.neg && a.polite === b.polite && a.keigo === b.keigo;

  const KEIGO_LABEL = { hon: ["Honorific", "尊敬語"], hum: ["Humble", "謙譲語"] };
  function targetChips(f) {
    const chips = [];
    if (f.keigo !== "none") chips.push(`<span class="chip-t k-${f.keigo}">${KEIGO_LABEL[f.keigo][0]} <span lang="ja">${KEIGO_LABEL[f.keigo][1]}</span></span>`);
    if (f.tense === "te") chips.push(`<span class="chip-t tense">て-form</span>`);
    else {
      chips.push(`<span class="chip-t ${f.polite ? "polite" : "plain"}">${f.polite ? "Polite" : "Plain"}</span>`);
      chips.push(`<span class="chip-t tense">${f.tense === "past" ? "Past" : "Present"}</span>`);
    }
    chips.push(`<span class="chip-t ${f.neg ? "neg" : "aff"}">${f.neg ? "Negative" : "Affirmative"}</span>`);
    return chips.join("");
  }

  function wordTags(w) {
    const tags = [`<span class="tag">${typeLabel(w)}</span>`];
    if (w.tr) tags.push(`<span class="tag tr-${w.tr}">${w.tr === "t" ? "Transitive 他動詞" : "Intransitive 自動詞"}</span>`);
    if (w.pair !== undefined) {
      const p = WORDS[w.pair];
      tags.push(`<span class="tag pair">pair: <span lang="ja">${toRuby(p.w, settings.furigana)}</span></span>`);
    }
    return tags.join("");
  }

  function showQuestion() {
    current = pickQuestion();
    answered = false;
    $("#feedback").innerHTML = "";
    $("#feedback").className = "feedback";
    const input = $("#answer");
    input.value = "";
    input.classList.remove("ok", "bad");
    input.disabled = false;
    $("#btn-next").textContent = "Check";
    if (!current) {
      $("#word").innerHTML = "—";
      $("#meaning").textContent = "";
      $("#word-tags").innerHTML = "";
      $("#target").innerHTML = `<span class="empty">No questions match your settings. Tick more options on the right.</span>`;
      input.disabled = true;
      return;
    }
    lastWordId = current.w.id;
    asked++;
    const w = current.w;
    $("#word").innerHTML = toRuby(w.w, settings.furigana);
    $("#meaning").textContent = settings.english ? w.m : "";
    $("#word-tags").innerHTML = wordTags(w);
    $("#target").innerHTML = targetChips(current.f);
    input.focus();
  }

  function normalize(s) {
    s = s.normalize("NFKC").replace(/[\s。．.、,!！?？]/g, "");
    if (/[a-z]/i.test(s) && window.wanakana) s = wanakana.toKana(s.toLowerCase());
    // katakana -> hiragana
    return s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
  }

  function check(skip) {
    if (!current || answered) return;
    const answers = conjugate(current.w, current.f);
    const raw = $("#answer").value;
    const given = normalize(raw);
    if (!skip && !given) return;
    const accepted = new Set(answers.flatMap((a) => [toKana(a), toKanji(a)]));
    const ok = !skip && accepted.has(given);
    answered = true;

    stats.total++;
    if (ok) { stats.correct++; stats.streak++; stats.best = Math.max(stats.best, stats.streak); }
    else { stats.streak = 0; retry.push({ w: current.w, f: current.f, due: asked + 3 + Math.floor(Math.random() * 3) }); }
    store.set("jc-stats", stats);
    renderStats();

    const input = $("#answer");
    input.classList.add(ok ? "ok" : "bad");
    input.disabled = true;

    const matchIdx = answers.findIndex((a) => toKana(a) === given || toKanji(a) === given);
    const primary = answers[0];
    let html = ok
      ? `<div class="verdict ok">✓ Correct</div>`
      : `<div class="verdict bad">${skip ? "Answer" : "✗ Not quite"}${!skip ? ` — you wrote <s lang="ja">${escapeHtml(raw)}</s>` : ""}</div>`;
    html += `<div class="answer-main" lang="ja">${toRuby(ok ? answers[matchIdx] : primary)}</div>`;
    const others = answers.filter((a, i) => i !== (ok ? matchIdx : 0));
    if (others.length) html += `<div class="also">Also accepted: <span lang="ja">${others.map((a) => toRuby(a)).join("、 ")}</span></div>`;
    if (current.f.keigo !== "none") {
      const kd = keigoDict(current.w, current.f.keigo);
      html += `<div class="note">${KEIGO_LABEL[current.f.keigo][0]} verb: <span lang="ja">${toRuby(kd)}</span></div>`;
    }
    if (current.w.note) html += `<div class="note">${escapeHtml(current.w.note)}</div>`;
    $("#feedback").innerHTML = html;
    $("#feedback").className = "feedback show " + (ok ? "ok" : "bad");
    $("#btn-next").textContent = "Next →";
    $("#btn-next").focus();
  }

  const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------------- Conjugation table dialog ---------------- */
  function cell(w, f) {
    const a = conjugate(w, f);
    if (!a) return `<td class="na">—</td>`;
    const rest = a.slice(1).map(toKanji).join(", ");
    return `<td lang="ja"${rest ? ` title="Also: ${escapeHtml(rest)}"` : ""}>${toRuby(a[0])}${a.length > 1 ? `<span class="more">+${a.length - 1}</span>` : ""}</td>`;
  }
  function tableFor(w, keigo) {
    const rows = [["present", false, "Present"], ["present", true, "Present negative"], ["past", false, "Past"], ["past", true, "Past negative"]];
    let h = `<table class="conj-table"><thead><tr><th></th><th>Plain</th><th>Polite</th></tr></thead><tbody>`;
    for (const [tense, neg, label] of rows)
      h += `<tr><th>${label}</th>${cell(w, { tense, neg, polite: false, keigo })}${cell(w, { tense, neg, polite: true, keigo })}</tr>`;
    for (const [neg, label] of [[false, "て-form"], [true, "て-form negative"]])
      h += `<tr><th>${label}</th>${cell(w, { tense: "te", neg, polite: false, keigo })}<td class="na"></td></tr>`;
    return h + `</tbody></table>`;
  }
  function openTable(w) {
    $("#dialog-title").innerHTML = `<span class="dlg-word">${toRuby(w.w)}</span> <span class="dlg-meaning">${escapeHtml(w.m)}</span><div class="word-tags">${wordTags(w)}</div>`;
    let body = `<h3>Regular</h3>` + tableFor(w, "none");
    for (const lvl of ["hon", "hum"]) {
      const kd = keigoDict(w, lvl);
      if (kd) body += `<h3>${KEIGO_LABEL[lvl][0]} <span lang="ja">${KEIGO_LABEL[lvl][1]}</span> — <span lang="ja">${toRuby(kd)}</span></h3>` + tableFor(w, lvl);
    }
    if (w.note) body += `<p class="note">${escapeHtml(w.note)}</p>`;
    $("#dialog-body").innerHTML = body;
    $("#table-dialog").showModal();
  }

  /* ---------------- Word list ---------------- */
  let listFilter = "all";
  function renderList() {
    const q = $("#list-search").value.trim().toLowerCase();
    const qk = q ? normalize(q) : "";
    const rows = WORDS.filter((w) => {
      if (listFilter === "pair" ? w.pair === undefined : listFilter !== "all" && typeBucket(w) !== listFilter) return false;
      if (!q) return true;
      return w.m.toLowerCase().includes(q) || toKana(w.w).includes(qk) || toKanji(w.w).includes(q);
    });
    $("#list-count").textContent = `${rows.length} of ${WORDS.length} words`;
    $("#list-body").innerHTML = rows.map((w) => {
      const tr = w.tr ? (w.tr === "t" ? "他 transitive" : "自 intransitive") : "";
      const pair = w.pair !== undefined ? ` ↔ <span lang="ja">${toRuby(WORDS[w.pair].w)}</span>` : "";
      const hon = keigoDict(w, "hon"), hum = keigoDict(w, "hum");
      return `<tr data-id="${w.id}">
        <td class="w" lang="ja">${toRuby(w.w)}</td>
        <td>${escapeHtml(w.m)}</td>
        <td class="muted">${typeLabel(w)}</td>
        <td class="muted">${tr}${pair}</td>
        <td lang="ja">${hon ? toRuby(hon) : ""}</td>
        <td lang="ja">${hum ? toRuby(hum) : ""}</td></tr>`;
    }).join("");
  }

  /* ---------------- Wiring ---------------- */
  function init() {
    applySettingsToInputs();
    buildPool();
    renderStats();
    renderList();
    if (window.wanakana) wanakana.bind($("#answer"), { IMEMode: true });

    $("#settings").addEventListener("change", () => {
      settings = Object.assign({}, DEFAULTS, readSettingsFromInputs());
      store.set("jc-settings", settings);
      buildPool();
      if (!answered) showQuestion();
    });

    $("#answer-form").addEventListener("submit", (e) => { e.preventDefault(); answered ? showQuestion() : check(false); });
    $("#btn-next").addEventListener("click", () => (answered ? showQuestion() : check(false)));
    $("#btn-skip").addEventListener("click", () => (answered ? showQuestion() : check(true)));
    $("#btn-table").addEventListener("click", () => current && openTable(current.w));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && answered && !$("#table-dialog").open && document.activeElement !== $("#btn-next")
          && !$("#view-practice").hidden) { e.preventDefault(); showQuestion(); }
    });
    $("#btn-reset-stats").addEventListener("click", () => {
      stats = { correct: 0, total: 0, streak: 0, best: 0 };
      store.set("jc-stats", stats);
      renderStats();
    });

    $$(".tab").forEach((t) => t.addEventListener("click", () => {
      $$(".tab").forEach((x) => x.classList.toggle("active", x === t));
      $$(".view").forEach((v) => { v.hidden = v.id !== "view-" + t.dataset.view; });
      t.blur();
      if (t.dataset.view === "practice" && !answered) $("#answer").focus();
    }));

    $("#list-search").addEventListener("input", renderList);
    $("#list-filter").addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      listFilter = b.dataset.f;
      $$("#list-filter .chip").forEach((c) => c.classList.toggle("active", c === b));
      renderList();
    });
    $("#list-body").addEventListener("click", (e) => {
      const tr = e.target.closest("tr[data-id]");
      if (tr) openTable(WORDS[+tr.dataset.id]);
    });

    $("#dialog-close").addEventListener("click", () => $("#table-dialog").close());
    $("#table-dialog").addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

    showQuestion();
  }

  init();
})();
