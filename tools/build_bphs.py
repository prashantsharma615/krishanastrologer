#!/usr/bin/env python3
"""
Builds data/bphs.json — the Brihat Parashara Hora Shastra knowledge base for Krishan Astrologer.

All wording is original paraphrase of classical Parashari principles (no modern translation is copied).
Chapter numbers follow the R. Santhanam English edition (1984, 97 chapters). Other editions number differently.

Every entry has: id, topic, rule_en, rule_hi, source  (+ optional: match, confidence, note)
  confidence: "chapter"   -> the rule is taught in the cited BPHS chapter
              "derived"   -> composed from BPHS principles in the cited chapters (e.g. planet-in-sign by dignity)
              "tradition" -> later/popular tradition, not a named BPHS rule; shown with that label

Run:  python3 tools/build_bphs.py
To add another book (Phaladeepika, Brihat Jataka...), create data/<book>.json in the same format and list it in data/books.json.
"""
import json, os

P = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"]
PH = {"Sun":"सूर्य","Moon":"चंद्र","Mars":"मंगल","Mercury":"बुध","Jupiter":"गुरु","Venus":"शुक्र","Saturn":"शनि","Rahu":"राहु","Ketu":"केतु"}
S = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"]
SH = ["मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुंभ","मीन"]
LORD = ["Mars","Venus","Mercury","Moon","Sun","Mercury","Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"]
ORD = {1:"1st",2:"2nd",3:"3rd"}; o=lambda n: ORD.get(n, f"{n}th")
HO = {1:"पहले",2:"दूसरे",3:"तीसरे",4:"चौथे",5:"पाँचवें",6:"छठे",7:"सातवें",8:"आठवें",9:"नौवें",10:"दसवें",11:"ग्यारहवें",12:"बारहवें"}
E = []
def add(id, topic, en, hi, source, conf="chapter", match=None, note=None, **extra):
    e = {"id":id,"topic":topic,"rule_en":en,"rule_hi":hi,"source":source,"confidence":conf}
    if match: e["match"]=match
    if note: e["note"]=note
    e.update(extra); E.append(e)

# ---------------------------------------------------------------- 1. HOUSES (Ch.11 + Ch.12–23)
HOUSES = {
 1:("Tanu","तनु","the body, appearance, health and vitality, temperament, self-confidence and overall well-being","शरीर, रूप, स्वास्थ्य और जीवन-शक्ति, स्वभाव, आत्मविश्वास और समग्र कल्याण",["Sun"]),
 2:("Dhana","धन","wealth and savings, family, speech, food habits, early learning and the right eye","धन और बचत, परिवार, वाणी, खान-पान, प्रारंभिक शिक्षा और दाहिनी आँख",["Jupiter"]),
 3:("Sahaja","सहज","younger siblings, courage, personal effort, short journeys, communication and helpers","छोटे भाई-बहन, साहस, व्यक्तिगत प्रयास, छोटी यात्राएँ, संवाद और सहायक",["Mars"]),
 4:("Sukha","सुख","mother, home, land and vehicles, inner happiness, relatives and basic education","माता, घर, भूमि और वाहन, मन का सुख, संबंधी और प्रारंभिक शिक्षा",["Moon","Mercury"]),
 5:("Putra","पुत्र","children, intelligence, devotion and mantra, merit from past deeds, higher learning and romance","संतान, बुद्धि, भक्ति और मंत्र, पूर्व पुण्य, उच्च विद्या और प्रेम",["Jupiter"]),
 6:("Ari","अरि","enemies and competition, disputes and litigation, debts, illness, service and daily work","शत्रु और प्रतियोगिता, विवाद और मुकदमे, कर्ज़, रोग, सेवा और दैनिक कार्य",["Saturn","Mars"]),
 7:("Yuvati","युवती","spouse and marriage, partnerships, business dealings, travel and dealings with the public","जीवनसाथी और विवाह, साझेदारी, व्यापारिक लेन-देन, यात्रा और जनता से व्यवहार",["Venus"]),
 8:("Randhra","रंध्र","sudden events and transformations, obstacles, inheritance, hidden matters and research","अचानक घटनाएँ और परिवर्तन, बाधाएँ, विरासत, गूढ़ विषय और शोध",["Saturn"]),
 9:("Dharma","धर्म","fortune and luck, father, guru, dharma, higher studies, long journeys and pilgrimage","भाग्य, पिता, गुरु, धर्म, उच्च शिक्षा, लंबी यात्राएँ और तीर्थ",["Sun","Jupiter"]),
 10:("Karma","कर्म","profession and career, status, authority, honour, one's actions and government favour","व्यवसाय और करियर, प्रतिष्ठा, अधिकार, सम्मान, कर्म और सरकारी कृपा",["Sun","Mercury","Jupiter","Saturn"]),
 11:("Labha","लाभ","gains and income, fulfilment of wishes, elder siblings and the circle of friends","लाभ और आय, इच्छाओं की पूर्ति, बड़े भाई-बहन और मित्र-मंडली",["Jupiter"]),
 12:("Vyaya","व्यय","expenses and losses, foreign lands, sleep and rest, charity, spiritual liberation and isolation","खर्च और हानि, विदेश, नींद और विश्राम, दान, मोक्ष और एकांत",["Saturn"]),
}
for h,(nm,nmh,en,hi,kar) in HOUSES.items():
    add(f"bphs.house.{h}","house",
        f"The {o(h)} house ({nm} Bhava) governs {en}. Its natural significator (karaka) is {', '.join(kar)}.",
        f"{HO[h]} भाव ({nmh} भाव) {hi} का कारक है। इसका प्राकृतिक कारक ग्रह {', '.join(PH[k] for k in kar)} है।",
        f"BPHS, Ch. 11 (Judgement of Houses) & Ch. {11+h} (Effects of the {o(h)} house); karakas: Ch. 32",
        match={"house":h}, name_en=nm, name_hi=nmh, signif_en=en, signif_hi=hi, karakas=kar)

