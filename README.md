# Krishan Astrologer – कृष्ण ज्योतिषी

Vedic astrology web app (installable PWA) in **Hindi and English**, with **Brihat Parashara Hora Shastra (BPHS)** as the classical source behind every answer, and **Phaladeepika** (Mantreswara) as a second source shown alongside it.

Live: https://krishanastrologer.netlify.app/

## Features
- Exact Vedic kundli (sidereal, Lahiri ayanamsa), North Indian chart, nakshatra, Vimshottari dasha
- **Ask your problem** chat — answers in the language the question is written in (Devanagari/Hinglish → Hindi)
- Every answer: ① Problem summary → ② Astrological reasoning → ③ Prediction & timing (dasha) → ④ Remedies → 📖 Source line + expandable **Why?** listing each BPHS rule used
- Kundli Milan (36 gunas), Daily Rashifal + Panchang, Dosh check (Mangal, Kaal Sarp, Sade Sati)
- **More charts:** Navamsa (D9), Dashamsa (D10), Chandra kundli, Gochar chart + transit results from the Moon (Phaladeepika Ch. 26)
- **Avakahada chakra:** varna, vashya, yoni, gana, nadi, tatva, paya, nakshatra/rashi/lagna lords, naming letters, birth tithi-yoga-karana-vaar; gemstones (life/lucky/punya) and lucky day, number, colour
- **Full panchang & muhurat:** tithi, nakshatra, yoga, karana at sunrise; sunrise/sunset, Rahu Kaal, Yamaganda, Gulika, Abhijit; day & night Choghadiya
- **Ashtakavarga:** Bhinnashtakavarga for 7 planets + Sarvashtakavarga by house (BPHS Ch. 66–72), strong/weak houses, Jupiter & Saturn transit bindus
- **Festival & vrat calendar (12 months):** major festivals plus Ekadashi, Purnima, Amavasya, Pradosh, Sankashti, Masik Shivaratri, Sankranti, Panchak (start/end time and type: Rog, Raj, Agni, Chor, Mrityu) — amanta months with Adhik maas, festival-specific kaal rules, Smarta Ekadashi rules; checked against Drik Panchang 2027 & 2028 (New Delhi)
- **Yogini Dasha:** 8 Yoginis / 36-year cycle with sub-periods and the running period highlighted
- **Varshphal:** Tajik yearly chart for the Sun's return (Varsha Pravesh), Varsha lagna, Muntha and its lord, year-by-year navigation
- **Monthly & yearly rashifal:** transit-based forecasts per Moon sign with sign changes, retrograde/direct dates and favourable days
- **Numerology (Ank Jyotish):** Mulank, Bhagyank, name number (Chaldean) with ruling planet, lucky day/colour and remedy
- Install on Android (install prompt) and iPhone (Add to Home Screen guide); works offline

## Project structure
```
index.html            app UI, chart maths, existing features
js/kb.js              loads data/books.json and every book file; indexes rules by topic + match
js/engine.js          answer engine: maps question → houses/karakas, reads the chart, pulls rules, builds the answer
js/install.js         "Install App" button (Android prompt / iPhone steps)
data/books.json       list of classical books to load
data/bphs.json        BPHS knowledge base (generated)
data/phaladeepika.json Phaladeepika knowledge base (generated) — edit tools/build_phaladeepika.py, then run it
tools/build_bphs.py   source of the BPHS knowledge base — edit here, then run: python3 tools/build_bphs.py
sw.js                 offline cache
```

## Knowledge-base format
Each entry: `id`, `topic`, `rule_en`, `rule_hi`, `source` (+ `match`, `confidence`).
Topics: `house`, `graha`, `planet_house`, `planet_sign`, `principle`, `yoga`, `dasha`, `antardasha`, `remedy`.
`confidence`: `chapter` (taught in the cited chapter) · `derived` (applied from BPHS principles) · `tradition` (later tradition, labelled as such).
Chapter numbers follow the R. Santhanam English edition (1984, 97 chapters). All rule text is original paraphrase.

## Adding another book (e.g. Brihat Jataka, Saravali)
Phaladeepika is already added this way (155 rules: houses, planets, planet-in-house from Ch. 8, yogas, dashas).
1. Create `data/<book>.json` with `{"book": {...}, "entries": [...]}` using the same `topic` + `match` keys.
2. Add `{"id": "<book>", "file": "data/<book>.json"}` to `data/books.json`.
3. Add the file to `FILES` in `sw.js`. Its rules appear automatically under "Why?" next to the BPHS rule for the same topic.

Astrological guidance is for spiritual and informational purposes only and is not a substitute for medical, legal, or financial advice.

## More files
```
js/cities.js          296 searchable Indian + world cities with time zones
js/vedic.js           divisional/transit charts, Avakahada, gems, full panchang & choghadiya, numerology
js/calendar.js        festival & vrat calendar
js/extras.js          city search, WhatsApp share, PDF/print, family profiles
terms.html            Terms of use (Hindi + English)
store/                Google Play listing kit: listing text, feature graphic, 8 screenshots
```
