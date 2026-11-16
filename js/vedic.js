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
      sbT: "Shadbala (Planetary Strength)", sbIntro: "The six-fold strength of each planet from BPHS Ch. 27, in rupas: positional (Sthana), directional (Dig), temporal (Kala), motional (Cheshta), natural (Naisargika) and aspectual (Drik). A planet at or above its required strength (ratio 1× or more) can deliver its results well.",
      sbCols: ["Total", "Need", "Ratio", "Sthana", "Dig", "Kala", "Cheshta", "Naisargika", "Drik"],
      sbSum: (a, b, w, weak) => `Strongest planets: <b>${a}</b> and <b>${b}</b> — matters they rule come more easily. Weakest: <b>${w}</b>.${weak.length ? ` Below required strength: ${weak.join(", ")} — their remedies are most useful.` : " Every planet meets its required strength."}`,
      sbNote: "Approximate calculation (Yuddha bala is not included); totals can differ slightly from other software that uses different orbs, ayanamsa or varga rules.",
      yT: "Yogini Dasha", yIntro: "A second dasha system of 8 Yoginis in a 36-year cycle, widely used in North India to confirm the timing shown by Vimshottari.",
      yMD: "Yogini (planet)", yFrom: "From", yTo: "To", yrs: " yrs", yr1: " yr", yAD: n => `Sub-periods in ${n}`,
      yNow: (n, p, e, g) => `You are now in <b>${n}</b> Yogini (ruled by ${p}) until ${e} — ${g ? "an auspicious period that supports growth" : "a demanding period; patience and the planet's remedy help"}.`,
      yNote: "Mangala, Dhanya, Bhadrika and Siddha are auspicious Yoginis; Pingala, Bhramari, Ulka and Sankata are demanding.",
      vT: "Varshphal (Yearly Chart)", vIntro: "The Tajik yearly chart is cast for the exact moment the Sun returns to its birth position each year (Varsha Pravesh). It shows the themes of that year of life.",
      vAge: a => `age ${a}→${a + 1}`, vEntry: "Varsha Pravesh", vLagna: "Varsha Lagna", vMuntha: "Muntha", vMlord: "Muntha lord", vHouse: h => `${h}${[, "st", "nd", "rd"][h] || "th"} house`,
      vMres: (h, g) => g ? `Muntha in the ${h}${[, "st", "nd", "rd"][h] || "th"} house is favourable: the year supports progress in ${HTHEME.en[h]}.` : `Muntha in the ${h}${[, "st", "nd", "rd"][h] || "th"} house asks for care this year with ${HTHEME.en[h]}.`,
      vPl: (p, h, g) => `${p} in the ${h}${[, "st", "nd", "rd"][h] || "th"} house of the yearly chart ${g ? "supports" : "puts pressure on"} ${HTHEME.en[h]}.`,
      vNote: "Calculated for the birth place. The Varsheshwar (year lord) and Tajik yogas are not shown.",
      rp: { today: "Today", month: "This Month", year: "This Year" }, rRating: k => k === "month" ? "month rating" : "year rating",
      rIntro: k => k === "month" ? "Planetary transits this month, counted from your Moon sign (Phaladeepika Ch. 26):" : "The slow planets that shape your year, counted from your Moon sign:",
      rEvents: k => k === "month" ? "Changes during the month" : "Key transit dates this year",
      ev: (p, s, h, g) => `${p} enters ${s} — your ${h}${[, "st", "nd", "rd"][h] || "th"} house (${g ? "favourable" : "needs care"})`, evR: p => `${p} turns retrograde`, evD: p => `${p} turns direct`,
      rGood: "Favourable days (Moon well placed for you)", rSS: "Saturn's Sade Sati is running for this sign — steady effort, Saturday charity and Hanuman Chalisa help.",
      rDh: "Saturn's Dhaiya (Kantak/Ashtam Shani) is running for this sign — avoid shortcuts and big risks.", rNote: "General forecast by Moon sign; your full kundli and dasha give the personal picture.",
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
      sbT: "षड्बल (ग्रह बल)", sbIntro: "BPHS अध्याय 27 के अनुसार हर ग्रह का छह प्रकार का बल, रूप में: स्थान बल, दिग्बल, काल बल, चेष्टा बल, नैसर्गिक बल और दृक् बल। जो ग्रह अपने आवश्यक बल के बराबर या अधिक हो (अनुपात 1× या अधिक), वह अपने फल अच्छी तरह देता है।",
      sbCols: ["कुल", "आवश्यक", "अनुपात", "स्थान", "दिक्", "काल", "चेष्टा", "नैसर्गिक", "दृक्"],
      sbSum: (a, b, w, weak) => `सबसे बलवान ग्रह: <b>${a}</b> और <b>${b}</b> — इनके विषय आसानी से फल देते हैं। सबसे कमज़ोर: <b>${w}</b>।${weak.length ? ` आवश्यक बल से कम: ${weak.join(", ")} — इनके उपाय सबसे उपयोगी हैं।` : " हर ग्रह अपने आवश्यक बल को पूरा करता है।"}`,
      sbNote: "अनुमानित गणना (युद्ध बल शामिल नहीं); अलग अंश, अयनांश या वर्ग नियमों वाले सॉफ़्टवेयर से कुल में थोड़ा अंतर हो सकता है।",
      yT: "योगिनी दशा", yIntro: "8 योगिनियों की 36 वर्ष की दूसरी दशा पद्धति, जिसका उत्तर भारत में विंशोत्तरी के समय की पुष्टि के लिए व्यापक प्रयोग होता है।",
      yMD: "योगिनी (ग्रह)", yFrom: "से", yTo: "तक", yrs: " वर्ष", yr1: " वर्ष", yAD: n => `${n} की अंतर्दशाएँ`,
      yNow: (n, p, e, g) => `आप अभी <b>${n}</b> योगिनी (स्वामी ${p}) में हैं, ${e} तक — ${g ? "यह शुभ समय है जो उन्नति में सहायक है" : "यह कठिन समय है; धैर्य और ग्रह का उपाय सहायक है"}।`,
      yNote: "मंगला, धान्या, भद्रिका और सिद्धा शुभ योगिनियाँ हैं; पिंगला, भ्रामरी, उल्का और संकटा कठिन मानी जाती हैं।",
      vT: "वर्षफल (वार्षिक कुंडली)", vIntro: "ताजिक वर्ष कुंडली उस क्षण की बनती है जब सूर्य हर वर्ष अपनी जन्म स्थिति पर लौटता है (वर्ष प्रवेश)। यह जीवन के उस वर्ष के विषय दिखाती है।",
      vAge: a => `आयु ${a}→${a + 1}`, vEntry: "वर्ष प्रवेश", vLagna: "वर्ष लग्न", vMuntha: "मुंथा", vMlord: "मुंथेश", vHouse: h => `${hiOrd(h)} भाव`,
      vMres: (h, g) => g ? `मुंथा ${hiOrd(h)} भाव में शुभ है: यह वर्ष ${HTHEME.hi[h]} में प्रगति देता है।` : `मुंथा ${hiOrd(h)} भाव में है: इस वर्ष ${HTHEME.hi[h]} में सावधानी रखें।`,
      vPl: (p, h, g) => `वर्ष कुंडली के ${hiOrd(h)} भाव में ${p} ${HTHEME.hi[h]} के लिए ${g ? "सहायक है" : "दबाव बनाता है"}।`,
      vNote: "जन्म स्थान के लिए गणना। वर्षेश और ताजिक योग नहीं दिखाए गए हैं।",
      rp: { today: "आज", month: "इस महीने", year: "इस वर्ष" }, rRating: k => k === "month" ? "मासिक रेटिंग" : "वार्षिक रेटिंग",
      rIntro: k => k === "month" ? "इस महीने का ग्रह गोचर, आपकी चंद्र राशि से (फलदीपिका अध्याय 26):" : "आपके वर्ष को दिशा देने वाले धीमे ग्रह, आपकी चंद्र राशि से:",
      rEvents: k => k === "month" ? "महीने के दौरान बदलाव" : "इस वर्ष की मुख्य गोचर तिथियाँ",
      ev: (p, s, h, g) => `${p} ${s} में प्रवेश — आपके ${hiOrd(h)} भाव में (${g ? "शुभ" : "सावधानी"})`, evR: p => `${p} वक्री`, evD: p => `${p} मार्गी`,
      rGood: "शुभ दिन (चंद्रमा आपके लिए अनुकूल)", rSS: "इस राशि पर शनि की साढ़ेसाती चल रही है — लगातार प्रयास, शनिवार का दान और हनुमान चालीसा सहायक हैं।",
      rDh: "इस राशि पर शनि की ढैय्या चल रही है — शॉर्टकट और बड़े जोखिम से बचें।", rNote: "चंद्र राशि पर आधारित सामान्य फल; व्यक्तिगत फल के लिए अपनी पूरी कुंडली और दशा देखें।",
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

  // ------------------------------------------------------------------ 2c. Yogini Dasha (36-year cycle)
  const YOG = [
    { en: "Mangala", hi: "मंगला", p: "Moon", y: 1, good: true }, { en: "Pingala", hi: "पिंगला", p: "Sun", y: 2, good: false },
    { en: "Dhanya", hi: "धान्या", p: "Jupiter", y: 3, good: true }, { en: "Bhramari", hi: "भ्रामरी", p: "Mars", y: 4, good: false },
    { en: "Bhadrika", hi: "भद्रिका", p: "Mercury", y: 5, good: true }, { en: "Ulka", hi: "उल्का", p: "Saturn", y: 6, good: false },
    { en: "Siddha", hi: "सिद्धा", p: "Venus", y: 7, good: true }, { en: "Sankata", hi: "संकटा", p: "Rahu", y: 8, good: false },
  ];
  const YR = 365.25;
  function yoginiDasha(k) {
    const nk = k.planets.Moon.nak, span = 360 / 27, frac = (k.planets.Moon.lon % span) / span;
    let i = (nk + 1 + 3) % 8; i = i === 0 ? 7 : i - 1;                  // (nakshatra no. + 3) mod 8, 0 → Sankata
    const out = []; let start = k.jd - frac * YOG[i].y * YR;              // the running yogini began before birth
    for (let n = 0; n < 12; n++) { const Y = YOG[(i + n) % 8], end = start + Y.y * YR; out.push({ i: (i + n) % 8, start, end }); start = end; }
    return out;
  }
  const yAntar = d => { const res = []; let s = d.start; for (let n = 0; n < 8; n++) { const j = (d.i + n) % 8, len = YOG[d.i].y * YOG[j].y / 36 * YR; res.push({ i: j, start: s, end: s + len }); s += len; } return res; };
  function yoginiHtml(k) {
    const x = X(), L = yoginiDasha(k).filter(d => d.end > k.jd).slice(0, 9), now = julianDayNow(), cur = L.find(d => now >= d.start && now < d.end);
    const nm = j => `${YOG[j][LANG]} <span class="sub">(${pn(YOG[j].p)})</span>`;
    let h = `<h2>${x.yT}</h2><p class="tag" style="text-align:left;margin:0 0 10px">${x.yIntro}</p>`;
    if (cur) h += `<p>${x.yNow(YOG[cur.i][LANG], pn(YOG[cur.i].p), fmt(cur.end), YOG[cur.i].good)}</p>`;
    h += `<div class="two"><div><table><tr><th>${x.yMD}</th><th>${x.yFrom}</th><th>${x.yTo}</th></tr>` + L.map(d => `<tr class="${now >= d.start && now < d.end ? "dasha-now" : ""}"><td>${nm(d.i)} · ${YOG[d.i].y}${YOG[d.i].y === 1 ? x.yr1 : x.yrs}</td><td>${fmt(Math.max(d.start, k.jd))}</td><td>${fmt(d.end)}</td></tr>`).join("") + `</table></div>`;
    if (cur) h += `<div><table><tr><th>${x.yAD(YOG[cur.i][LANG])}</th><th>${x.yFrom}</th><th>${x.yTo}</th></tr>` + yAntar(cur).map(a => `<tr class="${now >= a.start && now < a.end ? "dasha-now" : ""}"><td>${nm(a.i)}</td><td>${fmt(a.start)}</td><td>${fmt(a.end)}</td></tr>`).join("") + `</table></div>`;
    return h + `</div><p class="sub">${x.yNote}</p>`;
  }

  // ------------------------------------------------------------------ 2d. Varshphal (Tajik solar return)
  let varshOffset = 0;
  const MUNTHA_GOOD = [1, 2, 3, 5, 9, 10, 11];
  function solarReturn(k, year) {
    const natal = k.planets.Sun.lon, [, M, D] = k.inp.dob.split("-").map(Number);
    let a = julianDay(year, M, D, 0) - 3, b = a + 6; const f = jd => ((positionsAt(jd).Sun - natal + 540) % 360) - 180;
    for (let i = 0; i < 45; i++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; }
    return (a + b) / 2;
  }
  function varshHtml(k) {
    const x = X(), by = +k.inp.dob.slice(0, 4), now = julianDayNow();
    let year = new Date().getUTCFullYear(); if (solarReturn(k, year) > now) year--; year += varshOffset; if (year <= by) { year = by + 1; varshOffset = year - (new Date().getUTCFullYear()); }
    const jd = solarReturn(k, year), age = year - by, tz = k.inp.tz ?? 5.5, P = positionsAt(jd);
    const T_ = (jd + deltaT(jd) / 86400 - 2451545) / 36525, asc = norm(ascendant(jd, k.inp.lat, k.inp.lon) - ayanamsa(T_)), vl = Math.floor(asc / 30);
    const m = {}; PL.forEach(p => m[p] = Math.floor(P[p] / 30)); m.Lagna = vl;
    const mun = (k.lagna + age) % 12, mh = ((mun - vl + 12) % 12) + 1, good = MUNTHA_GOOD.includes(mh);
    const d = new Date((jd - 2440587.5) * 864e5 + tz * 36e5), when = d.toLocaleDateString(LANG === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) + ", " + timeTxt(jd, tz);
    const jh = ((m.Jupiter - vl + 12) % 12) + 1, sh = ((m.Saturn - vl + 12) % 12) + 1;
    let h = `<h2>${x.vT}</h2><p class="tag" style="text-align:left;margin:0 0 10px">${x.vIntro}</p>`;
    h += `<div class="tabs"><button class="tab" data-vy="-1">◀ ${year - 1}</button><button class="tab on">${year}–${year + 1} · ${x.vAge(age)}</button><button class="tab" data-vy="1">${year + 1} ▶</button></div>`;
    h += `<div class="two"><div>${northChart(vl, m, null)}</div><div><div class="kv">` +
      [[x.vEntry, when], [x.vLagna, `${sn(vl)} ${Math.floor(asc % 30)}°`], [x.vMuntha, `${sn(mun)} · ${x.vHouse(mh)}`], [x.vMlord, pn(LORD[mun])]].map(([a, b]) => `<div><small>${a}</small><b>${b}</b></div>`).join("") + `</div>`;
    h += `<p>${x.vMres(mh, good)}</p><p>${x.vPl(pn("Jupiter"), jh, [1, 2, 4, 5, 7, 9, 10, 11].includes(jh))} ${x.vPl(pn("Saturn"), sh, [3, 6, 11].includes(sh))}</p></div></div>`;
    return h + `<p class="sub">${x.vNote}</p>`;
  }

  // ------------------------------------------------------------------ 3b. monthly & yearly rashifal (transits from the Moon sign)
  let rPeriod = "today";
  const HTHEME = {
    en: ["", "health and confidence", "money and family", "courage, siblings and short travel", "home, mother and peace of mind", "children, studies and romance", "rivals, loans and health", "marriage and partnerships", "sudden changes and hidden matters", "luck, elders and spiritual growth", "career and status", "income and friends", "expenses, travel and sleep"],
    hi: ["", "स्वास्थ्य और आत्मविश्वास", "धन और परिवार", "साहस, भाई-बहन और छोटी यात्राएँ", "घर, माता और मन की शांति", "संतान, पढ़ाई और प्रेम", "विरोधी, कर्ज़ और स्वास्थ्य", "विवाह और साझेदारी", "अचानक बदलाव और छिपे विषय", "भाग्य, बड़े और आध्यात्मिक उन्नति", "करियर और प्रतिष्ठा", "आय और मित्र", "खर्च, यात्रा और नींद"],
  };
  const transitLine = (p, h) => { const g = GOCHAR_GOOD[p].includes(h), th = HTHEME[LANG][h];
    return LANG === "hi" ? `<b>${pn(p)}</b> आपकी राशि से ${hiOrd(h)} भाव में — ${th} के लिए ${g ? "<span class=\"pill g\">शुभ</span>" : "<span class=\"pill b\">सावधानी</span>"}।`
                         : `<b>${pn(p)}</b> in your ${h}${[, "st", "nd", "rd"][h] || "th"} house from the Moon — ${g ? "<span class=\"pill g\">supports</span>" : "<span class=\"pill b\">needs care in</span>"} ${th}.`; };
  function periodHtml(r, kind) {
    const x = X(), tz = 5.5, now = new Date(Date.now() + tz * 36e5), Y = now.getUTCFullYear(), Mo = now.getUTCMonth();
    const startD = kind === "month" ? new Date(Date.UTC(Y, Mo, 1)) : new Date(Date.UTC(Y, 0, 1)), endD = kind === "month" ? new Date(Date.UTC(Y, Mo + 1, 1)) : new Date(Date.UTC(Y + 1, 0, 1));
    const jd0 = julianDay(startD.getUTCFullYear(), startD.getUTCMonth() + 1, startD.getUTCDate(), 6.5 - tz), jd1 = julianDay(endD.getUTCFullYear(), endD.getUTCMonth() + 1, endD.getUTCDate(), 6.5 - tz);
    const hOf = (p, jd) => ((Math.floor(positionsAt(jd)[p] / 30) - r + 12) % 12) + 1, label = kind === "month" ? startD.toLocaleDateString(LANG === "hi" ? "hi-IN" : "en-IN", { month: "long", year: "numeric", timeZone: "UTC" }) : String(Y);
    const planets = kind === "month" ? ["Sun", "Mars", "Mercury", "Venus", "Jupiter", "Saturn", "Rahu"] : ["Jupiter", "Saturn", "Rahu", "Ketu"];
    let score = 0, n = 0, lines = [], events = [];
    for (const p of planets) {
      const h0 = hOf(p, jd0); lines.push(transitLine(p, h0)); score += GOCHAR_GOOD[p].includes(h0) ? (p === "Jupiter" || p === "Saturn" ? 2 : 1) : 0; n += p === "Jupiter" || p === "Saturn" ? 2 : 1;
      // sign changes and retrograde stations in the period
      let prevS = Math.floor(positionsAt(jd0)[p] / 30), prevL = positionsAt(jd0)[p], retro = null;
      for (let jd = jd0 + 1; jd < jd1; jd += 1) {
        const L = positionsAt(jd)[p], s = Math.floor(L / 30), mv = ((L - prevL + 540) % 360) - 180;
        if (s !== prevS) events.push([jd, x.ev(pn(p), sn(s), ((s - r + 12) % 12) + 1, GOCHAR_GOOD[p].includes(((s - r + 12) % 12) + 1))]);
        if (!["Rahu", "Ketu", "Sun"].includes(p)) { const rt = mv < 0; if (retro !== null && rt !== retro) events.push([jd, rt ? x.evR(pn(p)) : x.evD(pn(p))]); retro = rt; }
        prevS = s; prevL = L;
      }
    }
    const stars = Math.max(1, Math.min(5, Math.round(score / n * 5 + 0.4)));
    let h = `<h3><span class="sym">${SIGN_SYM[r]}</span> ${sn(r)} — ${label}</h3><p><span class="stars">${"★".repeat(stars)}${"☆".repeat(5 - stars)}</span> <span class="sub">${x.rRating(kind)}</span></p>`;
    h += `<p>${x.rIntro(kind)}</p><ul>${lines.map(l => `<li>${l}</li>`).join("")}</ul>`;
    if (events.length) h += `<h3>${x.rEvents(kind)}</h3><table>${events.sort((a, b) => a[0] - b[0]).map(([jd, t]) => `<tr><td style="white-space:nowrap">${new Date((jd - 2440587.5) * 864e5 + tz * 36e5).toLocaleDateString(LANG === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", timeZone: "UTC" })}</td><td>${t}</td></tr>`).join("")}</table>`;
    if (kind === "month") { // good Moon days (Chandrabalam): Moon in 1, 3, 6, 7, 10, 11 from the sign, at sunrise
      const good = []; for (let jd = jd0; jd < jd1; jd += 1) { const h_ = hOf("Moon", jd); if ([1, 3, 6, 7, 10, 11].includes(h_)) good.push(new Date((jd - 2440587.5) * 864e5 + tz * 36e5).getUTCDate()); }
      h += `<h3>${x.rGood}</h3><p>${good.join(", ")}</p>`;
    } else {
      const sat = (sgn => ((sgn - r + 12) % 12) + 1)(Math.floor(positionsAt(jd0).Saturn / 30));
      if ([12, 1, 2].includes(sat)) h += `<p class="sub">⚠ ${x.rSS}</p>`; else if ([4, 8].includes(sat)) h += `<p class="sub">⚠ ${x.rDh}</p>`;
    }
    return h + `<p class="sub">${x.rNote}</p>`;
  }
  function renderPeriodTabs() {
    const box = document.getElementById("rashifal"); if (!box) return; const x = X();
    const tabs = `<div class="tabs" id="rpTabs">${["today", "month", "year"].map(t => `<button class="tab ${t === rPeriod ? "on" : ""}" data-rp="${t}">${x.rp[t]}</button>`).join("")}</div>`;
    if (rPeriod !== "today") box.innerHTML = periodHtml(selRashi ?? 0, rPeriod);
    box.insertAdjacentHTML("afterbegin", tabs);
    box.querySelectorAll("[data-rp]").forEach(b => b.onclick = () => { rPeriod = b.dataset.rp; renderRashifal(); });
  }

  // ------------------------------------------------------------------ 2e. Shadbala (BPHS Ch. 27) — six-fold strength, in virupas (60 = 1 rupa)
  const SB_P = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const DEEP_EX = { Sun: 10, Moon: 33, Mars: 298, Mercury: 165, Jupiter: 95, Venus: 357, Saturn: 200 };
  const MOOLA = { Sun: [120, 140], Moon: [33, 60], Mars: [0, 12], Mercury: [165, 170], Jupiter: [240, 250], Venus: [180, 195], Saturn: [300, 320] };
  const NAISARGIKA = { Sun: 60, Moon: 51.43, Venus: 42.86, Jupiter: 34.29, Mercury: 25.71, Mars: 17.14, Saturn: 8.57 };
  const REQUIRED = { Sun: 5, Moon: 6, Mars: 5, Mercury: 7, Jupiter: 6.5, Venus: 5.5, Saturn: 5 };
  const sgn = l => Math.floor(norm(l) / 30), dgr = l => norm(l) % 30;
  const VARGA = {
    D1: l => sgn(l),
    D2: l => { const s = sgn(l), first = dgr(l) < 15; return (s % 2 === 0) === first ? 4 : 3; },             // Parashara hora: Leo (Sun) / Cancer (Moon)
    D3: l => (sgn(l) + [0, 4, 8][Math.floor(dgr(l) / 10)]) % 12,
    D7: l => (sgn(l) + (sgn(l) % 2 === 0 ? 0 : 6) + Math.floor(dgr(l) / (30 / 7))) % 12,
    D9: l => Math.floor(norm(l) * 9 / 30) % 12,
    D12: l => (sgn(l) + Math.floor(dgr(l) / 2.5)) % 12,
    D30: l => { const d = dgr(l); return sgn(l) % 2 === 0 ? (d < 5 ? 0 : d < 10 ? 10 : d < 18 ? 8 : d < 25 ? 2 : 6) : (d < 5 ? 1 : d < 12 ? 5 : d < 20 ? 11 : d < 25 ? 9 : 7); },
  };
  function compoundRel(k, p, q) { // p's compound relationship towards q: 2 great friend … -2 great enemy
    const nat = FRIENDS[p].F.includes(q) ? 1 : FRIENDS[p].E.includes(q) ? -1 : 0;
    const h = ((k.planets[q].sign - k.planets[p].sign + 12) % 12) + 1, tmp = [2, 3, 4, 10, 11, 12].includes(h) ? 1 : -1;
    return nat + tmp;
  }
  function shadbala(k) {
    const P = k.planets, jd = k.jd, T_ = (jd + deltaT(jd) / 86400 - 2451545) / 36525, ay = ayanamsa(T_), eps = 23.439291 - 0.0130042 * T_;
    const [Y, M, D] = k.inp.dob.split("-").map(Number), tz = effectiveTz(k.inp.tz, Y, M, D);
    let sr = sunriseJD(Y, M, D, k.inp.lat, k.inp.lon, tz), ss = sunsetJD(Y, M, D, k.inp.lat, k.inp.lon, tz);
    const day = jd >= sr && jd < ss; let vedicDay = new Date(Date.UTC(Y, M - 1, D));
    if (jd < sr) { vedicDay = new Date(vedicDay.getTime() - 864e5); const d = vedicDay; sr = sunriseJD(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), k.inp.lat, k.inp.lon, tz); ss = sunsetJD(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), k.inp.lat, k.inp.lon, tz); }
    const nextD = new Date(vedicDay.getTime() + 864e5), sr2 = sunriseJD(nextD.getUTCFullYear(), nextD.getUTCMonth() + 1, nextD.getUTCDate(), k.inp.lat, k.inp.lon, tz);
    const dow = vedicDay.getUTCDay(), elong = norm(P.Moon.lon - P.Sun.lon), waxing = elong < 180;
    const benefic = p => p === "Jupiter" || p === "Venus" || p === "Mercury" || (p === "Moon" && waxing);
    // MC for dig bala
    const gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545)), ramc = norm(gmst + k.inp.lon);
    const mc = norm(Math.atan2(sin(ramc), cos(ramc) * cos(eps)) * R2D - ay), asc = k.asc;
    const DIG_STRONG = { Sun: mc, Mars: mc, Jupiter: asc, Mercury: asc, Saturn: norm(asc + 180), Moon: norm(mc + 180), Venus: norm(mc + 180) };
    // Sun's hour angle for nathonnata
    const lamT = norm(P.Sun.lon + ay), raS = norm(Math.atan2(cos(eps) * sin(lamT), cos(lamT)) * R2D);
    let H = norm(ramc - raS); if (H > 180) H -= 360;
    // planetary hour lord and Kali ahargana lords (abda / masa)
    const CHALDEAN = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"], DAYL = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    const horaLen = day ? (ss - sr) / 12 : (sr2 - ss) / 12, horaN = Math.floor((jd - (day ? sr : ss)) / horaLen) + (day ? 0 : 12);
    const horaLord = CHALDEAN[(CHALDEAN.indexOf(DAYL[dow]) + horaN) % 7];
    const ahar = Math.floor(jd + tz / 24 + 0.5) - 588466;                    // days since the Kali epoch (Friday)
    const wd = n => DAYL[((n % 7) + 7 + 5) % 7];
    const abdaLord = wd(Math.floor(ahar / 360) * 360), masaLord = wd(Math.floor(ahar / 30) * 30);
    // cheshta kendra helpers (mean longitudes from the orbital elements)
    const meanL = p => { const e = EL[p]; return norm(e[6] + e[7] * T_); }, meanSun = norm(meanL("Earth") + 180);
    const out = {};
    for (const p of SB_P) {
      const lon = P[p].lon, s = P[p].sign, R = {};
      // ---- 1. Sthana bala
      let dd = Math.abs(norm(lon - DEEP_EX[p] + 180)); dd = dd > 180 ? 360 - dd : dd; const uchcha = dd / 3;
      let sapta = 0;
      for (const v in VARGA) {
        const vs = VARGA[v](lon), lord = LORD[vs];
        if (v === "D1" && norm(lon) >= MOOLA[p][0] && norm(lon) < MOOLA[p][1]) sapta += 45;
        else if (lord === p) sapta += 30;
        else sapta += { 2: 22.5, 1: 15, 0: 7.5, "-1": 3.75, "-2": 1.875 }[compoundRel(k, p, lord)];
      }
      const fem = p === "Moon" || p === "Venus";
      const oja = ((s % 2 === 1) === fem ? 15 : 0) + ((VARGA.D9(lon) % 2 === 1) === fem ? 15 : 0);
      const hs = ((s - k.lagna + 12) % 12) + 1, kendra = [1, 4, 7, 10].includes(hs) ? 60 : [2, 5, 8, 11].includes(hs) ? 30 : 15;
      const dk = Math.floor(dgr(lon) / 10), drek = ({ Sun: 0, Mars: 0, Jupiter: 0, Mercury: 1, Saturn: 1, Moon: 2, Venus: 2 }[p] === dk) ? 15 : 0;
      R.sthana = uchcha + sapta + oja + kendra + drek;
      // ---- 2. Dig bala
      let dg = Math.abs(norm(lon - DIG_STRONG[p])); dg = dg > 180 ? 360 - dg : dg; R.dig = (180 - dg) / 3;
      // ---- 3. Kala bala
      const nath = p === "Mercury" ? 60 : ["Sun", "Jupiter", "Venus"].includes(p) ? (180 - Math.abs(H)) / 3 : Math.abs(H) / 3;
      const pk = (elong > 180 ? 360 - elong : elong) / 3, paksha = (benefic(p) ? pk : 60 - pk) * (p === "Moon" ? 2 : 1);
      const part = day ? Math.floor((jd - sr) / ((ss - sr) / 3)) : Math.floor((jd - ss) / ((sr2 - ss) / 3));
      const tri = p === "Jupiter" || (day ? ["Mercury", "Sun", "Saturn"][part] === p : ["Moon", "Venus", "Mars"][part] === p) ? 60 : 0;
      const avmh = (abdaLord === p ? 15 : 0) + (masaLord === p ? 30 : 0) + (DAYL[dow] === p ? 45 : 0) + (horaLord === p ? 60 : 0);
      const decl = Math.asin(sin(eps) * sin(norm(lon + ay))) * R2D;
      let ayana = (["Moon", "Saturn"].includes(p) ? 24 - decl : p === "Mercury" ? 24 + Math.abs(decl) : 24 + decl) / 48 * 60; if (p === "Sun") ayana *= 2;
      R.kala = nath + paksha + tri + avmh + ayana;
      // ---- 4. Cheshta bala
      if (p === "Sun") R.cheshta = ayana / 2;
      else if (p === "Moon") R.cheshta = paksha / 2;
      else {
        const sup = ["Mars", "Jupiter", "Saturn"].includes(p), sigh = sup ? meanSun : meanL(p), madhya = sup ? meanL(p) : meanSun, tru = norm(lon + ay);
        let ck = norm(sigh - (madhya + tru) / 2); if (Math.abs(madhya - tru) > 180) ck = norm(ck + 180); ck = ck > 180 ? 360 - ck : ck; R.cheshta = ck / 3;
      }
      // ---- 5. Naisargika
      R.nais = NAISARGIKA[p];
      out[p] = R;
    }
    // ---- 6. Drik bala (aspects received; benefic +, malefic −, quarter value)
    const aspectVal = (q, d) => { let v = d >= 30 && d < 60 ? (d - 30) / 2 : d >= 60 && d < 90 ? d - 60 + 15 : d >= 90 && d < 120 ? (120 - d) / 2 + 30 : d >= 120 && d < 150 ? 150 - d : d >= 150 && d < 180 ? (d - 150) * 2 : d >= 180 && d < 300 ? (300 - d) / 2 : 0;
      if (q === "Mars" && ((d >= 90 && d <= 120) || (d >= 210 && d <= 240))) v += 15;
      if (q === "Jupiter" && ((d >= 120 && d <= 150) || (d >= 240 && d <= 270))) v += 30;
      if (q === "Saturn" && ((d >= 60 && d <= 90) || (d >= 270 && d <= 300))) v += 45; return v; };
    for (const p of SB_P) { let sum = 0; for (const q of SB_P) { if (q === p) continue; const v = aspectVal(q, norm(P[p].lon - P[q].lon)); sum += benefic(q) ? v : -v; } out[p].drik = sum / 4; }
    for (const p of SB_P) { const R = out[p]; R.total = R.sthana + R.dig + R.kala + R.cheshta + R.nais + R.drik; R.rupa = R.total / 60; R.ratio = R.rupa / REQUIRED[p]; }
    return out;
  }
  function shadbalaHtml(k) {
    const x = X(), S = shadbala(k), r = v => (v / 60).toFixed(2);
    const ranked = SB_P.slice().sort((a, b) => S[b].ratio - S[a].ratio);
    let h = `<h2>${x.sbT}</h2><p class="tag" style="text-align:left;margin:0 0 10px">${x.sbIntro}</p>`;
    h += `<div style="overflow-x:auto"><table class="avt"><tr><th></th>${x.sbCols.map(c => `<th>${c}</th>`).join("")}</tr>` + SB_P.map(p => { const R = S[p];
      return `<tr><td>${pn(p)}</td><td><b>${R.rupa.toFixed(2)}</b></td><td>${REQUIRED[p]}</td><td><span class="pill ${R.ratio >= 1 ? "g" : "b"}">${R.ratio.toFixed(2)}×</span></td><td>${r(R.sthana)}</td><td>${r(R.dig)}</td><td>${r(R.kala)}</td><td>${r(R.cheshta)}</td><td>${r(R.nais)}</td><td>${r(R.drik)}</td></tr>`; }).join("") + `</table></div>`;
    h += `<p>${x.sbSum(pn(ranked[0]), pn(ranked[1]), pn(ranked[6]), ranked.filter(p => S[p].ratio < 1).map(pn))}</p><p class="sub">${x.sbNote}</p>`;
    return h;
  }

  function renderMore(k) {
    if (!k) return;
    let a = document.getElementById("moreCharts"), b = document.getElementById("avakahada");
    if (!a) {
      const anchor = document.getElementById("chart").closest("section");
      anchor.insertAdjacentHTML("afterend", `<section class="card" id="moreCharts"></section><section class="card" id="avakahada"></section><section class="card" id="ashtak"></section><section class="card" id="shadbala"></section><section class="card" id="yogini"></section><section class="card" id="varsh"></section>`);
      a = document.getElementById("moreCharts"); b = document.getElementById("avakahada");
      a.addEventListener("click", e => { const t = e.target.closest("[data-ct]"); if (t) { chartTab = t.dataset.ct; a.innerHTML = moreChartsHtml(K); } });
    }
    a.innerHTML = moreChartsHtml(k); b.innerHTML = avakahadaHtml(k); document.getElementById("ashtak").innerHTML = ashtakavargaHtml(k); document.getElementById("shadbala").innerHTML = shadbalaHtml(k);
    document.getElementById("yogini").innerHTML = yoginiHtml(k); document.getElementById("varsh").innerHTML = varshHtml(k);
    document.getElementById("varsh").onclick = e => { const t = e.target.closest("[data-vy]"); if (t) { varshOffset += +t.dataset.vy; document.getElementById("varsh").innerHTML = varshHtml(K); } };
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
  window.renderRashifal = function () { _rashi(); try { renderPeriodTabs(); renderPanchang(); } catch (e) { console.error(e); } };
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
  window.Vedic = { shadbala, yoginiDasha, solarReturn, periodHtml, ashtakavarga, signOfD9, signOfD10, karanaOf, numerologyHtml, panchangHtml };
})();
