import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ta" | "hi";

const DICT: Record<Lang, Record<string, string>> = {
  en: {},
  ta: {
    // Sidebar / nav
    "Dashboard": "டாஷ்போர்டு",
    "Semester Notes": "செமஸ்டர் குறிப்புகள்",
    "Important Questions": "முக்கிய கேள்விகள்",
    "Previous Year Papers": "முந்தைய ஆண்டு வினாத்தாள்கள்",
    "Internships": "இன்டர்ன்ஷிப்",
    "Resume Builder": "ரெஸ்யூம் பில்டர்",
    "AI Resume Builder": "AI ரெஸ்யூம் பில்டர்",
    "Placement Prep": "வேலைவாய்ப்பு தயாரிப்பு",
    "Coding Practice": "கோடிங் பயிற்சி",
    "CGPA Calculator": "CGPA கால்குலேட்டர்",
    "Daily Challenges": "தினசரி சவால்கள்",
    "Daily Interview Test": "தினசரி நேர்காணல் தேர்வு",
    "Settings": "அமைப்புகள்",
    "Sign out": "வெளியேறு",
    "Quick access": "விரைவு அணுகல்",
    "Welcome back": "மீண்டும் வரவேற்கிறோம்",
    // Buttons
    "Save": "சேமி",
    "Submit": "சமர்ப்பி",
    "Download": "பதிவிறக்கம்",
    "New Resume": "புதிய ரெஸ்யூம்",
    "Search": "தேடு",
    "Mark as Completed": "முடிந்தது என குறி",
    "Retake Test": "மீண்டும் தேர்வெழுது",
    // Settings
    "Language": "மொழி",
    "Theme": "தீம்",
    "Light": "வெளிச்சம்",
    "Dark": "இருள்",
    "Default": "இயல்புநிலை",
    "English": "ஆங்கிலம்",
    "Tamil": "தமிழ்",
    "Hindi": "ஹிந்தி",
  },
  hi: {
    "Dashboard": "डैशबोर्ड",
    "Semester Notes": "सेमेस्टर नोट्स",
    "Important Questions": "महत्वपूर्ण प्रश्न",
    "Previous Year Papers": "पिछले वर्ष के पेपर",
    "Internships": "इंटर्नशिप",
    "Resume Builder": "रिज्यूमे बिल्डर",
    "AI Resume Builder": "AI रिज्यूमे बिल्डर",
    "Placement Prep": "प्लेसमेंट तैयारी",
    "Coding Practice": "कोडिंग अभ्यास",
    "CGPA Calculator": "CGPA कैलकुलेटर",
    "Daily Challenges": "दैनिक चुनौतियाँ",
    "Daily Interview Test": "दैनिक इंटरव्यू टेस्ट",
    "Settings": "सेटिंग्स",
    "Sign out": "साइन आउट",
    "Quick access": "त्वरित पहुँच",
    "Welcome back": "वापसी पर स्वागत है",
    "Save": "सहेजें",
    "Submit": "जमा करें",
    "Download": "डाउनलोड",
    "New Resume": "नया रिज्यूमे",
    "Search": "खोजें",
    "Mark as Completed": "पूर्ण के रूप में चिह्नित करें",
    "Retake Test": "पुनः परीक्षा दें",
    "Language": "भाषा",
    "Theme": "थीम",
    "Light": "हल्का",
    "Dark": "गहरा",
    "Default": "डिफ़ॉल्ट",
    "English": "अंग्रेज़ी",
    "Tamil": "तमिल",
    "Hindi": "हिंदी",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };
const I18nContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("app:lang") as Lang | null;
      if (saved === "en" || saved === "ta" || saved === "hi") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("app:lang", l); } catch {}
  };

  const t = (key: string) => DICT[lang]?.[key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
