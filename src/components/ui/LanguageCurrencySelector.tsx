import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency, Currency } from '../../contexts/CurrencyContext';
import { ChevronDown, Check, Globe, Coins } from 'lucide-react';

// لونك المفضل — نستخدمه في كل حاجة
const PRIMARY_COLOR = '#07635d';

const LanguageCurrencySelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentCurrency, setCurrency, currencies, getCurrentCurrencySymbol } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'ar', name: 'العربية', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // إغلاق عند الضغط بره
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    document.documentElement.lang = langCode;
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('selectedLanguage', langCode);
    setIsOpen(false);
  };

  const changeCurrency = (currency: Currency) => {
    setCurrency(currency);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🌟 الزر الجديد: أبيض نقي، نص #07635d، أنيق جدًّا */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group flex items-center gap-2 px-3 py-1.5 rounded-2xl
          bg-white
          border border-[${PRIMARY_COLOR}]/20
          shadow-[0_1px_3px_rgba(0,0,0,0.03)]
          transition-all duration-300 ease-out
          hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]
          hover:border-[${PRIMARY_COLOR}]/30
          focus:outline-none focus:ring-2 focus:ring-[${PRIMARY_COLOR}]/20
        `}
        aria-label={t('common.languageAndCurrency', 'اللغة والعملة')}
      >
        {/* العلم */}
        <span className="text-base">{currentLanguage.flag}</span>

        {/* رمز العملة — لون #07635d */}
        <span className="font-medium text-[#07635d] text-sm">
          {getCurrentCurrencySymbol()}
        </span>

        {/* سهم — لون #07635d، يدور عند الفتح */}
        <ChevronDown 
          className={`
            w-4 h-4 transition-transform duration-300
            ${isOpen ? 'rotate-180 text-[#07635d]' : 'text-[#07635d]/70'}
          `} 
        />
      </button>

      {/* 🌟 القائمة الجديدة: خلفية بيضاء صلبة، نسق واحد، تفاصيل دقيقة */}
      {isOpen && (
        <div 
          className={`
            absolute top-full mt-2 right-0 w-64
            bg-white
            border border-[${PRIMARY_COLOR}]/20
            rounded-2xl
            shadow-[0_4px_12px_rgba(0,0,0,0.08)]
            overflow-hidden
            z-50
            transition-all duration-300 ease-out
            opacity-0 translate-y-1
            animate-in fade-in-95 slide-in-from-top-2
          `}
          style={{ opacity: 1, transform: 'translateY(0)' }}
        >
          {/* العنوان — خلفية فاتحة جدًّا، حد سفلي رفيع */}
          <div className="px-4 py-3 bg-[#fdf9f7] border-b border-[#07635d]/10">
            <h3 className="text-[#07635d] font-medium text-sm flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t('common.languageAndCurrency', 'اللغة والعملة')}
            </h3>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {/* اللغات */}
            <div className="p-2">
              <div className="px-2 py-1.5 text-[#07635d]/80 text-xs font-medium flex items-center gap-2 mb-1.5">
                <Globe className="w-3.5 h-3.5" />
                {t('common.language', 'اللغة')}
              </div>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200
                    ${currentLanguage.code === lang.code
                      ? `bg-[#fdf9f7] text-[#07635d] font-medium border border-[${PRIMARY_COLOR}]/20`
                      : `text-gray-700 hover:bg-gray-50`
                    }
                  `}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.nativeName}</span>
                  {currentLanguage.code === lang.code && (
                    <Check className="ml-auto w-4 h-4 text-[#10B981]" />
                  )}
                </button>
              ))}
            </div>

            {/* فاصل رفيع — لون #07635d/10 */}
            <div className="px-4 py-0.5">
              <div className="h-px bg-[#07635d]/10"></div>
            </div>

            {/* العملات */}
            <div className="p-2">
              <div className="px-2 py-1.5 text-[#07635d]/80 text-xs font-medium flex items-center gap-2 mb-1.5">
                <Coins className="w-3.5 h-3.5" />
                {t('common.currency', 'العملة')}
              </div>
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => changeCurrency(currency)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200
                    ${currentCurrency.code === currency.code
                      ? `bg-[#fdf9f7] text-[#07635d] font-medium border border-[${PRIMARY_COLOR}]/20`
                      : `text-gray-700 hover:bg-gray-50`
                    }
                  `}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#07635d]/10 text-[#07635d] font-bold text-sm">
                    {i18n.language === 'ar' ? currency.symbol : currency.symbolEn}
                  </div>
                  <span className="font-medium">
                    {i18n.language === 'ar' ? currency.nameAr : currency.name}
                  </span>
                  {currentCurrency.code === currency.code && (
                    <Check className="ml-auto w-4 h-4 text-[#10B981]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* لمسة أخيرة: خط أسفل ناعم — نفس لون الخلفية الفاتحة */}
          <div className="h-0.5 bg-[#fdf9f7]"></div>
        </div>
      )}
    </div>
  );
};

export default LanguageCurrencySelector;