# ---------------------------------------------------------------- 2. GRAHAS (Ch.3, Ch.32)
GR = {
 "Sun":("malefic","soul, father, authority, government, vitality and confidence","आत्मा, पिता, अधिकार, सरकार, जीवन-शक्ति और आत्मविश्वास",0,10,["Moon","Mars","Jupiter"],["Venus","Saturn"],["Mercury"]),
 "Moon":("benefic (when waxing)","mind, mother, emotions, comforts, the public and liquids","मन, माता, भावनाएँ, सुख-सुविधा, जनता और तरल पदार्थ",1,3,["Sun","Mercury"],[],["Mars","Jupiter","Venus","Saturn"]),
 "Mars":("malefic","courage, energy, younger siblings, land and property, technical skill and discipline","साहस, ऊर्जा, छोटे भाई-बहन, भूमि-संपत्ति, तकनीकी कौशल और अनुशासन",9,28,["Sun","Moon","Jupiter"],["Mercury"],["Venus","Saturn"]),
 "Mercury":("benefic (when unafflicted)","intellect, speech, trade, learning, friends and writing","बुद्धि, वाणी, व्यापार, विद्या, मित्र और लेखन",5,15,["Sun","Venus"],["Moon"],["Mars","Jupiter","Saturn"]),
 "Jupiter":("benefic","wisdom, teachers, children, wealth, dharma and good fortune","ज्ञान, गुरु, संतान, धन, धर्म और सौभाग्य",3,5,["Sun","Moon","Mars"],["Mercury","Venus"],["Saturn"]),
 "Venus":("benefic","spouse and love, comforts, vehicles, arts, beauty and luxury","जीवनसाथी और प्रेम, सुख-सुविधा, वाहन, कला, सौंदर्य और ऐश्वर्य",11,27,["Mercury","Saturn"],["Sun","Moon"],["Mars","Jupiter"]),
 "Saturn":("malefic","work and service, discipline, patience, endurance, labourers and the results of delay","कर्म और सेवा, अनुशासन, धैर्य, सहनशक्ति, श्रमिक वर्ग और देरी से मिलने वाले फल",6,20,["Mercury","Venus"],["Sun","Moon","Mars"],["Jupiter"]),
 "Rahu":("malefic (shadow planet)","ambition, foreign links, unusual paths, technology and sudden events","महत्वाकांक्षा, विदेशी संबंध, अलग रास्ते, तकनीक और अचानक घटनाएँ",1,None,["Mercury","Venus","Saturn"],["Sun","Moon","Mars"],["Jupiter"]),
 "Ketu":("malefic (shadow planet)","detachment, spirituality, research, intuition and sudden breaks","वैराग्य, आध्यात्मिकता, शोध, अंतर्ज्ञान और अचानक बदलाव",7,None,["Mercury","Venus","Saturn"],["Sun","Moon","Mars"],["Jupiter"]),
}
NAT_HI = {"malefic":"पाप ग्रह","benefic":"शुभ ग्रह","benefic (when waxing)":"शुभ ग्रह (शुक्ल पक्ष में)","benefic (when unafflicted)":"शुभ ग्रह (जब पीड़ित न हो)","malefic (shadow planet)":"पाप ग्रह (छाया ग्रह)"}
OWN = {"Sun":[4],"Moon":[3],"Mars":[0,7],"Mercury":[2,5],"Jupiter":[8,11],"Venus":[1,6],"Saturn":[9,10],"Rahu":[],"Ketu":[]}
for p,(nat,ken,khi,ex,deg,fr,en_,ne) in GR.items():
    deb=(ex+6)%12
    exs=f"exalted in {S[ex]}"+(f" (deepest at {deg}°)" if deg else "")+f", debilitated in {S[deb]}"
    exh=f"{SH[ex]} में उच्च"+(f" ({deg}° पर परम उच्च)" if deg else "")+f", {SH[deb]} में नीच"
    own=", ".join(S[i] for i in OWN[p]); ownh=", ".join(SH[i] for i in OWN[p])
    add(f"bphs.graha.{p.lower()}","graha",
        f"{p} is a natural {nat}. It signifies {ken}. It is {exs}"+(f"; it owns {own}" if own else "; as a shadow planet it gives results like the lord of the sign it occupies")+f". Friends: {', '.join(fr)}; enemies: {', '.join(en_) or 'none'}; neutral: {', '.join(ne)}.",
        f"{PH[p]} प्राकृतिक {NAT_HI[nat]} है। यह {khi} का कारक है। यह {exh} होता है"+(f"; इसकी स्वराशि {ownh} है" if ownh else "; छाया ग्रह होने से यह जिस राशि में बैठता है उसके स्वामी जैसा फल देता है")+f"। मित्र: {', '.join(PH[x] for x in fr)}; शत्रु: {', '.join(PH[x] for x in en_) or 'कोई नहीं'}; सम: {', '.join(PH[x] for x in ne)}।",
        "BPHS, Ch. 3 (Planetary characteristics) & Ch. 32 (Karakatwas)" if p not in ("Rahu","Ketu") else "BPHS, Ch. 3 & Ch. 32; node friendships follow common Parashari practice",
        "chapter" if p not in ("Rahu","Ketu") else "derived",
        match={"planet":p}, karaka_en=ken, karaka_hi=khi, exalt=ex, debil=deb, own=OWN[p], friends=fr, enemies=en_, neutral=ne, nature=nat)

