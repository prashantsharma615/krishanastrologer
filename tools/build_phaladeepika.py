#!/usr/bin/env python3
"""
Builds data/phaladeepika.json — the Phaladeepika (Mantreswara) knowledge base for Krishan Astrologer.

Phaladeepika is the second classical book in the app. BPHS stays the primary source; Phaladeepika rules
use the same topic + match keys, so they appear under "Why?" as "Also in Phaladeepika" next to the BPHS rule.

All wording is original paraphrase of the classical results (no modern translation is copied).
Chapter numbers follow the standard 28-adhyaya arrangement (as in V. Subrahmanya Sastri's edition):
  1 Definitions · 2 Planets · 6 Yogas · 7 Maharajayogas · 8 Effects of planets in houses · 10 Seventh house
  15 Method of judging the Bhavas · 16 General effects of the 12 Bhavas · 19 Dasas and their effects

confidence: "chapter" -> the result is taught in the cited chapter
            "derived" -> applied from the chapter's principles (e.g. the nodes, which the text treats briefly)

Run:  python3 tools/build_phaladeepika.py
"""
import json, os

P = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"]
PH = {"Sun":"सूर्य","Moon":"चंद्र","Mars":"मंगल","Mercury":"बुध","Jupiter":"गुरु","Venus":"शुक्र","Saturn":"शनि","Rahu":"राहु","Ketu":"केतु"}
ORD = {1:"1st",2:"2nd",3:"3rd"}; o = lambda n: ORD.get(n, f"{n}th")
HO = {1:"पहले",2:"दूसरे",3:"तीसरे",4:"चौथे",5:"पाँचवें",6:"छठे",7:"सातवें",8:"आठवें",9:"नौवें",10:"दसवें",11:"ग्यारहवें",12:"बारहवें"}
B = "Phaladeepika"
E = []
def add(id, topic, en, hi, source, conf="chapter", match=None, **extra):
    e = {"id": "pd." + id, "topic": topic, "rule_en": en, "rule_hi": hi, "source": source, "confidence": conf}
    if match: e["match"] = match
    e.update(extra); E.append(e)

# ---------------------------------------------------------------- 1. HOUSES (Ch. 1, Ch. 15, Ch. 16)
HOUSES = {
 1:("the self, body, health, fame and the general course of life","स्वयं, शरीर, स्वास्थ्य, यश और जीवन की सामान्य दिशा"),
 2:("wealth, family, speech, the face, food and learning","धन, परिवार, वाणी, मुख, भोजन और विद्या"),
 3:("courage, younger siblings, servants, effort and short travel","साहस, छोटे भाई-बहन, सेवक, प्रयास और छोटी यात्राएँ"),
 4:("mother, home, vehicles, land, relatives and happiness","माता, घर, वाहन, भूमि, संबंधी और सुख"),
 5:("children, intelligence, wisdom, mantra and merit from past life","संतान, बुद्धि, विवेक, मंत्र और पूर्व जन्म का पुण्य"),
 6:("enemies, disease, debts, injuries, worries and service","शत्रु, रोग, कर्ज़, चोट, चिंताएँ और सेवा"),
 7:("spouse, marriage, partners, desire and journeys","जीवनसाथी, विवाह, साझेदार, कामना और यात्राएँ"),
 8:("longevity, obstacles, sudden troubles, hidden matters and inheritance","आयु, बाधाएँ, अचानक कष्ट, गुप्त विषय और विरासत"),
 9:("fortune, father, guru, dharma, charity and pilgrimage","भाग्य, पिता, गुरु, धर्म, दान और तीर्थ"),
 10:("work, status, honour, authority and good deeds","कर्म, पद, सम्मान, अधिकार और सत्कर्म"),
 11:("income, gains, elder siblings and fulfilment of desires","आय, लाभ, बड़े भाई-बहन और इच्छाओं की पूर्ति"),
 12:("expenses, losses, sleep, foreign lands and liberation","खर्च, हानि, नींद, विदेश और मोक्ष"),
}
for h, (en, hi) in HOUSES.items():
    add(f"house.{h}", "house",
        f"Mantreswara lists the {o(h)} house as showing {en}. A house prospers when its lord is strong and well placed and benefics occupy or aspect it; it suffers when its lord falls in the 6th, 8th or 12th, is debilitated or combust.",
        f"मंत्रेश्वर के अनुसार {HO[h]} भाव से {hi} देखे जाते हैं। भाव तब फलता है जब उसका स्वामी बलवान और शुभ स्थान में हो तथा शुभ ग्रह उसमें बैठें या उसे देखें; स्वामी 6, 8 या 12 में, नीच या अस्त हो तो भाव कमज़ोर होता है।",
        f"{B}, Ch. 1 (Definitions) & Ch. 15–16 (Judging the Bhavas)", match={"house": h})

