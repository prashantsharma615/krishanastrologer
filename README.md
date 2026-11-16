# Krishan Astrologer – कृष्ण ज्योतिषी

Vedic astrology web app (installable PWA) in **Hindi and English**, with **Brihat Parashara Hora Shastra (BPHS)** as the classical source behind every answer.

Live: https://krishanastrologer.netlify.app/

## Features
- Exact Vedic kundli (sidereal, Lahiri ayanamsa), North Indian chart, nakshatra, Vimshottari dasha
- **Ask your problem** chat — answers in the language the question is written in (Devanagari/Hinglish → Hindi)
- Every answer: ① Problem summary → ② Astrological reasoning → ③ Prediction & timing (dasha) → ④ Remedies → 📖 Source line + expandable **Why?** listing each BPHS rule used
- Kundli Milan (36 gunas), Daily Rashifal + Panchang, Dosh check (Mangal, Kaal Sarp, Sade Sati)
- Install on Android (install prompt) and iPhone (Add to Home Screen guide); works offline

## Project structure
```
index.html            app UI, chart maths, existing features
js/kb.js              loads data/books.json and every book file; indexes rules by topic + match
js/engine.js          answer engine: maps question → houses/karakas, reads the chart, pulls rules, builds the answer
js/install.js         "Install App" button (Android prompt / iPhone steps)
data/books.json       list of classical books to load
data/bphs.json        BPHS knowledge base (generated)
tools/build_bphs.py   source of the BPHS knowledge base — edit here, then run: python3 tools/build_bphs.py
sw.js                 offline cache
```

## Knowledge-base format
Each entry: `id`, `topic`, `rule_en`, `rule_hi`, `source` (+ `match`, `confidence`).
Topics: `house`, `graha`, `planet_house`, `planet_sign`, `principle`, `yoga`, `dasha`, `antardasha`, `remedy`.
`confidence`: `chapter` (taught in the cited chapter) · `derived` (applied from BPHS principles) · `tradition` (later tradition, labelled as such).
Chapter numbers follow the R. Santhanam English edition (1984, 97 chapters). All rule text is original paraphrase.

## Adding another book (e.g. Phaladeepika, Brihat Jataka)
1. Create `data/phaladeepika.json` with `{"book": {...}, "entries": [...]}` using the same `topic` + `match` keys.
2. Add `{"id": "phaladeepika", "file": "data/phaladeepika.json"}` to `data/books.json`.
3. Add the file to `FILES` in `sw.js`. Its rules appear automatically under "Why?" next to the BPHS rule for the same topic.

Astrological guidance is for spiritual and informational purposes only and is not a substitute for medical, legal, or financial advice.

## More files
```
js/cities.js          296 searchable Indian + world cities with time zones
js/extras.js          city search, WhatsApp share, PDF/print, family profiles
terms.html            Terms of use (Hindi + English)
store/                Google Play listing kit: listing text, feature graphic, 8 screenshots
```