# ---------------------------------------------------------------- 3. PLANET IN HOUSE (Ch.12–23, Ch.27)
BENEF = {"Moon","Mercury","Jupiter","Venus"}
DIG = {"Sun":10,"Mars":10,"Jupiter":1,"Mercury":1,"Moon":4,"Venus":4,"Saturn":7}
T = {
 "B_KT":("As a natural benefic in a kendra or trikona, it protects and strengthens this house, so these matters generally prosper.","प्राकृतिक शुभ ग्रह होने के कारण केंद्र या त्रिकोण में यह इस भाव की रक्षा करता है और इसे मज़बूत बनाता है, इसलिए ये विषय सामान्यतः फलते-फूलते हैं।"),
 "B_UP":("A benefic here supports effort and gains, though more gently than a malefic would in this house.","यहाँ शुभ ग्रह प्रयास और लाभ में सहायता करता है, यद्यपि इस भाव में पाप ग्रह की तुलना में कोमलता से।"),
 "B_2":("A benefic in the 2nd blesses wealth, family harmony and pleasant speech.","दूसरे भाव में शुभ ग्रह धन, पारिवारिक सौहार्द और मधुर वाणी का आशीर्वाद देता है।"),
 "B_6":("A benefic in the 6th is only partly able to subdue rivals; service and helping others go well, but keep an eye on debts and routine health.","छठे भाव में शुभ ग्रह विरोधियों को आंशिक रूप से ही दबा पाता है; सेवा और दूसरों की मदद अच्छी चलती है, पर कर्ज़ और दिनचर्या के स्वास्थ्य पर ध्यान रखें।"),
 "B_DUS":("A benefic in the 8th or 12th loses some strength: its gifts come with delay or expense, though it often brings spiritual or hidden gains.","आठवें या बारहवें भाव में शुभ ग्रह की शक्ति कुछ कम हो जाती है: इसके फल देरी या खर्च के साथ आते हैं, पर अक्सर आध्यात्मिक या गुप्त लाभ देता है।"),
 "M_KT":("A natural malefic in a kendra or trikona gives drive and ambition but can strain the gentler matters of this house; results come through effort.","केंद्र या त्रिकोण में प्राकृतिक पाप ग्रह जोश और महत्वाकांक्षा देता है, पर इस भाव के कोमल विषयों पर दबाव डाल सकता है; परिणाम मेहनत से मिलते हैं।"),
 "M_UP":("Malefics in the upachaya houses (3rd, 6th, 11th) are favourable in Parashari astrology: they give courage, victory over rivals and steadily growing gains.","पाराशरी ज्योतिष में उपचय भावों (3, 6, 11) में पाप ग्रह शुभ माने जाते हैं: ये साहस, विरोधियों पर विजय और लगातार बढ़ता लाभ देते हैं।"),
 "M_10":("The 10th is both a kendra and an upachaya house, so a malefic here gives strong drive for career, authority and achievement.","दसवाँ भाव केंद्र और उपचय दोनों है, इसलिए यहाँ पाप ग्रह करियर, अधिकार और उपलब्धि के लिए प्रबल प्रेरणा देता है।"),
 "M_2":("A malefic in the 2nd can make speech sharp and money fluctuate; careful saving and gentle words are advised.","दूसरे भाव में पाप ग्रह वाणी को तीखा और धन को अस्थिर कर सकता है; सोच-समझकर बचत और नरम वाणी की सलाह है।"),
 "M_DUS":("A malefic in the 8th or 12th can bring unexpected changes or expenses; patience and prudence reduce its effect.","आठवें या बारहवें भाव में पाप ग्रह अप्रत्याशित बदलाव या खर्च ला सकता है; धैर्य और समझदारी से इसका असर कम होता है।"),
}
SPECIAL = {
 ("Sun",10):("It favours government work, administration and positions of authority.","यह सरकारी कार्य, प्रशासन और अधिकार वाले पदों के लिए शुभ है।"),
 ("Sun",7):("Ego clashes with the spouse or partners are possible; humility keeps relations warm.","जीवनसाथी या साझेदारों से अहं का टकराव हो सकता है; विनम्रता से संबंध मधुर रहते हैं।"),
 ("Moon",4):("It gives a peaceful home, comforts and closeness to the mother.","यह शांत घर, सुख-सुविधा और माता से निकटता देता है।"),
 ("Moon",12):("It can link the person with foreign lands, and good sleep and rest become important.","यह व्यक्ति को विदेश से जोड़ सकता है, और अच्छी नींद व विश्राम ज़रूरी हो जाते हैं।"),
 ("Mars",7):("It gives a spirited, strong-willed partner; patience in marriage is important (this placement is also part of the popular Manglik rule).","यह जोशीला और दृढ़ इच्छाशक्ति वाला जीवनसाथी देता है; विवाह में धैर्य ज़रूरी है (यह स्थिति लोकप्रिय मांगलिक नियम का भी हिस्सा है)।"),
 ("Mars",4):("It can bring land and property through effort, but peace at home needs care.","यह मेहनत से भूमि-संपत्ति दे सकता है, पर घर की शांति का ध्यान रखना होता है।"),
 ("Mars",10):("It suits technical, engineering, police, defence or sports careers.","यह तकनीकी, इंजीनियरिंग, पुलिस, रक्षा या खेल से जुड़े करियर के लिए अनुकूल है।"),
 ("Mars",6):("It gives strong victory over enemies and success in competitions and disputes.","यह शत्रुओं पर प्रबल विजय और प्रतियोगिताओं व विवादों में सफलता देता है।"),
 ("Mercury",10):("It favours business, accounts, writing, media and communication-based careers.","यह व्यापार, लेखा, लेखन, मीडिया और संवाद पर आधारित करियर के लिए शुभ है।"),
 ("Mercury",7):("It suggests a youthful, intelligent partner and success in business partnerships.","यह युवा, बुद्धिमान जीवनसाथी और व्यापारिक साझेदारी में सफलता का संकेत देता है।"),
 ("Jupiter",1):("It makes the person wise, respected and generally protected in life.","यह व्यक्ति को ज्ञानी, सम्मानित और जीवन में सामान्यतः सुरक्षित बनाता है।"),
 ("Jupiter",2):("It favours wealth, a good family and truthful, respected speech.","यह धन, अच्छे परिवार और सच्ची, सम्मानित वाणी के लिए शुभ है।"),
 ("Jupiter",5):("It gives good intelligence and devotion; for children, Jupiter as karaka of this house asks for patience.","यह अच्छी बुद्धि और भक्ति देता है; संतान के विषय में, इस भाव का कारक होने से गुरु धैर्य माँगता है।"),
 ("Jupiter",7):("It promises a good-natured, wise spouse and blessings in marriage.","यह सुशील, समझदार जीवनसाथी और विवाह में आशीर्वाद का संकेत देता है।"),
 ("Jupiter",9):("It gives strong fortune, a good father or guru, and a religious outlook.","यह प्रबल भाग्य, अच्छे पिता या गुरु और धार्मिक दृष्टिकोण देता है।"),
 ("Venus",2):("It brings wealth through comforts, arts or beauty, and sweet speech.","यह सुख-सुविधा, कला या सौंदर्य के माध्यम से धन और मधुर वाणी देता है।"),
 ("Venus",7):("It gives an attractive, loving partner; balance in desires keeps the marriage happy.","यह आकर्षक और प्रेमपूर्ण जीवनसाथी देता है; इच्छाओं में संतुलन विवाह को सुखी रखता है।"),
 ("Venus",12):("It gives comforts and pleasures, and can bring gains from foreign lands.","यह सुख-भोग देता है और विदेश से लाभ दिला सकता है।"),
 ("Saturn",7):("Marriage may come after some delay, often to a mature and responsible partner.","विवाह कुछ देरी से हो सकता है, अक्सर परिपक्व और ज़िम्मेदार जीवनसाथी से।"),
 ("Saturn",10):("Career rises slowly but steadily through hard work; success is lasting.","करियर मेहनत से धीरे-धीरे पर लगातार बढ़ता है; सफलता स्थायी होती है।"),
 ("Saturn",6):("It defeats enemies and gives success in service, law and labour-related work.","यह शत्रुओं को पराजित करता है और सेवा, कानून और श्रम से जुड़े कार्यों में सफलता देता है।"),
 ("Saturn",12):("It can connect the person with foreign lands or distant places; expenses need control.","यह व्यक्ति को विदेश या दूर स्थानों से जोड़ सकता है; खर्च पर नियंत्रण ज़रूरी है।"),
 ("Rahu",10):("It can give an unusual or technology/foreign-linked career and sudden rise.","यह असामान्य या तकनीक/विदेश से जुड़ा करियर और अचानक उन्नति दे सकता है।"),
 ("Rahu",12):("It is a classic indicator of foreign travel or settling abroad.","यह विदेश यात्रा या विदेश में बसने का प्रमुख संकेत है।"),
 ("Rahu",7):("It can bring an unconventional partner or a partner from a different background; clarity and honesty in relationships help.","यह अलग स्वभाव या अलग पृष्ठभूमि वाला जीवनसाथी दे सकता है; रिश्तों में स्पष्टता और ईमानदारी सहायक है।"),
 ("Rahu",6):("It gives strong victory over rivals and success in competitive exams.","यह विरोधियों पर प्रबल विजय और प्रतियोगी परीक्षाओं में सफलता देता है।"),
 ("Ketu",12):("It favours spirituality, meditation and liberation.","यह आध्यात्मिकता, ध्यान और मोक्ष के लिए शुभ है।"),
 ("Ketu",7):("It can make the person somewhat detached in partnerships; spending quality time together helps.","यह साझेदारी में कुछ उदासीनता दे सकता है; साथ में अच्छा समय बिताना सहायक है।"),
}
def phouse(p,h):
    if p in BENEF:
        k = "B_KT" if h in (1,4,5,7,9,10) else "B_UP" if h in (3,11) else "B_2" if h==2 else "B_6" if h==6 else "B_DUS"
    else:
        k = "M_10" if h==10 else "M_KT" if h in (1,4,5,7,9) else "M_UP" if h in (3,6,11) else "M_2" if h==2 else "M_DUS"
    return k
