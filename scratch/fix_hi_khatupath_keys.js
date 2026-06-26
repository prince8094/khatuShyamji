/**
 * fix_hi_khatupath_keys.js
 * Overwrites corrupted Mojibake khatuPath keys in hi.json with proper Devanagari UTF-8.
 */

const fs = require('fs');
const path = require('path');
const hiPath = path.join(__dirname, '../lib/translations/hi.json');
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

// Replace only the khatuPath section under screens with proper Hindi
hi.screens.khatuPath = {
  congratulationsYouHaveCompletedYourSpiritual: "बधाई हो! आपने अपनी आध्यात्मिक पदयात्रा पूरी कर ली है और श्री श्याम दरबार पहुँच गए हैं।",
  areYouSureYouWantToRestartYourJourneyFrom: "क्या आप वाकई रींगस से अपनी यात्रा फिर से शुरू करना चाहते हैं?",
  audioStreamingIsComingSoonPlayingOfflineTem: "ऑडियो स्ट्रीमिंग जल्द आ रही है! अभी के लिए ऑफलाइन मंदिर मंत्र बज रहे हैं।",
  khatuPadyatra: "खाटू पदयात्रा",
  experienceTheSpiritualWalkFromRingasToKhatu: "रींगस से खाटू धाम तक की आध्यात्मिक यात्रा का अनुभव करें",
  journeyGuide: "यात्रा मार्गदर्शक",
  textsBhajans: "आरती व भजन",
  shyamJaapCounter: "जाप काउंटर",
  distanceLeft: "दूरी शेष",
  stageTaskExperience: "चरण का अनुभव व कर्म",
  ringas0: "रींगस (0%)",
  shreeShyamDarbar100: "श्याम दरबार (100%)",
  resetJourney: "यात्रा शुरू से करें",
  enterMainDarbar: "मुख्य दरबार में प्रवेश करें",
  continueToNextStage: "अगले चरण पर बढ़ें",
  padyatraMilestonesMap: "पदयात्रा पड़ाव मानचित्र",
  leftToTemple: "मंदिर शेष",
  current: "वर्तमान",
  bhajanAartiSangrah: "भजन एवं आरती संग्रह",
  listenOrReadLyricsOfPopularDevotionalPaths: "प्रसिद्ध भक्ति भजनों और आरती के बोल पढ़ें और सुनें",
  readLyrics: "लिरिक्स पढ़ें",
  listen: "सुनें",
  lyricsDevanagariRoman: "पाठ व भजन बोल",
  listenAudioChant: "ऑडियो भजन सुनें",
  shyamJaapMantra: "श्री श्याम जाप काउंटर",
  tapJaap: "स्पर्श करें",
  resetCount: "रीसेट करें",
  chantHareKaSaharaBabaShyamHamaraWhileWalki: "चलते हुए 'हारे का सहारा, बाबा श्याम हमारा' का जाप करें। प्रत्येक 11 जाप पर शंख ध्वनि होगी।",
  stageX: "चरण {id} / 6"
};

fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');
console.log('✅ hi.json screens.khatuPath fixed with proper Devanagari text.');
