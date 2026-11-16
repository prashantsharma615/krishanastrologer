/* Krishan Astrologer — Future forecast (भविष्यफल).
 * 1) Next 12 months: monthly rating from transits of Sun, Mars, Jupiter, Saturn counted from the natal Moon + running antardasha.
 * 2) Next 5 years: Jupiter and Saturn transits from the natal Moon (incl. Sade Sati / Dhaiya).
 * 3) Dasha timeline (5 years): every antardasha with dates, activated life areas and quality (BPHS Ch. 24, 47–48, 52–60).
 * Uses globals from index.html: K, LANG, positionsAt, julianDayNow, jdToDate, currentMD, antardashas, strength, LORD,
 * HOUSE_MEAN, pn, sn, fmt, hiOrd, esc, MANTRA. Uses KB (js/kb.js) when loaded.
 */
(function () {
  const GOOD = { Sun: [3, 6, 10, 11], Mars: [3, 6, 11], Jupiter: [2, 5, 7, 9, 11], Saturn: [3, 6, 11] };
  const SUN_FOCUS = {
    en: { 1: "self-care and health — keep a steady routine", 2: "family and money — watch spending", 3: "courage, effort and short trips — good results", 4: "home matters — make time to rest", 5: "studies and children — avoid risky bets", 6: "work progress and victory over rivals", 7: "partnerships and travel — be patient with others", 8: "go slow — care for health and avoid hasty decisions", 9: "dharma and elders — some delays possible", 10: "career recognition — a strong month for work", 11: "gains and fulfilled wishes", 12: "expenses and rest — plan your budget" },
    hi: { 1: "स्वयं और स्वास्थ्य का ध्यान — दिनचर्या नियमित रखें", 2: "परिवार और धन — खर्च पर नज़र रखें", 3: "साहस, प्रयास और छोटी यात्राएँ — अच्छे परिणाम", 4: "घर के मामले — आराम के लिए समय निकालें", 5: "पढ़ाई और संतान — जोखिम वाले दाँव से बचें", 6: "काम में प्रगति और विरोधियों पर विजय", 7: "साझेदारी और यात्रा — दूसरों के साथ धैर्य रखें", 8: "धीरे चलें — स्वास्थ्य का ध्यान और जल्दबाज़ी से बचें", 9: "धर्म और बड़ों का साथ — कुछ देरी संभव", 10: "करियर में पहचान — काम के लिए मज़बूत महीना", 11: "लाभ और इच्छाओं की पूर्ति", 12: "खर्च और विश्राम — बजट बनाकर चलें" },
  };
  const TX = {
    en: {
      title: n => `${n ? esc(n) + "'s " : "Your "}Future Forecast`,
      intro: "Based on your Vimshottari dasha (Brihat Parashara Hora Shastra) and the transits of the slow planets from your Moon sign. Astrology shows tendencies and favourable times — it is guidance, not a guaranteed prediction.",
      need: "Enter your birth details to see your personal forecast for the next 12 months and 5 years.", btn: "Enter birth details",
      m12: "Next 12 months", y5: "Year by year (next 5 years)", dt: "Dasha timeline (next 5 years)",
      now: "Now",
      q: { good: "Favourable", mixed: "Mixed", care: "Needs care" },
      dGood: t => `A favourable period — progress is likely in ${t}.`,
      dMixed: t => `A mixed period — ${t} come into focus; steady effort brings results.`,
      dCare: (t, p) => `A period that needs care — be patient in matters of ${t}. Remedies of ${p} help.`,
      jup: (h, t, g) => g ? `Jupiter moves through your ${ord(h)} house from the Moon — it blesses matters of ${t}.` : `Jupiter is in your ${ord(h)} house from the Moon — be patient in matters of ${t}.`,
      sat: (h, t) => [3, 6, 11].includes(h) ? `Saturn in the ${ord(h)} rewards hard work — steady progress in matters of ${t}.` : [12, 1, 2].includes(h) ? `Shani's Sade Sati phase — responsibility and patience; avoid shortcuts.` : [4, 8].includes(h) ? `Shani's Dhaiya — go slow with health, travel and big decisions.` : `Saturn in the ${ord(h)} asks for discipline in ${t}.`,
      remedy: p => `Remedy: chant <span class="mantra">${MANTRA[p][0]}</span> 108 times on ${MANTRA[p][1]}s.`,
      src: "Source: Brihat Parashara Hora Shastra, Ch. 24, 47, 48, 52–60 (dashas). Transit (gochar) ratings follow later classical tradition.",
    },
    hi: {
      title: n => `${n ? esc(n) + " का" : "आपका"} भविष्यफल`,
      intro: "यह आपकी विंशोत्तरी दशा (बृहत् पाराशर होरा शास्त्र) और आपकी चंद्र राशि से धीमे ग्रहों के गोचर पर आधारित है। ज्योतिष प्रवृत्तियाँ और शुभ समय बताता है — यह मार्गदर्शन है, निश्चित भविष्यवाणी नहीं।",
      need: "अगले 12 महीनों और 5 वर्षों का अपना भविष्यफल देखने के लिए जन्म विवरण भरें।", btn: "जन्म विवरण भरें",
      m12: "अगले 12 महीने", y5: "वर्षवार (अगले 5 वर्ष)", dt: "दशा समय-रेखा (अगले 5 वर्ष)",
      now: "अभी",
      q: { good: "शुभ", mixed: "मिश्रित", care: "सावधानी" },
      dGood: t => `शुभ समय — ${t} में प्रगति की संभावना है।`,
      dMixed: t => `मिश्रित समय — ${t} पर ध्यान रहेगा; लगातार प्रयास से परिणाम मिलेंगे।`,
      dCare: (t, p) => `सावधानी का समय — ${t} के मामलों में धैर्य रखें। ${p} के उपाय सहायक हैं।`,
      jup: (h, t, g) => g ? `गुरु चंद्र से ${hiOrd(h)} भाव में गोचर करेंगे — ${t} से जुड़े मामलों में आशीर्वाद।` : `गुरु चंद्र से ${hiOrd(h)} भाव में हैं — ${t} से जुड़े मामलों में धैर्य रखें।`,
      sat: (h, t) => [3, 6, 11].includes(h) ? `शनि ${hiOrd(h)} भाव में मेहनत का फल देंगे — ${t} से जुड़े मामलों में स्थिर प्रगति।` : [12, 1, 2].includes(h) ? `शनि की साढ़ेसाती का चरण — ज़िम्मेदारी और धैर्य; शॉर्टकट से बचें।` : [4, 8].includes(h) ? `शनि की ढैय्या — स्वास्थ्य, यात्रा और बड़े निर्णयों में धीरे चलें।` : `शनि ${hiOrd(h)} भाव में ${t} से जुड़े मामलों में अनुशासन माँगते हैं।`,
      remedy: p => `उपाय: ${MANTRA[p][2]} को <span class="mantra">${MANTRA[p][0]}</span> का 108 बार जाप करें।`,
      src: "स्रोत: बृहत् पाराशर होरा शास्त्र, Ch. 24, 47, 48, 52–60 (दशा)। गोचर की रेटिंग बाद की शास्त्रीय परंपरा पर आधारित है।",
    },
  };
  const ord = h => `${h}${h === 1 ? "st" : h === 2 ? "nd" : h === 3 ? "rd" : "th"}`;
  const short = h => HOUSE_MEAN[LANG][h].split(/,| और | and /)[0].trim();
  const fromMoon = (k, sign) => ((sign - k.planets.Moon.sign + 12) % 12) + 1;
  const sgn = (lon) => Math.floor(lon / 30);
  const stars = n => `<span class="stars">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
  const monthName = jd => jdToDate(jd).toLocaleDateString(LANG === "hi" ? "hi-IN" : "en-IN", { month: "long", year: "numeric" });

  function adQuality(k, md, ad) {
    const P = k.planets;
    const e = window.KB && KB.ready ? KB.find("antardasha", { md, ad }) : null;
    const rel = e ? e.relation : "neutral";
    const pos = ((P[ad].sign - P[md].sign + 12) % 12) + 1;
    let s = { same: 1, friend: 1, neutral: 0, enemy: -1 }[rel];
    s += [1, 4, 5, 7, 9, 10, 11].includes(pos) ? 1 : [6, 8, 12].includes(pos) ? -1 : 0;
    const st = strength(ad, k).s; s += st >= 1 ? 1 : st <= -1 ? -1 : 0;
    return s >= 2 ? "good" : s <= -1 ? "care" : "mixed";
  }
  function themes(k, p) {
    const hs = [];
    for (let h = 1; h <= 12; h++) if (LORD[(k.lagna + h - 1) % 12] === p) hs.push(h);
    const occ = k.planets[p].house; if (!hs.includes(occ)) hs.push(occ);
    return [...new Set(hs.map(short))].slice(0, 3).join(", ");
  }

  window.renderFuture = function () {
    const out = document.getElementById("futureOut"); if (!out) return;
    const X = TX[LANG];
    if (!K) { out.innerHTML = `<div class="banner">${X.need}</div><button class="chip futBirth">${X.btn}</button>`; return; }
    const now = julianDayNow(), k = K;
    // dasha sequence: current + next mahadasha
    const md = currentMD(k), mi = k.dasha.indexOf(md);
    const seq = antardashas(md).map(a => ({ md: md.lord, ...a })).concat(mi + 1 < k.dasha.length ? antardashas(k.dasha[mi + 1]).map(a => ({ md: k.dasha[mi + 1].lord, ...a })) : []);
    const adAt = jd => seq.find(a => jd >= a.start && jd < a.end);
    // 12 months
    let h = `<h2>${X.title(k.inp.name)}</h2><p class="tag" style="text-align:left;margin:0 0 6px">${X.intro}</p>`;
    h += `<h3>📅 ${X.m12}</h3><div class="fgrid">`;
    const d0 = new Date();
    for (let i = 0; i < 12; i++) {
      const dt = new Date(d0.getFullYear(), d0.getMonth() + i, 15, 12);
      const jd = julianDay(dt.getFullYear(), dt.getMonth() + 1, 15, 6.5);
      const P = positionsAt(jd), hs = fromMoon(k, sgn(P.Sun)), hm = fromMoon(k, sgn(P.Mars)), hj = fromMoon(k, sgn(P.Jupiter)), hsa = fromMoon(k, sgn(P.Saturn));
      let sc = (GOOD.Sun.includes(hs) ? 1 : -0.5) + (GOOD.Mars.includes(hm) ? 0.5 : -0.25) + (GOOD.Jupiter.includes(hj) ? 1 : 0) + (GOOD.Saturn.includes(hsa) ? 1 : [12, 1, 2, 4, 8].includes(hsa) ? -0.5 : 0);
      const a = adAt(jd); if (a) { const q = adQuality(k, a.md, a.lord); sc += q === "good" ? 1 : q === "care" ? -0.5 : 0; }
      const n = Math.max(1, Math.min(5, Math.round(2.5 + sc)));
      h += `<div class="fcard"><div class="fm">${monthName(jd)}${i === 0 ? ` <span class="pill">${X.now}</span>` : ""}</div>${stars(n)}<div class="sub" style="margin-top:4px">${SUN_FOCUS[LANG][hs]}</div></div>`;
    }
    h += `</div>`;
    // 5 years
    h += `<h3>🪐 ${X.y5}</h3><div class="flist">`;
    for (let y = 0; y < 5; y++) {
      const yr = d0.getFullYear() + y, jd = julianDay(yr, 7, 1, 6.5), P = positionsAt(jd);
      const hj = fromMoon(k, sgn(P.Jupiter)), hsa = fromMoon(k, sgn(P.Saturn));
      h += `<div class="fyear"><b>${yr}</b><div>${X.jup(hj, short(hj), GOOD.Jupiter.includes(hj))}</div><div>${X.sat(hsa, short(hsa))}</div></div>`;
    }
    h += `</div>`;
    // dasha timeline
    h += `<h3>⏳ ${X.dt}</h3><div class="flist">`;
    for (const a of seq.filter(a => a.end > now && a.start < now + 5 * 365.25)) {
      const q = adQuality(k, a.md, a.lord), t = themes(k, a.lord), cur = now >= a.start && now < a.end;
      const cls = { good: "g", mixed: "", care: "b" }[q];
      const txt = q === "good" ? X.dGood(t) : q === "care" ? X.dCare(t, pn(a.lord)) : X.dMixed(t);
      h += `<div class="fyear${cur ? " dasha-now" : ""}"><b>${fmt(Math.max(a.start, now))} – ${fmt(a.end)}</b> ${cur ? `<span class="pill">${X.now}</span>` : ""}<div>${pn(a.md)} / ${pn(a.lord)} <span class="pill ${cls}">${X.q[q]}</span></div><div>${txt}</div>${q === "care" ? `<div class="sub">${X.remedy(a.lord)}</div>` : ""}</div>`;
    }
    h += `</div><div class="src">📖 ${X.src}</div>`;
    out.innerHTML = h;
  };
})();