# ---------------------------------------------------------------- 2. GRAHAS (Ch. 2)
GR = {
 "Sun":("father, soul, power, the king/government, copper, the eyes and bones","पिता, आत्मा, शक्ति, राजा/सरकार, ताँबा, आँखें और हड्डियाँ"),
 "Moon":("mother, mind, sleep, happiness, water, milk, pearls and travel by water","माता, मन, नींद, सुख, जल, दूध, मोती और जल-यात्रा"),
 "Mars":("courage, brothers, land, fire, weapons, blood, disputes and commanders","साहस, भाई, भूमि, अग्नि, शस्त्र, रक्त, विवाद और सेनापति"),
 "Mercury":("learning, speech, wit, mathematics, writing, trade and maternal uncles","विद्या, वाणी, चतुराई, गणित, लेखन, व्यापार और मामा"),
 "Jupiter":("wisdom, children, the guru, wealth, scriptures, virtue and the body's strength","ज्ञान, संतान, गुरु, धन, शास्त्र, सद्गुण और शरीर का बल"),
 "Venus":("spouse, love, vehicles, ornaments, music and arts, perfumes and luxury","जीवनसाथी, प्रेम, वाहन, आभूषण, संगीत और कला, सुगंध और ऐश्वर्य"),
 "Saturn":("longevity, hardship, servants, old age, iron, delays and labour","आयु, कठिनाई, सेवक, वृद्धावस्था, लोहा, देरी और श्रम"),
 "Rahu":("the paternal grandfather, foreign people, snakes, sudden events and unusual paths","दादा, विदेशी लोग, सर्प, अचानक घटनाएँ और असामान्य रास्ते"),
 "Ketu":("the maternal grandfather, detachment, moksha, wounds and occult knowledge","नाना, वैराग्य, मोक्ष, घाव और गूढ़ ज्ञान"),
}
for p, (en, hi) in GR.items():
    node = p in ("Rahu", "Ketu")
    add(f"graha.{p.lower()}", "graha",
        f"Phaladeepika makes {p} the significator of {en}.",
        f"फलदीपिका में {PH[p]} को {hi} का कारक बताया गया है।",
        f"{B}, Ch. 2 (Planets and their varieties)", "derived" if node else "chapter", match={"planet": p})

