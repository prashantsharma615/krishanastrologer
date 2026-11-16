/* Krishan Astrologer — Future forecast (भविष्यफल), built entirely on the BPHS knowledge base.
 * 1) Mahadasha overview — KB dasha rule + houses the dasha lord owns/occupies (BPHS Ch. 46–48)
 * 2) Next 12 months — pratyantar dashas inside the running antardasha(s) (BPHS Ch. 61)
 * 3) 5-year antardasha timeline — KB antardasha rule, position from the Mahadasha lord, themes, remedy (BPHS Ch. 24, 52–60, 84)
 * Every section ends with a Source line and an expandable "Why?" list of the KB rules used.
 * Uses globals from index.html: K, LANG, julianDayNow, currentMD, antardashas, strength, LORD, DYEARS, DLORDS,
 * pn, sn, fmt, hiOrd, esc, dignityKey, MANTRA; and KB from js/kb.js.
 */
(function () {
  const TX = {
    en: {
      title: n => `${n ? esc(n) + "'s " : "Your "}Future Forecast`,
      intro: "Calculated from your Vimshottari dasha using the rules of Brihat Parashara Hora Shastra. Astrology shows tendencies and favourable times — it is guidance, not a guaranteed prediction.",
      need: "Enter your birth details to see your personal forecast.", btn: "Enter birth details", wait: "Loading the BPHS knowledge base…",
      mdT: "Mahadasha overview", pdT: "Next 12 months (pratyantar dasha)", adT: "Antardasha timeline (next 5 years)",
      now: "Now", next: "Next", q: { good: "Favourable", mixed: "Mixed", care: "Needs care" },
      mdLine: (p, a, b, hs, occ, dg, disp) => `<b>${pn(p)} Mahadasha</b> (${a} – ${b}). In your chart ${pn(p)} ${hs ? `rules ${hs} and ` : ""}sits in the ${occ}${dg ? `, ${dg}` : ""}${disp ? `; as a shadow planet it acts like its sign lord <b>${pn(disp)}</b>` : ""}.`,
      mdFocus: t => `Main areas activated: <b>${t}</b>.`,
      good: t => `A favourable period — progress is likely in ${t}.`,
      mixed: t => `A mixed period — ${t} come into focus; steady effort brings results.`,
      care: (t, p) => `A period that needs care — be patient in matters of ${t}. Remedies of ${p} help.`,
      pos: (n, above) => `${ord(n)} from the ${above} lord`,
      remedy: p => `Remedy: chant <span class="mantra">${MANTRA[p][0]}</span> 108 times, especially on ${MANTRA[p][1]}.`,
      house: h => `${ord(h)} house`, and: " and ", mdW: "Mahadasha", adW: "antardasha",
      src: "Source", book: "Brihat Parashara Hora Shastra", why: "Why? — the BPHS rules used", inChart: "In your chart",
      dign: { Exalted: "exalted", Debilitated: "debilitated", Own: "in its own sign" },
    },
    hi: {
      title: n => `${n ? esc(n) + " का" : "आपका"} भविष्यफल`,
      intro: "यह आपकी विंशोत्तरी दशा से बृहत् पाराशर होरा शास्त्र के नियमों द्वारा निकाला गया है। ज्योतिष प्रवृत्तियाँ और शुभ समय बताता है — यह मार्गदर्शन है, निश्चित भविष्यवाणी नहीं।",
      need: "अपना भविष्यफल देखने के लिए जन्म विवरण भरें।", btn: "जन्म विवरण भरें", wait: "BPHS ज्ञानकोश लोड हो रहा है…",
      mdT: "महादशा का सार", pdT: "अगले 12 महीने (प्रत्यंतर दशा)", adT: "अंतर्दशा समय-रेखा (अगले 5 वर्ष)",
      now: "अभी", next: "अगली", q: { good: "शुभ", mixed: "मिश्रित", care: "सावधानी" },
      mdLine: (p, a, b, hs, occ, dg, disp) => `<b>${pn(p)} महादशा</b> (${a} – ${b})। आपकी कुंडली में ${pn(p)} ${hs ? hs + " का स्वामी है और " : ""}${occ} में${dg ? ` ${dg}` : ""} बैठा है${disp ? `; छाया ग्रह होने से यह अपनी राशि के स्वामी <b>${pn(disp)}</b> जैसा फल देता है` : ""}।`,
      mdFocus: t => `मुख्य रूप से सक्रिय क्षेत्र: <b>${t}</b>।`,
      good: t => `शुभ समय — ${t} में प्रगति की संभावना है।`,
      mixed: t => `मिश्रित समय — ${t} पर ध्यान रहेगा; लगातार प्रयास से परिणाम मिलेंगे।`,
      care: (t, p) => `सावधानी का समय — ${t} के मामलों में धैर्य रखें। ${p} के उपाय सहायक हैं।`,
      pos: (n, above) => `${above} स्वामी से ${hiOrd(n)} स्थान`,
      remedy: p => `उपाय: विशेषकर ${MANTRA[p][2]} को <span class="mantra">${MANTRA[p][0]}</span> का 108 बार जाप करें।`,
      house: h => `${hiOrd(h)} भाव`, and: " और ", mdW: "महादशा", adW: "अंतर्दशा",
      src: "स्रोत", book: "बृहत् पाराशर होरा शास्त्र", why: "क्यों? — उपयोग किए गए BPHS नियम", inChart: "आपकी कुंडली में",
      dign: { Exalted: "उच्च का होकर", Debilitated: "नीच का होकर", Own: "स्वराशि में" },
    },
  };
  const ord = h => `${h}${h === 1 ? "st" : h === 2 ? "nd" : h === 3 ? "rd" : "th"}`;
  const strip = s => s.replace(/<[^>]+>/g, "");

  const housesOf = (k, p) => { const hs = []; for (let h = 1; h <= 12; h++) if (LORD[(k.lagna + h - 1) % 12] === p) hs.push(h); return hs; };
  const isNode = p => p === "Rahu" || p === "Ketu";
  function themes(k, p) {
    const hs = housesOf(k, p), occ = k.planets[p].house; if (!hs.includes(occ)) hs.unshift(occ);
    if (isNode(p)) housesOf(k, LORD[k.planets[p].sign]).forEach(h => { if (!hs.includes(h)) hs.push(h); });
    const t = [];
    for (const h of hs) { const e = KB.find("house", { house: h }); if (e) { const w = (LANG === "hi" ? e.signif_hi : e.signif_en).split(/,| और | and /)[0].trim(); if (!t.includes(w)) t.push(w); } }
    return t.slice(0, 3).join(", ");
  }
  function relation(a, b) { // attitude of a towards b, from the KB graha entries (BPHS Ch. 3)
    if (a === b) return "same";
    const g = KB.find("graha", { planet: a });
    return g.friends.includes(b) ? "friend" : g.enemies.includes(b) ? "enemy" : "neutral";
  }
  function quality(k, lordAbove, lord) {
    const P = k.planets, pos = ((P[lord].sign - P[lordAbove].sign + 12) % 12) + 1;
    let s = { same: 1, friend: 1, neutral: 0, enemy: -1 }[relation(lord, lordAbove)];
    s += [1, 4, 5, 7, 9, 10, 11].includes(pos) ? 1 : [6, 8, 12].includes(pos) ? -1 : 0;
    const st = strength(lord, k).s; s += st >= 1 ? 1 : st <= -1 ? -1 : 0;
    return { q: s >= 2 ? "good" : s <= -1 ? "care" : "mixed", pos };
  }
  function subPeriods(parent, lordAbove) { // Vimshottari subdivision (BPHS Ch. 46)
    const i = DLORDS.indexOf(lordAbove), len = parent.end - parent.start, out = []; let s = parent.start;
    for (let j = 0; j < 9; j++) { const l = DLORDS[(i + j) % 9], d = len * DYEARS[l] / 120; out.push({ lord: l, start: s, end: s + d }); s += d; }
    return out;
  }
  function sourceBlock(X, used) {
    used = used.filter(u => u.e);
    const seen = new Set();
    return `<div class="src">📖 ${X.src}: ${X.book}, Ch. ${KB.chapters(used.map(u => u.e))}</div><details class="why"><summary>${X.why}</summary><ol>` +
      used.filter(u => { const key = u.e.id + "|" + u.fact; if (seen.has(key)) return false; seen.add(key); return true; })
        .map(u => `<li>${u.fact ? `<b>${esc(u.fact)}</b><br>` : ""}${LANG === "hi" ? u.e.rule_hi : u.e.rule_en}<br><span class="sub">— ${u.e.source}</span></li>`).join("") + `</ol></details>`;
  }
  const qCls = { good: "g", mixed: "", care: "b" };
  const qText = (X, q, t, p) => q === "good" ? X.good(t) : q === "care" ? X.care(t, pn(p)) : X.mixed(t);

  window.renderFuture = function () {
    const out = document.getElementById("futureOut"); if (!out) return;
    const X = TX[LANG];
    if (!K) { out.innerHTML = `<div class="banner">${X.need}</div><button class="chip futBirth">${X.btn}</button>`; return; }
    if (!window.KB || !KB.ready) { out.innerHTML = `<p class="sub">${X.wait}</p>`; return; }
    const k = K, now = julianDayNow(), md = currentMD(k), mi = k.dasha.indexOf(md), horizon = now + 5 * 365.25;
    let h = `<h2>${X.title(k.inp.name)}</h2><p class="tag" style="text-align:left;margin:0 0 6px">${X.intro}</p>`;

    // 1) Mahadasha overview
    let used = [{ e: KB.find("principle", { principle: "dasha_houses" }), fact: "" }];
    h += `<h3>🕉️ ${X.mdT}</h3><div class="flist">`;
    for (const d of k.dasha.slice(mi, mi + 2).filter(d => d.start < horizon)) {
      const p = d.lord, hs = housesOf(k, p).map(X.house).join(X.and), occ = X.house(k.planets[p].house), dg = X.dign[dignityKey(p, k.planets[p].sign)] || "";
      const de = KB.find("dasha", { md: p }), cur = d === md;
      const line = X.mdLine(p, fmt(Math.max(d.start, k.jd)), fmt(d.end), hs, occ, dg, isNode(p) ? LORD[k.planets[p].sign] : null);
      used.push({ e: de, fact: strip(line) });
      used.push({ e: KB.find("planet_sign", { planet: p, sign: k.planets[p].sign }), fact: `${X.inChart}: ${pn(p)} — ${sn(k.planets[p].sign)}` });
      used.push({ e: KB.find("planet_house", { planet: p, house: k.planets[p].house }), fact: `${X.inChart}: ${pn(p)} — ${X.house(k.planets[p].house)}` });
      h += `<div class="fyear${cur ? " dasha-now" : ""}"><span class="pill">${cur ? X.now : X.next}</span> ${line}<div>${X.mdFocus(themes(k, p))}</div><div class="sub" style="margin-top:4px">${LANG === "hi" ? de.rule_hi : de.rule_en}</div></div>`;
    }
    h += `</div>` + sourceBlock(X, used);

    // 2) Next 12 months — pratyantar dashas
    used = [{ e: KB.find("principle", { principle: "pratyantar" }), fact: "" }];
    const adSeq = antardashas(md).map(a => ({ md: md.lord, ...a })).concat(mi + 1 < k.dasha.length ? antardashas(k.dasha[mi + 1]).map(a => ({ md: k.dasha[mi + 1].lord, ...a })) : []);
    const year = now + 365.25;
    h += `<h3>📅 ${X.pdT}</h3><div class="flist">`;
    for (const ad of adSeq.filter(a => a.end > now && a.start < year)) {
      for (const pd of subPeriods(ad, ad.lord).filter(p => p.end > now && p.start < year)) {
        const { q, pos } = quality(k, ad.lord, pd.lord), cur = now >= pd.start && now < pd.end;
        used.push({ e: KB.find("graha", { planet: pd.lord }), fact: `${pn(ad.lord)} / ${pn(pd.lord)}: ${X.pos(pos, X.adW)}` });
        h += `<div class="fyear${cur ? " dasha-now" : ""}"><b>${fmt(Math.max(pd.start, now))} – ${fmt(pd.end)}</b> ${cur ? `<span class="pill">${X.now}</span>` : ""}<div>${pn(ad.md)} / ${pn(ad.lord)} / ${pn(pd.lord)} <span class="pill ${qCls[q]}">${X.q[q]}</span></div><div>${qText(X, q, themes(k, pd.lord), pd.lord)}</div>${q === "care" ? `<div class="sub">${X.remedy(pd.lord)}</div>` : ""}</div>`;
      }
    }
    h += `</div>` + sourceBlock(X, used);

    // 3) Antardasha timeline — 5 years
    used = [{ e: KB.find("principle", { principle: "ad_position" }), fact: "" }, { e: KB.find("principle", { principle: "activation" }), fact: "" }];
    h += `<h3>⏳ ${X.adT}</h3><div class="flist">`;
    for (const a of adSeq.filter(a => a.end > now && a.start < horizon)) {
      const { q, pos } = quality(k, a.md, a.lord), cur = now >= a.start && now < a.end, ae = KB.find("antardasha", { md: a.md, ad: a.lord });
      used.push({ e: ae, fact: `${pn(a.md)} / ${pn(a.lord)}: ${X.pos(pos, X.mdW)}` });
      if (q === "care") used.push({ e: KB.find("remedy", { planet: a.lord }), fact: "" });
      h += `<div class="fyear${cur ? " dasha-now" : ""}"><b>${fmt(Math.max(a.start, now))} – ${fmt(a.end)}</b> ${cur ? `<span class="pill">${X.now}</span>` : ""}<div>${pn(a.md)} / ${pn(a.lord)} <span class="pill ${qCls[q]}">${X.q[q]}</span></div><div>${qText(X, q, themes(k, a.lord), a.lord)}</div><div class="sub">${LANG === "hi" ? ae.rule_hi : ae.rule_en}</div>${q === "care" ? `<div class="sub">${X.remedy(a.lord)}</div>` : ""}</div>`;
    }
    h += `</div>` + sourceBlock(X, used);
    out.innerHTML = h;
  };
})();
