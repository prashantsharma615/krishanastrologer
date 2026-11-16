/* Krishan Astrologer — classical answer engine.
 * Builds every answer from the loaded knowledge base (js/kb.js) and the user's chart.
 * Structure: 1 Problem summary → 2 Astrological reasoning → 3 Prediction & timing → 4 Remedies → Source + "Why?"
 * Uses globals from index.html: K, LANG, AREAS, LORD, PRACTICAL, lordOf, planetsIn, strength, dignityKey,
 * currentMD, antardashas, julianDayNow, fmt, pn, sn, esc, mangalInfo, KW_GOVT.
 */
window.Engine = (function () {
  // ---- which houses and karakas judge each problem area (BPHS Ch. 11 & Ch. 32)
  const AREA = {
    career:   { h: [10, 6], k: ["Sun", "Saturn", "Mercury"] },
    business: { h: [7, 10, 11], k: ["Mercury", "Jupiter"] },
    money:    { h: [2, 11], k: ["Jupiter", "Venus"] },
    marriage: { h: [7], k: ["Venus", "Jupiter"] },
    love:     { h: [5, 7], k: ["Venus", "Moon"] },
    health:   { h: [1, 6], k: ["Sun", "Moon"] },
    education:{ h: [4, 5], k: ["Mercury", "Jupiter"] },
    family:   { h: [4, 2], k: ["Moon", "Jupiter"] },
    legal:    { h: [6], k: ["Mars", "Saturn"] },
    foreign:  { h: [12, 9], k: ["Rahu", "Saturn"] },
    children: { h: [5], k: ["Jupiter"] },
    property: { h: [4], k: ["Mars", "Venus"] },
  };
  const PRO = new Set(["health", "legal", "money", "business"]);
  const KENDRA = [1, 4, 7, 10];
  // graha drishti (BPHS Ch. 26): all aspect the 7th; Mars 4/8, Jupiter 5/9, Saturn 3/10
  const ASPECTS = { Sun: [7], Moon: [7], Mercury: [7], Venus: [7], Mars: [4, 7, 8], Jupiter: [5, 7, 9], Saturn: [3, 7, 10] };
  const COMBUST = { Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15 };
  const isBenefic = (k, p) => p === "Jupiter" || p === "Venus" || p === "Mercury" || (p === "Moon" && norm(k.planets.Moon.lon - k.planets.Sun.lon) < 180);
  const combust = (k, p) => { if (!COMBUST[p]) return false; let d = Math.abs(k.planets[p].lon - k.planets.Sun.lon) % 360; if (d > 180) d = 360 - d; return d < COMBUST[p]; };
  const LORD_SCORE = { lord_own: 2, lord_kt: 2, lord_gain: 1, lord_3: 0, lord_dus: -2 };
  const DIG_SCORE = { exalted: 2, own: 1.5, friend: 0.5, neutral: 0, enemy: -0.5, debilitated: -2 };
  const POS_YOGA = new Set(["gajakesari", "raj", "yogakaraka", "dhan", "ruchaka", "bhadra", "hamsa", "malavya", "sasa", "neechabhanga"]);

  const T = {
    en: {
      h1: "Problem summary", h2: "Astrological reasoning", h3: "Prediction & timing (dasha)", h4: "Remedies (upay)",
      tone: { fav: "Favourable", mix: "Mixed", eff: "Needs effort" },
      summary: (area, q, houses, karakas, tone, intent) =>
        `You asked about <b>${area.toLowerCase()}</b>${q ? `: “${esc(q)}”` : ""}. Following Parashara, this is judged from the ${houses} and the significator${karakas.includes(",") ? "s" : ""} ${karakas}. Overall, your chart shows a <b>${tone.toLowerCase()}</b> picture${intent === "when" ? " — the timing is in section 3" : intent === "why" ? " — the reasons are in section 2" : intent === "remedy" ? " — the remedies are in section 4" : ""}.`,
      houseWord: hs => hs.map(h => `${h}${h === 1 ? "st" : h === 2 ? "nd" : h === 3 ? "rd" : "th"}`).join(" & ") + (hs.length > 1 ? " houses" : " house"),
      bLord: (h, lord, lh, cat) => `Lord of the ${ord(h)} house, <b>${pn(lord)}</b>, is in the ${ord(lh)} house — ${({ lord_own: "its own house, which protects it", lord_kt: "a kendra/trikona, which helps this matter flourish", lord_gain: "a house of gains, which is supportive", lord_3: "the house of effort, so results come through your own work", lord_dus: "a dusthana (6/8/12), which brings delays or obstacles" })[cat]}.`,
      bIn: (p, h, good) => `<b>${pn(p)}</b> sits in the ${ord(h)} house — ${good ? "a supportive placement" : "a placement that asks for effort"}.`,
      bAsp: (p, h, good) => `<b>${pn(p)}</b> aspects the ${ord(h)} house — ${good ? "a protective, supportive influence" : "pressure that calls for patience and effort"}.`,
      bComb: (p, h) => `Lord of the ${ord(h)} house, <b>${pn(p)}</b>, is combust (too close to the Sun), which weakens it.`,
      bKar: (p, s, d, h) => `Significator <b>${pn(p)}</b> is in ${sn(s)} (${({ exalted: "exalted", own: "own sign", friend: "friend's sign", neutral: "neutral sign", enemy: "enemy's sign", debilitated: "debilitated" })[d]}), ${ord(h)} house.`,
      bYoga: (n, extra) => `<b>${n}</b> is present in your chart${extra ? " " + extra : ""}.`,
      kemaCancelled: "(cancelled by planets in kendras, so its effect is mild)",
      kujaMild: "(only from the Moon chart — mild)",
      running: (md, d, ad, d2) => `You are running <b>${pn(md)} Mahadasha</b> (until ${d})${ad ? ` with <b>${pn(ad)} Antardasha</b> (until ${d2})` : ""}.`,
      active: (p, d) => `<b>${pn(p)}</b> is directly linked to this matter, so <b>this is an active period until ${d}</b> — a good time to act.`,
      next: (a, b, p1, p2) => `The current period is not directly linked to this matter. <b>A better window opens from ${a} to ${b}</b> (${pn(p1)} / ${pn(p2)} dasha), when a planet connected to it runs.`,
      none: "The coming dasha periods are not strongly linked to this matter, so results will come mainly through steady effort.",
      adRel: { same: "its own sub-period", friend: "a friendly sub-period", neutral: "a neutral sub-period", enemy: "a sub-period with some friction" },
      adLine: (md, ad, r) => `${pn(ad)} antardasha is ${r} within ${pn(md)} Mahadasha.`,
      remFor: p => `For <b>${pn(p)}</b>`,
      mantra: m => `Chant <span class="mantra">${m}</span> 108 times daily or on its day.`,
      daan: d => `Donate ${d}.`,
      fast: d => `Keep a simple fast or extra prayer on ${d}.`,
      gem: "Gemstones are optional and costly — mantra, charity and good conduct work without any expense. Wear a gem only after a qualified astrologer checks your full chart.",
      steps: "Practical steps",
      pro: {
        health: "Please also consult a qualified doctor for any health concern; astrology does not replace medical care.",
        legal: "Please also take advice from a qualified lawyer; astrology does not replace legal advice.",
        money: "Please also consult a qualified financial adviser before big money decisions; astrology does not replace financial advice.",
        business: "Please also consult a qualified accountant or financial adviser before big business decisions.",
      },
      govt: s => s ? "☀️ The Sun is strong in your chart — supportive for a government job." : "☀️ The Sun needs strengthening — for a government job, put in steady effort and offer water to the Sun on Sundays.",
      source: "Source", srcBook: "Brihat Parashara Hora Shastra", srcTrad: "some remedy details follow later tradition",
      why: "Why? — the rules used", inChart: "In your chart", conf: { derived: "applied from BPHS principles", tradition: "later tradition" },
      also: b => `Also in ${b}`,
    },
    hi: {
      h1: "समस्या सारांश", h2: "ज्योतिषीय कारण", h3: "भविष्यवाणी और समय (दशा)", h4: "उपाय",
      tone: { fav: "अनुकूल", mix: "मिश्रित", eff: "प्रयास आवश्यक" },
      summary: (area, q, houses, karakas, tone, intent) =>
        `आपने <b>${area}</b> के बारे में पूछा है${q ? `: “${esc(q)}”` : ""}। महर्षि पाराशर के अनुसार इसका विचार ${houses} और कारक ग्रह ${karakas} से किया जाता है। कुल मिलाकर आपकी कुंडली में स्थिति <b>${tone}</b> है${intent === "when" ? " — समय भाग 3 में देखें" : intent === "why" ? " — कारण भाग 2 में देखें" : intent === "remedy" ? " — उपाय भाग 4 में देखें" : ""}।`,
      houseWord: hs => hs.map(h => hiOrd(h)).join(" और ") + " भाव",
      bLord: (h, lord, lh, cat) => `${hiOrd(h)} भाव का स्वामी <b>${pn(lord)}</b> ${hiOrd(lh)} भाव में है — ${({ lord_own: "अपने ही भाव में, जो इसे सुरक्षित रखता है", lord_kt: "केंद्र/त्रिकोण में, जिससे यह विषय फलता-फूलता है", lord_gain: "लाभ के भाव में, जो सहायक है", lord_3: "प्रयास के भाव में, इसलिए फल अपनी मेहनत से मिलेगा", lord_dus: "दुःस्थान (6/8/12) में, जिससे देरी या बाधा आती है" })[cat]}।`,
      bIn: (p, h, good) => `<b>${pn(p)}</b> ${hiOrd(h)} भाव में है — ${good ? "यह सहायक स्थिति है" : "यह स्थिति प्रयास माँगती है"}।`,
      bAsp: (p, h, good) => `<b>${pn(p)}</b> की ${hiOrd(h)} भाव पर दृष्टि है — ${good ? "यह रक्षा और सहयोग देती है" : "यह दबाव बनाती है, धैर्य और प्रयास चाहिए"}।`,
      bComb: (p, h) => `${hiOrd(h)} भाव का स्वामी <b>${pn(p)}</b> अस्त है (सूर्य के बहुत निकट), जिससे यह कमज़ोर होता है।`,
      bKar: (p, s, d, h) => `कारक <b>${pn(p)}</b> ${sn(s)} राशि (${({ exalted: "उच्च", own: "स्वराशि", friend: "मित्र राशि", neutral: "सम राशि", enemy: "शत्रु राशि", debilitated: "नीच" })[d]}) में, ${hiOrd(h)} भाव में है।`,
      bYoga: (n, extra) => `आपकी कुंडली में <b>${n}</b> है${extra ? " " + extra : ""}।`,
      kemaCancelled: "(केंद्र में ग्रह होने से भंग, इसलिए प्रभाव हल्का है)",
      kujaMild: "(केवल चंद्र कुंडली से — आंशिक)",
      running: (md, d, ad, d2) => `आपकी <b>${pn(md)} महादशा</b> (${d} तक)${ad ? ` और <b>${pn(ad)} अंतर्दशा</b> (${d2} तक)` : ""} चल रही है।`,
      active: (p, d) => `<b>${pn(p)}</b> सीधे इस विषय से जुड़ा है, इसलिए <b>${d} तक यह सक्रिय समय है</b> — कदम उठाने का अच्छा समय।`,
      next: (a, b, p1, p2) => `वर्तमान दशा इस विषय से सीधे नहीं जुड़ी है। <b>${a} से ${b} तक बेहतर समय</b> आएगा (${pn(p1)} / ${pn(p2)} दशा), जब इससे जुड़ा ग्रह सक्रिय होगा।`,
      none: "आने वाली दशाएँ इस विषय से ज़्यादा नहीं जुड़ी हैं, इसलिए परिणाम मुख्य रूप से लगातार प्रयास से आएगा।",
      adRel: { same: "उसकी अपनी अंतर्दशा", friend: "मित्र ग्रह की अंतर्दशा", neutral: "सम ग्रह की अंतर्दशा", enemy: "कुछ टकराव वाली अंतर्दशा" },
      adLine: (md, ad, r) => `${pn(md)} महादशा में ${pn(ad)} अंतर्दशा ${r} है।`,
      remFor: p => `<b>${pn(p)}</b> के लिए`,
      mantra: m => `रोज़ या उसके दिन <span class="mantra">${m}</span> का 108 बार जाप करें।`,
      daan: d => `${d} दान करें।`,
      fast: d => `${d} को सरल व्रत या विशेष पूजा करें।`,
      gem: "रत्न वैकल्पिक और महँगे हैं — मंत्र, दान और अच्छा आचरण बिना खर्च के काम करते हैं। रत्न केवल योग्य ज्योतिषी द्वारा पूरी कुंडली देखने के बाद ही पहनें।",
      steps: "व्यावहारिक कदम",
      pro: {
        health: "स्वास्थ्य संबंधी किसी भी समस्या के लिए योग्य डॉक्टर से भी सलाह लें; ज्योतिष चिकित्सा का विकल्प नहीं है।",
        legal: "योग्य वकील से भी सलाह लें; ज्योतिष कानूनी सलाह का विकल्प नहीं है।",
        money: "पैसे से जुड़े बड़े निर्णयों से पहले योग्य वित्तीय सलाहकार से भी सलाह लें; ज्योतिष वित्तीय सलाह का विकल्प नहीं है।",
        business: "व्यापार के बड़े निर्णयों से पहले योग्य अकाउंटेंट या वित्तीय सलाहकार से भी सलाह लें।",
      },
      govt: s => s ? "☀️ आपकी कुंडली में सूर्य बलवान है — सरकारी नौकरी के लिए सहायक।" : "☀️ सूर्य को बल देने की ज़रूरत है — सरकारी नौकरी के लिए लगातार मेहनत करें और रविवार को सूर्य को जल चढ़ाएँ।",
      source: "स्रोत", srcBook: "बृहत् पाराशर होरा शास्त्र", srcTrad: "कुछ उपायों का विवरण बाद की परंपरा से",
      why: "क्यों? — उपयोग किए गए नियम", inChart: "आपकी कुंडली में", conf: { derived: "BPHS के सिद्धांतों से लागू", tradition: "बाद की परंपरा" },
      also: b => `${b} में भी`,
    },
  };
  const ord = h => `${h}${h === 1 ? "st" : h === 2 ? "nd" : h === 3 ? "rd" : "th"}`;

  // ---- yoga detection
  function detectYogas(k) {
    const P = k.planets, out = [];
    const fromMoon = p => ((P[p].sign - P.Moon.sign + 12) % 12) + 1;
    const own = p => { const d = dignityKey(p, P[p].sign); return d === "Own" || d === "Exalted"; };
    const assoc = (a, b) => a !== b && (P[a].sign === P[b].sign || (LORD[P[a].sign] === b && LORD[P[b].sign] === a) || (P[a].sign + 6) % 12 === P[b].sign);
    if (KENDRA.includes(fromMoon("Jupiter"))) out.push({ id: "gajakesari" });
    const MP = { Mars: "ruchaka", Mercury: "bhadra", Jupiter: "hamsa", Venus: "malavya", Saturn: "sasa" };
    for (const p in MP) if (own(p) && KENDRA.includes(P[p].house)) out.push({ id: MP[p] });
    const L = h => lordOf(k, h);
    const kl = [4, 7, 10].map(L), tl = [5, 9].map(L);
    const yk = kl.find(p => tl.includes(p));
    if (yk) out.push({ id: "yogakaraka", planet: yk });
    let raj = null;
    for (const a of kl) for (const b of tl) if (!raj && assoc(a, b)) raj = [a, b];
    if (raj) out.push({ id: "raj", pair: raj });
    let dhan = null;
    for (const a of [2, 11].map(L)) for (const b of [1, 5, 9].map(L)) if (!dhan && assoc(a, b)) dhan = [a, b];
    if (dhan) out.push({ id: "dhan", pair: dhan });
    for (const p of ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]) {
      if (dignityKey(p, P[p].sign) !== "Debilitated") continue;
      const c = [LORD[P[p].sign], LORD[EXALT[p]]].filter(q => P[q] && (KENDRA.includes(P[q].house) || KENDRA.includes(fromMoon(q))));
      if (c.length) { out.push({ id: "neechabhanga", planet: p }); break; }
    }
    const five = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    if (!five.some(p => [2, 12].includes(fromMoon(p)))) {
      const cancelled = five.some(p => KENDRA.includes(fromMoon(p)) || KENDRA.includes(P[p].house));
      out.push({ id: "kemadruma", cancelled });
    }
    const m = mangalInfo(k);
    if (m.present) out.push({ id: "kuja", mild: !m.strong || m.reduced });
    return out;
  }

  function strongestAreaFit(y, key) {
    const e = KB.find("yoga", { yoga: y.id });
    return e && (e.areas.includes(key) || (e.areas.includes("general") && POS_YOGA.has(y.id) && ["career", "money", "education"].includes(key)));
  }

  // ---- build one answer
  function areaAnswer(k, key, q, intent) {
    const X = T[LANG], area = AREAS[key].t[LANG], used = [], add = (e, fact) => { if (e && !used.some(u => u.e.id === e.id && u.fact === fact)) used.push({ e, fact }); };
    // marriage: Venus is the spouse significator; for a woman's chart tradition takes Jupiter (husband) first
    const A = key === "marriage" && k.inp && k.inp.gender === 1 ? { h: AREA.marriage.h, k: ["Jupiter", "Venus"] } : AREA[key];
    const rel = new Set(A.k), bullets = [];
    let score = 0;
    // houses + lords + occupants
    for (const h of A.h) {
      add(KB.find("house", { house: h }), X.inChart + ": " + (LANG === "hi" ? `${hiOrd(h)} भाव में ${sn((k.lagna + h - 1) % 12)} राशि` : `${ord(h)} house falls in ${sn((k.lagna + h - 1) % 12)}`));
      const lord = lordOf(k, h), LP = k.planets[lord], lh = LP.house; rel.add(lord);
      const cat = lh === h ? "lord_own" : [1, 4, 5, 7, 9, 10].includes(lh) ? "lord_kt" : [2, 11].includes(lh) ? "lord_gain" : lh === 3 ? "lord_3" : "lord_dus";
      score += LORD_SCORE[cat];
      const line = X.bLord(h, lord, lh, cat); bullets.push(line);
      add(KB.find("principle", { principle: cat }), line.replace(/<[^>]+>/g, ""));
      const ps = KB.find("planet_sign", { planet: lord, sign: LP.sign });
      if (ps) { score += DIG_SCORE[ps.dignity] / 2; add(ps, X.inChart + ": " + (LANG === "hi" ? `${pn(lord)} ${sn(LP.sign)} राशि में` : `${pn(lord)} in ${sn(LP.sign)}`)); }
      for (const p of planetsIn(k, h)) {
        rel.add(p);
        const e = KB.find("planet_house", { planet: p, house: h }), good = e && e.tone === "good";
        score += good ? 1 : -0.5;
        const l = X.bIn(p, h, good); bullets.push(l); add(e, l.replace(/<[^>]+>/g, ""));
      }
      // combust house lord
      if (combust(k, lord)) { score -= 1; const l = X.bComb(lord, h); bullets.push(l); add(KB.find("principle", { principle: "combust" }), l.replace(/<[^>]+>/g, "")); }
      // aspects on the house (planets sitting in it are already counted)
      for (const p in ASPECTS) {
        const P = k.planets[p]; if (!P || P.house === h) continue;
        if (!ASPECTS[p].includes(((h - P.house + 12) % 12) + 1)) continue;
        const good = isBenefic(k, p); score += good ? 0.75 : -0.5; rel.add(p);
        const l = X.bAsp(p, h, good); bullets.push(l); add(KB.find("principle", { principle: good ? "aspect_benefic" : "aspect_malefic" }), l.replace(/<[^>]+>/g, ""));
      }
    }
    // karakas
    add(KB.find("principle", { principle: "karaka" }), "");
    for (const p of A.k) {
      const PP = k.planets[p], e = KB.find("planet_sign", { planet: p, sign: PP.sign });
      if (!e) continue;
      score += DIG_SCORE[e.dignity] + ([6, 8, 12].includes(PP.house) ? -0.5 : 0);
      const l = X.bKar(p, PP.sign, e.dignity, PP.house); bullets.push(l); add(e, l.replace(/<[^>]+>/g, ""));
    }
    // yogas
    for (const y of detectYogas(k).filter(y => strongestAreaFit(y, key))) {
      const e = KB.find("yoga", { yoga: y.id }); if (!e) continue;
      const name = LANG === "hi" ? e.name_hi : e.name_en;
      const extra = y.id === "kemadruma" && y.cancelled ? X.kemaCancelled : y.id === "kuja" && y.mild ? X.kujaMild : y.planet ? `(${pn(y.planet)})` : y.pair ? `(${pn(y.pair[0])} + ${pn(y.pair[1])})` : "";
      score += POS_YOGA.has(y.id) ? 1.5 : (y.id === "kemadruma" && y.cancelled) || (y.id === "kuja" && y.mild) ? 0 : -1;
      const l = X.bYoga(name, extra); bullets.push(l); add(e, l.replace(/<[^>]+>/g, ""));
    }
    const toneK = score >= 2 ? "fav" : score <= -1 ? "eff" : "mix";
    const toneCls = { fav: "g", mix: "", eff: "b" }[toneK];
    // timing
    const now = julianDayNow(), md = currentMD(k), mi = k.dasha.indexOf(md), ads = antardashas(md), ad = ads.find(a => now >= a.start && now < a.end);
    const seq = ads.map(a => ({ md: md.lord, ...a })).concat(mi + 1 < k.dasha.length ? antardashas(k.dasha[mi + 1]).map(a => ({ md: k.dasha[mi + 1].lord, ...a })) : []);
    let timing = X.running(md.lord, fmt(md.end), ad && ad.lord, ad && fmt(ad.end)) + " ";
    add(KB.find("dasha", { md: md.lord }), X.running(md.lord, fmt(md.end)).replace(/<[^>]+>/g, ""));
    if (ad) {
      const ae = KB.find("antardasha", { md: md.lord, ad: ad.lord });
      if (ae) { timing += X.adLine(md.lord, ad.lord, X.adRel[ae.relation]) + " "; add(ae, X.adLine(md.lord, ad.lord, X.adRel[ae.relation])); }
    }
    add(KB.find("principle", { principle: "activation" }), "");
    const activeLord = rel.has(md.lord) ? md.lord : ad && rel.has(ad.lord) ? ad.lord : null;
    if (activeLord) timing += X.active(activeLord, fmt(activeLord === md.lord ? md.end : ad.end));
    else {
      const nx = seq.find(a => a.start > now && (rel.has(a.lord) || rel.has(a.md)));
      timing += nx ? X.next(fmt(nx.start), fmt(nx.end), nx.md, nx.lord) : X.none;
    }
    // remedies
    const ranked = [...rel].filter(p => k.planets[p]).map(p => ({ p, s: strength(p, k).s })).sort((a, b) => a.s - b.s);
    const remP = []; if (ranked.length && ranked[0].s <= 0) remP.push(ranked[0].p);
    if (strength(md.lord, k).s <= 0 && !remP.includes(md.lord)) remP.push(md.lord);
    if (!remP.length) remP.push(A.k[0]);
    let rem = "<ul>";
    for (const p of remP.slice(0, 2)) {
      const r = KB.find("remedy", { planet: p }); if (!r) continue;
      rem += `<li>${X.remFor(p)}: ${X.mantra(r.mantra)} ${X.daan(LANG === "hi" ? r.daan_hi : r.daan_en)} ${X.fast(LANG === "hi" ? r.fast_hi : r.fast_en)} ${LANG === "hi" ? r.practice_hi : r.practice_en}</li>`;
      add(r, X.remFor(p).replace(/<[^>]+>/g, ""));
    }
    rem += `</ul><p class="sub">💎 ${X.gem}</p><p><b>${X.steps}:</b></p><ul>${PRACTICAL[LANG][key].slice(0, 2).map(t => `<li>${t.replace(/^[^:]+:\s*/, "")}</li>`).join("")}</ul>`;
    if (PRO.has(key)) rem += `<p class="pro">⚖️ ${X.pro[key]}</p>`;
    // summary
    const karakas = A.k.map(pn).join(", ");
    let html = `<div><span class="pill ${toneCls}">${area} — ${X.tone[toneK]}</span></div>`;
    html += `<h4 class="ah">① ${X.h1}</h4><p>${X.summary(area, q, X.houseWord(A.h), karakas, X.tone[toneK], intent)}</p>`;
    if (key === "career" && q && KW_GOVT.some(w => q.toLowerCase().includes(w))) bullets.push(X.govt(strength("Sun", k).s >= 1));
    html += `<h4 class="ah">② ${X.h2}</h4><ul>${bullets.map(b => `<li>${b}</li>`).join("")}</ul>`;
    html += `<h4 class="ah">③ ${X.h3}</h4><p${intent === "when" ? ' class="hl"' : ""}>${timing}</p>`;
    html += `<h4 class="ah">④ ${X.h4}</h4>${rem}`;
    // source + why
    const prim = used.filter(u => u.e._book === "bphs");
    const chs = KB.chapters(prim.map(u => u.e));
    const trad = used.some(u => /tradition/i.test(u.e.source));
    // other books (e.g. Phaladeepika) that teach the same rules
    const alsoBooks = {};
    used.forEach(u => KB.findAll(u.e.topic, u.e.match).filter(o => o._book !== "bphs").forEach(o => (alsoBooks[o._book] = alsoBooks[o._book] || []).push(o)));
    const alsoTxt = Object.keys(alsoBooks).map(id => `${KB.book(id)[LANG === "hi" ? "name_hi" : "name_en"]}, Ch. ${KB.chapters(alsoBooks[id])}`).join(" · ");
    html += `<div class="src">📖 ${X.source}: ${X.srcBook}, Ch. ${chs}${alsoTxt ? ` · ${alsoTxt}` : ""}${trad ? ` <span class="sub">(${X.srcTrad})</span>` : ""}</div>`;
    const seen = new Set();
    html += `<details class="why"><summary>${X.why}</summary><ol>` + used.filter(u => !seen.has(u.e.id) && seen.add(u.e.id)).map(u => {
      const others = KB.findAll(u.e.topic, u.e.match).filter(o => o._book !== u.e._book);
      return `<li>${u.fact ? `<b>${esc(u.fact)}</b><br>` : ""}${LANG === "hi" ? u.e.rule_hi : u.e.rule_en}<br><span class="sub">— ${u.e.source}${X.conf[u.e.confidence] ? ` · ${X.conf[u.e.confidence]}` : ""}</span>${others.map(o => `<br><span class="sub">${X.also(KB.book(o._book)[LANG === "hi" ? "name_hi" : "name_en"])}: ${LANG === "hi" ? o.rule_hi : o.rule_en} — ${o.source}</span>`).join("")}</li>`;
    }).join("") + `</ol></details>`;
    return html;
  }

  // ---- language of a question: Devanagari or Hinglish → Hindi, otherwise English
  const HINGLISH = ["kab", "kya", "kyu", "kyon", "kyun", "hai", "hoga", "hogi", "mera", "meri", "mere", "mujhe", "shaadi", "shadi", "naukri", "nahi", "karu", "karun", "kaise", "batao", "lagegi", "milega", "milegi", "paisa", "ghar", "padhai", "bachche", "videsh", "jana", "jaunga", "raha", "rahi", "ka", "ki", "ke", "me", "mein", "upay", "dhandha", "vyapar", "pyar", "pyaar", "rishta"];
  function detectLang(q) {
    if (/[ऀ-ॿ]/.test(q)) return "hi";
    const words = q.toLowerCase().match(/[a-z]+/g) || [];
    return words.some(w => HINGLISH.includes(w)) ? "hi" : "en";
  }
  function withLang(l, fn) { const s = LANG; LANG = l; try { return fn(); } finally { LANG = s; } }

  return { AREA, areaAnswer, detectYogas, detectLang, withLang, get ready() { return KB.ready; } };
})();