# ---------------------------------------------------------------- 3. PLANET IN HOUSE (Ch. 8)
# (text_en, text_hi, tone)
PHX = {
 "Sun": {
  1:("is bold and self-respecting with strong willpower, but quick-tempered; the eyes and head need care.","साहसी, स्वाभिमानी और दृढ़ इच्छाशक्ति वाला, पर जल्दी क्रोधित होने वाला; आँखों और सिर का ध्यान रखें।","mixed"),
  2:("money comes and goes, and dealings with authorities can cost money; speech should be kept gentle.","धन आता-जाता रहता है और अधिकारियों से जुड़े मामलों में खर्च हो सकता है; वाणी नरम रखनी चाहिए।","bad"),
  3:("is courageous, capable and prosperous; wins through own effort, though siblings may face difficulties.","साहसी, योग्य और समृद्ध; अपने प्रयास से जीतता है, पर भाई-बहनों को कठिनाई हो सकती है।","good"),
  4:("the mind is restless and home comforts or property bring worries, though public or government work is possible.","मन बेचैन रहता है और घर के सुख या संपत्ति को लेकर चिंता रहती है, पर सरकारी या सार्वजनिक कार्य संभव है।","bad"),
  5:("is intelligent and ambitious, but children may be few or come late, and the mind tends to wander.","बुद्धिमान और महत्वाकांक्षी, पर संतान कम या देर से हो सकती है और मन भटकता रहता है।","mixed"),
  6:("overcomes enemies, becomes known and powerful, and has strong digestion and good health.","शत्रुओं पर विजय पाता है, प्रसिद्ध और प्रभावशाली होता है, और पाचन व स्वास्थ्य अच्छा रहता है।","good"),
  7:("ego can enter married life and partnerships; travel and some friction with authorities are shown.","वैवाहिक जीवन और साझेदारी में अहं आ सकता है; यात्राएँ और अधिकारियों से कुछ टकराव दिखता है।","bad"),
  8:("finances and eyesight need care and friends may be few; patience in sudden situations is advised.","धन और आँखों का ध्यान रखना होता है और मित्र कम हो सकते हैं; अचानक स्थितियों में धैर्य की सलाह है।","bad"),
  9:("has wealth, friends and children and respects the divine, but differences with the father are possible.","धन, मित्र और संतान होती है और ईश्वर में श्रद्धा रहती है, पर पिता से मतभेद संभव है।","mixed"),
  10:("gains fame, authority, wealth and success — one of the Sun's best placements.","यश, अधिकार, धन और सफलता पाता है — सूर्य की सबसे अच्छी स्थितियों में से एक।","good"),
  11:("earns well, often with support from government or powerful people, and most wishes are fulfilled.","अच्छी आय होती है, अक्सर सरकार या प्रभावशाली लोगों के सहयोग से, और अधिकतर इच्छाएँ पूरी होती हैं।","good"),
  12:("expenses rise, the eyes need care and distance from the father is possible; spending should be planned.","खर्च बढ़ते हैं, आँखों का ध्यान रखना होता है और पिता से दूरी संभव है; खर्च की योजना बनानी चाहिए।","bad"),
 },
 "Moon": {
  1:("when the Moon is strong, the person is attractive, healthy and well off; a weak Moon makes the mind changeable.","चंद्र बलवान हो तो व्यक्ति आकर्षक, स्वस्थ और संपन्न होता है; कमज़ोर चंद्र मन को चंचल बनाता है।","mixed"),
  2:("has wealth, a pleasant way of speaking, a good family and many comforts.","धन, मधुर वाणी, अच्छा परिवार और अनेक सुख-सुविधाएँ होती हैं।","good"),
  3:("has supportive siblings and courage, though the mind can be restless.","सहयोगी भाई-बहन और साहस होता है, यद्यपि मन बेचैन रह सकता है।","mixed"),
  4:("is happy, has comforts, vehicles and friends, and shares a close bond with the mother.","सुखी होता है, सुख-सुविधा, वाहन और मित्र होते हैं, और माता से गहरा संबंध रहता है।","good"),
  5:("is intelligent and gentle, with good children and good fortune.","बुद्धिमान और सौम्य होता है, अच्छी संतान और अच्छा भाग्य मिलता है।","good"),
  6:("digestion and stamina need care and rivals may take advantage of a soft nature.","पाचन और ऊर्जा का ध्यान रखना होता है और विरोधी कोमल स्वभाव का लाभ उठा सकते हैं।","bad"),
  7:("gets an attractive, affectionate spouse and is emotionally attached to the partner.","आकर्षक और स्नेही जीवनसाथी मिलता है और साथी से भावनात्मक लगाव रहता है।","good"),
  8:("health and moods fluctuate and worries come easily; calm routines help.","स्वास्थ्य और मन में उतार-चढ़ाव रहता है और चिंता जल्दी होती है; शांत दिनचर्या सहायक है।","bad"),
  9:("is fortunate, religious and prosperous, and blessed with children.","भाग्यशाली, धार्मिक और समृद्ध होता है, और संतान का सुख मिलता है।","good"),
  10:("succeeds in work, earns a good name and does virtuous deeds.","कार्य में सफल होता है, अच्छा नाम कमाता है और सत्कर्म करता है।","good"),
  11:("has wealth, honour, many gains and good friends.","धन, सम्मान, अनेक लाभ और अच्छे मित्र मिलते हैं।","good"),
  12:("expenses and mental unrest increase and laziness should be avoided; links with distant places are shown.","खर्च और मानसिक अशांति बढ़ती है और आलस्य से बचना चाहिए; दूर स्थानों से संबंध दिखता है।","bad"),
 },
 "Mars": {
  1:("is bold and energetic but hot-tempered, and prone to cuts, burns or fevers.","साहसी और ऊर्जावान पर गर्म स्वभाव का होता है, और चोट, जलने या बुखार की संभावना रहती है।","mixed"),
  2:("speech can be harsh and money and family peace fluctuate; food habits need care.","वाणी कठोर हो सकती है और धन व परिवार की शांति में उतार-चढ़ाव रहता है; खान-पान का ध्यान रखें।","bad"),
  3:("is brave and prosperous and wins through effort, though siblings may face trouble.","वीर और समृद्ध होता है और प्रयास से जीतता है, पर भाई-बहनों को कष्ट हो सकता है।","good"),
  4:("peace at home is lacking and matters of mother, vehicles or land need care; may live away from home.","घर में शांति की कमी रहती है और माता, वाहन या भूमि के विषयों में सावधानी चाहिए; घर से दूर रह सकता है।","bad"),
  5:("is sharp but restless, and children may be few or need extra care.","तेज़ पर बेचैन होता है, और संतान कम हो सकती है या अधिक देखभाल माँगती है।","bad"),
  6:("is victorious over enemies, powerful, well off and famous, and gets what he desires.","शत्रुओं पर विजयी, शक्तिशाली, संपन्न और प्रसिद्ध होता है, और इच्छित फल पाता है।","good"),
  7:("quarrels with the spouse or partners are possible and partnerships can bring losses; patience in marriage is needed.","जीवनसाथी या साझेदारों से झगड़े और साझेदारी में हानि संभव है; विवाह में धैर्य ज़रूरी है।","bad"),
  8:("health and accidents need care and wealth can be lost suddenly.","स्वास्थ्य और दुर्घटनाओं से सावधानी चाहिए और धन अचानक जा सकता है।","bad"),
  9:("fortune comes through struggle and differences with the father are possible.","भाग्य संघर्ष से मिलता है और पिता से मतभेद संभव है।","mixed"),
  10:("is brave and famous, reaches a high position and succeeds in action.","वीर और प्रसिद्ध होता है, ऊँचा पद पाता है और कर्म में सफल होता है।","good"),
  11:("has wealth, gains, courage and happiness, and is free from sorrow.","धन, लाभ, साहस और सुख मिलता है, और दुःख से मुक्त रहता है।","good"),
  12:("expenses, quarrels and eye or health troubles are shown; anger should be controlled.","खर्च, झगड़े और आँख या स्वास्थ्य की परेशानी दिखती है; क्रोध पर नियंत्रण रखें।","bad"),
 },
 "Mercury": {
  1:("is learned, witty, sweet-spoken and long-lived.","विद्वान, हाज़िरजवाब, मधुरभाषी और दीर्घायु होता है।","good"),
  2:("earns through intellect and speech, is eloquent and enjoys good food.","बुद्धि और वाणी से कमाता है, वाक्पटु होता है और अच्छे भोजन का आनंद लेता है।","good"),
  3:("is clever and enterprising and has the support of siblings.","चतुर और उद्यमी होता है और भाई-बहनों का सहयोग मिलता है।","mixed"),
  4:("is learned and happy, with friends, land and vehicles.","विद्वान और सुखी होता है, मित्र, भूमि और वाहन मिलते हैं।","good"),
  5:("is happy and learned, has good children and knowledge of mantras.","सुखी और विद्वान होता है, अच्छी संतान और मंत्रों का ज्ञान होता है।","good"),
  6:("wins debates and disputes through argument, but can become quarrelsome.","तर्क से बहस और विवाद जीतता है, पर झगड़ालू हो सकता है।","mixed"),
  7:("is wise and well-presented and gets an intelligent, educated spouse.","बुद्धिमान और सुसज्जित होता है और समझदार, शिक्षित जीवनसाथी मिलता है।","good"),
  8:("becomes known, lives long and supports the family.","प्रसिद्ध होता है, दीर्घायु होता है और परिवार का सहारा बनता है।","good"),
  9:("is wealthy, learned, well-behaved and eloquent.","धनवान, विद्वान, सदाचारी और वाक्पटु होता है।","good"),
  10:("succeeds in many works, is intelligent, happy and well known.","अनेक कार्यों में सफल, बुद्धिमान, सुखी और प्रसिद्ध होता है।","good"),
  11:("has wealth, long life and steady gains.","धन, दीर्घायु और स्थिर लाभ मिलता है।","good"),
  12:("is learned but can lose through careless words or deals; humility and care in signing help.","विद्वान होता है पर लापरवाह शब्दों या सौदों से हानि हो सकती है; विनम्रता और हस्ताक्षर में सावधानी सहायक है।","bad"),
 },
 "Jupiter": {
  1:("is good-looking, learned, long-lived and respected.","सुंदर, विद्वान, दीर्घायु और सम्मानित होता है।","good"),
  2:("is wealthy and eloquent, with a good family and good food.","धनवान और वाक्पटु होता है, अच्छा परिवार और अच्छा भोजन मिलता है।","good"),
  3:("gains through effort, but may be overly careful with money; siblings are blessed.","प्रयास से लाभ पाता है, पर धन के मामले में अधिक कंजूस हो सकता है; भाई-बहन सुखी रहते हैं।","mixed"),
  4:("is happy and wise, with comforts, vehicles and a good mother.","सुखी और ज्ञानी होता है, सुख-सुविधा, वाहन और अच्छी माता का सुख मिलता है।","good"),
  5:("is wise and a good adviser; children may be few or come after some delay.","ज्ञानी और अच्छा सलाहकार होता है; संतान कम या कुछ देरी से हो सकती है।","mixed"),
  6:("overcomes enemies, but should avoid laziness.","शत्रुओं पर विजय पाता है, पर आलस्य से बचना चाहिए।","mixed"),
  7:("gets a good spouse, is wise and eloquent and can rise above the father.","अच्छा जीवनसाथी मिलता है, ज्ञानी और वाक्पटु होता है और पिता से आगे बढ़ सकता है।","good"),
  8:("lives long and is drawn to hidden knowledge, but income can stay modest.","दीर्घायु होता है और गूढ़ ज्ञान की ओर झुकाव रहता है, पर आय साधारण रह सकती है।","mixed"),
  9:("is fortunate, religious, wealthy and respected, with good children.","भाग्यशाली, धार्मिक, धनवान और सम्मानित होता है, अच्छी संतान मिलती है।","good"),
  10:("is famous, virtuous and wealthy and succeeds in his undertakings.","प्रसिद्ध, सदाचारी और धनवान होता है और अपने कार्यों में सफल होता है।","good"),
  11:("is wealthy, fearless and long-lived, with steady gains.","धनवान, निडर और दीर्घायु होता है, स्थिर लाभ मिलता है।","good"),
  12:("spends on good causes and is spiritual, though can feel lonely at times.","अच्छे कार्यों पर खर्च करता है और आध्यात्मिक होता है, यद्यपि कभी-कभी अकेलापन महसूस हो सकता है।","mixed"),
 },
 "Venus": {
  1:("is attractive, happy and long-lived, and enjoys comforts.","आकर्षक, सुखी और दीर्घायु होता है, और सुख-सुविधाओं का आनंद लेता है।","good"),
  2:("is wealthy, poetic and eloquent, and enjoys good food.","धनवान, काव्य-प्रेमी और वाक्पटु होता है, और अच्छे भोजन का आनंद लेता है।","good"),
  3:("has means, but joy in relationships can be limited; warmth with siblings helps.","साधन होते हैं, पर रिश्तों में आनंद सीमित रह सकता है; भाई-बहनों से स्नेह सहायक है।","mixed"),
  4:("has a good home, vehicles, comforts and friends, and is happy.","अच्छा घर, वाहन, सुख-सुविधा और मित्र होते हैं, और व्यक्ति सुखी रहता है।","good"),
  5:("is happy and intelligent, with children and wealth.","सुखी और बुद्धिमान होता है, संतान और धन मिलता है।","good"),
  6:("has few enemies, but too much indulgence can weaken health and savings.","शत्रु कम होते हैं, पर अधिक भोग-विलास स्वास्थ्य और बचत को कमज़ोर कर सकता है।","mixed"),
  7:("gets an attractive spouse and a loving marriage; balance in desires keeps it happy.","आकर्षक जीवनसाथी और प्रेमपूर्ण विवाह मिलता है; इच्छाओं में संतुलन इसे सुखी रखता है।","good"),
  8:("lives long, gains wealth (sometimes through others or inheritance) and is content.","दीर्घायु होता है, धन पाता है (कभी-कभी दूसरों से या विरासत में) और संतुष्ट रहता है।","good"),
  9:("is wealthy, religious and happy, with a good spouse.","धनवान, धार्मिक और सुखी होता है, अच्छा जीवनसाथी मिलता है।","good"),
  10:("gains fame, comforts and wealth, often through arts, beauty or pleasing work.","यश, सुख-सुविधा और धन पाता है, अक्सर कला, सौंदर्य या मनभावन कार्य से।","good"),
  11:("has wealth, gains and comforts.","धन, लाभ और सुख-सुविधाएँ मिलती हैं।","good"),
  12:("enjoys comforts and pleasures and has means to spend on them.","सुख-भोग का आनंद लेता है और उन पर खर्च करने के साधन होते हैं।","good"),
 },
 "Saturn": {
  1:("health in early life and energy need care; if Saturn is in its own or exaltation sign, it gives high status instead.","बचपन में स्वास्थ्य और ऊर्जा का ध्यान रखना होता है; शनि स्वराशि या उच्च में हो तो इसके बजाय ऊँचा पद देता है।","mixed"),
  2:("speech can be harsh and money fluctuates early on, with gains coming later in life.","वाणी कठोर हो सकती है और शुरुआत में धन अस्थिर रहता है, लाभ जीवन में बाद में आता है।","bad"),
  3:("is intelligent, brave and prosperous — a strong placement for effort.","बुद्धिमान, वीर और समृद्ध होता है — प्रयास के लिए मज़बूत स्थिति।","good"),
  4:("home happiness is lacking and matters of mother, vehicles or property need care.","घर का सुख कम रहता है और माता, वाहन या संपत्ति के विषयों में सावधानी चाहिए।","bad"),
  5:("children may come late or be few, and the mind can wander; patience is advised.","संतान देर से या कम हो सकती है, और मन भटक सकता है; धैर्य की सलाह है।","bad"),
  6:("defeats enemies, becomes well off and has a strong appetite.","शत्रुओं को पराजित करता है, संपन्न होता है और भूख अच्छी रहती है।","good"),
  7:("marriage may be delayed or need effort and the spouse's health needs care; travels are shown.","विवाह में देरी या प्रयास की ज़रूरत हो सकती है और जीवनसाथी के स्वास्थ्य का ध्यान रखें; यात्राएँ दिखती हैं।","bad"),
  8:("lives long, but chronic health issues and obstacles need patience.","दीर्घायु होता है, पर पुरानी बीमारियाँ और बाधाएँ धैर्य माँगती हैं।","mixed"),
  9:("fortune rises late and differences with the father or elders are possible.","भाग्य देर से उदय होता है और पिता या बड़ों से मतभेद संभव है।","bad"),
  10:("can rise to a high or ministerial position through hard work and becomes well off and brave.","कड़ी मेहनत से ऊँचा या मंत्री जैसा पद पा सकता है और संपन्न व साहसी होता है।","good"),
  11:("is long-lived and wealthy, with steady gains and few illnesses.","दीर्घायु और धनवान होता है, स्थिर लाभ और कम रोग रहते हैं।","good"),
  12:("expenses and losses increase and life may take one to distant or foreign places.","खर्च और हानि बढ़ती है और जीवन दूर या विदेशी स्थानों पर ले जा सकता है।","bad"),
 },
 "Rahu": {
  1:("is ambitious and unconventional, but health and clarity of mind need care.","महत्वाकांक्षी और अलग सोच वाला होता है, पर स्वास्थ्य और मन की स्पष्टता का ध्यान रखें।","mixed"),
  2:("speech and family finances fluctuate; honesty in dealings protects wealth.","वाणी और पारिवारिक धन में उतार-चढ़ाव रहता है; लेन-देन में ईमानदारी धन की रक्षा करती है।","bad"),
  3:("is bold and enterprising and succeeds through daring effort.","साहसी और उद्यमी होता है और जोखिम भरे प्रयास से सफल होता है।","good"),
  4:("peace at home is disturbed and property matters need care.","घर की शांति भंग होती है और संपत्ति के मामलों में सावधानी चाहिए।","bad"),
  5:("the mind is restless and children matters need patience.","मन बेचैन रहता है और संतान के विषय में धैर्य चाहिए।","bad"),
  6:("defeats rivals and does well in competition.","विरोधियों को हराता है और प्रतियोगिता में अच्छा करता है।","good"),
  7:("partnerships and marriage can be unconventional; clarity and honesty help.","साझेदारी और विवाह असामान्य हो सकते हैं; स्पष्टता और ईमानदारी सहायक है।","bad"),
  8:("sudden events and hidden troubles are possible; caution is advised.","अचानक घटनाएँ और छिपी परेशानियाँ संभव हैं; सावधानी की सलाह है।","bad"),
  9:("beliefs may differ from tradition and the father; fortune comes in unusual ways.","विश्वास परंपरा और पिता से अलग हो सकते हैं; भाग्य असामान्य तरीकों से मिलता है।","mixed"),
  10:("can rise suddenly in career, often through foreign, technical or unusual work.","करियर में अचानक उन्नति हो सकती है, अक्सर विदेशी, तकनीकी या असामान्य कार्य से।","good"),
  11:("gains come through many sources, including foreign links.","अनेक स्रोतों से लाभ मिलता है, विदेशी संबंधों से भी।","good"),
  12:("expenses rise and foreign travel or living abroad is indicated.","खर्च बढ़ता है और विदेश यात्रा या विदेश में रहने का संकेत है।","mixed"),
 },
 "Ketu": {
  1:("is introspective and spiritual, but health and self-confidence need care.","आत्मचिंतक और आध्यात्मिक होता है, पर स्वास्थ्य और आत्मविश्वास का ध्यान रखें।","mixed"),
  2:("speech can be blunt and savings unsteady.","वाणी रूखी हो सकती है और बचत अस्थिर रहती है।","bad"),
  3:("is courageous and gains through effort.","साहसी होता है और प्रयास से लाभ पाता है।","good"),
  4:("feels detached from home comforts; the mother's well-being needs care.","घर के सुख से उदासीनता रहती है; माता के स्वास्थ्य का ध्यान रखें।","bad"),
  5:("has a deep, intuitive mind; children matters need patience.","गहरा और अंतर्ज्ञानी मन होता है; संतान के विषय में धैर्य चाहिए।","mixed"),
  6:("overcomes enemies and disease.","शत्रुओं और रोग पर विजय पाता है।","good"),
  7:("can feel detached in marriage or partnerships; time together helps.","विवाह या साझेदारी में उदासीनता हो सकती है; साथ बिताया समय सहायक है।","bad"),
  8:("is drawn to the occult and research, but sudden troubles need caution.","गूढ़ विद्या और शोध की ओर झुकाव होता है, पर अचानक कष्टों से सावधानी चाहिए।","mixed"),
  9:("is spiritual, though differences with elders or the father are possible.","आध्यात्मिक होता है, यद्यपि बड़ों या पिता से मतभेद संभव है।","mixed"),
  10:("work may involve sudden changes; steady effort brings results.","कार्य में अचानक बदलाव आ सकते हैं; लगातार प्रयास से परिणाम मिलता है।","mixed"),
  11:("gains steadily and fulfils wishes.","स्थिर लाभ पाता है और इच्छाएँ पूरी होती हैं।","good"),
  12:("is spiritual and inclined to moksha, with expenses on worship or travel.","आध्यात्मिक और मोक्ष की ओर झुका होता है, पूजा या यात्रा पर खर्च होता है।","mixed"),
 },
}
VERBS = {"is","has","gets","earns","overcomes","gains","succeeds","wins","becomes","lives","spends","enjoys","defeats","can","feels","lose"}
for p in P:
    node = p in ("Rahu", "Ketu")
    for h in range(1, 13):
        en, hi, tone = PHX[p][h]
        add(f"planet_house.{p.lower()}.{h}", "planet_house",
            (f"With {p} in the {o(h)} house, the person {en}" if en.split()[0] in VERBS else f"{p} in the {o(h)} house: {en[0].upper() + en[1:]}"),
            f"{HO[h]} भाव में {PH[p]}: {hi}",
            f"{B}, Ch. 8 (Effects of the planets in the houses)" + ("; nodes applied from Ch. 2 natures" if node else ""),
            "derived" if node else "chapter", match={"planet": p, "house": h}, tone=tone)

