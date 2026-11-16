/* Krishan Astrologer — Festival & Vrat calendar (त्योहार और व्रत).
 * Computes, for the next 12 months at a chosen place (birth city or New Delhi):
 *   • Hindu lunar months (amanta, with Adhik maas) from new moons and sidereal solar ingress
 *   • Major festivals by (lunar month, tithi, time-of-day "kaal") — sunrise, madhyahna, aparahna, pradosh, nishita, moonrise
 *   • Monthly vrats: Ekadashi, Purnima, Amavasya, Pradosh, Sankashti Chaturthi, Masik Shivaratri, Sankranti
 * Uses globals from index.html: julianDay, julianDayNow, positionsAt, sunriseJD, norm, sin, cos, R2D, deltaT, geoLon, K, LANG, DAYS, TITHI, PAKSHA, sn.
 */
(function () {
  const MONTH = {
    en: ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashwin", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"],
    hi: ["चैत्र", "वैशाख", "ज्येष्ठ", "आषाढ़", "श्रावण", "भाद्रपद", "आश्विन", "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन"],
  };
  // month = amanta month index (Chaitra 0), tithi 0..29 (0 = Shukla Pratipada, 14 = Purnima, 15 = Krishna Pratipada, 29 = Amavasya)
  const FEST = [
    { id: "vasant", m: 10, t: 4, kaal: "purvahna", en: "Vasant Panchami", hi: "वसंत पंचमी" },
    { id: "shivaratri", m: 10, t: 28, kaal: "nishita", en: "Maha Shivaratri", hi: "महाशिवरात्रि" },
    { id: "holika", m: 11, t: 14, kaal: "pradosh", en: "Holika Dahan", hi: "होलिका दहन" },
    { id: "holi", after: "holika", en: "Holi", hi: "होली" },
    { id: "navratri1", m: 0, t: 0, kaal: "sunrise", en: "Chaitra Navratri begins / Hindu New Year", hi: "चैत्र नवरात्रि आरंभ / हिंदू नववर्ष" },
    { id: "ramnavami", m: 0, t: 8, kaal: "madhyahna", en: "Ram Navami", hi: "राम नवमी" },
    { id: "hanuman", m: 0, t: 14, kaal: "sunrise", en: "Hanuman Jayanti", hi: "हनुमान जयंती" },
    { id: "akshaya", m: 1, t: 2, kaal: "purvahna", en: "Akshaya Tritiya", hi: "अक्षय तृतीया" },
    { id: "buddha", m: 1, t: 14, kaal: "sunrise", en: "Buddha Purnima", hi: "बुद्ध पूर्णिमा" },
    { id: "guru", m: 3, t: 14, kaal: "sunrise", en: "Guru Purnima", hi: "गुरु पूर्णिमा" },
    { id: "nagpanchami", m: 4, t: 4, kaal: "purvahna", en: "Nag Panchami", hi: "नाग पंचमी" },
    { id: "rakhi", m: 4, t: 14, kaal: "udaya6", en: "Raksha Bandhan", hi: "रक्षा बंधन" },
    { id: "janmashtami", m: 4, t: 22, kaal: "nishita", en: "Krishna Janmashtami (Smarta)", hi: "कृष्ण जन्माष्टमी (स्मार्त)" },
    { id: "janmashtamiV", m: 4, t: 22, kaal: "sunrise", en: "Krishna Janmashtami (Vaishnava / ISKCON)", hi: "कृष्ण जन्माष्टमी (वैष्णव / इस्कॉन)" },
    { id: "ganesh", m: 5, t: 3, kaal: "madhyahna", en: "Ganesh Chaturthi", hi: "गणेश चतुर्थी" },
    { id: "pitru", m: 5, t: 29, kaal: "sunrise", en: "Sarva Pitru Amavasya", hi: "सर्व पितृ अमावस्या" },
    { id: "navratri2", m: 6, t: 0, kaal: "sunrise", en: "Sharad Navratri begins", hi: "शारदीय नवरात्रि आरंभ" },
    { id: "durgashtami", m: 6, t: 7, kaal: "sunrise", en: "Durga Ashtami", hi: "दुर्गा अष्टमी" },
    { id: "mahanavami", m: 6, t: 8, kaal: "madhyahna", en: "Maha Navami", hi: "महा नवमी" },
    { id: "dussehra", m: 6, t: 9, kaal: "aparahna", en: "Dussehra (Vijayadashami)", hi: "दशहरा (विजयादशमी)" },
    { id: "sharadpurnima", m: 6, t: 14, kaal: "nishita", en: "Sharad Purnima", hi: "शरद पूर्णिमा" },
    { id: "karwa", m: 6, t: 18, kaal: "moonrise", en: "Karwa Chauth", hi: "करवा चौथ" },
    { id: "dhanteras", m: 6, t: 27, kaal: "pradosh", en: "Dhanteras", hi: "धनतेरस" },
    { id: "narak", m: 6, t: 28, kaal: "sunrise", en: "Narak Chaturdashi (Chhoti Diwali)", hi: "नरक चतुर्दशी (छोटी दिवाली)" },
    { id: "diwali", m: 6, t: 29, kaal: "pradosh", en: "Diwali (Lakshmi Puja)", hi: "दीपावली (लक्ष्मी पूजा)" },
    { id: "govardhan", m: 7, t: 0, kaal: "sunrise", en: "Govardhan Puja", hi: "गोवर्धन पूजा" },
    { id: "bhaidooj", m: 7, t: 1, kaal: "aparahna", en: "Bhai Dooj", hi: "भाई दूज" },
    { id: "chhath", m: 7, t: 5, kaal: "sunrise", en: "Chhath Puja", hi: "छठ पूजा" },
    { id: "devuthani", m: 7, t: 10, kaal: "sunrise", en: "Dev Uthani Ekadashi", hi: "देवउठनी एकादशी" },
    { id: "kartikpurnima", m: 7, t: 14, kaal: "sunrise", en: "Kartik Purnima / Guru Nanak Jayanti", hi: "कार्तिक पूर्णिमा / गुरु नानक जयंती" },
  ];
  const T = {
    en: { nav: "Festivals", title: "Festival & Vrat Calendar", intro: p => `Hindu festivals and monthly vrats for the next 12 months, ${p}. Dates follow the tithi prevailing at the traditional time of each festival, with North Indian (purnimanta) month names.`,
      place: p => `calculated for ${p}`, delhi: "New Delhi", birth: "your birth place", fest: "Festivals", vrat: "Vrats", all: "All",
      ekadashi: (m, pk) => `Ekadashi (${m}, ${pk})`, purnima: m => `Purnima — ${m}`, amavasya: m => `Amavasya — ${m}`, pradosh: "Pradosh Vrat", sankashti: "Sankashti Chaturthi", shivaratri: "Masik Shivaratri",
      sankranti: s => `${s} Sankranti`, makar: "Makar Sankranti", adhik: "Adhik", today: "Today",
      note: "Some festivals can fall a day apart in different traditions (e.g. Smarta vs Vaishnava Janmashtami/Ekadashi) or regions. Confirm the exact muhurat with your local panchang or priest." },
    hi: { nav: "त्योहार", title: "त्योहार और व्रत कैलेंडर", intro: p => `अगले 12 महीनों के हिंदू त्योहार और मासिक व्रत, ${p}। तिथियाँ हर त्योहार के पारंपरिक समय पर चल रही तिथि के अनुसार हैं, और महीनों के नाम उत्तर भारतीय (पूर्णिमांत) पद्धति से।`,
      place: p => `${p} के लिए गणना`, delhi: "नई दिल्ली", birth: "आपके जन्म स्थान", fest: "त्योहार", vrat: "व्रत", all: "सभी",
      ekadashi: (m, pk) => `एकादशी (${m}, ${pk})`, purnima: m => `पूर्णिमा — ${m}`, amavasya: m => `अमावस्या — ${m}`, pradosh: "प्रदोष व्रत", sankashti: "संकष्टी चतुर्थी", shivaratri: "मासिक शिवरात्रि",
      sankranti: s => `${s} संक्रांति`, makar: "मकर संक्रांति", adhik: "अधिक", today: "आज",
      note: "कुछ त्योहार अलग परंपराओं (जैसे स्मार्त और वैष्णव जन्माष्टमी/एकादशी) या क्षेत्रों में एक दिन आगे-पीछे हो सकते हैं। सटीक मुहूर्त के लिए स्थानीय पंचांग या पुरोहित से पुष्टि करें।" },
  };
  const X = () => T[LANG];
  const EKADASHI = {
    en: [["Kamada", "Varuthini"], ["Mohini", "Apara"], ["Nirjala", "Yogini"], ["Devshayani", "Kamika"], ["Shravana Putrada", "Aja"], ["Parivartini", "Indira"], ["Papankusha", "Rama"], ["Dev Uthani", "Utpanna"], ["Mokshada", "Saphala"], ["Pausha Putrada", "Shattila"], ["Jaya", "Vijaya"], ["Amalaki", "Papmochani"]],
    hi: [["कामदा", "वरूथिनी"], ["मोहिनी", "अपरा"], ["निर्जला", "योगिनी"], ["देवशयनी", "कामिका"], ["श्रावण पुत्रदा", "अजा"], ["परिवर्तिनी", "इंदिरा"], ["पापांकुशा", "रमा"], ["देवउठनी", "उत्पन्ना"], ["मोक्षदा", "सफला"], ["पौष पुत्रदा", "षटतिला"], ["जया", "विजया"], ["आमलकी", "पापमोचनी"]],
  };

  // ------------------------------------------------------------------ astronomy helpers
  const elong = jd => { const p = positionsAt(jd); return norm(p.Moon - p.Sun); };
  const tithiAt = jd => Math.floor(elong(jd) / 12);
  const sunSign = jd => Math.floor(positionsAt(jd).Sun / 30);
  function sunsetJD(Y, M, D, lat, lon, tz) {
    let jd = julianDay(Y, M, D, 18 - tz);
    for (let i = 0; i < 4; i++) {
      const T_ = (jd + deltaT(jd) / 86400 - 2451545) / 36525, l = geoLon("Sun", T_), e = 23.439291 - 0.0130042 * T_;
      const ra = norm(Math.atan2(cos(e) * sin(l), cos(l)) * R2D), dec = Math.asin(sin(e) * sin(l)) * R2D;
      const c = (sin(-0.833) - sin(lat) * sin(dec)) / (cos(lat) * cos(dec)); if (c < -1 || c > 1) return jd;
      const H0 = Math.acos(c) * R2D, Tu = (jd - 2451545) / 36525, lst = norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * Tu * Tu + lon);
      let dH = norm(lst - ra - H0); if (dH > 180) dH -= 360; jd -= dH / 360.98564736629;
    }
    return jd;
  }
  // new moon (elongation 0) near jd, by bisection on the elongation
  function newMoonNear(jd) {
    let a = jd - 2, b = jd + 2; const f = x => { const e = elong(x); return e > 180 ? e - 360 : e; };
    for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; }
    return (a + b) / 2;
  }
  function sankrantiNear(jd, sign) { // Sun's sidereal ingress into `sign`, searched in the 3 days around jd
    let a = jd - 2, b = jd + 2; const f = x => { let d = positionsAt(x).Sun - sign * 30; d = ((d + 540) % 360) - 180; return d; };
    if (f(a) * f(b) > 0) return null;
    for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; }
    return (a + b) / 2;
  }

  // ------------------------------------------------------------------ build calendar
  function build(pl, startDay, days) {
    const tz = pl.tz ?? 5.5, out = [];
    // daily frame
    const D = [];
    for (let i = -2; i <= days + 2; i++) {
      const d = new Date(startDay.getTime() + i * 86400000), Y = d.getUTCFullYear(), M = d.getUTCMonth() + 1, Dd = d.getUTCDate();
      const sr = sunriseJD(Y, M, Dd, pl.lat, pl.lon, tz), ss = sunsetJD(Y, M, Dd, pl.lat, pl.lon, tz);
      D.push({ d, sr, ss });
    }
    for (let i = 0; i < D.length - 1; i++) {
      const x = D[i], dl = x.ss - x.sr, night = D[i + 1].sr - x.ss;
      x.kaal = { udaya6: x.sr + 0.1, sunrise: x.sr + 1e-4, purvahna: x.sr + dl * 0.3, madhyahna: x.sr + dl * 0.5, aparahna: x.sr + dl * 0.7, pradosh: x.ss + 48 / 1440, nishita: x.ss + night / 2, moonrise: x.ss + 2.5 / 24 };
      x.ts = {}; for (const k in x.kaal) x.ts[k] = tithiAt(x.kaal[k]);
    }
    D.pop();
    // lunar months from new moons
    const nms = []; let t0 = D[0].sr - 35;
    while (t0 < D[D.length - 1].sr + 35) { const e = elong(t0); const nm = newMoonNear(t0 + (360 - e) / 12.19); if (!nms.length || nm - nms[nms.length - 1] > 20) nms.push(nm); t0 = nm + 25; }
    const months = nms.map((nm, i) => ({ start: nm, s: sunSign(nm) }));
    months.forEach((m, i) => { m.idx = (m.s + 1) % 12; m.adhik = i + 1 < months.length && months[i + 1].s === m.s; });
    const monthAt = jd => { let m = null; for (const x of months) if (x.start <= jd) m = x; return m; };
    const inRange = x => x.d >= startDay && x.d < new Date(startDay.getTime() + days * 86400000);
    const add = (x, type, en, hi, extra) => { if (inRange(x)) out.push(Object.assign({ date: x.d, type, en, hi }, extra || {})); };
    const name = (m, l) => (m.adhik ? T[l].adhik + " " : "") + MONTH[l][m.idx];
    const purn = (m, l, krishna) => (m.adhik ? T[l].adhik + " " : "") + MONTH[l][krishna ? (m.idx + 1) % 12 : m.idx]; // purnimanta name

    // tithis "owned" by a day under the sunrise rule: the one at sunrise plus any that begin and end before the next sunrise
    for (let i = 0; i < D.length; i++) {
      const x = D[i], n = D[i + 1], own = [x.ts.sunrise];
      if (n && n.ts.sunrise !== x.ts.sunrise) for (let t = (x.ts.sunrise + 1) % 30; t !== n.ts.sunrise; t = (t + 1) % 30) { own.push(t); if (own.length > 3) break; }
      x.own = own;
    }
    // festivals, one lunar month at a time: 1) tithi at its kaal, 2) tithi at sunrise, 3) day that owns a skipped tithi
    const found = {};
    months.forEach((M, mi) => {
      if (M.adhik) return; const end = months[mi + 1] ? months[mi + 1].start : M.start + 30;
      const days = D.filter(x => x.sr > M.start - 1.2 && x.sr < end + 1.2);
      for (const f of FEST) {
        if (f.after || f.m !== M.idx) continue;
        const inM = jd => jd >= M.start && jd < end;
        const hit = days.find(x => x.ts[f.kaal] === f.t && (f.kaal !== "udaya6" || x.ts.sunrise === f.t) && inM(x.kaal[f.kaal])) || (f.kaal === "udaya6" ? days.find(x => x.ts.aparahna === f.t && inM(x.kaal.aparahna)) : null) || days.find(x => x.ts.sunrise === f.t && inM(x.sr)) || days.find(x => x.own.includes(f.t) && inM(x.sr + 0.5));
        if (hit) { found[f.id] = hit; add(hit, "fest", f.en, f.hi, { id: f.id }); }
      }
    });
    if (found.janmashtami && found.janmashtamiV === found.janmashtami) { const i = out.findIndex(e => e.id === "janmashtamiV"); if (i >= 0) out.splice(i, 1); const j = out.find(e => e.id === "janmashtami"); if (j) { j.en = "Krishna Janmashtami"; j.hi = "कृष्ण जन्माष्टमी"; } }
    if (found.holika) { const i = D.indexOf(found.holika); if (D[i + 1]) add(D[i + 1], "fest", "Holi", "होली", { id: "holi" }); }

    // monthly vrats
    for (let i = 0; i < D.length; i++) {
      const x = D[i], prev = D[i - 1], m = monthAt(x.sr); if (!m) continue;
      const owns = t => x.own.includes(t) && (!(prev && prev.ts.sunrise === t) || [10, 25].includes(t)), newAt = k => x.ts[k] !== (prev ? prev.ts[k] : -1);
      for (const t of [10, 25]) if (owns(t)) {
        const kr = t === 25 ? 1 : 0, nx = D[i + 1];
        if (nx && x.ts.sunrise === t && nx.ts.sunrise === t) continue;                       // vriddhi: fast on the second day
        let y = x;
        if (!(prev && prev.ts.sunrise === t) && x.ts.sunrise === t && nx && nx.ts.sunrise === (t + 2) % 30 && prev) y = prev; // Dwadashi skipped → a day earlier
        if (m.adhik) add(y, "vrat", `${["Padmini", "Parama"][kr]} Ekadashi (Adhik)`, `${["पद्मिनी", "परमा"][kr]} एकादशी (अधिक मास)`);
        else if (!(m.idx === 7 && !kr)) add(y, "vrat", `${EKADASHI.en[m.idx][kr]} Ekadashi`, `${EKADASHI.hi[m.idx][kr]} एकादशी`);
      }
      if (owns(14)) add(x, "vrat", T.en.purnima(purn(m, "en", false)), T.hi.purnima(purn(m, "hi", false)));
      if (owns(29)) add(x, "vrat", T.en.amavasya(purn(m, "en", true)), T.hi.amavasya(purn(m, "hi", true)));
      if ((x.ts.pradosh === 12 || x.ts.pradosh === 27) && newAt("pradosh")) add(x, "vrat", T.en.pradosh, T.hi.pradosh);
      if (x.ts.moonrise === 18 && newAt("moonrise")) add(x, "vrat", T.en.sankashti, T.hi.sankashti);
      if (x.ts.nishita === 28 && newAt("nishita") && m.idx !== 10) add(x, "vrat", T.en.shivaratri, T.hi.shivaratri);
      // sankranti: Sun changes sidereal sign between this sunrise and the next
      const s1 = sunSign(x.sr), nx = D[i + 1];
      if (nx && sunSign(nx.sr) !== s1) { const s2 = (s1 + 1) % 12, ing = sankrantiNear(x.sr + 0.5, s2);
        // Makar Sankranti: after sunset → next day (punya kaal); other sankrantis (Baisakhi etc.): after local midnight → next day
        const midnight = julianDay(x.d.getUTCFullYear(), x.d.getUTCMonth() + 1, x.d.getUTCDate(), 24 - tz);
        const y = ing !== null && ing > (s2 === 9 ? x.ss : midnight) ? nx : x;
        if (s2 === 9) { add(y, "fest", T.en.makar, T.hi.makar); const yi = D.indexOf(y); if (D[yi - 1]) add(D[yi - 1], "fest", "Lohri", "लोहड़ी"); }
        else if (s2 === 0) add(y, "fest", "Baisakhi / Mesha Sankranti", "बैसाखी / मेष संक्रांति");
        else add(y, "vrat", T.en.sankranti(SIGNS.en[s2]), T.hi.sankranti(SIGNS.hi[s2])); }
    }
    out.sort((a, b) => a.date - b.date || (a.type === "fest" ? -1 : 1));
    return out;
  }

  // ------------------------------------------------------------------ UI
  let filter = "all", cache = null;
  function render() {
    const x = X(), pl = K && K.inp ? K.inp : { lat: 28.6139, lon: 77.2090, tz: 5.5 }, tz = pl.tz ?? 5.5;
    const loc = new Date(Date.now() + tz * 3600000), start = new Date(Date.UTC(loc.getUTCFullYear(), loc.getUTCMonth(), loc.getUTCDate()));
    const key = `${pl.lat},${pl.lon},${start.getTime()}`;
    if (!cache || cache.key !== key) cache = { key, list: build(pl, start, 366) };
    const list = cache.list.filter(e => filter === "all" || e.type === filter);
    const btns = ["all", "fest", "vrat"].map(f => `<button class="tab ${f === filter ? "on" : ""}" data-cf="${f}">${x[f]}</button>`).join("");
    let h = `<h2>${x.title}</h2><p class="tag" style="text-align:left;margin:0 0 10px">${x.intro(x.place(K ? x.birth : x.delhi))}</p><div class="tabs">${btns}</div>`;
    let lastM = "";
    for (const e of list) {
      const d = e.date, mk = d.toLocaleDateString(LANG === "hi" ? "hi-IN" : "en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
      if (mk !== lastM) { if (lastM) h += `</table>`; h += `<h3>${mk}</h3><table>`; lastM = mk; }
      const isToday = d.getTime() === start.getTime();
      h += `<tr class="${isToday ? "dasha-now" : ""}"><td style="white-space:nowrap;width:110px"><b>${d.getUTCDate()}</b> <span class="sub">${DAYS[LANG][d.getUTCDay()]}</span>${isToday ? ` <span class="pill">${x.today}</span>` : ""}</td><td>${e.type === "fest" ? "🪔 <b>" : ""}${e[LANG]}${e.type === "fest" ? "</b>" : ""}</td></tr>`;
    }
    if (lastM) h += `</table>`;
    h += `<p class="sub">${x.note}</p>`;
    const out = document.getElementById("calOut"); out.innerHTML = h;
  }
  function setup() {
    if (document.getElementById("view-cal")) return;
    document.querySelector("nav.nav").insertAdjacentHTML("beforeend", `<button data-view="cal"></button>`);
    const last = [...document.querySelectorAll("main > .view")].pop();
    last.insertAdjacentHTML("afterend", `<div id="view-cal" class="view hidden"><section class="card"><div class="reading" id="calOut"></div></section></div>`);
    document.querySelector('nav.nav button[data-view="cal"]').onclick = () => showView("cal");
    document.getElementById("calOut").addEventListener("click", e => { const b = e.target.closest("[data-cf]"); if (b) { filter = b.dataset.cf; render(); } });
  }
  const label = () => { const b = document.querySelector('nav.nav button[data-view="cal"]'); if (b) b.textContent = X().nav; };
  const _show = window.showView, _lang = window.applyLang;
  window.showView = function (v, noHash) { _show(v, noHash); if (v === "cal") { try { render(); } catch (e) { console.error(e); } } };
  window.applyLang = function () { _lang(); label(); if (typeof VIEW !== "undefined" && VIEW === "cal") render(); };
  function init() { setup(); label(); if (location.hash === "#cal") showView("cal", true); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.FestCal = { build };
})();
