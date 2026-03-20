const WORD_LIST = [
  "araba","aslan","balik","bahce","beyin","bilgi","bulut","cadde","ceket",
  "cicek","deniz","demir","duman","duvar","elmas","ekmek","fener","forma",
  "gelin","gunes","guzel","hakim","hamur","hayat","hizli","insan","kalem",
  "karga","kadin","kahve","kapak","kasap","kayak","kazma","kebap","kenar",
  "kilic","kitap","kofte","konak","kopek","koyun","kumar","liman","limon",
  "masal","marul","merak","meyve","mezar","miras","misir","model","moral",
  "motor","nabiz","nefes","nehir","nimet","nisan","ocak","odun","okuma",
  "onlar","onur","orman","ortak","oynak","ozlem","palet","panel","papaz",
  "pasta","pazar","perde","pilot","polis","radar","rapor","rende","resim",
  "roman","rozet","sabah","safir","sahne","sakal","salon","saman","sanat",
  "saray","satin","saygi","sefer","sehir","selam","senet","serin","sevgi",
  "sicak","silah","simge","siyah","sorun","sucuk","sulak","surat","tahta",
  "takim","takla","talip","tango","taraf","tarih","tarim","tavuk","tavan",
  "tekel","tekne","temiz","temel","tepsi","terzi","timsah","toprak","torun",
  "turan","tutar","tutum","tuzak","vergi","verim","vezir","viral","visne",
  "yaban","yakin","yanar","yapay","yarar","yatay","yazar","yayla","yedek",
  "yenge","yetki","yigit","yogun","yorum","yunus","yurek","zaman","zamir",
  "zarif","zebra","zemin","zeytin","zihin","zirve","zorba","zurna","abide",
  "acele","acemi","adres","afyon","ahbap","alarm","alcak","altin","ambar",
  "anket","antik","arazi","ardic","arena","armut","aroma","asker","atlas",
  "avans","avare","avlak","aydin","ayran","bakis","balkon","baraj","baret",
  "barut","basak","bayir","bazen","bedel","begeni","bekar","beyan","beyaz",
  "bicak","bicim","bilek","bilim","birim","bodur","boyut","bozuk","borek",
  "bolge","budun","buket","burun","butun","buyuk","canli","cazib","cesur",
  "daire","damga","davul","deger","dergi","desen","devir","disari","dizgi",
  "dokum","donum","dosem","dugum","dusuk","egitim","ekici","eksen","elci",
  "emekli","emsal","endise","engel","enlem","erkek","erken","esarp","essiz",
  "etken","etnik","evrak","evren","facia","fakir","fayda","fazla","fetih",
  "fikir","firar","fiyat","fosil","garaj","garip","gazoz","gecit","gelir",
  "genel","gercek","girift","girisi","giysi","gorev","gorus","gozlem","guclu",
  "gundem","hakikat","hamle","hapis","harabe","hatira","hava","hayal",
  "hazine","hediye","hesap","heves","heykel","hizli","hogoru","huküm",
  "irmak","ibadet","icerik","iddia","iktidar","ilerleme","isaret","izin",
  "sabun","sacma","sade","saha","sahip","sakin","sarp","satir","serap",
  "sergi","sevda","sidik","sigir","sirup","sivri","soguk","soluk","somun",
  "soylu","sozluk","suret","surgun","tapir","tarla","tasim","tatli","tayfa",
  "tembel","tepki","terlik","tesvik","tirnak","tohum","tokac","tolga","tomak",
  "topal","toran","torum","tosun","tudak","tufan","tugla","tuhaf","tulum",
  "tuncay","turna","uzakta","uzanti","uzari","uzman","uzuv","vagon","vakit",
  "varis","varlik","vasif","vatoz","vazife","vefali","velayet","vurgu","vuruk",
  "yagiz","yagma","yahut","yaka","yalak","yalin","yalniz","yanak","yangi",
  "yanik","yanki","yaprak","yarim","yasli","yavas","yaygin","yazlik","yengi",
  "yenlik","yetim","yigma","yikma","yilan","yipik","yitik","yoksul","yolcu",
  "yonga","yorgan","yosun","yufka","yukari","yumak","yumru","yumus","yutma",
  "zaman","zekat","zenci","zengin","ziyade","zulüm"
];

const VALID_WORDS = WORD_LIST.filter(w => w.length === 5);

function getRandomWord() {
  return VALID_WORDS[Math.floor(Math.random() * VALID_WORDS.length)];
}

function isValidWord(word) {
  return VALID_WORDS.includes(word.toLowerCase());
}

module.exports = { VALID_WORDS, getRandomWord, isValidWord };
