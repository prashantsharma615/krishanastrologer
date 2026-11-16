/* Krishan Astrologer — Shubh Muhurat finder (शुभ मुहूर्त).
 * Scans the next 90 days in 15-minute steps at the chosen place and lists time windows where, for the chosen activity:
 *   • the nakshatra is one recommended for it (Muhurta Chintamani tradition)
 *   • the tithi is not Rikta (4, 9, 14) or Amavasya, the yoga is not one of the 9 inauspicious ones, the karana is not Vishti (Bhadra)
 *   • the weekday is allowed, Rahu Kaal is avoided, and (where tradition requires) Panchak, Kharmas, Chaturmas and
 *     combust Jupiter/Venus are excluded.
 * Uses globals: positionsAt, julianDay, julianDayNow, sunriseJD, norm, NAK, TITHI, PAKSHA, DAYS, K, LANG, FestCal, Vedic.
 */
(function () {
  const ACT = {
    vivah: { en: "Marriage (Vivah)", hi: "विवाह", nak: [3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26], noDays: [2], strict: true },
    griha: { en: "Griha Pravesh (house warming)", hi: "गृह प्रवेश", nak: [3, 4, 11, 13, 16, 20, 22, 23, 25, 26], noDays: [2, 0], strict: true, noPanchak: true },
    vehicle: { en: "Vehicle purchase", hi: "वाहन खरीद", nak: [0, 4, 6, 7, 12, 13, 14, 16, 21, 22, 23, 26], noDays: [2] },
    business: { en: "Business / shop opening", hi: "व्यापार / दुकान आरंभ", nak: [0, 3, 7, 11, 12, 13, 16, 20, 21, 25, 26], noDays: [0, 2, 6] },
    travel: { en: "Travel", hi: "यात्रा", nak: [0, 4, 6, 7, 12, 16, 21, 22, 26], noDays: [], noPanchak: true },
    naming: { en: "Naamkaran (naming ceremony)", hi: "नामकरण", nak: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26], noDays: [2, 6] },
    property: { en: "Property purchase", hi: "संपत्ति खरीद", nak: [3, 4, 9, 11, 13, 16, 18, 20, 25, 26], noDays: [2] },
  };
  const BAD_YOGA = [0, 5, 8, 9, 12, 14, 16, 18, 26];
  const T = {
    en: { nav: "Muhurat", title: "Shubh Muhurat Finder", pick: "Choose the occasion", intro: p => `Auspicious time windows in the next 90 days, ${p}.`, place: p => `for ${p}`, delhi: "New Delhi", birth: "your birth place",
      none: "No suitable window in the next 90 days with these rules.", nak: "Nakshatra", tithi: "Tithi",
      rules: a => `Rules used: recommended nakshatras for ${a}; no Rikta tithi (4th, 9th, 14th) or Amavasya; no inauspicious yoga; no Bhadra (Vishti karana); no Rahu Kaal; avoided weekdays`,
      strict: "; no Kharmas (Sun in Sagittarius or Pisces), no Chaturmas, and Jupiter and Venus not combust", panchak: "; no Panchak",
      note: "These are general auspicious windows. For marriage and house warming, the exact lagna muhurat should be fixed by a priest using both people's kundlis." },
    hi: { nav: "मुहूर्त", title: "शुभ मुहूर्त खोजें", pick: "अवसर चुनें", intro: p => `अगले 90 दिनों के शुभ समय, ${p}।`, place: p => `${p} के लिए`, delhi: "नई दिल्ली", birth: "आपके जन्म स्थान",
      none: "इन नियमों के साथ अगले 90 दिनों में कोई उपयुक्त समय नहीं मिला।", nak: "नक्षत्र", tithi: "तिथि",
      rules: a => `प्रयुक्त नियम: ${a} के लिए शुभ नक्षत्र; रिक्ता तिथि (चतुर्थी, नवमी, चतुर्दशी) और अमावस्या नहीं; अशुभ योग नहीं; भद्रा (विष्टि करण) नहीं; राहु काल नहीं; वर्जित वार नहीं`,
      strict: "; खरमास (सूर्य धनु या मीन में), चातुर्मास नहीं, और गुरु व शुक्र अस्त नहीं", panchak: "; पंचक नहीं",
      note: "ये सामान्य शुभ समय हैं। विवाह और गृह प्रवेश के लिए सटीक लग्न मुहूर्त पुरोहित से दोनों की कुंडली देखकर तय करवाएँ।" },
  };
  const X = () => T[LANG];
  let act = "vivah", cache = {};

  function scan(pl, key) {
    const A = ACT[key], tz = pl.tz ?? 5.5, now = julianDayNow(), step = 15 / 1440, out = [];
    const loc = new Date(Date.now() + tz * 36e5), start = new Date(Date.UTC(loc.getUTCFullYear(), loc.getUTCMonth(), loc.getUTCDate()));
    // Chaturmas spans from the Devshayani to the Dev Uthani Ekadashi
    let chat = [];
    if (A.strict && window.FestCal) {
      const L = FestCal.build(pl, new Date(start.getTime() - 200 * 864e5), 300), ds = L.filter(e => /^Devshayani/.test(e.en)), du = L.filter(e => /Dev Uthani/.test(e.en) && e.type === "fest");
      ds.forEach(d => { const u = du.find(x => x.date > d.date); if (u) chat.push([d.date.getTime(), u.date.getTime()]); });
    }
    for (let i = 0; i < 90; i++) {
      const d = new Date(start.getTime() + i * 864e5), Y = d.getUTCFullYear(), M = d.getUTCMonth() + 1, Dd = d.getUTCDate(), dow = d.getUTCDay();
      if (A.noDays.includes(dow)) continue;
      if (chat.some(([a, b]) => d.getTime() > a && d.getTime() < b)) continue;
      const sr = sunriseJD(Y, M, Dd, pl.lat, pl.lon, tz), n2 = new Date(d.getTime() + 864e5), sr2 = sunriseJD(n2.getUTCFullYear(), n2.getUTCMonth() + 1, n2.getUTCDate(), pl.lat, pl.lon, tz);
      const ssApprox = sr + 0.5, rahuSeg = [8, 2, 7, 5, 6, 4, 3][dow];
      let win = null;
      const close = () => { if (win && win.b - win.a >= 1 / 24) out.push(win); win = null; };
      for (let t = Math.max(sr, now); t < sr2; t += step) {
        const P = positionsAt(t), el = norm(P.Moon - P.Sun), ti = Math.floor(el / 12), nk = Math.floor(P.Moon / (360 / 27)), yg = Math.floor(norm(P.Sun + P.Moon) / (360 / 27));
        const kar = Vedic.karanaOf(el), sunS = Math.floor(P.Sun / 30);
        let ok = A.nak.includes(nk) && ![3, 8, 13, 18, 23, 28, 29].includes(ti) && !BAD_YOGA.includes(yg) && kar !== 6;
        if (ok && A.noPanchak && P.Moon >= 300) ok = false;
        if (ok && A.strict) {
          if (sunS === 8 || sunS === 11) ok = false;
          const sep = q => { let x = Math.abs(P[q] - P.Sun) % 360; return x > 180 ? 360 - x : x; };
          if (sep("Jupiter") < 11 || sep("Venus") < 10) ok = false;
        }
        if (ok && t < ssApprox + 0.1) { const ss = Vedic.sunset ? Vedic.sunset(Y, M, Dd, pl.lat, pl.lon, tz) : ssApprox, seg = (ss - sr) / 8; if (t >= sr + (rahuSeg - 1) * seg && t < sr + rahuSeg * seg) ok = false; }
        if (ok) { if (!win) win = { a: t, b: t + step, date: d, nk, ti }; else win.b = t + step; } else close();
      }
      close();
    }
    return out;
  }
  const clock = (jd, tz) => { const d = new Date((jd - 2440587.5) * 864e5 + tz * 36e5); let h = d.getUTCHours(); const m = String(d.getUTCMinutes()).padStart(2, "0"), ap = h < 12 ? "AM" : "PM"; h = h % 12 || 12; return `${h}:${m} ${ap}`; };
  const dayTxt = (jd, tz) => new Date((jd - 2440587.5) * 864e5 + tz * 36e5).toLocaleDateString(LANG === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

  function render() {
    const x = X(), pl = K && K.inp ? K.inp : { lat: 28.6139, lon: 77.2090, tz: 5.5 }, tz = pl.tz ?? 5.5;
    const key = `${act}|${pl.lat}|${pl.lon}|${new Date().toDateString()}`;
    if (!cache[key]) cache[key] = scan(pl, act);
    const W = cache[key], A = ACT[act];
    let h = `<h2>${x.title}</h2><p class="tag" style="text-align:left;margin:0 0 10px">${x.intro(x.place(K ? x.birth : x.delhi))}</p>`;
    h += `<label>${x.pick}</label><div class="tabs">${Object.keys(ACT).map(k => `<button class="tab ${k === act ? "on" : ""}" data-ma="${k}">${ACT[k][LANG]}</button>`).join("")}</div>`;
    if (!W.length) h += `<p>${x.none}</p>`;
    else {
      let lastM = "";
      for (const w of W) {
        const c = new Date((w.a - 2440587.5) * 864e5 + tz * 36e5); w.date = new Date(Date.UTC(c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate()));   // civil date of the window start
        const mk = w.date.toLocaleDateString(LANG === "hi" ? "hi-IN" : "en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
        if (mk !== lastM) { if (lastM) h += `</table>`; h += `<h3>${mk}</h3><table>`; lastM = mk; }
        const end = dayTxt(w.b, tz) !== dayTxt(w.a, tz) ? `${dayTxt(w.b, tz)}, ${clock(w.b, tz)}` : clock(w.b, tz);
        h += `<tr><td style="white-space:nowrap;width:110px"><b>${w.date.getUTCDate()}</b> <span class="sub">${DAYS[LANG][w.date.getUTCDay()]}</span></td><td>✨ <b>${clock(w.a, tz)} – ${end}</b><br><span class="sub">${x.nak}: ${NAK[LANG][w.nk]} · ${x.tithi}: ${TITHI[LANG][w.ti === 14 ? 14 : w.ti === 29 ? 15 : w.ti % 15]} (${PAKSHA[LANG][w.ti < 15 ? 0 : 1]})</span></td></tr>`;
      }
      h += `</table>`;
    }
    h += `<p class="sub">${x.rules(A[LANG])}${A.strict ? x.strict : ""}${A.noPanchak ? x.panchak : ""}.</p><p class="sub">${x.note}</p>`;
    const out = document.getElementById("muhOut"); out.innerHTML = h;
  }
  function setup() {
    if (document.getElementById("view-muh")) return;
    document.querySelector("nav.nav").insertAdjacentHTML("beforeend", `<button data-view="muh"></button>`);
    const last = [...document.querySelectorAll("main > .view")].pop();
    last.insertAdjacentHTML("afterend", `<div id="view-muh" class="view hidden"><section class="card"><div class="reading" id="muhOut"></div></section></div>`);
    document.querySelector('nav.nav button[data-view="muh"]').onclick = () => showView("muh");
    document.getElementById("muhOut").addEventListener("click", e => { const b = e.target.closest("[data-ma]"); if (b) { act = b.dataset.ma; render(); } });
  }
  const label = () => { const b = document.querySelector('nav.nav button[data-view="muh"]'); if (b) b.textContent = X().nav; };
  const _show = window.showView, _lang = window.applyLang;
  window.showView = function (v, noHash) { _show(v, noHash); if (v === "muh") { try { render(); } catch (e) { console.error(e); } } };
  window.applyLang = function () { _lang(); label(); if (typeof VIEW !== "undefined" && VIEW === "muh") render(); };
  function init() { setup(); label(); if (location.hash === "#muh") showView("muh", true); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.Muhurat = { scan };
})();