for p in P:
    for h in range(1,13):
        k=phouse(p,h); en,hi=T[k]
        hen,hhi=HOUSES[h][2],HOUSES[h][3]
        ren=f"{p} in the {o(h)} house brings its qualities ({GR[p][1]}) into matters of {hen}. {en}"
        rhi=f"{HO[h]} भाव में {PH[p]} अपने गुण ({GR[p][2]}) {hhi} के विषयों में लाता है। {hi}"
        src=f"BPHS, Ch. {11+h} (Effects of the {o(h)} house)"
        if DIG.get(p)==h:
            ren+=" It also gains directional strength (dig bala) here, which makes it powerful."
            rhi+=" यहाँ इसे दिग्बल भी मिलता है, जिससे यह शक्तिशाली हो जाता है।"
            src+=" & Ch. 27 (Strengths)"
        if (p,h) in SPECIAL:
            ren+=" "+SPECIAL[(p,h)][0]; rhi+=" "+SPECIAL[(p,h)][1]
        add(f"bphs.planet_house.{p.lower()}.{h}","planet_house",ren,rhi,src,"derived",match={"planet":p,"house":h},tone=("good" if k in ("B_KT","B_UP","B_2","M_UP","M_10") else "mixed"))

# ---------------------------------------------------------------- 4. PLANET IN SIGN (Ch.3 dignities, Ch.4 sign natures)
MOD = ["movable","fixed","dual"]; MODH=["चर","स्थिर","द्विस्वभाव"]
ELEM = ["fire","earth","air","water"]; ELH=["अग्नि","पृथ्वी","वायु","जल"]
ELF = {"fire":("adds energy, initiative and leadership","ऊर्जा, पहल और नेतृत्व"),"earth":("makes it practical and grounded","व्यावहारिकता और स्थिरता"),"air":("adds intellect, communication and social skill","बुद्धि, संवाद और सामाजिक कौशल"),"water":("adds emotion, intuition and sensitivity","भावना, अंतर्ज्ञान और संवेदनशीलता")}
MODF = [("quick action and change","तेज़ कार्य और परिवर्तन"),("stability and persistence","स्थिरता और दृढ़ता"),("adaptability, though sometimes indecision","लचीलापन, पर कभी-कभी अनिर्णय")]
DIGN = {"exalted":("Exalted: the planet is at its strongest and gives its best results.","उच्च: ग्रह अपनी सबसे अच्छी स्थिति में है और श्रेष्ठ फल देता है।"),
 "debilitated":("Debilitated: the planet is weak, so its significations need extra effort, unless the debility is cancelled (neecha bhanga).","नीच: ग्रह कमज़ोर है, इसलिए इसके विषयों में अतिरिक्त प्रयास चाहिए, जब तक नीचभंग न हो।"),
 "own":("In its own sign: comfortable and strong, it gives steady, reliable results.","स्वराशि में: सहज और बलवान होकर यह स्थिर, भरोसेमंद फल देता है।"),
 "friend":("In a friend's sign: the planet works well and gives good results.","मित्र राशि में: ग्रह अच्छा काम करता है और शुभ फल देता है।"),
 "neutral":("In a neutral sign: results are moderate.","सम राशि में: फल मध्यम रहते हैं।"),
 "enemy":("In an enemy's sign: the planet is uneasy, so results come with some friction.","शत्रु राशि में: ग्रह असहज रहता है, इसलिए फल कुछ रुकावट के साथ मिलते हैं।")}
def dignity(p,s):
    ex=GR[p][3]
    if s==ex: return "exalted"
    if s==(ex+6)%12: return "debilitated"
    if s in OWN[p]: return "own"
    l=LORD[s]
    if l==p: return "own"
    if l in GR[p][5]: return "friend"
    if l in GR[p][6]: return "enemy"
    return "neutral"
for p in P:
    for s in range(12):
        d=dignity(p,s); m=s%3; el=ELEM[s%4]
        den,dhi=DIGN[d]
        ren=f"{p} in {S[s]}: {den} {S[s]} is a {MOD[m]}, {el} sign ruled by {LORD[s]}; it {ELF[el][0]} and favours {MODF[m][0]}."
        rhi=f"{SH[s]} में {PH[p]}: {dhi} {SH[s]} {MODH[m]}, {ELH[s%4]} तत्व की राशि है जिसका स्वामी {PH[LORD[s]]} है; यह राशि {ELF[el][1]} तथा {MODF[m][1]} को बढ़ावा देती है।"
        if p in ("Rahu","Ketu") and d not in ("exalted","debilitated"):
            ren+=f" As a shadow planet, {p} here gives results like {LORD[s]}, the sign lord."
            rhi+=f" छाया ग्रह होने से {PH[p]} यहाँ राशि स्वामी {PH[LORD[s]]} जैसा फल देता है।"
        add(f"bphs.planet_sign.{p.lower()}.{s}","planet_sign",ren,rhi,"BPHS, Ch. 3 (dignities, friendships) & Ch. 4 (sign natures)","derived",match={"planet":p,"sign":s},dignity=d)

