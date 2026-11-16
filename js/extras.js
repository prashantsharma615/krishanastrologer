/* Krishan Astrologer — city search, WhatsApp share, PDF/print, family profiles.
 * Uses globals from index.html: K, LANG, VIEW, CITIES, NAK, pn, sn, fmt, currentMD, antardashas, julianDayNow, applyLang.
 */
(function () {
  const APP_URL = /^https?:/.test(location.href) && !/claude|localhost|usercontent/.test(location.host) ? location.origin + "/" : "https://krishanastrologer.netlify.app/";
  const T = {
    en: { cityPh: "Type city name…", saved: "Saved kundlis:", del: "Remove", share: "📤 Share on WhatsApp", print: "🖨️ Save PDF / Print",
      tz: z => `UTC${z >= 0 ? "+" : ""}${Math.floor(Math.abs(z)) * Math.sign(z || 1)}:${String(Math.round((Math.abs(z) % 1) * 60)).padStart(2, "0")}`,
      head: n => `🔮 ${n ? n + "'s " : "My "}Kundli — Krishan Astrologer`, lagna: "Lagna", rashi: "Moon sign", nak: "Nakshatra", dasha: "Running dasha",
      try: "Make your free kundli in Hindi & English:" },
    hi: { cityPh: "शहर का नाम लिखें…", saved: "सहेजी गई कुंडलियाँ:", del: "हटाएँ", share: "📤 WhatsApp पर शेयर करें", print: "🖨️ PDF सेव / प्रिंट करें",
      tz: z => `UTC${z >= 0 ? "+" : "-"}${Math.floor(Math.abs(z))}:${String(Math.round((Math.abs(z) % 1) * 60)).padStart(2, "0")}`,
      head: n => `🔮 ${n ? n + " की" : "मेरी"} कुंडली — कृष्ण ज्योतिषी`, lagna: "लग्न", rashi: "चंद्र राशि", nak: "नक्षत्र", dasha: "चल रही दशा",
      try: "हिंदी और अंग्रेज़ी में अपनी मुफ़्त कुंडली बनाएँ:" },
  };
  const X = () => T[LANG];
  T.en.tz = z => { const s = z < 0 ? "-" : "+", a = Math.abs(z); return `UTC${s}${Math.floor(a)}:${String(Math.round((a % 1) * 60)).padStart(2, "0")}`; };

  // ---------------- City search ----------------
  const norm = s => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  function filterSelect(sel, q, withCustom) {
    const cur = sel.value; q = norm(q.trim());
    const idx = CITIES.map((c, i) => i).filter(i => !q || norm(CITIES[i][0]).includes(q) || CITIES[i][1].includes(q.trim()));
    const opts = idx.map(i => `<option value="${i}">${LANG === "hi" ? CITIES[i][1] : CITIES[i][0]}</option>`).join("");
    const customOpt = withCustom ? `<option value="custom">${UI[LANG].otherPlace}</option>` : "";
    sel.innerHTML = opts + customOpt;
    if (q) sel.value = idx.length ? String(idx[0]) : (withCustom ? "custom" : "");
    else if (cur) sel.value = cur;
    sel.dispatchEvent(new Event("change"));
  }
  function addSearch(selId, withCustom) {
    const sel = document.getElementById(selId); if (!sel || sel.previousElementSibling?.classList?.contains("csearch")) return;
    const inp = document.createElement("input");
    inp.className = "csearch"; inp.type = "search"; inp.autocomplete = "off";
    sel.parentNode.insertBefore(inp, sel);
    inp.addEventListener("input", () => filterSelect(sel, inp.value, withCustom));
    const info = document.createElement("div"); info.className = "sub cinfo"; sel.parentNode.appendChild(info);
    sel.addEventListener("change", () => { const c = CITIES[+sel.value]; info.textContent = c ? `${c[2].toFixed(2)}°, ${c[3].toFixed(2)}° · ${X().tz(c[4] ?? 5.5)}` : ""; });
  }

  // ---------------- Profiles ----------------
  const KEY = "krishan_profiles";
  const getP = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } };
  const setP = l => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} };
  window.saveProfile = function () {
    let sv; try { sv = JSON.parse(localStorage.getItem("krishan_birth") || "null"); } catch (e) {}
    if (!sv || !sv.inp) return;
    const id = (sv.inp.name || "") + "|" + sv.inp.dob + "|" + sv.inp.tob;
    const l = getP().filter(p => p.id !== id); l.unshift(Object.assign({ id }, sv)); setP(l.slice(0, 12)); renderProfiles();
  };
  function setForm(sv) {
    document.getElementById("name").value = sv.inp.name || "";
    document.getElementById("dob").value = sv.inp.dob;
    const sel = document.getElementById("city"), s = document.querySelector("#city")?.previousElementSibling;
    if (s && s.classList.contains("csearch")) { s.value = ""; filterSelect(sel, "", true); }
    sel.value = sv.city; sel.dispatchEvent(new Event("change"));
    document.getElementById("hh").value = sv.hh; document.getElementById("mm").value = sv.mm; document.getElementById("ap").value = sv.ap;
    if (sv.city === "custom") { document.getElementById("lat").value = sv.inp.lat; document.getElementById("lon").value = sv.inp.lon; document.getElementById("tz").value = sv.inp.tz; }
  }
  function renderProfiles() {
    const box = document.getElementById("profiles"); if (!box) return;
    const l = getP();
    if (!l.length) { box.innerHTML = ""; return; }
    box.innerHTML = `<span class="sub">${X().saved}</span> ` + l.map((p, i) => `<span class="prof"><button class="chip pload" data-i="${i}">👤 ${p.inp.name ? p.inp.name.replace(/[<>&"]/g, "") : p.inp.dob}</button><button class="pdel" data-i="${i}" title="${X().del}" aria-label="${X().del}">✕</button></span>`).join("");
    box.querySelectorAll(".pload").forEach(b => b.onclick = () => { setForm(getP()[+b.dataset.i]); document.getElementById("go").click(); });
    box.querySelectorAll(".pdel").forEach(b => b.onclick = () => { const x = getP(); x.splice(+b.dataset.i, 1); setP(x); renderProfiles(); });
  }

  // ---------------- Share & print ----------------
  function shareText() {
    const L = X(), k = K;
    if (!k) return `${L.try} ${APP_URL}`;
    const md = currentMD(k), now = julianDayNow(), ad = antardashas(md).find(a => now >= a.start && now < a.end);
    const P = k.planets;
    return [L.head(k.inp.name), `${L.lagna}: ${sn(k.lagna)}`, `${L.rashi}: ${sn(P.Moon.sign)}`, `${L.nak}: ${NAK[LANG][P.Moon.nak]}`,
      `${L.dasha}: ${pn(md.lord)}${ad ? " / " + pn(ad.lord) : ""}`, "", `${L.try} ${APP_URL}`].join("\n");
  }
  async function doShare() {
    const text = shareText();
    if (navigator.share) { try { await navigator.share({ text }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
    const a = document.createElement("a"); a.href = "https://wa.me/?text=" + encodeURIComponent(text); a.target = "_blank"; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
  }
  function doPrint() {
    const opened = [...document.querySelectorAll("details:not([open])")];
    opened.forEach(d => d.open = true);
    const restore = () => { opened.forEach(d => d.open = false); window.removeEventListener("afterprint", restore); };
    window.addEventListener("afterprint", restore);
    try { window.print(); } catch (e) {}
  }
  function bars() {
    document.querySelectorAll(".sharebar").forEach(b => {
      b.innerHTML = `<button class="ghost sbtn">${X().share}</button><button class="ghost pbtn">${X().print}</button>`;
      b.querySelector(".sbtn").onclick = doShare; b.querySelector(".pbtn").onclick = doPrint;
    });
  }

  // ---------------- init + language refresh ----------------
  function refresh() {
    document.querySelectorAll(".csearch").forEach(i => i.placeholder = X().cityPh);
    ["city", "b_city", "g_city"].forEach(id => { const s = document.getElementById(id); if (s) s.dispatchEvent(new Event("change")); });
    renderProfiles(); bars();
  }
  window.extrasRefresh = refresh;
  function init() { addSearch("city", true); addSearch("b_city", false); addSearch("g_city", false); refresh(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
