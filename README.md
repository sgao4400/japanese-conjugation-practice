# 活用・漢字 Japanese Practice

A small, dependency-free web app for drilling Japanese verb and adjective conjugations (inspired by [jconj](https://baileysnyder.com/jconj/)) and practicing writing kanji.

**Use it here:** https://sgao4400.github.io/japanese-conjugation-practice/

## Features

- **~300 common words**, each with furigana on every kanji:
  - Common godan, ichidan and irregular verbs (する, 来る, 行く, ある)
  - **Transitive / intransitive pairs** (開ける↔開く, 消す↔消える, 入れる↔入る …), tagged 他動詞 / 自動詞 with a link to the partner verb
  - **する verbs** (勉強する, 説明する, 連絡する …)
  - **い-adjectives** (including irregular いい / かっこいい) and **な-adjectives** (including the tricky きれい, きらい, ゆうめい)
- **Forms practiced:** present / past / て-form × affirmative / negative × plain / polite
- **Keigo:** honorific 尊敬語 and humble 謙譲語 forms
  - Special verbs: いらっしゃる, 召し上がる, ご覧になる, おっしゃる, なさる, ご存じだ, 参る, 伺う, いただく, 拝見する, 申す, いたす, おる …
  - Regular patterns: お待ちになる / お待ちする(いたす), ご説明になる / ご説明する, and 〜れる・〜られる honorifics
  - Only offered for verbs where they make sense (no humble form for 壊れる!)
- Type answers in **romaji or kana** (romaji converts as you type via [WanaKana](https://wanakana.com)), or in kanji
- Multiple correct answers are accepted (e.g. 高くないです / 高くありません, じゃない / ではない)
- Missed questions come back a few questions later
- **Word list** tab with search and filters; click any word for its full conjugation table
- Settings and stats are saved in your browser

### Kanji writing tab

- 166 everyday words that are normally written in kanji (229 different characters). **No kanji appears in more than one word**, and homophones / look-alikes (橋・箸, 紙・神 …) are avoided
- Prompt shows the reading in **katakana or romaji** (toggle) plus the English meaning. Write it on paper, then press **Space** (or the button) to reveal the kanji
- **Stroke order animation** for every character, with stroke numbers, play / pause / replay, a speed slider (0.25×–3×) and a **hold-to-fast-forward** button
- `Space` reveal / next · `←` `→` previous / next · Shuffle

## Running locally

It's a static site — open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```

## Project layout

| File | Purpose |
| --- | --- |
| `js/data.js` | The word list (furigana markup `{漢字|かな}`, verb class, transitivity, keigo info) |
| `js/conjugate.js` | Conjugation engine |
| `js/app.js` | Quiz, word list and conjugation-table UI |
| `js/kanji-data.js` | Kanji writing word list |
| `js/writing.js` | Kanji writing tab and stroke-order player |
| `js/stroke-data.js` | Stroke paths bundled from KanjiVG (generated) |
| `scripts/build_strokes.py` | Regenerates `stroke-data.js` after editing the kanji list |
| `style.css` | Styles (light and dark mode) |

### Adding words

```js
V("{書|か}く", "u", "to write", { tr: "t", k: "hb" });          // godan, transitive, honorific + humble
V("{食|た}べる", "ru", "to eat", { k: "hb", hon: ["{召|め}し{上|あ}がる"], hum: ["いただく"] });
S("{説|せつ}{明|めい}", "to explain", "t", "hb", "ご");            // する verb with ご prefix
I("{高|たか}い", "tall; expensive");                               // い-adjective
N("{静|しず}か", "quiet");                                         // な-adjective
```

See the comment at the top of `js/data.js` for all options.

After changing `js/kanji-data.js`, regenerate the stroke data:

```bash
python scripts/build_strokes.py
```

## Credits

Stroke order data from [KanjiVG](https://kanjivg.tagaini.net) © Ulrich Apel, licensed under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