# ---------------------------------------------------------------- 5. HOUSE-LORD & JUDGEMENT PRINCIPLES (Ch.24, 27, 32, 46, 48, 52–60)
PR = [
 ("lord_own","When a house's lord sits in its own house, that house is protected and its matters stay strong.","जब किसी भाव का स्वामी अपने ही भाव में बैठता है, तो वह भाव सुरक्षित रहता है और उसके विषय मज़बूत रहते हैं।","BPHS, Ch. 24 (Effects of the Bhava lords)"),
 ("lord_kt","When a house's lord occupies a kendra (1st, 4th, 7th, 10th) or trikona (5th, 9th), the matters of that house flourish.","जब किसी भाव का स्वामी केंद्र (1, 4, 7, 10) या त्रिकोण (5, 9) में होता है, तो उस भाव के विषय फलते-फूलते हैं।","BPHS, Ch. 24 (Effects of the Bhava lords)"),
 ("lord_gain","When a house's lord is in the 2nd or 11th, its matters connect with wealth and gains, which is generally supportive.","जब किसी भाव का स्वामी दूसरे या ग्यारहवें भाव में होता है, तो उसके विषय धन और लाभ से जुड़ते हैं, जो सामान्यतः सहायक है।","BPHS, Ch. 24 (Effects of the Bhava lords)"),
 ("lord_3","When a house's lord is in the 3rd, its results come through one's own effort and courage.","जब किसी भाव का स्वामी तीसरे भाव में होता है, तो उसके फल अपने प्रयास और साहस से मिलते हैं।","BPHS, Ch. 24 (Effects of the Bhava lords)"),
 ("lord_dus","When a house's lord falls in a dusthana (6th, 8th or 12th), that house's matters meet delays, obstacles or expense, unless the lord is otherwise strong.","जब किसी भाव का स्वामी दुःस्थान (6, 8, 12) में होता है, तो उस भाव के विषयों में देरी, बाधा या खर्च आता है, जब तक स्वामी अन्यथा बलवान न हो।","BPHS, Ch. 24 (Effects of the Bhava lords)"),
 ("karaka","Each house has a natural significator (karaka). A strong karaka supports that house's matters; a weak karaka calls for its remedies.","हर भाव का एक प्राकृतिक कारक ग्रह होता है। बलवान कारक उस भाव के विषयों को सहारा देता है; कमज़ोर कारक के उपाय करने चाहिए।","BPHS, Ch. 32 (Karakatwas)"),
 ("digbala","Directional strength: Jupiter and Mercury are strongest in the 1st, Moon and Venus in the 4th, Saturn in the 7th, Sun and Mars in the 10th.","दिग्बल: गुरु और बुध पहले भाव में, चंद्र और शुक्र चौथे में, शनि सातवें में, सूर्य और मंगल दसवें भाव में सबसे बलवान होते हैं।","BPHS, Ch. 27 (Evaluation of strengths)"),
 ("vimshottari","Vimshottari dasha spans 120 years: Ketu 7, Venus 20, Sun 6, Moon 10, Mars 7, Rahu 18, Jupiter 16, Saturn 19, Mercury 17. The first dasha is that of the lord of the Moon's birth nakshatra.","विंशोत्तरी दशा 120 वर्ष की होती है: केतु 7, शुक्र 20, सूर्य 6, चंद्र 10, मंगल 7, राहु 18, गुरु 16, शनि 19, बुध 17। पहली दशा जन्म के समय चंद्रमा के नक्षत्र के स्वामी की होती है।","BPHS, Ch. 46 (Dasas of planets)"),
 ("activation","A house gives its results during the dasha or antardasha of its lord, of planets placed in it, and of its karaka.","कोई भाव अपना फल अपने स्वामी, उसमें बैठे ग्रहों और उसके कारक की दशा या अंतर्दशा में देता है।","BPHS, Ch. 48 (Effects of the dasas of house lords)"),
 ("ad_position","An antardasha is favourable when its lord is friendly to the Mahadasha lord and placed in a kendra, trikona or the 11th from it; it is harder when placed 6th, 8th or 12th from it.","अंतर्दशा तब शुभ होती है जब उसका स्वामी महादशा स्वामी का मित्र हो और उससे केंद्र, त्रिकोण या ग्यारहवें स्थान में हो; उससे छठे, आठवें या बारहवें होने पर कठिन होती है।","BPHS, Ch. 52–60 (Antardasha effects)"),
 ("benefic_malefic","Jupiter, Venus, well-placed Mercury and the waxing Moon are natural benefics; the Sun, Mars, Saturn, Rahu and Ketu are natural malefics.","गुरु, शुक्र, शुभ बुध और शुक्ल पक्ष का चंद्रमा प्राकृतिक शुभ ग्रह हैं; सूर्य, मंगल, शनि, राहु और केतु प्राकृतिक पाप ग्रह हैं।","BPHS, Ch. 3 (Planetary characteristics)"),
]
for id_,en,hi,src in PR: add(f"bphs.principle.{id_}","principle",en,hi,src,match={"principle":id_})

