/* Krishan Astrologer — "Install app" button for Android and iPhone.
 * Android / Chrome / Edge: uses the browser's install prompt (beforeinstallprompt).
 * iPhone / iPad: Safari has no prompt, so we show the "Share → Add to Home Screen" steps.
 * Hidden automatically when the app is already running as an installed app.
 */
(function () {
  const TX = {
    en: { title: "Install Krishan Astrologer", close: "Got it",
      ios: ["Open this page in <b>Safari</b> on your iPhone or iPad.", "Tap the <b>Share</b> button <span class='ico'>⬆︎</span> at the bottom (or top on iPad).", "Scroll down and tap <b>Add to Home Screen</b>.", "Tap <b>Add</b>. The app icon appears on your home screen."],
      android: ["Open this page in <b>Chrome</b>.", "Tap the menu <span class='ico'>⋮</span> at the top right.", "Tap <b>Install app</b> or <b>Add to Home screen</b>.", "Tap <b>Install</b>. The app icon appears on your home screen."],
      desktop: ["In Chrome or Edge, click the <b>install icon</b> <span class='ico'>⊕</span> in the address bar.", "Click <b>Install</b>."],
      iosNote: "On iPhone it works like a normal app — full screen, with its own icon — and updates automatically.",
      androidNote: "Coming soon on the Google Play Store too." },
    hi: { title: "कृष्ण ज्योतिषी ऐप इंस्टॉल करें", close: "ठीक है",
      ios: ["यह पेज अपने iPhone या iPad में <b>Safari</b> में खोलें।", "नीचे (iPad में ऊपर) <b>Share</b> बटन <span class='ico'>⬆︎</span> दबाएँ।", "नीचे स्क्रॉल करके <b>Add to Home Screen</b> दबाएँ।", "<b>Add</b> दबाएँ। ऐप का आइकन होम स्क्रीन पर आ जाएगा।"],
      android: ["यह पेज <b>Chrome</b> में खोलें।", "ऊपर दाईं ओर मेन्यू <span class='ico'>⋮</span> दबाएँ।", "<b>Install app</b> या <b>Add to Home screen</b> दबाएँ।", "<b>Install</b> दबाएँ। ऐप का आइकन होम स्क्रीन पर आ जाएगा।"],
      desktop: ["Chrome या Edge में एड्रेस बार में <b>इंस्टॉल आइकन</b> <span class='ico'>⊕</span> दबाएँ।", "<b>Install</b> दबाएँ।"],
      iosNote: "iPhone पर यह सामान्य ऐप की तरह चलता है — पूरी स्क्रीन, अपना आइकन — और अपने-आप अपडेट होता है।",
      androidNote: "जल्द ही Google Play Store पर भी उपलब्ध।" },
  };
  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const standalone = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  let deferred = null;

  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; });
  window.addEventListener("appinstalled", () => { deferred = null; hideBtn(); });

  function hideBtn() { const b = document.getElementById("installBtn"); if (b) b.classList.add("hidden"); }
  function showModal() {
    const L = TX[(window.LANG_CURRENT && window.LANG_CURRENT()) || "en"];
    const steps = isIOS ? L.ios : isAndroid ? L.android : L.desktop;
    const m = document.getElementById("installModal");
    m.querySelector(".im-body").innerHTML =
      `<h2>📲 ${L.title}</h2><div class="im-plat">${isIOS ? "iPhone / iPad" : isAndroid ? "Android" : "Computer"}</div>` +
      `<ol>${steps.map(s => `<li>${s}</li>`).join("")}</ol><p class="sub">${isIOS ? L.iosNote : L.androidNote}</p>` +
      `<div class="row" style="justify-content:flex-end"><button class="im-close">${L.close}</button></div>`;
    m.classList.remove("hidden");
    m.querySelector(".im-close").onclick = () => m.classList.add("hidden");
  }
  async function onClick() {
    if (deferred) {
      deferred.prompt();
      try { await deferred.userChoice; } catch (e) {}
      deferred = null;
      return;
    }
    showModal();
  }
  document.addEventListener("DOMContentLoaded", init);
  if (document.readyState !== "loading") init();
  function init() {
    const b = document.getElementById("installBtn"); if (!b || b.dataset.ready) return;
    b.dataset.ready = "1";
    if (standalone()) return hideBtn();
    b.onclick = onClick;
    const m = document.getElementById("installModal");
    m.addEventListener("click", e => { if (e.target === m) m.classList.add("hidden"); });
  }
})();
