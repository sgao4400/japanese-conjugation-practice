/*
 * Conjugation engine. Works directly on furigana markup ({漢字|かな}), so every
 * generated answer can be rendered with furigana and compared as kana or kanji.
 *
 * A "form" is { tense: "present" | "past" | "te", neg: bool, polite: bool,
 *               keigo: "none" | "hon" | "hum" }.
 * conjugate(word, form) returns an array of accepted answers (markup strings),
 * primary answer first, or null if the form doesn't apply to the word.
 */
(function () {
  const GODAN = {
    "う": ["わ", "い", "って"], "く": ["か", "き", "いて"], "ぐ": ["が", "ぎ", "いで"],
    "す": ["さ", "し", "して"], "つ": ["た", "ち", "って"], "ぬ": ["な", "に", "んで"],
    "ぶ": ["ば", "び", "んで"], "む": ["ま", "み", "んで"], "る": ["ら", "り", "って"],
  };
  const MARK = /\{([^|}]+)\|([^}]+)\}/g;

  const toKana = (s) => s.replace(MARK, "$2");
  const toKanji = (s) => s.replace(MARK, "$1");
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const toRuby = (s, furigana = true) =>
    furigana ? esc(s).replace(MARK, "<ruby>$1<rt>$2</rt></ruby>") : esc(toKanji(s));
  const hasKanji = (s) => s.includes("{");
  const teToTa = (s) => s.replace(/て$/, "た").replace(/で$/, "だ");
  const uniq = (a) => [...new Set(a)];

  /* Stems: a = negative base (before ない), i = masu-stem, te = て-form, nai = plain negative */
  function stems(w, c) {
    if (c === "suru") {
      const n = w.slice(0, -2);
      return { dict: w, a: n + "し", i: n + "し", te: n + "して", nai: n + "しない", noun: n };
    }
    if (c === "kuru") {
      const k = w.startsWith("{") ? (r) => `{来|${r}}` : (r) => r;
      return { dict: w, a: k("こ"), i: k("き"), te: k("き") + "て", nai: k("こ") + "ない" };
    }
    const base = w.slice(0, -1);
    if (c === "ru") return { dict: w, a: base, i: base, te: base + "て", nai: base + "ない" };
    const row = GODAN[w.slice(-1)];
    if (!row) throw new Error("Unknown godan ending: " + w);
    const s = { dict: w, a: base + row[0], i: base + row[1], te: base + row[2] };
    if (c === "iku") s.te = base + "って";
    if (c === "aru") s.i = base + "い";
    s.nai = c === "aruv" ? "ない" : s.a + "ない";
    return s;
  }

  function conjVerb(w, c, f) {
    const s = stems(w, c);
    const naiStem = s.nai.slice(0, -1); // 〜な
    if (f.tense === "te") return f.neg ? [s.nai + "で", naiStem + "くて"] : [s.te];
    if (f.tense === "present") {
      if (f.polite) return f.neg ? [s.i + "ません", s.nai + "です"] : [s.i + "ます"];
      return f.neg ? [s.nai] : [s.dict];
    }
    if (f.polite) return f.neg ? [s.i + "ませんでした", naiStem + "かったです"] : [s.i + "ました"];
    return f.neg ? [naiStem + "かった"] : [teToTa(s.te)];
  }

  function conjI(w, c, f) {
    const st = c === "ii" ? w.slice(0, -2) + "よ" : w.slice(0, -1);
    if (f.tense === "te") return f.neg ? [st + "くなくて"] : [st + "くて"];
    if (f.tense === "present") {
      if (f.polite) return f.neg ? [st + "くないです", st + "くありません"] : [w + "です"];
      return f.neg ? [st + "くない"] : [w];
    }
    if (f.polite) return f.neg ? [st + "くなかったです", st + "くありませんでした"] : [st + "かったです"];
    return f.neg ? [st + "くなかった"] : [st + "かった"];
  }

  function conjNa(s, f) {
    const j = ["じゃ", "では"];
    if (f.tense === "te") return f.neg ? j.map((x) => s + x + "なくて") : [s + "で"];
    if (f.tense === "present") {
      if (f.polite) return f.neg
        ? [...j.map((x) => s + x + "ありません"), ...j.map((x) => s + x + "ないです")]
        : [s + "です"];
      return f.neg ? j.map((x) => s + x + "ない") : [s + "だ", s];
    }
    if (f.polite) return f.neg
      ? [...j.map((x) => s + x + "ありませんでした"), ...j.map((x) => s + x + "なかったです")]
      : [s + "でした"];
    return f.neg ? j.map((x) => s + x + "なかった") : [s + "だった"];
  }

  /* Parse a keigo override like "ru:{申|もう}し{上|あ}げる" into { w, c } */
  function parseBase(str) {
    if (str.startsWith("ru:")) return { w: str.slice(3), c: "ru" };
    if (str.endsWith("する")) return { w: str, c: "suru" };
    if (str.endsWith("だ")) return { w: str.slice(0, -1), c: "na" };
    if (/(なさる|いらっしゃる|おっしゃる|くださる)$/.test(str)) return { w: str, c: "aru" };
    return { w: str, c: "u" };
  }

  /* The 〜れる / 〜られる form, accepted as an alternative honorific */
  function passive(word) {
    const s = stems(word.w, word.c);
    if (word.c === "suru") return { w: s.noun + "される", c: "ru" };
    if (word.c === "kuru") return { w: s.a + "られる", c: "ru" };
    if (word.c === "ru") return { w: s.a + "られる", c: "ru" };
    if (word.c === "aruv") return null;
    return { w: s.a + "れる", c: "ru" };
  }

  /* Base verbs for honorific / humble speech, primary first. null = not used. */
  function keigoBases(word, level) {
    if (word.pos !== "verb") return null;
    const flag = level === "hon" ? "h" : "b";
    if (!word.k || !word.k.includes(flag)) return null;
    const override = level === "hon" ? word.hon : word.hum;
    let bases;
    if (override) bases = override.map(parseBase);
    else if (word.c === "suru") {
      const n = stems(word.w, word.c).noun, p = word.pre || "";
      bases = level === "hon"
        ? (p ? [p + n + "になる", p + n + "なさる", n + "なさる"] : [n + "なさる"]).map(parseBase)
        : (p ? [p + n + "する", p + n + "いたす", n + "いたす"] : [n + "いたす"]).map(parseBase);
    } else {
      const i = stems(word.w, word.c).i;
      bases = level === "hon"
        ? [{ w: "お" + i + "になる", c: "u" }]
        : [{ w: "お" + i + "する", c: "suru" }, { w: "お" + i + "いたす", c: "u" }];
    }
    if (level === "hon" && !word.nr) {
      const p = passive(word);
      if (p) bases.push(p);
    }
    return bases;
  }

  function conjBase(b, f) {
    if (b.c === "na") return conjNa(b.w, f);
    return conjVerb(b.w, b.c, f);
  }

  function conjugate(word, form) {
    if (word.pos === "adj") {
      if (form.keigo && form.keigo !== "none") return null;
      return uniq(word.c === "na" ? conjNa(word.w, form) : conjI(word.w, word.c, form));
    }
    if (!form.keigo || form.keigo === "none") return uniq(conjVerb(word.w, word.c, form));
    const bases = keigoBases(word, form.keigo);
    if (!bases) return null;
    return uniq(bases.flatMap((b) => conjBase(b, form)));
  }

  /* Dictionary form of the primary honorific / humble verb, for display */
  function keigoDict(word, level) {
    const b = keigoBases(word, level);
    if (!b) return null;
    return b[0].c === "na" ? b[0].w + "だ" : b[0].w;
  }

  const TYPE_LABEL = {
    u: "Godan (う-verb)", ru: "Ichidan (る-verb)", suru: "する verb", kuru: "Irregular",
    iku: "Godan (irregular て-form)", aruv: "Godan (irregular negative)",
    i: "い-adjective", ii: "い-adjective (irregular)", na: "な-adjective",
  };
  const typeLabel = (word) => (word.w === "する" ? "Irregular" : TYPE_LABEL[word.c]);
  /* Bucket used by the type filter */
  const typeBucket = (word) => {
    if (word.w === "する" || word.c === "kuru") return "irregular";
    if (word.c === "suru") return "suru";
    if (word.c === "ru") return "ichidan";
    if (word.pos === "verb") return "godan";
    return word.c === "na" ? "na" : "i";
  };

  window.Conj = { conjugate, keigoBases, keigoDict, toKana, toKanji, toRuby, hasKanji, typeLabel, typeBucket };
})();