# ---------------------------------------------------------------- 6. YOGAS (Ch.34, 36, 37, 39, 41, 75)
Y = [
 ("gajakesari","Gajakesari Yoga","गजकेसरी योग","Gajakesari Yoga forms when Jupiter is in a kendra (1st, 4th, 7th or 10th) from the Moon. It gives intelligence, respect, prosperity and a lasting good name.","गजकेसरी योग तब बनता है जब गुरु चंद्रमा से केंद्र (1, 4, 7, 10) में हो। यह बुद्धि, सम्मान, समृद्धि और स्थायी यश देता है।","BPHS, Ch. 36 (Many other Yogas)","chapter",["career","money","education","general"]),
 ("raj","Raj Yoga","राज योग","Raj Yoga arises when the lord of a kendra and the lord of a trikona join together, exchange signs or face each other. It brings rise in status, authority and success, especially in their dashas.","राज योग तब बनता है जब केंद्र का स्वामी और त्रिकोण का स्वामी एक साथ हों, राशि परिवर्तन करें या एक-दूसरे के सामने हों। यह विशेषकर उनकी दशा में पद, अधिकार और सफलता में वृद्धि देता है।","BPHS, Ch. 39 (Raja Yogas)","chapter",["career","business","general"]),
 ("yogakaraka","Yogakaraka planet","योगकारक ग्रह","A planet that owns both a kendra and a trikona from the lagna becomes a yogakaraka; on its own it gives Raj Yoga results in its dasha.","जो ग्रह लग्न से केंद्र और त्रिकोण दोनों का स्वामी हो, वह योगकारक बनता है; वह अकेले ही अपनी दशा में राज योग का फल देता है।","BPHS, Ch. 34 (Yoga Karakas)","chapter",["career","general"]),
 ("dhan","Dhan Yoga","धन योग","Dhan Yoga forms when the lords of wealth houses (2nd and 11th) associate with the lords of the 1st, 5th or 9th by conjunction, exchange or mutual aspect. It promises accumulation of wealth, especially in their dashas.","धन योग तब बनता है जब धन भावों (2, 11) के स्वामी पहले, पाँचवें या नौवें भाव के स्वामियों से युति, परिवर्तन या परस्पर दृष्टि से जुड़ें। यह विशेषकर उनकी दशा में धन-संचय का वादा करता है।","BPHS, Ch. 41 (Yogas for wealth)","chapter",["money","business"]),
 ("ruchaka","Ruchaka Yoga (Mars)","रुचक योग (मंगल)","Ruchaka Yoga, one of the five Mahapurusha yogas, forms when Mars is in its own or exaltation sign in a kendra. It gives a strong body, courage and leadership, with success in land, police, defence, sports or technical fields.","रुचक योग, पाँच महापुरुष योगों में से एक, तब बनता है जब मंगल स्वराशि या उच्च राशि में केंद्र में हो। यह मज़बूत शरीर, साहस और नेतृत्व देता है, तथा भूमि, पुलिस, रक्षा, खेल या तकनीकी क्षेत्रों में सफलता।","BPHS, Ch. 75 (Pancha Mahapurushas)","chapter",["career","general","property"]),
 ("bhadra","Bhadra Yoga (Mercury)","भद्र योग (बुध)","Bhadra Yoga forms when Mercury is in its own or exaltation sign in a kendra. It gives a sharp intellect, eloquence and success in trade, writing and learning.","भद्र योग तब बनता है जब बुध स्वराशि या उच्च राशि में केंद्र में हो। यह तीक्ष्ण बुद्धि, वाक्पटुता और व्यापार, लेखन व विद्या में सफलता देता है।","BPHS, Ch. 75 (Pancha Mahapurushas)","chapter",["career","business","education","general"]),
 ("hamsa","Hamsa Yoga (Jupiter)","हंस योग (गुरु)","Hamsa Yoga forms when Jupiter is in its own or exaltation sign in a kendra. It makes the person righteous, wise and respected, often in teaching, advisory or spiritual roles.","हंस योग तब बनता है जब गुरु स्वराशि या उच्च राशि में केंद्र में हो। यह व्यक्ति को धर्मनिष्ठ, ज्ञानी और सम्मानित बनाता है, अक्सर शिक्षण, सलाह या आध्यात्मिक भूमिकाओं में।","BPHS, Ch. 75 (Pancha Mahapurushas)","chapter",["career","education","children","general"]),
 ("malavya","Malavya Yoga (Venus)","मालव्य योग (शुक्र)","Malavya Yoga forms when Venus is in its own or exaltation sign in a kendra. It gives comforts, vehicles, artistic taste, wealth and a happy married life.","मालव्य योग तब बनता है जब शुक्र स्वराशि या उच्च राशि में केंद्र में हो। यह सुख-सुविधा, वाहन, कलात्मक रुचि, धन और सुखी वैवाहिक जीवन देता है।","BPHS, Ch. 75 (Pancha Mahapurushas)","chapter",["marriage","love","money","general"]),
 ("sasa","Sasa Yoga (Saturn)","शश योग (शनि)","Sasa Yoga forms when Saturn is in its own or exaltation sign in a kendra. It gives authority over people, discipline and success through persistence, often leading organisations.","शश योग तब बनता है जब शनि स्वराशि या उच्च राशि में केंद्र में हो। यह लोगों पर अधिकार, अनुशासन और दृढ़ता से सफलता देता है, अक्सर संस्थाओं का नेतृत्व।","BPHS, Ch. 75 (Pancha Mahapurushas)","chapter",["career","legal","general"]),
 ("kemadruma","Kemadruma Yoga","केमद्रुम योग","Kemadruma Yoga is described when no planet other than the Sun occupies the 2nd or 12th house from the Moon; it is associated with periods of struggle and lack of support. Planets in kendras from the Moon or Lagna are widely taken to cancel it, and Moon remedies help.","केमद्रुम योग तब बताया गया है जब चंद्रमा से दूसरे या बारहवें भाव में सूर्य के अलावा कोई ग्रह न हो; इसे संघर्ष और सहारे की कमी वाले समय से जोड़ा जाता है। चंद्रमा या लग्न से केंद्र में ग्रह हों तो इसे प्रायः भंग माना जाता है, और चंद्र के उपाय सहायक हैं।","BPHS, Ch. 37 (Lunar Yogas); cancellation rule is from later commentators","chapter",["money","health","family","general"]),
 ("neechabhanga","Neecha Bhanga (cancellation of debility)","नीचभंग","A debilitated planet's weakness is cancelled when the lord of the sign it is debilitated in, or the lord of its exaltation sign, is in a kendra from the Lagna or the Moon. The planet then gives good results after initial struggle.","नीच ग्रह की कमज़ोरी तब भंग होती है जब उसकी नीच राशि का स्वामी, या उसकी उच्च राशि का स्वामी, लग्न या चंद्रमा से केंद्र में हो। तब वह ग्रह शुरुआती संघर्ष के बाद अच्छा फल देता है।","Classical tradition (Parashari principle widely taught; not confined to one BPHS chapter)","tradition",["career","money","general"]),
 ("kuja","Kuja (Manglik) Dosha","कुज (मांगलिक) दोष","Popular tradition calls a chart Manglik when Mars is in the 1st, 2nd, 4th, 7th, 8th or 12th house from the Lagna (or Moon). It is said to call for patience and understanding in marriage; matching with another Manglik chart, or Mars remedies, is traditionally advised.","लोकप्रिय परंपरा में जब मंगल लग्न (या चंद्र) से 1, 2, 4, 7, 8 या 12वें भाव में हो, तो कुंडली मांगलिक कहलाती है। इसका अर्थ विवाह में धैर्य और समझ की ज़रूरत बताया जाता है; परंपरा में मांगलिक से मिलान या मंगल के उपाय की सलाह दी जाती है।","Later tradition (not a named dosha in BPHS)","tradition",["marriage","love"]),
]
for id_,nen,nhi,en,hi,src,conf,areas in Y:
    add(f"bphs.yoga.{id_}","yoga",en,hi,src,conf,match={"yoga":id_},name_en=nen,name_hi=nhi,areas=areas)

