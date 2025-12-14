import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUp, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logo from "../../assets/logo.png";
import tabby from "../../assets/tabby.png";

// اللون الأساسي — بطل التصميم
const PRIMARY = '#07635d';
const PRIMARY_DARK = '#c18c78';

const GlobalFooter: React.FC = () => {
  const { t } = useTranslation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // الروابط المهمة
  const importantLinks = [
    { to: "/privacy-policy", label: t('footer.privacy_policy', { defaultValue: 'سياسة الخصوصية' }) },
    { to: "/terms-and-conditions", label: t('footer.terms_conditions', { defaultValue: 'الشروط والأحكام' }) },
    { to: "/return-policy", label: t('footer.exchange_return', { defaultValue: 'الاستبدال والاسترجاع' }) },
    { to: "/products", label: t('footer.products', { defaultValue: 'المنتجات' }) },
  ];

  // معلومات الاتصال
  const contactInfo = [
    { icon: Phone, label: "590073905", href: "tel:590073905" },
    { icon: Mail, label: "info@madartech.com", href: "mailto:info@madartech.com" },
    { icon: MapPin, label: "الرياض، المملكة العربية السعودية", href: "#" },
  ];

  return (
    <>
      {/* === Footer — تدرج #07635d، صور الدفع رجعت، نسق نظيف === */}
      <footer 
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* --- الشعار --- */}
            <div className="md:col-span-2 lg:col-span-1">
              <Link to="/" className="inline-block mb-4">
                <img src={logo} alt="Logo" className="h-20 w-auto object-contain" />
              </Link>
              <p className="text-white/85 text-sm max-w-xs leading-relaxed">
                {t('footer.company_description_short', {
                  defaultValue: 'تقنية تحبها، وأسعار تعجبك.متجرك الشامل للموبايلات، التابلتس، والسماعات. عروض حصرية، منتجات أصلية،شحن سريع، جودة ممتازة، وتجربة سهلة'
                })}
              </p>
            </div>

            {/* --- الروابط المهمة --- */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">روابط مهمة</h4>
              <ul className="space-y-2">
                {importantLinks.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.to}
                      className="inline-block text-white/75 hover:text-white text-sm transition-colors"
                    >
                      • {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* --- الاتصال --- */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">اتصل بنا</h4>
              <ul className="space-y-3">
                {contactInfo.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="mt-0.5 text-white/60">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                      </div>
                      <a
                        href={item.href}
                        className="text-white/80 hover:text-white text-sm transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* --- طرق الدفع — الصور رجعت زي ما طلبت === */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">طرق الدفع</h4>
              <div className="flex flex-wrap items-center gap-2.5">
                {[
                  { name: 'Visa', src: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' },
                  { name: 'Mastercard', src: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg' },
                  { name: 'Apple Pay', src: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg' },
                  { name: 'Mada', src: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Mada_Logo.svg' },
                  { name: 'Tamara', src: 'https://cdn.prod.website-files.com/67c184892f7a84b971ff49d9/68931b49f2808979578bdc64_tamara-text-logo-black-en.svg' },
                  { name: 'Tabby', src: tabby },
                ].map((method, i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 px-2.5 py-1.5 h-10 flex items-center justify-center min-w-[60px]"
                  >
                    <img
                      src={method.src}
                      alt={method.name}
                      className={(method.name === 'Tabby') ? 'h-6 w-auto object-contain' : 'h-4 w-auto object-contain'}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* --- حقوق النشر — نظيف، من غير "AfterAds" في الوصف === */}
          <div className="border-t border-white/15 mt-8 pt-6 text-center">
            <p className="text-white/60 text-sm">
              &copy; {new Date().getFullYear()} جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>

      {/* === زر التمرير — بسيط، بلون #07635d === */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`
            fixed bottom-6 left-6 w-11 h-11
            bg-white/90 backdrop-blur-sm
            text-${PRIMARY_DARK}
            rounded-full
            flex items-center justify-center
            shadow-lg
            z-50
            transition-all duration-300
            hover:bg-white
          `}
          aria-label="العودة للأعلى"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default GlobalFooter;