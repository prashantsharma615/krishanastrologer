/* Krishan Astrologer — extra Vedic features:
 *  • Divisional & transit charts: Navamsa (D9), Dashamsa (D10), Chandra kundli, Gochar + transit results (Phaladeepika Ch. 26)
 *  • Avakahada chakra, birth panchang, naming letter, gemstones, lucky day/colour/number
 *  • Full daily panchang: yoga, karana, sunrise/sunset, Rahu Kaal, Yamaganda, Gulika, Abhijit, day & night Choghadiya
 *  • Numerology (Ank Jyotish): Mulank, Bhagyank, name number (Chaldean)
 * Uses globals from index.html (positions, tables, translations) and wraps render / renderRashifal / showView / applyLang.
 */
(function () {
  // ------------------------------------------------------------------ text
  const T = {
    en: {
      akT: "Ashtakavarga", akIntro: "Bindus (benefic points) each planet gives to every house, counted from your Lagna (BPHS Ch. 66–72). The bottom row is the Sarvashtakavarga (SAV): 28 is average, 30 or more is strong, below 25 is weak.",
      akHouse: "House", akSav: "SAV",
      akStrong: hs => hs.length ? `Strong houses (30+ bindus): <b>${hs.join(", ")}</b> — their matters give good results with less effort.` : "",
      akWeak: hs => hs.length ? `Weaker houses (below 25): <b>${hs.join(", ")}</b> — these need more patience and remedies.` : "",
      akTransit: (p, s, b, t) => `${p} is now transiting ${s}, where it has <b>${b}</b> of 8 bindus (SAV ${t}) — ${b >= 4 ? "a supportive transit for you" : "a transit that asks for patience"}.`,
      akNote: "Traditionally a planet transiting a sign where it has 4 or more bindus in its own Ashtakavarga gives good results.",
      moreT: "More Charts", d9: "Navamsa (D9)", d10: "Dashamsa (D10)", chandra: "Chandra Kundli", gochar: "Gochar (Transit)",
      cap: {
        d9: "Navamsa (D9) — the most important divisional chart: shows the strength of planets, marriage and spouse, and inner potential (BPHS Ch. 6–7).",
        d10: "Dashamsa (D10) — the chart of career, profession, status and achievements (BPHS Ch. 6–7).",
        chandra: "Chandra Kundli — houses counted from your Moon sign; used for Gochar, Sade Sati and daily predictions.",
        gochar: n => `Gochar — where the planets are today, placed in houses from your Moon sign (${n}).`,
      },
      trT: "Today's transits from your Moon sign", trPlanet: "Planet", trSign: "Transit sign", trHouse: "From Moon", trRes: "Result",
      good: "Favourable", hard: "Needs care",
      trNote: "Transit results follow Phaladeepika Ch. 26 (favourable houses counted from the natal Moon). Vedha (obstruction) is not applied.",
      avT: "Avakahada Chakra & Birth Details",
      av: { varna: "Varna", vashya: "Vashya", yoni: "Yoni", gana: "Gana", nadi: "Nadi", nakLord: "Nakshatra lord", rashiLord: "Rashi lord", lagnaLord: "Lagna lord",
        tatva: "Tatva (element)", letter: "Naming letters", btithi: "Birth tithi", byoga: "Birth yoga", bkarana: "Birth karana", bvaar: "Birth day (vaar)", paya: "Paya" },
      tatva: ["Fire", "Earth", "Air", "Water"], paya: ["Gold", "Silver", "Copper", "Iron"],
      letterNote: (l, all) => `Your nakshatra pada letter is <b>${l}</b> (all letters of your nakshatra: ${all}).`,
      gemT: "Gemstones & lucky factors", life: "Life stone (Lagna lord)", lucky: "Lucky stone (9th lord)", punya: "Punya stone (5th lord)",
      luckyDay: "Lucky day", luckyNum: "Lucky number", luckyCol: "Lucky colour",
      gemNote: "Gemstones are optional and costly. Mantra, charity and good conduct work without any expense. Wear a gem only after a qualified astrologer checks your full chart — especially Blue Sapphire (Neelam), Hessonite (Gomed) and Cat's eye (Lehsunia).",
      pT: "Muhurat & Choghadiya", place: p => `For ${p}`, delhi: "New Delhi", birthPlace: "your birth place",
      p: { nak: "Nakshatra", yoga: "Yoga", karana: "Karana", sunrise: "Sunrise", sunset: "Sunset", rahu: "Rahu Kaal", yama: "Yamaganda", gulika: "Gulika Kaal", abhijit: "Abhijit Muhurat", panchak: "Panchak" },
      panchakOn: t => `In force until ${t}`, panchakTip: "Panchak is running now — avoid travelling south, roof work, buying wood and making a bed or cot until it ends.",
      avoid: "Avoid starting new work in Rahu Kaal, Yamaganda and Gulika Kaal.", abhijitWed: "Abhijit Muhurat is traditionally not used on Wednesdays.",
      chDay: "Day Choghadiya", chNight: "Night Choghadiya", now: "Now",
      chQ: { good: "Good", mid: "Neutral", bad: "Avoid" },
      navNumero: "Numerology",
      nT: "Numerology (Ank Jyotish)", nName: "Full name", nDob: "Date of birth", nBtn: "Calculate", nNeed: "Enter your date of birth.",
      mulank: "Mulank (Psychic number)", bhagyank: "Bhagyank (Destiny number)", namank: "Name number",
      ruler: "Ruling planet", day: "Lucky day", colour: "Lucky colour", friends: "Friendly numbers",
      nameMatch: (a, b, ok) => ok ? `Your name number ${a} is in harmony with your Bhagyank ${b}.` : `Your name number ${a} is not a natural friend of your Bhagyank ${b}; some people adjust the spelling of their name to bring it into harmony.`,
      nSrc: "Numerology follows the popular Chaldean / Indian Ank Jyotish system (not a BPHS rule).",
      remedy: (m, d) => `Remedy: chant <span class="mantra">${m}</span> 108 times on ${d}.`,
    },
    hi: {
      akT: "अष्टकवर्ग", akIntro: "हर ग्रह आपके लग्न से हर भाव को कितने बिंदु (शुभ अंक) देता है (BPHS अध्याय 66–72)। अंतिम पंक्ति सर्वाष्टकवर्ग (SAV) है: 28 औसत, 30 या अधिक बलवान, 25 से कम कमज़ोर।",
      akHouse: "भाव", akSav: "SAV",
      akStrong: hs => hs.length ? `बलवान भाव (30+ बिंदु): <b>${hs.join(", ")}</b> — इनके विषय कम प्रयास में अच्छे फल देते हैं।` : "",
      akWeak: hs => hs.length ? `कमज़ोर भाव (25 से कम): <b>${hs.join(", ")}</b> — इनमें अधिक धैर्य और उपाय चाहिए।` : "",
      akTransit: (p, s, b, t) => `${p} अभी ${s} राशि में गोचर कर रहा है, जहाँ इसके 8 में से <b>${b}</b> बिंदु हैं (SAV ${t}) — ${b >= 4 ? "यह आपके लिए सहायक गोचर है" : "यह गोचर धैर्य माँगता है"}।`,
      akNote: "परंपरा के अनुसार जिस राशि में ग्रह के अपने अष्टकवर्ग में 4 या अधिक बिंदु हों, वहाँ उसका गोचर शुभ फल देता है।",
      moreT: "अन्य कुंडलियाँ", d9: "नवांश (D9)", d10: "दशमांश (D10)", chandra: "चंद्र कुंडली", gochar: "गोचर",
      cap: {
        d9: "नवांश (D9) — सबसे महत्वपूर्ण वर्ग कुंडली: ग्रहों का वास्तविक बल, विवाह और जीवनसाथी, तथा आंतरिक क्षमता दिखाती है (BPHS अध्याय 6–7)।",
        d10: "दशमांश (D10) — करियर, व्यवसाय, पद और उपलब्धियों की कुंडली (BPHS अध्याय 6–7)।",
        chandra: "चंद्र कुंडली — भाव आपकी चंद्र राशि से गिने जाते हैं; गोचर, साढ़ेसाती और दैनिक फल में इसका प्रयोग होता है।",
        gochar: n => `गोचर — आज ग्रह कहाँ हैं, आपकी चंद्र राशि (${n}) से भावों में।`,
      },
      trT: "आपकी चंद्र राशि से आज का गोचर", trPlanet: "ग्रह", trSign: "गोचर राशि", trHouse: "चंद्र से भाव", trRes: "फल",
      good: "शुभ", hard: "सावधानी",
      trNote: "गोचर फल फलदीपिका अध्याय 26 के अनुसार (जन्म चंद्र से शुभ भाव)। वेध का विचार नहीं किया गया है।",
      avT: "अवकहड़ा चक्र और जन्म विवरण",
      av: { varna: "वर्ण", vashya: "वश्य", yoni: "योनि", gana: "गण", nadi: "नाड़ी", nakLord: "नक्षत्र स्वामी", rashiLord: "राशि स्वामी", lagnaLord: "लग्न स्वामी",
        tatva: "तत्व", letter: "नामाक्षर", btithi: "जन्म तिथि", byoga: "जन्म योग", bkarana: "जन्म करण", bvaar: "जन्म वार", paya: "पाया" },
      tatva: ["अग्नि", "पृथ्वी", "वायु", "जल"], paya: ["स्वर्ण", "रजत", "ताम्र", "लौह"],
      letterNote: (l, all) => `आपके नक्षत्र चरण का अक्षर <b>${l}</b> है (नक्षत्र के सभी अक्षर: ${all})।`,
      gemT: "रत्न और शुभ बातें", life: "जीवन रत्न (लग्नेश)", lucky: "भाग्य रत्न (नवमेश)", punya: "पुण्य रत्न (पंचमेश)",
      luckyDay: "शुभ दिन", luckyNum: "शुभ अंक", luckyCol: "शुभ रंग",
      gemNote: "रत्न वैकल्पिक और महँगे हैं। मंत्र, दान और अच्छा आचरण बिना खर्च के काम करते हैं। रत्न केवल योग्य ज्योतिषी द्वारा पूरी कुंडली देखने के बाद ही पहनें — विशेषकर नीलम, गोमेद और लहसुनिया।",
      pT: "मुहूर्त और चौघड़िया", place: p => `${p} के लिए`, delhi: "नई दिल्ली", birthPlace: "आपके जन्म स्थान",
      p: { nak: "नक्षत्र", yoga: "योग", karana: "करण", sunrise: "सूर्योदय", sunset: "सूर्यास्त", rahu: "राहु काल", yama: "यमगंड", gulika: "गुलिक काल", abhijit: "अभिजित मुहूर्त", panchak: "पंचक" },
      panchakOn: t => `${t} तक जारी`, panchakTip: "अभी पंचक चल रहा है — इसके समाप्त होने तक दक्षिण दिशा की यात्रा, छत का काम, लकड़ी खरीदना और पलंग या चारपाई बनाना टालें।",
      avoid: "राहु काल, यमगंड और गुलिक काल में नया कार्य शुरू करने से बचें।", abhijitWed: "परंपरा में बुधवार को अभिजित मुहूर्त का प्रयोग नहीं किया जाता।",
      chDay: "दिन का चौघड़िया", chNight: "रात का चौघड़िया", now: "अभी",
      chQ: { good: "शुभ", mid: "सामान्य", bad: "अशुभ" },
      navNumero: "अंक ज्योतिष",
      nT: "अंक ज्योतिष", nName: "पूरा नाम", nDob: "जन्म तिथि", nBtn: "गणना करें", nNeed: "अपनी जन्म तिथि भरें।",
      mulank: "मूलांक", bhagyank: "भाग्यांक", namank: "नामांक",
      ruler: "स्वामी ग्रह", day: "शुभ दिन", colour: "शुभ रंग", friends: "मित्र अंक",
      nameMatch: (a, b, ok) => ok ? `आपका नामांक ${a} आपके भाग्यांक ${b} के अनुकूल है।` : `आपका नामांक ${a} आपके भाग्यांक ${b} का स्वाभाविक मित्र नहीं है; कुछ लोग इसे अनुकूल बनाने के लिए नाम की वर्तनी बदलते हैं।`,
      nSrc: "अंक ज्योतिष प्रचलित कैल्डियन / भारतीय अंक ज्योतिष पद्धति पर आधारित है (यह BPHS का नियम नहीं है)।",
      remedy: (m, d) => `उपाय: ${d} को <span class="mantra">${m}</span> का 108 बार जाप करें।`,
    },
  };
  const X = () => T[LANG];

  // ------------------------------------------------------------------ data
  const YOGA = {
    en: ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"],
    hi: ["विष्कुम्भ", "प्रीति", "आयुष्मान", "सौभाग्य", "शोभन", "अतिगण्ड", "सुकर्मा", "धृति", "शूल", "गण्ड", "वृद्धि", "ध्रुव", "व्याघात", "हर्षण", "वज्र", "सिद्धि", "व्यतीपात", "वरीयान", "परिघ", "शिव", "सिद्ध", "साध्य", "शुभ", "शुक्ल", "ब्रह्म", "इन्द्र", "वैधृति"],
  };
  const KARANA = {
    en: ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti (Bhadra)", "Shakuni", "Chatushpada", "Naga", "Kimstughna"],
    hi: ["बव", "बालव", "कौलव", "तैतिल", "गर", "वणिज", "विष्टि (भद्रा)", "शकुनि", "चतुष्पद", "नाग", "किंस्तुघ्न"],
  };
  const karanaOf = diff => { const k = Math.floor(norm(diff) / 6); if (k === 0) return 10; if (k >= 57) return 7 + (k - 57); return (k - 1) % 7; };
  const CHOG = { en: ["Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog"], hi: ["उद्वेग", "चर", "लाभ", "अमृत", "काल", "शुभ", "रोग"] };
  const CHOG_Q = ["bad", "mid", "good", "good", "bad", "good", "bad"];
  const CH_DAY_START = [0, 3, 6, 2, 5, 1, 4];   // Sun..Sat → index in CHOG (Udveg, Amrit, Rog, Labh, Shubh, Char, Kaal)
  const CH_NIGHT = [5, 3, 1, 6, 4, 2, 0];        // night cycle: Shubh, Amrit, Char, Rog, Kaal, Labh, Udveg
  const CH_NIGHT_START = [0, 2, 4, 6, 1, 3, 5];  // Sun..Sat → position in CH_NIGHT (Shubh, Char, Kaal, Udveg, Amrit, Rog, Labh)
  const RAHU_SEG = [8, 2, 7, 5, 6, 4, 3], YAMA_SEG = [5, 4, 3, 2, 1, 7, 6], GULI_SEG = [7, 6, 5, 4, 3, 2, 1];
  const SYL = {
    en: [["Chu", "Che", "Cho", "La"], ["Li", "Lu", "Le", "Lo"], ["A", "I", "U", "E"], ["O", "Va", "Vi", "Vu"], ["Ve", "Vo", "Ka", "Ki"], ["Ku", "Gha", "Nga", "Chha"], ["Ke", "Ko", "Ha", "Hi"], ["Hu", "He", "Ho", "Da"], ["Di", "Du", "De", "Do"], ["Ma", "Mi", "Mu", "Me"], ["Mo", "Ta", "Ti", "Tu"], ["Te", "To", "Pa", "Pi"], ["Pu", "Sha", "Na", "Tha"], ["Pe", "Po", "Ra", "Ri"], ["Ru", "Re", "Ro", "Ta"], ["Ti", "Tu", "Te", "To"], ["Na", "Ni", "Nu", "Ne"], ["No", "Ya", "Yi", "Yu"], ["Ye", "Yo", "Bha", "Bhi"], ["Bhu", "Dha", "Pha", "Dha"], ["Bhe", "Bho", "Ja", "Ji"], ["Khi", "Khu", "Khe", "Kho"], ["Ga", "Gi", "Gu", "Ge"], ["Go", "Sa", "Si", "Su"], ["Se", "So", "Da", "Di"], ["Du", "Tha", "Jha", "Na"], ["De", "Do", "Cha", "Chi"]],
    hi: [["चू", "चे", "चो", "ला"], ["ली", "लू", "ले", "लो"], ["अ", "ई", "उ", "ए"], ["ओ", "वा", "वी", "वू"], ["वे", "वो", "का", "की"], ["कू", "घ", "ङ", "छ"], ["के", "को", "हा", "ही"], ["हू", "हे", "हो", "डा"], ["डी", "डू", "डे", "डो"], ["मा", "मी", "मू", "मे"], ["मो", "टा", "टी", "टू"], ["टे", "टो", "पा", "पी"], ["पू", "ष", "ण", "ठ"], ["पे", "पो", "रा", "री"], ["रू", "रे", "रो", "ता"], ["ती", "तू", "ते", "तो"], ["ना", "नी", "नू", "ने"], ["नो", "या", "यी", "यू"], ["ये", "यो", "भा", "भी"], ["भू", "धा", "फा", "ढा"], ["भे", "भो", "जा", "जी"], ["खी", "खू", "खे", "खो"], ["गा", "गी", "गू", "गे"], ["गो", "सा", "सी", "सू"], ["से", "सो", "दा", "दी"], ["दू", "थ", "झ", "ञ"], ["दे", "दो", "चा", "ची"]],
  };
  const GEM = {
    en: { Sun: "Ruby (Manik)", Moon: "Pearl (Moti)", Mars: "Red Coral (Moonga)", Mercury: "Emerald (Panna)", Jupiter: "Yellow Sapphire (Pukhraj)", Venus: "Diamond (Heera) / White Sapphire", Saturn: "Blue Sapphire (Neelam)", Rahu: "Hessonite (Gomed)", Ketu: "Cat's eye (Lehsunia)" },
    hi: { Sun: "माणिक्य", Moon: "मोती", Mars: "मूंगा", Mercury: "पन्ना", Jupiter: "पुखराज", Venus: "हीरा / सफ़ेद पुखराज", Saturn: "नीलम", Rahu: "गोमेद", Ketu: "लहसुनिया" },
  };
  const DAYLORD = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  // good transit houses from the natal Moon — Phaladeepika Ch. 26
  const GOCHAR_GOOD = { Sun: [3, 6, 10, 11], Moon: [1, 3, 6, 7, 10, 11], Mars: [3, 6, 11], Mercury: [2, 4, 6, 8, 10, 11], Jupiter: [2, 5, 7, 9, 11], Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12], Saturn: [3, 6, 11], Rahu: [3, 6, 11], Ketu: [3, 6, 11] };
  const PL = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

  // ------------------------------------------------------------------ helpers
  const timeTxt = (jd, tz) => { const d = new Date((jd - 2440587.5) * 86400000 + tz * 3600000); let h = d.getUTCHours(); const m = String(d.getUTCMinutes()).padStart(2, "0"), ap = h < 12 ? "AM" : "PM"; h = h % 12 || 12; return `${h}:${m} ${ap}`; };
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
  const signOfD9 = lon => Math.floor(lon * 9 / 30) % 12;
  const signOfD10 = lon => { const s = Math.floor(lon / 30), d = lon % 30; return (s + (s % 2 === 0 ? 0 : 8) + Math.floor(d / 3)) % 12; };

  // North Indian chart for any (ascendant sign, planet → sign) set
  function northChart(ascSign, signOf, retro) {
    const pos = { 1: [200, 100], 2: [100, 45], 3: [45, 100], 4: [100, 200], 5: [45, 300], 6: [100, 355], 7: [200, 300], 8: [300, 355], 9: [355, 300], 10: [300, 200], 11: [355, 100], 12: [300, 45] };
    const num = { 1: [200, 175], 2: [100, 85], 3: [85, 100], 4: [175, 200], 5: [85, 300], 6: [100, 315], 7: [200, 225], 8: [300, 315], 9: [315, 300], 10: [225, 200], 11: [315, 100], 12: [300, 85] };
    const AB = ABBR[LANG], rmark = LANG === "hi" ? "(व)" : "ᴿ";
    let s = `<rect x="2" y="2" width="396" height="396" rx="6" fill="#120d2c" stroke="#e8b94a" stroke-width="2"/><g stroke="#e8b94a" stroke-width="1.4" fill="none"><line x1="2" y1="2" x2="398" y2="398"/><line x1="398" y1="2" x2="2" y2="398"/><polygon points="200,2 398,200 200,398 2,200"/></g>`;
    for (let h = 1; h <= 12; h++) {
      const sg = (ascSign + h - 1) % 12;
      s += `<text x="${num[h][0]}" y="${num[h][1]}" fill="#a59fc7" font-size="12" text-anchor="middle" dominant-baseline="middle">${sg + 1}</text>`;
      const items = (h === 1 && signOf.Lagna !== undefined ? [AB.Lagna] : []).concat(PL.filter(p => signOf[p] === sg).map(p => AB[p] + (retro && retro[p] ? rmark : "")));
      items.forEach((t, i) => {
        const cols = items.length > 1 ? 2 : 1, row = Math.floor(i / 2), col = i % 2;
        const x = pos[h][0] + (cols === 2 ? (col ? 17 : -17) : 0), y = pos[h][1] + (row - (Math.ceil(items.length / 2) - 1) / 2) * 17;
        s += `<text x="${x}" y="${y}" fill="${t === AB.Lagna ? "#f6d98b" : "#ece8fb"}" font-size="${LANG === "hi" ? 13 : 14}" font-weight="600" text-anchor="middle" dominant-baseline="middle" font-family="Noto Sans Devanagari, Inter, sans-serif">${t}</text>`;
      });
    }
    return `<svg class="chart" viewBox="0 0 400 400">${s}</svg>`;
  }

  // ------------------------------------------------------------------ 1. more charts
  let chartTab = "d9";
  function moreChartsHtml(k) {
    const x = X(), P = k.planets, retro = {}; PL.forEach(p => retro[p] = P[p].retro && p !== "Rahu" && p !== "Ketu");
    let chart = "", cap = "", extra = "";
    if (chartTab === "d9" || chartTab === "d10") {
      const f = chartTab === "d9" ? signOfD9 : signOfD10, m = { Lagna: f(k.asc) };
      PL.forEach(p => m[p] = f(P[p].lon));
      chart = northChart(m.Lagna, m, retro); cap = x.cap[chartTab];
    } else if (chartTab === "chandra") {
      const m = {}; PL.forEach(p => m[p] = P[p].sign);
      chart = northChart(P.Moon.sign, m, retro); cap = x.cap.chandra;
    } else {
      const now = positionsAt(julianDayNow()), m = {}; PL.forEach(p => m[p] = Math.floor(now[p] / 30));
      chart = northChart(P.Moon.sign, m, null); cap = x.cap.gochar(sn(P.Moon.sign));
      extra = `<h3>${x.trT}</h3><table><tr><th>${x.trPlanet}</th><th>${x.trSign}</th><th>${x.trHouse}</th><th>${x.trRes}</th></tr>` + PL.map(p => {
        const h = ((m[p] - P.Moon.sign + 12) % 12) + 1, g = GOCHAR_GOOD[p].includes(h);
        return `<tr><td>${pn(p)}</td><td>${sn(m[p])}</td><td>${h}</td><td><span class="pill ${g ? "g" : "b"}">${g ? x.good : x.hard}</span></td></tr>`;
      }).join("") + `</table><p class="sub">${x.trNote}</p>`;
    }
    const tabs = ["d9", "d10", "chandra", "gochar"].map(t => `<button class="tab ${t === chartTab ? "on" : ""}" data-ct="${t}">${x[t]}</button>`).join("");
    return `<h2>${x.moreT}</h2><div class="tabs">${tabs}</div><div class="two"><div>${chart}<div class="tag" style="text-align:center">${cap}</div></div><div>${extra}</div></div>`;
  }

  // ------------------------------------------------------------------ 2. avakahada + gems
  function birthDow(k) {
    const [Y, M, D] = k.inp.dob.split("-").map(Number), tz = effectiveTz(k.inp.tz, Y, M, D);
    let dow = new Date(Date.UTC(Y, M - 1, D)).getUTCDay();
    if (k.jd < sunriseJD(Y, M, D, k.inp.lat, k.inp.lon, tz)) dow = (dow + 6) % 7; // Hindu day begins at sunrise
    return dow;
  }
  function avakahadaHtml(k) {
    const x = X(), P = k.planets, M = P.Moon, nk = M.nak, s = M.sign;
    const diff = norm(M.lon - P.Sun.lon), t = Math.floor(diff / 12), ti = t === 14 ? 14 : t === 29 ? 15 : t % 15;
    const yoga = Math.floor(norm(P.Sun.lon + M.lon) / (360 / 27));
    const vash = vashyaOf(M), syl = SYL[LANG][nk], dow = birthDow(k);
    const payaI = [0, 1, 2, 3][[1, 6, 11].includes(((s - k.lagna + 12) % 12) + 1) ? 0 : [2, 5, 9].includes(((s - k.lagna + 12) % 12) + 1) ? 1 : [3, 7, 10].includes(((s - k.lagna + 12) % 12) + 1) ? 2 : 3];
    const rows = [
      [x.av.varna, VARNA_N[LANG][VARNA[s]]], [x.av.vashya, VASHYA_N[LANG][vash]], [x.av.yoni, YONI_N[LANG][YONI_OF[nk]]],
      [x.av.gana, GANA_N[LANG][GANA_OF[nk]]], [x.av.nadi, NADI_N[LANG][nadiOf(nk)]], [x.av.tatva, x.tatva[s % 4]],
      [x.av.nakLord, pn(DLORDS[nk % 9])], [x.av.rashiLord, pn(LORD[s])], [x.av.lagnaLord, pn(LORD[k.lagna])], [x.av.paya, x.paya[payaI]],
      [x.av.letter, syl[M.pada - 1]], [x.av.bvaar, DAYS[LANG][dow]],
      [x.av.btithi, `${TITHI[LANG][ti]} (${PAKSHA[LANG][t < 15 ? 0 : 1]})`], [x.av.byoga, YOGA[LANG][yoga]], [x.av.bkarana, KARANA[LANG][karanaOf(diff)]],
    ];
    let h = `<h2>${x.avT}</h2><div class="kv">${rows.map(([a, b]) => `<div><small>${a}</small><b>${b}</b></div>`).join("")}</div>`;
    h += `<p class="sub">${x.letterNote(syl[M.pada - 1], syl.join(", "))}</p>`;
    // gems & lucky factors
    const L1 = LORD[k.lagna], L5 = LORD[(k.lagna + 4) % 12], L9 = LORD[(k.lagna + 8) % 12], di = DAYLORD.indexOf(L1);
    h += `<h3>${x.gemT}</h3><div class="kv">` + [[x.life, `${GEM[LANG][L1]} <span class="sub">(${pn(L1)})</span>`], [x.lucky, `${GEM[LANG][L9]} <span class="sub">(${pn(L9)})</span>`], [x.punya, `${GEM[LANG][L5]} <span class="sub">(${pn(L5)})</span>`],
      [x.luckyDay, DAYS[LANG][di]], [x.luckyNum, LUCKY_NUM[L1]], [x.luckyCol, COLORS[LANG][di]]].map(([a, b]) => `<div><small>${a}</small><b>${b}</b></div>`).join("") + `</div>`;
    h += `<p class="sub">💎 ${x.gemNote}</p>`;
    return h;
  }


  // ------------------------------------------------------------------ 2b. Ashtakavarga (BPHS Ch. 66–72)
  // For each planet: houses, counted from each contributor, where it receives a bindu (benefic point).
  const AV_FROM = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Lagna"];
  const AV = {
    Sun:     [[1,2,4,7,8,9,10,11],[3,6,10,11],[1,2,4,7,8,9,10,11],[3,5,6,9,10,11,12],[5,6,9,11],[6,7,12],[1,2,4,7,8,9,10,11],[3,4,6,10,11,12]],
    Moon:    [[3,6,7,8,10,11],[1,3,6,7,10,11],[2,3,5,6,9,10,11],[1,3,4,5,7,8,10,11],[1,4,7,8,10,11,12],[3,4,5,7,9,10,11],[3,5,6,11],[3,6,10,11]],
    Mars:    [[3,5,6,10,11],[3,6,11],[1,2,4,7,8,10,11],[3,5,6,11],[6,10,11,12],[6,8,11,12],[1,4,7,8,9,10,11],[1,3,6,10,11]],
    Mercury: [[5,6,9,11,12],[2,4,6,8,10,11],[1,2,4,7,8,9,10,11],[1,3,5,6,9,10,11,12],[6,8,11,12],[1,2,3,4,5,8,9,11],[1,2,4,7,8,9,10,11],[1,2,4,6,8,10,11]],
    Jupiter: [[1,2,3,4,7,8,9,10,11],[2,5,7,9,11],[1,2,4,7,8,10,11],[1,2,4,5,6,9,10,11],[1,2,3,4,7,8,10,11],[2,5,6,9,10,11],[3,5,6,12],[1,2,4,5,6,7,9,10,11]],
    Venus:   [[8,11,12],[1,2,3,4,5,8,9,11,12],[3,5,6,9,11,12],[3,5,6,9,11],[5,8,9,10,11],[1,2,3,4,5,8,9,10,11],[3,4,5,8,9,10,11],[1,2,3,4,5,8,9,11]],
    Saturn:  [[1,2,4,7,8,10,11],[3,6,11],[3,5,6,10,11,12],[6,8,9,10,11,12],[5,6,11,12],[6,11,12],[3,5,6,11],[1,3,4,6,10,11]],
  };
  function ashtakavarga(k) {
    const signOf = p => p === "Lagna" ? k.lagna : k.planets[p].sign, bav = {}, sav = Array(12).fill(0);
    for (const pl in AV) {
      const row = Array(12).fill(0);
      AV[pl].forEach((houses, i) => { const from = signOf(AV_FROM[i]); houses.forEach(h => row[(from + h - 1) % 12]++); });
      bav[pl] = row; row.forEach((v, s) => sav[s] += v);
    }
    return { bav, sav };
  }
  function ashtakavargaHtml(k) {
    const x = X(), { bav, sav } = ashtakavarga(k), signs = [...Array(12)].map((_, h) => (k.lagna + h) % 12);
    const cls = v => v >= 30 ? "g" : v < 25 ? "b" : "";
    let h = `<h2>${x.akT}</h2><p class="tag" style="text-align:left;margin:0 0 10px">${x.akIntro}</p>`;
    h += `<div style="overflow-x:auto"><table class="avt"><tr><th>${x.akHouse}</th>${signs.map((s, i) => `<th>${i + 1}<br><span class="sub">${sn(s).slice(0, LANG === "hi" ? 4 : 3)}</span></th>`).join("")}<th>Σ</th></tr>`;
    for (const pl in bav) h += `<tr><td>${pn(pl)}</td>${signs.map(s => `<td>${bav[pl][s]}</td>`).join("")}<td><b>${bav[pl].reduce((a, b) => a + b, 0)}</b></td></tr>`;
    h += `<tr><td><b>${x.akSav}</b></td>${signs.map(s => `<td><span class="pill ${cls(sav[s])}">${sav[s]}</span></td>`).join("")}<td><b>${sav.reduce((a, b) => a + b, 0)}</b></td></tr></table></div>`;
    const strong = signs.map((s, i) => [i + 1, sav[s]]).filter(([, v]) => v >= 30).map(([hh]) => hh), weak = signs.map((s, i) => [i + 1, sav[s]]).filter(([, v]) => v < 25).map(([hh]) => hh);
    h += `<p>${x.akStrong(strong)} ${x.akWeak(weak)}</p>`;
    const now = positionsAt(julianDayNow()), js = Math.floor(now.Jupiter / 30), ss = Math.floor(now.Saturn / 30);
    h += `<p>${x.akTransit(pn("Jupiter"), sn(js), bav.Jupiter[js], sav[js])} ${x.akTransit(pn("Saturn"), sn(ss), bav.Saturn[ss], sav[ss])}</p>`;
    h += `<p class="sub">${x.akNote}</p>`;
    return h;
  }

  function renderMore(k) {
    if (!k) return;
    let a = document.getElementById("moreCharts"), b = document.getElementById("avakahada");
    if (!a) {
      const anchor = document.getElementById("chart").closest("section");
      anchor.insertAdjacentHTML("afterend", `<section class="card" id="moreCharts"></section><section class="card" id="avakahada"></section><section class="card" id="ashtak"></section>`);
      a = document.getElementById("moreCharts"); b = document.getElementById("avakahada");
      a.addEventListener("click", e => { const t = e.target.closest("[data-ct]"); if (t) { chartTab = t.dataset.ct; a.innerHTML = moreChartsHtml(K); } });
    }
    a.innerHTML = moreChartsHtml(k); b.innerHTML = avakahadaHtml(k); document.getElementById("ashtak").innerHTML = ashtakavargaHtml(k);
  }

  // ------------------------------------------------------------------ 3. full panchang + muhurat
  function panchangHtml() {
    const x = X(), pl = K && K.inp ? K.inp : { lat: 28.6139, lon: 77.2090, tz: 5.5 }, tz = pl.tz ?? 5.5, now = julianDayNow();
    const loc = new Date(Date.now() + tz * 3600000); let day = new Date(Date.UTC(loc.getUTCFullYear(), loc.getUTCMonth(), loc.getUTCDate()));
    const ymd = d => [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
    let sr = sunriseJD(...ymd(day), pl.lat, pl.lon, tz);
    if (now < sr) { day = new Date(day.getTime() - 86400000); sr = sunriseJD(...ymd(day), pl.lat, pl.lon, tz); }
    const ss = sunsetJD(...ymd(day), pl.lat, pl.lon, tz), next = new Date(day.getTime() + 86400000), sr2 = sunriseJD(...ymd(next), pl.lat, pl.lon, tz);
    const dow = day.getUTCDay(), S = positionsAt(sr), diff = norm(S.Moon - S.Sun);
    const yoga = Math.floor(norm(S.Sun + S.Moon) / (360 / 27)), nak = Math.floor(S.Moon / (360 / 27));
    const dl = (ss - sr) / 8, seg = n => [sr + (n - 1) * dl, sr + n * dl], span = ([a, b]) => `${timeTxt(a, tz)} – ${timeTxt(b, tz)}`;
    const noon = (sr + ss) / 2, ab = [noon - (ss - sr) / 30, noon + (ss - sr) / 30];
    const kv = [[x.p.nak, NAK[LANG][nak]], [x.p.yoga, YOGA[LANG][yoga]], [x.p.karana, KARANA[LANG][karanaOf(diff)]], [x.p.sunrise, timeTxt(sr, tz)], [x.p.sunset, timeTxt(ss, tz)],
      [x.p.rahu, span(seg(RAHU_SEG[dow]))], [x.p.yama, span(seg(YAMA_SEG[dow]))], [x.p.gulika, span(seg(GULI_SEG[dow]))], [x.p.abhijit, span(ab)]];
    // Panchak in force now? (Moon in sidereal Aquarius/Pisces)
    const mNow = positionsAt(now).Moon;
    if (mNow >= 300) {
      let e = now; while (positionsAt(e).Moon >= 300) e += 0.1;
      let a = e - 0.1, b = e; for (let i = 0; i < 30; i++) { const m = (a + b) / 2; if (positionsAt(m).Moon >= 300) a = m; else b = m; }
      const d = new Date((b - 2440587.5) * 864e5 + tz * 36e5);
      kv.push([x.p.panchak, x.panchakOn(`${d.toLocaleDateString(LANG === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", timeZone: "UTC" })}, ${timeTxt(b, tz)}`)]);
    }
    let h = `<h2>${x.pT}</h2><p class="tag" style="text-align:left;margin:0 0 10px">${x.place(K ? x.birthPlace : x.delhi)} · ${DAYS[LANG][dow]}</p>`;
    h += `<div class="kv">${kv.map(([a, b]) => `<div><small>${a}</small><b>${b}</b></div>`).join("")}</div>`;
    h += `<p class="sub">⚠ ${x.avoid}${dow === 3 ? " " + x.abhijitWed : ""}${mNow >= 300 ? " " + x.panchakTip : ""}</p>`;
    const table = (title, start, len, idxs) => `<div><h3>${title}</h3><table>` + idxs.map((ci, i) => {
      const a = start + i * len, b = a + len, on = now >= a && now < b, q = CHOG_Q[ci];
      return `<tr class="${on ? "dasha-now" : ""}"><td><b>${CHOG[LANG][ci]}</b>${on ? ` <span class="pill">${x.now}</span>` : ""}</td><td style="white-space:nowrap">${timeTxt(a, tz)} – ${timeTxt(b, tz)}</td><td><span class="pill ${q === "good" ? "g" : q === "bad" ? "b" : ""}">${x.chQ[q]}</span></td></tr>`;
    }).join("") + `</table></div>`;
    const dayIdx = [...Array(8)].map((_, i) => (CH_DAY_START[dow] + i) % 7);
    const nightIdx = [...Array(8)].map((_, i) => CH_NIGHT[(CH_NIGHT_START[dow] + i) % 7]);
    h += `<div class="chog">${table(x.chDay, sr, dl, dayIdx)}${table(x.chNight, ss, (sr2 - ss) / 8, nightIdx)}</div>`;
    return h;
  }
  function renderPanchang() {
    let c = document.getElementById("muhurat");
    if (!c) { document.getElementById("panchang").closest("section").insertAdjacentHTML("afterend", `<section class="card" id="muhurat"></section>`); c = document.getElementById("muhurat"); }
    c.innerHTML = panchangHtml();
  }

  // ------------------------------------------------------------------ 4. numerology
  const NUM = {
    1: { p: "Sun", day: 0, en: "Leadership, independence and self-confidence. You like to take charge and do well in positions of authority; guard against ego and impatience.", hi: "नेतृत्व, स्वतंत्रता और आत्मविश्वास। आप ज़िम्मेदारी लेना पसंद करते हैं और अधिकार वाले पदों पर अच्छा करते हैं; अहंकार और अधीरता से बचें।", col: { en: "Golden, orange", hi: "सुनहरा, नारंगी" }, fr: [1, 2, 3, 9] },
    2: { p: "Moon", day: 1, en: "Sensitive, imaginative and caring. You work well in partnership and have strong intuition; mood swings and indecision need watching.", hi: "संवेदनशील, कल्पनाशील और देखभाल करने वाले। आप साझेदारी में अच्छा काम करते हैं और अंतर्ज्ञान प्रबल है; मन के उतार-चढ़ाव और अनिर्णय पर ध्यान दें।", col: { en: "White, cream", hi: "सफ़ेद, क्रीम" }, fr: [1, 2, 3, 5] },
    3: { p: "Jupiter", day: 4, en: "Wise, disciplined and expressive. You are a natural teacher or adviser and value knowledge and dharma; avoid being too rigid or preachy.", hi: "ज्ञानी, अनुशासित और अभिव्यक्ति में कुशल। आप स्वाभाविक शिक्षक या सलाहकार हैं और ज्ञान व धर्म को महत्व देते हैं; ज़्यादा कठोर या उपदेशक बनने से बचें।", col: { en: "Yellow", hi: "पीला" }, fr: [1, 2, 3, 9] },
    4: { p: "Rahu", day: 6, en: "Unconventional, hard-working and practical. You think differently and can succeed in technology and new fields; sudden changes and conflicts need patience.", hi: "अलग सोच वाले, मेहनती और व्यावहारिक। आप अलग ढंग से सोचते हैं और तकनीक व नए क्षेत्रों में सफल हो सकते हैं; अचानक बदलाव और टकराव में धैर्य रखें।", col: { en: "Grey, blue", hi: "स्लेटी, नीला" }, fr: [1, 5, 6, 7] },
    5: { p: "Mercury", day: 3, en: "Quick, clever and communicative. You are good at business, travel and learning new skills; avoid restlessness and scattered energy.", hi: "तेज़, चतुर और बातचीत में कुशल। आप व्यापार, यात्रा और नए कौशल सीखने में अच्छे हैं; बेचैनी और बिखरी ऊर्जा से बचें।", col: { en: "Green", hi: "हरा" }, fr: [1, 4, 5, 6] },
    6: { p: "Venus", day: 5, en: "Loving, artistic and family-minded. You enjoy beauty, comfort and harmony and attract people easily; avoid over-indulgence.", hi: "प्रेमपूर्ण, कलात्मक और परिवार-प्रिय। आपको सौंदर्य, सुख और सामंजस्य पसंद है और लोग आसानी से आकर्षित होते हैं; अधिक भोग से बचें।", col: { en: "White, pink, light blue", hi: "सफ़ेद, गुलाबी, हल्का नीला" }, fr: [4, 5, 6, 8] },
    7: { p: "Ketu", day: 1, en: "Spiritual, thoughtful and intuitive. You seek deeper meaning and do well in research and inner work; avoid isolation and overthinking.", hi: "आध्यात्मिक, विचारशील और अंतर्ज्ञानी। आप गहरे अर्थ की खोज करते हैं और शोध व साधना में अच्छा करते हैं; अकेलेपन और अधिक सोचने से बचें।", col: { en: "Light green, white", hi: "हल्का हरा, सफ़ेद" }, fr: [1, 4, 5, 6] },
    8: { p: "Saturn", day: 6, en: "Patient, serious and persistent. Success comes slowly but lasts; you carry responsibility well. Delays early in life are common — keep going.", hi: "धैर्यवान, गंभीर और लगनशील। सफलता धीरे पर स्थायी मिलती है; आप ज़िम्मेदारी अच्छी तरह निभाते हैं। जीवन की शुरुआत में देरी आम है — लगे रहें।", col: { en: "Dark blue, black", hi: "गहरा नीला, काला" }, fr: [4, 5, 6, 8] },
    9: { p: "Mars", day: 2, en: "Energetic, brave and determined. You fight for what you want and protect others; control anger and haste.", hi: "ऊर्जावान, साहसी और दृढ़। आप जो चाहते हैं उसके लिए लड़ते हैं और दूसरों की रक्षा करते हैं; क्रोध और जल्दबाज़ी पर नियंत्रण रखें।", col: { en: "Red", hi: "लाल" }, fr: [1, 2, 3, 9] },
  };
  const CHAL = { A: 1, I: 1, J: 1, Q: 1, Y: 1, B: 2, K: 2, R: 2, C: 3, G: 3, L: 3, S: 3, D: 4, M: 4, T: 4, E: 5, H: 5, N: 5, X: 5, U: 6, V: 6, W: 6, O: 7, Z: 7, F: 8, P: 8 };
  const reduce = n => { while (n > 9) n = String(n).split("").reduce((a, c) => a + +c, 0); return n; };
  function numerologyHtml(name, dob) {
    const x = X(); if (!dob) return `<p>${x.nNeed}</p>`;
    const [Y, M, D] = dob.split("-").map(Number), mul = reduce(D), bh = reduce((dob.replace(/-/g, "")).split("").reduce((a, c) => a + +c, 0));
    const latin = (name || "").toUpperCase().replace(/[^A-Z]/g, ""), nameSum = latin.split("").reduce((a, c) => a + CHAL[c], 0), nm = latin ? reduce(nameSum) : null;
    const card = (title, n, extra) => { const d = NUM[n]; return `<div class="dosh"><h3>${title}: <span class="pill g" style="font-size:16px">${n}</span>${extra || ""}</h3><p>${d[LANG]}</p><div class="kv"><div><small>${x.ruler}</small><b>${pn(d.p)}</b></div><div><small>${x.day}</small><b>${DAYS[LANG][d.day]}</b></div><div><small>${x.colour}</small><b>${d.col[LANG]}</b></div><div><small>${x.friends}</small><b>${d.fr.join(", ")}</b></div></div><p class="sub">${x.remedy(MANTRA[d.p][0], DAYS[LANG][d.day])}</p></div>`; };
    let h = card(x.mulank, mul) + card(x.bhagyank, bh);
    if (nm) { h += card(x.namank, nm, nameSum > 9 ? ` <span class="sub">(${nameSum})</span>` : ""); h += `<p>${x.nameMatch(nm, bh, NUM[bh].fr.includes(nm))}</p>`; }
    return h + `<p class="sub">${x.nSrc}</p>`;
  }
  function setupNumerology() {
    if (document.getElementById("view-numero")) return;
    document.querySelector("nav.nav").insertAdjacentHTML("beforeend", `<button data-view="numero" data-i="navNumero"></button>`);
    const last = [...document.querySelectorAll("main > .view")].pop();
    last.insertAdjacentHTML("afterend", `<div id="view-numero" class="view hidden"><section class="card"><h2 id="nT"></h2>
      <div class="grid"><div><label id="nNameL"></label><input id="nName"></div><div><label id="nDobL"></label><input type="date" id="nDob"></div></div>
      <div class="row"><button id="nBtn"></button></div><div class="reading" id="nOut"></div></section></div>`);
    const btn = document.querySelector('nav.nav button[data-view="numero"]');
    btn.onclick = () => showView("numero");
    document.getElementById("nBtn").onclick = () => { document.getElementById("nOut").innerHTML = numerologyHtml(document.getElementById("nName").value, document.getElementById("nDob").value); };
  }
  function renderNumerology() {
    const x = X();
    document.getElementById("nT").textContent = x.nT; document.getElementById("nNameL").textContent = x.nName; document.getElementById("nDobL").textContent = x.nDob; document.getElementById("nBtn").textContent = x.nBtn;
    const n = document.getElementById("nName"), d = document.getElementById("nDob");
    if (K && K.inp) { if (!n.value) n.value = K.inp.name || ""; if (!d.value) d.value = K.inp.dob; }
    document.getElementById("nOut").innerHTML = d.value ? numerologyHtml(n.value, d.value) : "";
  }

  // ------------------------------------------------------------------ hooks
  UI.en.navNumero = T.en.navNumero; UI.hi.navNumero = T.hi.navNumero;
  const _render = window.render, _rashi = window.renderRashifal, _show = window.showView, _lang = window.applyLang;
  window.render = function (k) { _render(k); try { renderMore(k); } catch (e) { console.error(e); } };
  window.renderRashifal = function () { _rashi(); try { renderPanchang(); } catch (e) { console.error(e); } };
  window.showView = function (v, noHash) { _show(v, noHash); if (v === "numero") renderNumerology(); };
  window.applyLang = function () {
    _lang();
    try {
      const nb = document.querySelector('nav.nav button[data-view="numero"]'); if (nb) nb.textContent = X().navNumero;
      if (K && !document.getElementById("result").classList.contains("hidden")) renderMore(K);
      if (typeof VIEW !== "undefined" && VIEW === "daily") renderPanchang();
      if (typeof VIEW !== "undefined" && VIEW === "numero") renderNumerology();
    } catch (e) { console.error(e); }
  };
  function init() {
    setupNumerology();
    document.querySelector('nav.nav button[data-view="numero"]').textContent = X().navNumero;
    if (K && !document.getElementById("result").classList.contains("hidden")) renderMore(K);
    if (location.hash === "#numero") showView("numero", true);
    if (typeof VIEW !== "undefined" && VIEW === "daily") renderPanchang();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.Vedic = { ashtakavarga, signOfD9, signOfD10, karanaOf, numerologyHtml, panchangHtml };
})();