# ---------------------------------------------------------------- 4. PRINCIPLES (Ch. 15)
PR = {
 "lord_own":("A house whose lord occupies or aspects it is strong; its matters are well protected.","जिस भाव का स्वामी उसमें बैठा हो या उसे देखे, वह भाव बलवान होता है; उसके विषय सुरक्षित रहते हैं।"),
 "lord_kt":("A house lord placed in a kendra or trikona, in strength, makes that house flourish.","भाव का स्वामी बलवान होकर केंद्र या त्रिकोण में हो तो वह भाव फलता-फूलता है।"),
 "lord_gain":("A house lord in the 11th or 2nd, unafflicted, adds gains to that house's matters.","भाव का स्वामी 11वें या दूसरे भाव में, बिना पीड़ा के, उस भाव के विषयों में लाभ जोड़ता है।"),
 "lord_dus":("A house lord in the 6th, 8th or 12th, debilitated, combust or in an enemy's sign, weakens that house — its results come with delay or effort.","भाव का स्वामी 6, 8 या 12 में, नीच, अस्त या शत्रु राशि में हो तो वह भाव कमज़ोर होता है — फल देरी या प्रयास से मिलता है।"),
 "aspect_benefic":("Benefics aspecting a house strengthen it and bring its good results; Mars, Jupiter and Saturn have their special aspects in addition to the 7th.","शुभ ग्रहों की दृष्टि भाव को बल देती है और उसके शुभ फल लाती है; मंगल, गुरु और शनि की सातवीं के अतिरिक्त विशेष दृष्टियाँ भी होती हैं।"),
 "aspect_malefic":("Malefics aspecting a house, without benefic help, harm its matters; judge them together with the strength of the house lord.","बिना शुभ सहायता के पाप ग्रहों की दृष्टि भाव के विषयों को हानि पहुँचाती है; इसे भाव स्वामी के बल के साथ मिलाकर देखें।"),
 "combust":("A house lord that is combust (too near the Sun) cannot protect its house; its results shrink.","अस्त (सूर्य के बहुत निकट) भाव स्वामी अपने भाव की रक्षा नहीं कर पाता; उसके फल घट जाते हैं।"),
 "karaka":("Judge every house together with its significator (karaka); a strong karaka supports the house even when other factors are mixed.","हर भाव का विचार उसके कारक ग्रह के साथ करें; बलवान कारक अन्य कारकों के मिश्रित होने पर भी भाव को सहारा देता है।"),
}
for k, (en, hi) in PR.items():
    add(f"principle.{k}", "principle", en, hi, f"{B}, Ch. 15 (Method of judging the Bhavas)", match={"principle": k})