# ---------------------------------------------------------------- 7. MAHADASHA (Ch.46–47) & ANTARDASHA (Ch.52–60)
YRS = {"Ketu":7,"Venus":20,"Sun":6,"Moon":10,"Mars":7,"Rahu":18,"Jupiter":16,"Saturn":19,"Mercury":17}
MD = {
 "Sun":("brings recognition, authority, support from government or seniors and stronger confidence. If the Sun is weak, friction with superiors or father and low energy are possible; humility and routine help.","मान-सम्मान, अधिकार, सरकार या वरिष्ठों से सहयोग और आत्मविश्वास में वृद्धि देती है। सूर्य कमज़ोर हो तो वरिष्ठों या पिता से मतभेद और कम ऊर्जा संभव है; विनम्रता और नियमित दिनचर्या सहायक है।"),
 "Moon":("brings comforts, peace of mind, closeness to mother, travel and success in public dealings. If the Moon is weak, emotional ups and downs need care.","सुख-सुविधा, मानसिक शांति, माता से निकटता, यात्रा और जनसंपर्क में सफलता देती है। चंद्र कमज़ोर हो तो भावनात्मक उतार-चढ़ाव का ध्यान रखना होता है।"),
 "Mars":("brings energy, courage, gains from land or property, technical success and progress through siblings. If Mars is weak, avoid anger, haste and disputes.","ऊर्जा, साहस, भूमि-संपत्ति से लाभ, तकनीकी सफलता और भाई-बहनों से प्रगति देती है। मंगल कमज़ोर हो तो क्रोध, जल्दबाज़ी और विवाद से बचें।"),
 "Rahu":("brings ambition, sudden opportunities, foreign connections and unconventional paths. If Rahu is afflicted, confusion or misleading people are possible; stay honest and clear-headed.","महत्वाकांक्षा, अचानक अवसर, विदेशी संबंध और अलग रास्ते देती है। राहु पीड़ित हो तो भ्रम या गुमराह करने वाले लोग मिल सकते हैं; ईमानदार और स्पष्ट रहें।"),
 "Jupiter":("brings growth, wisdom, respect, wealth, children's happiness and spiritual inclination; it is often favourable for marriage and learning. If Jupiter is weak, opportunities may be missed through over-confidence.","उन्नति, ज्ञान, सम्मान, धन, संतान सुख और आध्यात्मिक झुकाव देती है; यह अक्सर विवाह और विद्या के लिए शुभ होती है। गुरु कमज़ोर हो तो अति-आत्मविश्वास से अवसर छूट सकते हैं।"),
 "Saturn":("brings results through steady hard work, discipline and service; gains come after delay but last long. If Saturn is weak, delays and heavy responsibilities test patience.","लगातार मेहनत, अनुशासन और सेवा से फल देती है; लाभ देरी से पर स्थायी आते हैं। शनि कमज़ोर हो तो देरी और भारी ज़िम्मेदारियाँ धैर्य की परीक्षा लेती हैं।"),
 "Mercury":("brings learning, business growth, communication skills, new friends and sharp thinking. If Mercury is weak, nervousness or indecision may appear.","विद्या, व्यापार में वृद्धि, संवाद कौशल, नए मित्र और तेज़ सोच देती है। बुध कमज़ोर हो तो घबराहट या अनिर्णय हो सकता है।"),
 "Ketu":("brings detachment, spiritual growth, research ability and sudden changes. If Ketu is afflicted, confusion or losses are possible; inner practice brings stability.","वैराग्य, आध्यात्मिक उन्नति, शोध क्षमता और अचानक बदलाव देती है। केतु पीड़ित हो तो भ्रम या हानि संभव है; आंतरिक साधना से स्थिरता आती है।"),
 "Venus":("brings comforts, marriage and romance, vehicles, arts, luxury and wealth. If Venus is weak, over-indulgence or relationship strain need care.","सुख-सुविधा, विवाह और प्रेम, वाहन, कला, ऐश्वर्य और धन देती है। शुक्र कमज़ोर हो तो अति-भोग या रिश्तों में तनाव का ध्यान रखें।"),
}
for p,(en,hi) in MD.items():
    add(f"bphs.dasha.{p.lower()}","dasha",f"{p} Mahadasha ({YRS[p]} years) {en}",f"{PH[p]} महादशा ({YRS[p]} वर्ष) {hi}","BPHS, Ch. 46 (Dasas) & Ch. 47 (Effects of Dasas)",match={"md":p})
ADCH = {"Sun":52,"Moon":53,"Mars":54,"Rahu":55,"Jupiter":56,"Saturn":57,"Mercury":58,"Ketu":59,"Venus":60}
def rel(a,b):
    if a==b: return "same"
    return "friend" if b in GR[a][5] else "enemy" if b in GR[a][6] else "neutral"
RELT = {"same":("This is the Mahadasha lord's own sub-period, so its themes are at their strongest.","यह महादशा स्वामी की अपनी अंतर्दशा है, इसलिए इसके विषय सबसे प्रबल रहते हैं।"),
 "friend":("{a} is friendly to {m}, so this sub-period generally runs smoothly and supports the Mahadasha's good results.","{a}, {m} का मित्र है, इसलिए यह अंतर्दशा सामान्यतः सहज चलती है और महादशा के शुभ फलों को बढ़ाती है।"),
 "neutral":("{a} is neutral to {m}, so results are mixed and depend on where {a} sits in the chart.","{a}, {m} के प्रति सम है, इसलिए फल मिश्रित रहते हैं और कुंडली में {a} की स्थिति पर निर्भर करते हैं।"),
 "enemy":("{a} is not friendly to {m}, so some friction, delays or tension are possible; remedies of {a} help.","{a}, {m} का मित्र नहीं है, इसलिए कुछ टकराव, देरी या तनाव संभव है; {a} के उपाय सहायक हैं।")}
