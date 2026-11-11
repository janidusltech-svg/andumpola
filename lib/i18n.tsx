"use client";
// lib/i18n.tsx — light English / සිංහල / தமிழ் switch for customer pages.
// Pages stay cached (fast); the chosen language is applied in the browser.
import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "si" | "ta";

const DICT = {
  search: ["Search", "සොයන්න", "தேடு"],
  sell: ["Sell", "විකුණන්න", "விற்க"],
  sellOn: ["Sell on AndumPola", "AndumPola හි විකුණන්න", "AndumPola இல் விற்கவும்"],
  orderOnWhatsApp: ["Order on WhatsApp", "WhatsApp හරහා ඇණවුම් කරන්න", "WhatsApp மூலம் ஆர்டர் செய்யுங்கள்"],
  callShop: ["Call shop", "සාප්පුවට අමතන්න", "கடையை அழைக்கவும்"],
  chooseSize: ["Choose size", "ප්‍රමාණය තෝරන්න", "அளவைத் தேர்ந்தெடுக்கவும்"],
  quantity: ["Quantity", "ගණන", "எண்ணிக்கை"],
  total: ["Total", "මුළු මුදල", "மொத்தம்"],
  orderNote: [
    "Your order goes straight to the shop on WhatsApp. They confirm price, delivery and payment with you directly.",
    "ඔබේ ඇණවුම WhatsApp හරහා කෙලින්ම සාප්පුවට යයි. මිල, බෙදාහැරීම සහ ගෙවීම ඔවුන් ඔබ සමඟ සෘජුවම තහවුරු කරයි.",
    "உங்கள் ஆர்டர் WhatsApp மூலம் நேரடியாக கடைக்குச் செல்லும். விலை, டெலிவரி மற்றும் கட்டணத்தை அவர்கள் உங்களுடன் நேரடியாக உறுதிப்படுத்துவார்கள்.",
  ],
  addToCart: ["Add to cart", "කරත්තයට එක් කරන්න", "கூடையில் சேர்"],
  addedToCart: ["Added to cart ✓", "කරත්තයට එක් කළා ✓", "கூடையில் சேர்க்கப்பட்டது ✓"],
  viewCart: ["View cart", "කරත්තය බලන්න", "கூடையைப் பார்"],
  cart: ["Cart", "කරත්තය", "கூடை"],
  account: ["Account", "ගිණුම", "கணக்கு"],
  login: ["Log in", "ඇතුල් වන්න", "உள்நுழை"],
  // counter poster
  posterScan: ["Scan to see our products", "අපේ භාණ්ඩ බලන්න ස්කෑන් කරන්න", "எங்கள் பொருட்களைப் பார்க்க ஸ்கேன் செய்யுங்கள்"],
  posterOrder: ["& order on WhatsApp", "සහ WhatsApp හරහා ඇණවුම් කරන්න", "மற்றும் WhatsApp இல் ஆர்டர் செய்யுங்கள்"],
  posterFooter: ["Our online shop on", "අපේ ඔන්ලයින් සාප්පුව", "எங்கள் ஆன்லைன் கடை"],
  posterHint: [
    "Print on A4 (or save as PDF) and stick it at the counter.",
    "A4 කඩදාසියක මුද්‍රණය කර (හෝ PDF ලෙස සුරකින්න) කවුන්ටරයේ අලවන්න.",
    "A4 இல் அச்சிட்டு (அல்லது PDF ஆக சேமித்து) கவுண்டரில் ஒட்டவும்.",
  ],
  printPdf: ["Print / Save PDF", "මුද්‍රණය / PDF", "அச்சிடு / PDF"],
  // join page
  joinBadge: ["For shop owners", "සාප්පු හිමියන්ට", "கடை உரிமையாளர்களுக்கு"],
  joinTitleA: ["Your shop online,", "ඔබේ සාප්පුව ඔන්ලයින්,", "உங்கள் கடை ஆன்லைனில்,"],
  joinTitleB: ["free for 60 days.", "දින 60ක් නොමිලේ.", "60 நாட்கள் இலவசம்."],
  joinSub: [
    "No website cost. No commission. Customers order straight to your WhatsApp.",
    "වෙබ් අඩවි වියදමක් නැහැ. කොමිස් නැහැ. පාරිභෝගිකයෝ කෙලින්ම ඔබේ WhatsApp එකට ඇණවුම් කරනවා.",
    "இணையதளச் செலவு இல்லை. கமிஷன் இல்லை. வாடிக்கையாளர்கள் நேரடியாக உங்கள் WhatsApp க்கு ஆர்டர் செய்வார்கள்.",
  ],
  joinStep1: ["Sign up in 2 minutes", "විනාඩි 2න් ලියාපදිංචි වන්න", "2 நிமிடங்களில் பதிவு செய்யுங்கள்"],
  joinStep2: ["Add product photos & prices", "භාණ්ඩ ඡායාරූප සහ මිල දාන්න", "பொருட்களின் புகைப்படங்கள் மற்றும் விலைகளைச் சேர்க்கவும்"],
  joinStep3: [
    "Share your link — get WhatsApp orders",
    "ඔබේ ලින්ක් එක share කරන්න — WhatsApp ඇණවුම් ගන්න",
    "உங்கள் இணைப்பைப் பகிருங்கள் — WhatsApp ஆர்டர்களைப் பெறுங்கள்",
  ],
  soldOut: ["Sold out", "අවසන්", "விற்றுத் தீர்ந்தது"],
  soldOutNow: ["Sold out right now", "දැනට තොග අවසන්", "தற்போது இருப்பில் இல்லை"],
  askComeback: [
    "Ask on WhatsApp if it's coming back",
    "නැවත ලැබෙනවාද කියා WhatsApp හරහා අහන්න",
    "மீண்டும் வருமா என WhatsApp இல் கேளுங்கள்",
  ],
  description: ["Description", "විස්තරය", "விளக்கம்"],
  soldBy: ["Sold by", "විකුණන්නා", "விற்பனையாளர்"],
  colours: ["Colours", "වර්ණ", "நிறங்கள்"],
  share: ["Share", "බෙදාගන්න", "பகிர்"],
  featured: ["Featured", "විශේෂ භාණ්ඩ", "சிறப்புப் பொருட்கள்"],
  allProducts: ["All products", "සියලු භාණ්ඩ", "அனைத்து பொருட்கள்"],
  all: ["All", "සියල්ල", "அனைத்தும்"],
  reviews: ["Reviews", "සමාලෝචන", "மதிப்புரைகள்"],
  shopLocation: ["Shop location", "සාප්පුවේ ස්ථානය", "கடையின் இருப்பிடம்"],
  openMaps: ["Open in Google Maps →", "Google Maps හි විවෘත කරන්න →", "Google Maps இல் திறக்கவும் →"],
  delivers: ["Delivers", "බෙදාහරින ප්‍රදේශ", "டெலிவரி பகுதிகள்"],
  delivery: ["Delivery", "බෙදාහැරීමේ ගාස්තුව", "டெலிவரி கட்டணம்"],
  cod: ["Cash on delivery", "භාණ්ඩ ලැබුණු පසු මුදල් ගෙවිය හැක", "பொருள் கிடைத்ததும் பணம் செலுத்தலாம்"],
  payByBank: ["Prefer to pay by bank transfer?", "බැංකු මාරුවෙන් ගෙවීමට කැමතිද?", "வங்கி பரிமாற்றம் மூலம் செலுத்த விரும்புகிறீர்களா?"],
  noProducts: [
    "This shop has not added products yet. Check back soon!",
    "මෙම සාප්පුව තවම භාණ්ඩ එකතු කර නැත. ඉක්මනින් නැවත බලන්න!",
    "இந்தக் கடை இன்னும் பொருட்களைச் சேர்க்கவில்லை. விரைவில் மீண்டும் பாருங்கள்!",
  ],
} as const;

export type TKey = keyof typeof DICT;
const IDX: Record<Lang, number> = { en: 0, si: 1, ta: 2 };

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ap-lang") as Lang | null;
      if (saved && saved in IDX) setLangState(saved);
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : lang;
  }, [lang]);
  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem("ap-lang", l);
    } catch {}
  }
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}

export function useT() {
  const { lang } = useLang();
  return (k: TKey) => DICT[k][IDX[lang]];
}

/** <T k="orderOnWhatsApp" /> — usable inside server components too */
export function T({ k }: { k: TKey }) {
  const t = useT();
  return <>{t(k)}</>;
}

/** Render children only in the listed languages (e.g. Sinhala-only extras) */
export function LangOnly({ langs, children }: { langs: Lang[]; children: React.ReactNode }) {
  const { lang } = useLang();
  return langs.includes(lang) ? <>{children}</> : null;
}

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <select
      aria-label="Language"
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      className="rounded-lg border border-line bg-white px-1 py-1 text-xs sm:text-sm sm:px-1.5 sm:py-1.5 mr-0.5"
    >
      <option value="en">EN</option>
      <option value="si">සිං</option>
      <option value="ta">தமி</option>
    </select>
  );
}