# ---------------------------------------------------------------- 5. YOGAS (Ch. 6, Ch. 7, Ch. 10)
YO = {
 "gajakesari":("Gajakesari Yoga (Jupiter in a kendra from the Moon) makes the person eloquent, wealthy, intelligent and respected, with a lasting reputation.","गजकेसरी योग (चंद्र से केंद्र में गुरु) व्यक्ति को वाक्पटु, धनवान, बुद्धिमान और सम्मानित बनाता है, और स्थायी यश देता है।","Ch. 6 (Yogas)","chapter"),
 "ruchaka":("Ruchaka Yoga (Mars in its own or exaltation sign in a kendra) gives a strong body, courage, fame and leadership.","रुचक योग (मंगल स्वराशि या उच्च होकर केंद्र में) बलवान शरीर, साहस, यश और नेतृत्व देता है।","Ch. 6 (Yogas — Pancha Mahapurusha)","chapter"),
 "bhadra":("Bhadra Yoga (Mercury in its own or exaltation sign in a kendra) gives sharp intellect, eloquence, learning and long life.","भद्र योग (बुध स्वराशि या उच्च होकर केंद्र में) तेज़ बुद्धि, वाक्पटुता, विद्या और दीर्घायु देता है।","Ch. 6 (Yogas — Pancha Mahapurusha)","chapter"),
 "hamsa":("Hamsa Yoga (Jupiter in its own or exaltation sign in a kendra) gives virtue, wisdom, a pleasing nature and respect from good people.","हंस योग (गुरु स्वराशि या उच्च होकर केंद्र में) सद्गुण, ज्ञान, मनोहर स्वभाव और सज्जनों से सम्मान देता है।","Ch. 6 (Yogas — Pancha Mahapurusha)","chapter"),
 "malavya":("Malavya Yoga (Venus in its own or exaltation sign in a kendra) gives comforts, vehicles, a good spouse, strength of mind and prosperity.","मालव्य योग (शुक्र स्वराशि या उच्च होकर केंद्र में) सुख-सुविधा, वाहन, अच्छा जीवनसाथी, मानसिक बल और समृद्धि देता है।","Ch. 6 (Yogas — Pancha Mahapurusha)","chapter"),
 "sasa":("Sasa Yoga (Saturn in its own or exaltation sign in a kendra) gives authority over many people, organising ability and wealth.","शश योग (शनि स्वराशि या उच्च होकर केंद्र में) अनेक लोगों पर अधिकार, संगठन क्षमता और धन देता है।","Ch. 6 (Yogas — Pancha Mahapurusha)","chapter"),
 "kemadruma":("Kemadruma Yoga (no planet other than the Sun on either side of the Moon) brings hardship and lack of support; planets in kendras from the lagna or Moon cancel it.","केमद्रुम योग (चंद्र के दोनों ओर सूर्य के अलावा कोई ग्रह न हो) कठिनाई और सहयोग की कमी देता है; लग्न या चंद्र से केंद्र में ग्रह हों तो यह भंग हो जाता है।","Ch. 6 (Yogas — Sunapha, Anapha, Durudhara, Kemadruma)","chapter"),
 "raj":("When lords of kendras and trikonas join, exchange signs or aspect each other, a Raja Yoga forms, giving status, power and success.","जब केंद्र और त्रिकोण के स्वामी साथ हों, राशि परिवर्तन करें या एक-दूसरे को देखें, तो राजयोग बनता है, जो पद, शक्ति और सफलता देता है।","Ch. 7 (Maharajayogas)","chapter"),
 "neechabhanga":("A debilitated planet's weakness is cancelled when the lord of its sign or exaltation sign is in a kendra from the lagna or Moon; it can then give a Raja Yoga after early struggle.","नीच ग्रह की कमज़ोरी भंग हो जाती है जब उसकी राशि या उच्च राशि का स्वामी लग्न या चंद्र से केंद्र में हो; तब शुरुआती संघर्ष के बाद यह राजयोग दे सकता है।","Ch. 7 (Maharajayogas — Neechabhanga Raja Yoga)","chapter"),
 "dhan":("When lords of the 2nd and 11th join the lords of the lagna, 5th or 9th in strength, the person accumulates wealth.","जब दूसरे और 11वें भाव के स्वामी लग्न, पाँचवें या नौवें के स्वामियों से बलवान होकर जुड़ें, तो व्यक्ति धन संचय करता है।","Ch. 6 (Yogas — Dhana Yogas)","chapter"),
 "yogakaraka":("A planet that rules both a kendra and a trikona is especially auspicious and brings success in its periods.","जो ग्रह केंद्र और त्रिकोण दोनों का स्वामी हो, वह विशेष शुभ होता है और अपनी दशा में सफलता देता है।","Ch. 7 (Maharajayogas) & Ch. 15","derived"),
 "kuja":("Mars in the 7th or 8th, or afflicting the 7th house and Venus, harms marital harmony; benefic aspects and a strong 7th lord reduce the effect.","मंगल सातवें या आठवें भाव में हो, या सातवें भाव और शुक्र को पीड़ित करे, तो वैवाहिक सौहार्द प्रभावित होता है; शुभ दृष्टि और बलवान सप्तमेश प्रभाव कम करते हैं।","Ch. 10 (The 7th house)","derived"),
}
for y, (en, hi, src, conf) in YO.items():
    add(f"yoga.{y}", "yoga", en, hi, f"{B}, {src}", conf, match={"yoga": y})