for m in P:
    for a in P:
        r=rel(a,m); en,hi=RELT[r]
        add(f"bphs.antardasha.{m.lower()}.{a.lower()}","antardasha",
            f"{a} antardasha in {m} Mahadasha: "+en.format(a=a,m=m)+f" Matters signified by {a}, such as {GR[a][1].split(',')[0]}, come into focus.",
            f"{PH[m]} महादशा में {PH[a]} अंतर्दशा: "+hi.format(a=PH[a],m=PH[m])+f" {PH[a]} के विषय, जैसे {GR[a][2].split(',')[0]}, सामने आते हैं।",
            f"BPHS, Ch. {ADCH[m]} (Antardashas in the dasha of {m})","derived",match={"md":m,"ad":a},relation=r)

# ---------------------------------------------------------------- 8. REMEDIES (Ch.84 + tradition)
RM = {
 "Sun":("ॐ घृणि सूर्याय नमः","wheat, jaggery or a copper vessel","गेहूँ, गुड़ या ताँबे का बर्तन","Sunday","रविवार","Ruby","माणिक्य","Offer water to the rising Sun and respect your father and elders.","उगते सूर्य को जल अर्पित करें और पिता व बड़ों का सम्मान करें।"),
 "Moon":("ॐ सों सोमाय नमः","rice, milk or white cloth","चावल, दूध या सफ़ेद वस्त्र","Monday","सोमवार","Pearl","मोती","Keep the mind calm, serve your mother and offer water to a Shivling on Mondays.","मन शांत रखें, माता की सेवा करें और सोमवार को शिवलिंग पर जल चढ़ाएँ।"),
 "Mars":("ॐ अं अंगारकाय नमः","red lentils (masoor dal), jaggery or red cloth","मसूर दाल, गुड़ या लाल वस्त्र","Tuesday","मंगलवार","Red coral","मूंगा","Recite Hanuman Chalisa and channel anger into exercise or service.","हनुमान चालीसा का पाठ करें और क्रोध को व्यायाम या सेवा में लगाएँ।"),
 "Mercury":("ॐ बुं बुधाय नमः","green moong dal or green vegetables; feed green fodder to cows","हरी मूंग दाल या हरी सब्ज़ियाँ; गाय को हरा चारा खिलाएँ","Wednesday","बुधवार","Emerald","पन्ना","Keep your accounts honest and your words kind; worship Lord Vishnu or Ganesha.","हिसाब-किताब ईमानदार और वाणी मधुर रखें; भगवान विष्णु या गणेश की उपासना करें।"),
 "Jupiter":("ॐ बृं बृहस्पतये नमः","chana dal, turmeric or bananas","चने की दाल, हल्दी या केले","Thursday","गुरुवार","Yellow sapphire","पुखराज","Respect teachers and elders, keep your promises and help students.","गुरुओं और बड़ों का सम्मान करें, वचन निभाएँ और विद्यार्थियों की मदद करें।"),
 "Venus":("ॐ शुं शुक्राय नमः","rice, sugar, curd or white sweets","चावल, चीनी, दही या सफ़ेद मिठाई","Friday","शुक्रवार","Diamond (or white sapphire)","हीरा (या सफ़ेद पुखराज)","Keep your home clean and pleasant, and respect the women in your life; worship Goddess Lakshmi.","घर साफ़ और सुंदर रखें और जीवन की महिलाओं का सम्मान करें; माँ लक्ष्मी की उपासना करें।"),
 "Saturn":("ॐ शं शनैश्चराय नमः","black sesame, mustard oil or black urad dal","काले तिल, सरसों का तेल या काली उड़द दाल","Saturday","शनिवार","Blue sapphire","नीलम","Serve workers and the elderly, be patient, and light a mustard-oil lamp under a peepal tree on Saturdays.","श्रमिकों और बुज़ुर्गों की सेवा करें, धैर्य रखें और शनिवार को पीपल के नीचे सरसों के तेल का दीपक जलाएँ।"),
 "Rahu":("ॐ रां राहवे नमः","black sesame, a blanket or coconut","काले तिल, कंबल या नारियल","Saturday","शनिवार","Hessonite (Gomed)","गोमेद","Avoid shortcuts and intoxicants, feed stray dogs and worship Goddess Durga.","शॉर्टकट और नशे से बचें, आवारा कुत्तों को भोजन दें और माँ दुर्गा की उपासना करें।"),
 "Ketu":("ॐ कें केतवे नमः","a blanket, sesame or food for dogs","कंबल, तिल या कुत्तों के लिए भोजन","Tuesday","मंगलवार","Cat's eye","लहसुनिया","Meditate, worship Lord Ganesha, and avoid decisions made in confusion.","ध्यान करें, भगवान गणेश की उपासना करें और भ्रम में निर्णय न लें।"),
}
for p,(mn,de,dh,fe,fh,ge,gh,pe,phi) in RM.items():
    add(f"bphs.remedy.{p.lower()}","remedy",
        f"To strengthen {p}: chant its mantra {mn} 108 times; donate {de}; keep a simple fast or extra devotion on {fe}. {pe} Gemstone: {ge} — gemstones are costly and not required; wear one only after a qualified astrologer checks your full chart.",
        f"{PH[p]} को बल देने के लिए: इसके मंत्र {mn} का 108 बार जाप करें; {dh} दान करें; {fh} को सरल व्रत या विशेष पूजा करें। {phi} रत्न: {gh} — रत्न महँगे हैं और आवश्यक नहीं; केवल योग्य ज्योतिषी द्वारा पूरी कुंडली देखने के बाद ही धारण करें।",
        "BPHS, Ch. 84 (Remedial measures: japa, worship and charity); specific items, fasting day and gemstone follow later tradition","chapter",
        match={"planet":p},mantra=mn,daan_en=de,daan_hi=dh,fast_en=fe,fast_hi=fh,gem_en=ge,gem_hi=gh,practice_en=pe,practice_hi=phi)

out = {"book":{"id":"bphs","name_en":"Brihat Parashara Hora Shastra","name_hi":"बृहत् पाराशर होरा शास्त्र","short":"BPHS",
        "edition_note":"Chapter numbers follow the R. Santhanam English edition (1984, 97 chapters); other editions number chapters differently. All rule text is original paraphrase.",
        "version":"1.0"},
       "entries":E}
os.makedirs(os.path.join(os.path.dirname(__file__),"..","data"),exist_ok=True)
path=os.path.join(os.path.dirname(__file__),"..","data","bphs.json")
json.dump(out,open(path,"w",encoding="utf-8"),ensure_ascii=False,indent=1)
from collections import Counter
print(len(E),"entries",dict(Counter(e["topic"] for e in E)))
