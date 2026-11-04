/*
 * Word list for the conjugation trainer.
 *
 * Markup: {漢字|かな} attaches furigana to a kanji run. Plain kana is left as-is.
 *
 * Verb classes (c):
 *   u     godan (う-verb)            ru    ichidan (る-verb)
 *   suru  する / noun+する            kuru  来る
 *   iku   行く (godan, irregular て/た)
 *   aru   なさる・いらっしゃる・おっしゃる・くださる (godan, masu-stem in い)
 *   aruv  ある (godan, negative is ない)
 * Adjective classes: i (い-adjective), ii (いい-type), na (な-adjective)
 *
 * Verb options:
 *   tr    "t" transitive / "i" intransitive
 *   k     keigo flags: "h" honorific (尊敬語) allowed, "b" humble (謙譲語) allowed
 *   hon   special honorific verbs (replace the regular お〜になる pattern)
 *   hum   special humble verbs   (replace the regular お〜する pattern)
 *         Prefix "ru:" marks an ichidan verb; する / だ endings are detected.
 *   pre   お or ご prefix used for する-verb keigo (ご説明になる / ご説明する)
 *   nr    don't accept the 〜れる/〜られる form as honorific
 *   note  extra study note shown with the word
 */
(function () {
  const WORDS = [];
  let id = 0;
  const add = (o) => { o.id = id++; WORDS.push(o); return o; };
  const V = (w, c, m, o = {}) => add(Object.assign({ pos: "verb", w, c, m, k: "" }, o));
  const A = (w, c, m, o = {}) => add(Object.assign({ pos: "adj", w, c, m }, o));
  const pair = (t, i) => {
    t.tr = "t"; i.tr = "i";
    t.pair = i.id; i.pair = t.id;
  };

  /* ---------- Common verbs ---------- */
  V("{食|た}べる", "ru", "to eat", { tr: "t", k: "hb", hon: ["{召|め}し{上|あ}がる"], hum: ["いただく"] });
  V("{飲|の}む", "u", "to drink", { tr: "t", k: "hb", hon: ["{召|め}し{上|あ}がる"], hum: ["いただく"] });
  V("{見|み}る", "ru", "to see; to watch", { tr: "t", k: "hb", hon: ["ご{覧|らん}になる"], hum: ["{拝|はい}{見|けん}する"] });
  V("{行|い}く", "iku", "to go", { tr: "i", k: "hb", hon: ["いらっしゃる", "おいでになる"], hum: ["{参|まい}る", "{伺|うかが}う"], note: "Irregular て/た form: 行って, 行った" });
  V("{来|く}る", "kuru", "to come", { tr: "i", k: "hb", hon: ["いらっしゃる", "おいでになる", "お{見|み}えになる"], hum: ["{参|まい}る", "{伺|うかが}う"] });
  V("する", "suru", "to do", { tr: "t", k: "hb", hon: ["なさる"], hum: ["いたす"] });
  V("いる", "ru", "to be; to exist (animate)", { tr: "i", k: "hb", hon: ["いらっしゃる", "おいでになる"], hum: ["おる"], nr: 1 });
  V("ある", "aruv", "to be; to exist (inanimate)", { tr: "i", note: "Negative is ない, not あらない" });
  V("{言|い}う", "u", "to say", { tr: "t", k: "hb", hon: ["おっしゃる"], hum: ["{申|もう}す", "ru:{申|もう}し{上|あ}げる"] });
  V("{話|はな}す", "u", "to speak; to talk", { tr: "t", k: "hb" });
  V("{聞|き}く", "u", "to hear; to listen; to ask", { tr: "t", k: "hb", hum: ["{伺|うかが}う", "お{聞|き}きする", "{拝|はい}{聴|ちょう}する"] });
  V("{読|よ}む", "u", "to read", { tr: "t", k: "hb" });
  V("{書|か}く", "u", "to write", { tr: "t", k: "hb" });
  V("{買|か}う", "u", "to buy", { tr: "t", k: "h" });
  V("{待|ま}つ", "u", "to wait", { tr: "t", k: "hb" });
  V("{会|あ}う", "u", "to meet", { tr: "i", k: "hb", hum: ["お{目|め}にかかる", "お{会|あ}いする"] });
  V("{作|つく}る", "u", "to make", { tr: "t", k: "hb" });
  V("{使|つか}う", "u", "to use", { tr: "t", k: "h" });
  V("{分|わ}かる", "u", "to understand", { tr: "i", k: "hb", hum: ["{承|しょう}{知|ち}する", "かしこまる"], nr: 1 });
  V("{知|し}る", "u", "to know; to come to know", { tr: "t", k: "hb", hon: ["ご{存|ぞん}じだ"], hum: ["ru:{存|ぞん}じる", "ru:{存|ぞん}じ{上|あ}げる"], nr: 1, note: "Godan verb despite ending in -iru" });
  V("{思|おも}う", "u", "to think", { tr: "t", k: "hb", hum: ["ru:{存|ぞん}じる"] });
  V("{帰|かえ}る", "u", "to return home", { tr: "i", k: "h", note: "Godan verb despite ending in -eru" });
  V("{寝|ね}る", "ru", "to sleep; to go to bed", { tr: "i", k: "h", hon: ["お{休|やす}みになる"] });
  V("{遊|あそ}ぶ", "u", "to play", { tr: "i", k: "h" });
  V("{死|し}ぬ", "u", "to die", { tr: "i", k: "h", hon: ["お{亡|な}くなりになる"], nr: 1 });
  V("{泳|およ}ぐ", "u", "to swim", { tr: "i", k: "h" });
  V("{歩|ある}く", "u", "to walk", { tr: "i", k: "h" });
  V("{走|はし}る", "u", "to run", { tr: "i", k: "h", note: "Godan verb despite ending in -iru" });
  V("{休|やす}む", "u", "to rest; to take time off", { tr: "i", k: "h" });
  V("{持|も}つ", "u", "to hold; to carry", { tr: "t", k: "hb" });
  V("{着|き}る", "ru", "to wear (upper body)", { tr: "t", k: "h", hon: ["お{召|め}しになる"] });
  V("{住|す}む", "u", "to live (reside)", { tr: "i", k: "h", hon: ["お{住|す}まいになる"] });
  V("{働|はたら}く", "u", "to work", { tr: "i", k: "h" });
  V("{教|おし}える", "ru", "to teach; to tell", { tr: "t", k: "hb" });
  V("{習|なら}う", "u", "to learn (from someone)", { tr: "t", k: "h" });
  V("{覚|おぼ}える", "ru", "to remember; to memorize", { tr: "t", k: "h" });
  V("{忘|わす}れる", "ru", "to forget", { tr: "t", k: "h" });
  V("{借|か}りる", "ru", "to borrow", { tr: "t", k: "hb", hum: ["お{借|か}りする", "{拝|はい}{借|しゃく}する"] });
  V("{貸|か}す", "u", "to lend", { tr: "t", k: "hb" });
  V("{呼|よ}ぶ", "u", "to call; to invite", { tr: "t", k: "hb" });
  V("{送|おく}る", "u", "to send", { tr: "t", k: "hb" });
  V("{座|すわ}る", "u", "to sit", { tr: "i", k: "h", hon: ["お{掛|か}けになる", "お{座|すわ}りになる"] });
  V("{歌|うた}う", "u", "to sing", { tr: "t", k: "h" });
  V("{洗|あら}う", "u", "to wash", { tr: "t", k: "h" });
  V("{撮|と}る", "u", "to take (a photo)", { tr: "t", k: "h" });
  V("{取|と}る", "u", "to take; to pick up", { tr: "t", k: "hb" });
  V("{乗|の}る", "u", "to ride; to get on", { tr: "i", k: "h" });
  V("{降|お}りる", "ru", "to get off; to descend", { tr: "i", k: "h" });
  V("{要|い}る", "u", "to need", { tr: "i", note: "Godan verb despite ending in -iru" });
  V("あげる", "ru", "to give (to others)", { tr: "t", k: "b", hum: ["ru:{差|さ}し{上|あ}げる"] });
  V("もらう", "u", "to receive", { tr: "t", k: "b", hum: ["いただく"] });
  V("くれる", "ru", "to give (to me / my group)", { tr: "t", k: "h", hon: ["くださる"], nr: 1 });
  V("{見|み}せる", "ru", "to show", { tr: "t", k: "hb", hum: ["お{目|め}にかける", "ru:ご{覧|らん}に{入|い}れる"] });
  V("{訪|たず}ねる", "ru", "to visit", { tr: "t", k: "hb", hum: ["{伺|うかが}う", "お{訪|たず}ねする"] });
  V("{答|こた}える", "ru", "to answer", { tr: "i", k: "hb" });
  V("{考|かんが}える", "ru", "to think about; to consider", { tr: "t", k: "h" });
  V("{売|う}る", "u", "to sell", { tr: "t", k: "h" });
  V("{払|はら}う", "u", "to pay", { tr: "t", k: "h" });
  V("{急|いそ}ぐ", "u", "to hurry", { tr: "i", k: "h" });
  V("{頼|たの}む", "u", "to ask (a favor); to request", { tr: "t", k: "h" });
  V("{手|て}{伝|つだ}う", "u", "to help", { tr: "t", k: "hb" });
  V("{出|で}かける", "ru", "to go out", { tr: "i", k: "h" });
  V("{疲|つか}れる", "ru", "to get tired", { tr: "i", k: "h" });
  V("{困|こま}る", "u", "to be troubled", { tr: "i", k: "h" });
  V("{喜|よろこ}ぶ", "u", "to be glad; to rejoice", { tr: "i", k: "h" });
  V("{笑|わら}う", "u", "to laugh; to smile", { tr: "i", k: "h" });
  V("{泣|な}く", "u", "to cry", { tr: "i" });
  V("{登|のぼ}る", "u", "to climb", { tr: "i", k: "h" });
  V("{探|さが}す", "u", "to look for", { tr: "t", k: "hb" });
  V("{選|えら}ぶ", "u", "to choose", { tr: "t", k: "hb" });
  V("{思|おも}い{出|だ}す", "u", "to recall", { tr: "t", k: "h" });
  V("{勝|か}つ", "u", "to win", { tr: "i", k: "h" });
  V("{負|ま}ける", "ru", "to lose", { tr: "i", k: "h" });
  V("{違|ちが}う", "u", "to differ; to be wrong", { tr: "i" });
  V("できる", "ru", "to be able to; to be done", { tr: "i" });
  V("{着|つ}く", "u", "to arrive", { tr: "i", k: "h" });
  V("{飛|と}ぶ", "u", "to fly", { tr: "i" });
  V("{吸|す}う", "u", "to smoke; to inhale", { tr: "t", k: "h" });
  V("{弾|ひ}く", "u", "to play (an instrument)", { tr: "t", k: "h" });
  V("{脱|ぬ}ぐ", "u", "to take off (clothes)", { tr: "t", k: "h" });
  V("{押|お}す", "u", "to push; to press", { tr: "t", k: "h" });
  V("{引|ひ}く", "u", "to pull", { tr: "t", k: "h" });
  V("{置|お}く", "u", "to put; to place", { tr: "t", k: "h" });
  V("{履|は}く", "u", "to wear (shoes, trousers)", { tr: "t", k: "h" });

  /* ---------- Transitive / intransitive pairs (transitive first) ---------- */
  const P = (t, tc, tm, i, ic, im, tk = "hb", ik = "") =>
    pair(V(t, tc, tm, { k: tk, group: "pair" }), V(i, ic, im, { k: ik, group: "pair" }));
  P("{開|あ}ける", "ru", "to open (something)", "{開|あ}く", "u", "(something) opens");
  P("{閉|し}める", "ru", "to close (something)", "{閉|し}まる", "u", "(something) closes");
  P("{始|はじ}める", "ru", "to begin (something)", "{始|はじ}まる", "u", "(something) begins");
  P("{終|お}える", "ru", "to finish (something)", "{終|お}わる", "u", "(something) ends");
  P("{付|つ}ける", "ru", "to turn on; to attach", "{付|つ}く", "u", "to be turned on; to be attached");
  P("{消|け}す", "u", "to turn off; to erase", "{消|き}える", "ru", "to go out; to disappear");
  P("{入|い}れる", "ru", "to put in", "{入|はい}る", "u", "to enter", "hb", "h");
  P("{出|だ}す", "u", "to take out; to submit", "{出|で}る", "ru", "to go out; to leave", "hb", "h");
  P("{落|お}とす", "u", "to drop", "{落|お}ちる", "ru", "to fall");
  P("{壊|こわ}す", "u", "to break (something)", "{壊|こわ}れる", "ru", "to break; to be broken", "h");
  P("{起|お}こす", "u", "to wake (someone); to cause", "{起|お}きる", "ru", "to wake up; to happen", "hb", "h");
  P("{止|と}める", "ru", "to stop (something)", "{止|と}まる", "u", "to stop; to come to a halt");
  P("{決|き}める", "ru", "to decide", "{決|き}まる", "u", "to be decided", "h");
  P("{変|か}える", "ru", "to change (something)", "{変|か}わる", "u", "to change", "hb", "h");
  P("{集|あつ}める", "ru", "to collect; to gather", "{集|あつ}まる", "u", "to gather; to assemble", "hb", "h");
  P("{上|あ}げる", "ru", "to raise", "{上|あ}がる", "u", "to rise; to go up", "h");
  P("{下|さ}げる", "ru", "to lower", "{下|さ}がる", "u", "to go down; to drop", "hb");
  P("{届|とど}ける", "ru", "to deliver", "{届|とど}く", "u", "to arrive; to reach");
  P("{直|なお}す", "u", "to fix; to repair", "{直|なお}る", "u", "to be fixed");
  P("{見|み}つける", "ru", "to find", "{見|み}つかる", "u", "to be found", "h");
  P("{戻|もど}す", "u", "to return (something)", "{戻|もど}る", "u", "to return; to go back", "hb", "h");
  P("{返|かえ}す", "u", "to give back", "{返|かえ}る", "u", "to be returned");
  P("{続|つづ}ける", "ru", "to continue (something)", "{続|つづ}く", "u", "to continue", "h");
  P("{増|ふ}やす", "u", "to increase (something)", "{増|ふ}える", "ru", "to increase", "h");
  P("{減|へ}らす", "u", "to reduce", "{減|へ}る", "u", "to decrease", "h");
  P("{並|なら}べる", "ru", "to line up (things)", "{並|なら}ぶ", "u", "to line up; to queue", "hb", "h");
  P("{渡|わた}す", "u", "to hand over", "{渡|わた}る", "u", "to cross", "hb", "h");
  P("{残|のこ}す", "u", "to leave behind", "{残|のこ}る", "u", "to remain", "h", "h");
  P("{育|そだ}てる", "ru", "to raise; to bring up", "{育|そだ}つ", "u", "to grow up", "h", "h");
  P("{沸|わ}かす", "u", "to boil (water)", "{沸|わ}く", "u", "to boil", "hb");
  P("{冷|ひ}やす", "u", "to chill", "{冷|ひ}える", "ru", "to get cold", "hb");
  P("{乾|かわ}かす", "u", "to dry (something)", "{乾|かわ}く", "u", "to become dry", "h");
  P("{汚|よご}す", "u", "to make dirty", "{汚|よご}れる", "ru", "to get dirty", "h");
  P("{倒|たお}す", "u", "to knock down", "{倒|たお}れる", "ru", "to fall over; to collapse", "h", "h");
  P("{割|わ}る", "u", "to break; to split", "{割|わ}れる", "ru", "to break; to crack", "h");
  P("{焼|や}く", "u", "to bake; to grill", "{焼|や}ける", "ru", "to be baked; to burn", "hb");
  P("{折|お}る", "u", "to fold; to snap", "{折|お}れる", "ru", "to break; to be folded", "h");
  P("{切|き}る", "u", "to cut", "{切|き}れる", "ru", "to be cut; to run out", "hb");
  P("{回|まわ}す", "u", "to turn (something)", "{回|まわ}る", "u", "to turn; to go around", "h", "h");
  P("{動|うご}かす", "u", "to move (something)", "{動|うご}く", "u", "to move", "h", "h");
  P("{建|た}てる", "ru", "to build", "{建|た}つ", "u", "to be built", "h");
  P("{立|た}てる", "ru", "to stand (something) up", "{立|た}つ", "u", "to stand", "h", "h");
  P("{片|かた}{付|づ}ける", "ru", "to tidy up", "{片|かた}{付|づ}く", "u", "to be tidied up", "hb");
  P("{助|たす}ける", "ru", "to help; to save", "{助|たす}かる", "u", "to be saved; to be helped", "hb", "h");
  P("{伝|つた}える", "ru", "to convey; to tell", "{伝|つた}わる", "u", "to be conveyed", "hb");
  P("{隠|かく}す", "u", "to hide (something)", "{隠|かく}れる", "ru", "to hide", "h", "h");
  P("{通|とお}す", "u", "to let through", "{通|とお}る", "u", "to pass through", "hb", "h");
  P("{無|な}くす", "u", "to lose (something)", "{無|な}くなる", "u", "to be lost; to run out", "h");

  /* ---------- する verbs ---------- */
  const S = (n, m, tr, k = "h", pre = "") => V(n + "する", "suru", m, { tr, k, pre, group: "suru" });
  S("{勉|べん}{強|きょう}", "to study", "t");
  S("{料|りょう}{理|り}", "to cook", "t");
  S("{運|うん}{転|てん}", "to drive", "t");
  S("{掃|そう}{除|じ}", "to clean", "t");
  S("{洗|せん}{濯|たく}", "to do laundry", "t");
  S("{練|れん}{習|しゅう}", "to practice", "t");
  S("{研|けん}{究|きゅう}", "to research", "t");
  S("{散|さん}{歩|ぽ}", "to take a walk", "i");
  S("{留|りゅう}{学|がく}", "to study abroad", "i");
  S("{運|うん}{動|どう}", "to exercise", "i");
  S("{失|しっ}{敗|ぱい}", "to fail", "i");
  S("{努|ど}{力|りょく}", "to make an effort", "i");
  S("{結|けっ}{婚|こん}", "to marry", "i", "h", "ご");
  S("{旅|りょ}{行|こう}", "to travel", "i", "h", "ご");
  S("{心|しん}{配|ぱい}", "to worry", "t", "h", "ご");
  S("{出|しゅっ}{発|ぱつ}", "to depart", "i", "h", "ご");
  S("{到|とう}{着|ちゃく}", "to arrive", "i", "h", "ご");
  S("{参|さん}{加|か}", "to participate", "i", "h", "ご");
  S("{卒|そつ}{業|ぎょう}", "to graduate", "i", "h", "ご");
  S("{入|にゅう}{学|がく}", "to enter a school", "i", "h", "ご");
  S("{電|でん}{話|わ}", "to telephone", "i", "hb", "お");
  S("{返|へん}{事|じ}", "to reply", "i", "hb", "お");
  S("{約|やく}{束|そく}", "to promise", "t", "hb", "お");
  S("{説|せつ}{明|めい}", "to explain", "t", "hb", "ご");
  S("{連|れん}{絡|らく}", "to contact", "i", "hb", "ご");
  S("{準|じゅん}{備|び}", "to prepare", "t", "hb", "ご");
  S("{案|あん}{内|ない}", "to guide; to show around", "t", "hb", "ご");
  S("{紹|しょう}{介|かい}", "to introduce", "t", "hb", "ご");
  S("{質|しつ}{問|もん}", "to ask a question", "i", "hb", "ご");
  S("{予|よ}{約|やく}", "to reserve", "t", "hb", "ご");
  S("{相|そう}{談|だん}", "to consult", "i", "hb", "ご");
  S("{利|り}{用|よう}", "to use; to make use of", "t", "hb", "ご");
  S("{報|ほう}{告|こく}", "to report", "t", "hb", "ご");
  S("{注|ちゅう}{文|もん}", "to order", "t", "hb", "ご");
  S("{確|かく}{認|にん}", "to confirm", "t", "hb", "ご");
  S("{招|しょう}{待|たい}", "to invite", "t", "hb", "ご");

  /* ---------- い-adjectives ---------- */
  const I = (w, m, o) => A(w, "i", m, o);
  I("{高|たか}い", "tall; expensive");
  I("{安|やす}い", "cheap");
  I("{大|おお}きい", "big");
  I("{小|ちい}さい", "small");
  I("{新|あたら}しい", "new");
  I("{古|ふる}い", "old (things)");
  A("いい", "ii", "good", { note: "Irregular: conjugates from よい (よくない, よかった)" });
  A("{格好|かっこ}いい", "ii", "cool; good-looking", { note: "Conjugates like いい (かっこよくない)" });
  I("{悪|わる}い", "bad");
  I("{暑|あつ}い", "hot (weather)");
  I("{寒|さむ}い", "cold (weather)");
  I("{熱|あつ}い", "hot (to the touch)");
  I("{冷|つめ}たい", "cold (to the touch)");
  I("{暖|あたた}かい", "warm");
  I("{涼|すず}しい", "cool (weather)");
  I("{長|なが}い", "long");
  I("{短|みじか}い", "short");
  I("{早|はや}い", "early");
  I("{速|はや}い", "fast");
  I("{遅|おそ}い", "slow; late");
  I("{多|おお}い", "many; numerous");
  I("{少|すく}ない", "few");
  I("{近|ちか}い", "near");
  I("{遠|とお}い", "far");
  I("{強|つよ}い", "strong");
  I("{弱|よわ}い", "weak");
  I("{難|むずか}しい", "difficult");
  I("{易|やさ}しい", "easy");
  I("{優|やさ}しい", "kind; gentle");
  I("{面|おも}{白|しろ}い", "interesting; funny");
  I("つまらない", "boring");
  I("{楽|たの}しい", "fun; enjoyable");
  I("{嬉|うれ}しい", "happy; glad");
  I("{悲|かな}しい", "sad");
  I("{忙|いそが}しい", "busy");
  I("{美味|おい}しい", "delicious");
  I("まずい", "bad-tasting");
  I("{甘|あま}い", "sweet");
  I("{辛|から}い", "spicy");
  I("{痛|いた}い", "painful");
  I("{若|わか}い", "young");
  I("{広|ひろ}い", "spacious; wide");
  I("{狭|せま}い", "narrow; cramped");
  I("{明|あか}るい", "bright");
  I("{暗|くら}い", "dark");
  I("{重|おも}い", "heavy");
  I("{軽|かる}い", "light (weight)");
  I("{白|しろ}い", "white");
  I("{黒|くろ}い", "black");
  I("{赤|あか}い", "red");
  I("{青|あお}い", "blue");
  I("{可愛|かわい}い", "cute");
  I("{怖|こわ}い", "scary");
  I("{汚|きたな}い", "dirty");
  I("{危|あぶ}ない", "dangerous");
  I("{眠|ねむ}い", "sleepy");
  I("{欲|ほ}しい", "wanted; desirable");

  /* ---------- な-adjectives ---------- */
  const N = (w, m, o) => A(w, "na", m, o);
  N("{静|しず}か", "quiet");
  N("{有|ゆう}{名|めい}", "famous", { note: "な-adjective (not an い-adjective)" });
  N("{元|げん}{気|き}", "healthy; energetic");
  N("{便|べん}{利|り}", "convenient");
  N("{不|ふ}{便|べん}", "inconvenient");
  N("{親|しん}{切|せつ}", "kind");
  N("{簡|かん}{単|たん}", "simple; easy");
  N("{大|たい}{切|せつ}", "important; precious");
  N("{大|だい}{丈|じょう}{夫|ぶ}", "all right; OK");
  N("{好|す}き", "liked");
  N("{大|だい}{好|す}き", "loved; really liked");
  N("{嫌|きら}い", "disliked", { note: "Ends in い, but it is a な-adjective" });
  N("{綺麗|きれい}", "pretty; clean", { note: "Ends in い, but it is a な-adjective" });
  N("{上手|じょうず}", "skillful; good at");
  N("{下手|へた}", "unskillful; bad at");
  N("{暇|ひま}", "free (time)");
  N("{大|たい}{変|へん}", "tough; terrible");
  N("{残|ざん}{念|ねん}", "regrettable");
  N("{安|あん}{全|ぜん}", "safe");
  N("{危|き}{険|けん}", "dangerous");
  N("{自|じ}{由|ゆう}", "free (freedom)");
  N("{真面目|まじめ}", "serious; diligent");
  N("{丁|てい}{寧|ねい}", "polite; careful");
  N("{複|ふく}{雑|ざつ}", "complicated");
  N("{特|とく}{別|べつ}", "special");
  N("{必|ひつ}{要|よう}", "necessary");
  N("{幸|しあわ}せ", "happy");
  N("{賑|にぎ}やか", "lively");
  N("{素|す}{敵|てき}", "lovely; wonderful");
  N("{無|む}{理|り}", "impossible; unreasonable");
  N("{十|じゅう}{分|ぶん}", "enough; sufficient");
  N("{健|けん}{康|こう}", "healthy");
  N("{派|は}{手|で}", "flashy");
  N("{地|じ}{味|み}", "plain; subdued");

  window.WORDS = WORDS;
})();