# ---------------------------------------------------------------- 6. DASHAS (Ch. 19)
DA = {
 "Sun":("Sun dasha brings gains through government or people in power, recognition and travel; if the Sun is weak, fevers, eye trouble and separation from family are possible.","सूर्य दशा सरकार या प्रभावशाली लोगों से लाभ, मान-सम्मान और यात्रा देती है; सूर्य कमज़ोर हो तो बुखार, आँखों की परेशानी और परिवार से दूरी संभव है।"),
 "Moon":("Moon dasha brings comforts, good food and clothes, help from women and the mother, and peace of mind when the Moon is strong.","चंद्र दशा सुख-सुविधा, अच्छा भोजन और वस्त्र, स्त्रियों और माता से सहायता, और चंद्र बलवान हो तो मन की शांति देती है।"),
 "Mars":("Mars dasha brings gains from land, property and courageous action and success over rivals, but also quarrels, injuries or blood-related ailments if Mars is afflicted.","मंगल दशा भूमि, संपत्ति और साहसिक कार्यों से लाभ तथा विरोधियों पर सफलता देती है, पर मंगल पीड़ित हो तो झगड़े, चोट या रक्त संबंधी रोग भी।"),
 "Mercury":("Mercury dasha brings learning, success in trade and communication, new friends and the use of one's intelligence.","बुध दशा विद्या, व्यापार और संवाद में सफलता, नए मित्र और बुद्धि के उपयोग का अवसर देती है।"),
 "Jupiter":("Jupiter dasha brings honour, wealth, children's happiness, wisdom and favour from respected people.","गुरु दशा सम्मान, धन, संतान सुख, ज्ञान और सम्मानित लोगों की कृपा देती है।"),
 "Venus":("Venus dasha brings vehicles, ornaments, comforts, marriage or happiness with the spouse, and enjoyment of arts.","शुक्र दशा वाहन, आभूषण, सुख-सुविधा, विवाह या जीवनसाथी से सुख, और कला का आनंद देती है।"),
 "Saturn":("Saturn dasha brings hard work, delays and responsibility; when Saturn is strong it gives gains through steady labour, servants and old or lasting assets.","शनि दशा कड़ी मेहनत, देरी और ज़िम्मेदारी लाती है; शनि बलवान हो तो लगातार श्रम, सेवकों और पुरानी या स्थायी संपत्ति से लाभ देती है।"),
 "Rahu":("Rahu dasha brings sudden changes, travel and unusual opportunities, along with fears or confusion; results depend on the sign lord and associations.","राहु दशा अचानक बदलाव, यात्रा और असामान्य अवसर देती है, साथ में भय या भ्रम भी; फल राशि स्वामी और युति पर निर्भर करता है।"),
 "Ketu":("Ketu dasha brings detachment, spiritual interest and sudden breaks; health and relationships need care.","केतु दशा वैराग्य, आध्यात्मिक रुचि और अचानक रुकावटें देती है; स्वास्थ्य और रिश्तों का ध्यान रखें।"),
}
for p, (en, hi) in DA.items():
    add(f"dasha.{p.lower()}", "dasha", en, hi, f"{B}, Ch. 19 (Dasas and their effects)",
        "derived" if p in ("Rahu", "Ketu") else "chapter", match={"md": p})

out = {
    "book": {
        "id": "phaladeepika", "name_en": "Phaladeepika", "name_hi": "फलदीपिका", "short": "PD",
        "author_en": "Mantreswara", "author_hi": "मंत्रेश्वर",
        "edition_note": "Chapter numbers follow the standard 28-adhyaya arrangement (as in V. Subrahmanya Sastri's edition). All rule text is original paraphrase.",
        "version": "1.0",
    },
    "entries": E,
}
path = os.path.join(os.path.dirname(__file__), "..", "data", "phaladeepika.json")
with open(path, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print(f"wrote {len(E)} entries to data/phaladeepika.json")
