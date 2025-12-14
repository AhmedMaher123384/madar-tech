// === بداية قسم: التصدير ===
import React, { useState } from 'react';
import { Plus, Minus, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// === الأنواع (كما هي، بدون تغيير) ===
interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: number;
  title: string;
  // ✅ icon removed — no icons used anywhere
  faqs: FAQ[];
}

// === المكون: FAQSection — v2 — Ultra-Elegant Vertical Layout ===
const FAQSection: React.FC = () => {
  const { t } = useTranslation();

  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleCategory = (id: number) => {
    setOpenCategory(openCategory === id ? null : id);
    if (openCategory !== id) setOpenFAQ(null);
  };

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  // ✅ البيانات كما هي — فقط حُذفت حقول `icon`
  const faqCategories: FAQCategory[] = [
    {
      id: 1,
      title: 'الأجهزة والهواتف والشحن',
      faqs: [
        {
          id: 1,
          question: 'هل الأجهزة أصلية وتدعم ضمان؟',
          answer: 'نعم، جميع الهواتف والأجهزة أصلية بمصدر موثوق وتأتي بضمان معتمد. تُرفق الفاتورة مع كل طلب ويمكن تفعيل الضمان عبر مراكز الخدمة المعتمدة.',
        },
        {
          id: 2,
          question: 'هل الشواحن تدعم الشحن السريع؟',
          answer: 'نوفر شواحن تدعم تقنيات الشحن السريع مثل PD وQC. تحقق من مواصفات المنتج لمعرفة القدرة (W) والتوافق مع هاتفك.',
        },
        {
          id: 3,
          question: 'كيف أتأكد أن الشاحن مناسب لجهازي؟',
          answer: 'تحقق من نوع المنفذ (USB‑C/Lightning) وقدرة الشحن المطلوبة لجهازك. يمكنك سؤال فريق الدعم أو استخدام فلتر التوافق في صفحة المنتج.',
        },
        {
          id: 4,
          question: 'هل البطاريات والملحقات آمنة؟',
          answer: 'المنتجات مطابقة لمعايير السلامة CE/FCC. ننصح باستخدام الشاحن الأصلي وتجنب التعرض للحرارة العالية أو الرطوبة.',
        },
      ],
    },
    {
      id: 2,
      title: 'الطلبات والتوصيل والتتبع',
      faqs: [
        {
          id: 5,
          question: 'كم مدة التوصيل داخل المملكة؟',
          answer: 'داخل المدن الرئيسية عادة 1–3 أيام عمل، وخارجها 3–7 أيام. تتغير المدة بحسب شركة الشحن والوجهة.',
        },
        {
          id: 6,
          question: 'هل يتوفر شحن في نفس اليوم؟',
          answer: 'متاح في بعض المدن برسوم إضافية. تظهر الخيارات المتاحة عند إنهاء الدفع.',
        },
        {
          id: 7,
          question: 'كيف أتتبع الشحنة؟',
          answer: 'نرسل رقم تتبع فور الشحن عبر البريد/واتساب ويمكنك متابعته من حسابك.',
        },
        {
          id: 8,
          question: 'ما تكلفة الشحن؟',
          answer: 'تُحسب تلقائياً حسب العنوان والوزن/القيمة. قد تتوفر عروض شحن مجاني عند تجاوز حد معين.',
        },
      ],
    },
    {
      id: 3,
      title: 'الضمان والصيانة',
      faqs: [
        {
          id: 9,
          question: 'كم مدة الضمان؟',
          answer: 'الهواتف: حتى 12 شهر حسب الموديل والمورّد. الشواحن والملحقات: حتى 6 أشهر.',
        },
        {
          id: 10,
          question: 'ماذا يغطي الضمان؟',
          answer: 'يغطّي عيوب الصناعة فقط. لا يشمل سوء الاستخدام أو التلف الناتج عن السوائل أو الكسر.',
        },
        {
          id: 11,
          question: 'كيف أطلب صيانة؟',
          answer: 'تواصل معنا بمعلومات الطلب والمنتج، وسنوجهك لأقرب مركز خدمة معتمد.',
        },
        {
          id: 12,
          question: 'استلام جهاز معيب (DOA)؟',
          answer: 'في حال تعطل كامل خلال 48 ساعة من الاستلام، نساعد في استبدال فوري بعد التأكد من الحالة.',
        },
      ],
    },
    {
      id: 4,
      title: 'الاستبدال والاسترجاع',
      faqs: [
        {
          id: 13,
          question: 'هل يمكن إرجاع الهواتف؟',
          answer: 'نقبل الإرجاع خلال 14 يوم للأجهزة غير المفتوحة وبحالتها الأصلية مع الفاتورة. الأجهزة المفتوحة تخضع لسياسة المصنع/الضمان.',
        },
        {
          id: 14,
          question: 'هل يمكن استبدال أو إرجاع الشواحن والملحقات؟',
          answer: 'خلال 7 أيام إذا كانت غير مستعملة وبكامل التغليف الأصلي.',
        },
        {
          id: 15,
          question: 'وصلني منتج خاطئ أو تالف، ماذا أفعل؟',
          answer: 'أبلغنا خلال 48 ساعة مع صور، وسنرتّب الاستبدال أو الاسترجاع حسب الحالة.',
        },
        {
          id: 16,
          question: 'كم يستغرق استرداد المبلغ؟',
          answer: 'يتم الاسترداد خلال 3–7 أيام عمل عبر نفس وسيلة الدفع المستخدمة.',
        },
      ],
    },
    {
      id: 5,
      title: 'الدفع والتقسيط',
      faqs: [
        {
          id: 17,
          question: 'ما طرق الدفع المتاحة؟',
          answer: 'بطاقات بنكية، Apple Pay، مدى، تحويل بنكي، وقد يتوفر الدفع عند الاستلام في بعض المناطق.',
        },
        {
          id: 18,
          question: 'هل يتوفر تقسيط؟',
          answer: 'متاح عبر شركائنا مثل تمارا وتابي وفق الشروط. اختر خيار التقسيط أثناء الدفع.',
        },
        {
          id: 19,
          question: 'هل أستلم فاتورة ضريبية؟',
          answer: 'نعم، تصدر إلكترونياً وتُرفق مع الطلب ويمكن تحميلها من حسابك.',
        },
      ],
    },
  ];

  return (
    <section 
      className="py-16 sm:py-20 bg-gradient-to-b from-white to-[#fff9f7] relative overflow-hidden"
      data-section="faq"
      aria-labelledby="faq-heading"
    >
      {/* ✨ عنصر زخرفي خفيف — خط ناعم عمودي يُوحّد التسلسل */}
      <div 
        className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#07635d]/20 to-transparent transform -translate-x-1/2 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        
        {/* === العنوان الرئيسي — فاخر، بتركيز بصري على اللون #07635d === */}
        <div className="text-center mb-16 relative">
          <h2 
            id="faq-heading"
            className="text-3xl sm:text-4xl font-light tracking-tight text-[#0A2A55]"
          >
            {t('home.faq.frequent_questions', { defaultValue: 'الأسئلة الشائعة' })}
          </h2>
          <div className="mt-5 w-24 h-0.5 mx-auto bg-[#07635d] rounded-full"></div>
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            {t('home.faq.subtitle', {
              defaultValue: 'إجابات عن الأجهزة، الشحن، الضمان، والدفع',
            })}
          </p>
        </div>

        {/* === القائمة العمودية الرتيبة — بدون شبكات، بدون أيقونات، فقط أناقة === */}
        <div className="space-y-10">
          {faqCategories.map((category) => (
            <div 
              key={category.id} 
              className="relative group"
            >
              {/* --- خط الاتصال الرأسي (جزئي، فقط عند الفئة المفتوحة أو المجاورة) --- */}
              {openCategory === category.id && (
                <div 
                  className="absolute left-0 top-0 w-0.5 h-full bg-[#07635d] rounded-full opacity-50"
                  aria-hidden="true"
                />
              )}

              {/* --- رأس الفئة — نحيف، أنيق، مع إشارة بصرية لطيفة عند التمرير/Focus --- */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full text-left py-4 px-6 rounded-xl transition-all duration-400
                  ${openCategory === category.id 
                    ? 'bg-white border border-[#07635d]/20 shadow-sm' 
                    : 'bg-transparent hover:bg-[#fdf8f6]'}
                  focus:outline-none focus:ring-2 focus:ring-[#07635d]/30`}
                aria-expanded={openCategory === category.id}
                aria-controls={`faq-category-${category.id}`}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className={`text-lg font-medium tracking-wide transition-colors duration-300
                      ${openCategory === category.id 
                        ? 'text-[#0A2A55]' 
                        : 'text-gray-800 group-hover:text-[#0A2A55]'}`}
                  >
                    {category.title}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#07635d] transform transition-transform duration-300
                      ${openCategory === category.id ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {/* --- محتوى الفئة (الأسئلة) — يظهر بسلاسة عند الفتح --- */}
              {openCategory === category.id && (
                <div 
                  id={`faq-category-${category.id}`}
                  className="mt-4 pl-6 border-l-2 border-[#07635d]/20 space-y-5"
                  aria-live="polite"
                >
                  {category.faqs.map((faq) => (
                    <div 
                      key={faq.id}
                      className={`transition-all duration-400 ${
                        openFAQ === faq.id ? 'opacity-100' : 'opacity-95'
                      }`}
                    >
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className={`w-full text-left py-3 px-5 rounded-lg flex justify-between items-start
                          transition-colors duration-300
                          ${openFAQ === faq.id 
                            ? 'bg-[#fdf8f6] shadow-sm' 
                            : 'hover:bg-[#fefcfa]'}`}
                        aria-expanded={openFAQ === faq.id}
                        aria-controls={`faq-answer-${faq.id}`}
                      >
                        <span 
                          className={`text-base font-normal text-gray-800 leading-relaxed
                            ${openFAQ === faq.id 
                              ? 'font-medium text-[#0A2A55]' 
                              : 'group-hover:text-gray-900'}`}
                        >
                          {faq.question}
                        </span>
                        <span className="ml-3 flex-shrink-0">
                          {openFAQ === faq.id ? (
                            <Minus className="w-4 h-4 text-[#07635d]" />
                          ) : (
                            <Plus className="w-4 h-4 text-[#07635d]" />
                          )}
                        </span>
                      </button>

                      {openFAQ === faq.id && (
                        <div
                          id={`faq-answer-${faq.id}`}
                          className="mt-3 ml-10 pr-2"
                          role="region"
                        >
                          <p className="text-gray-600 leading-relaxed font-light text-sm sm:text-base">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ✨ لمسة نهائية: زخرفة خفيفة في الأسفل — لتعزيز الطابع الراقي */}
        <div 
          className="mt-20 text-center opacity-10"
          aria-hidden="true"
        >
          <div className="w-20 h-px bg-[#07635d] mx-auto"></div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;