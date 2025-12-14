import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import heroImage from '../../assets/hero.png';
import ArabicCollectionList from '../collections/ArabicCollectionList';
import { Link } from 'react-router-dom';
import { createCategorySlug } from '../../utils/slugify';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../config/api';
import { getCategoryImage } from '../../assets/categoryImages';
import CategoryProductsPreview from '../categories/CategoryProductsPreview';
import whiteImage from '../../assets/white.png';
import watchImage from '../../assets/watch.jpg';
import airImage from '../../assets/air.jpg';

interface Category {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  image?: string;
}

const AboutUsSection: React.FC = () => {
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('cachedCategories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [imageRatios, setImageRatios] = useState<Record<number, string>>({});
  const whiteImgRef = useRef<HTMLImageElement | null>(null);
  const [whiteDisplayHeight, setWhiteDisplayHeight] = useState<number>(0);
  const updateWhiteHeight = () => {
    if (whiteImgRef.current) {
      setWhiteDisplayHeight(whiteImgRef.current.clientHeight);
    }
  };
  useEffect(() => {
    const handler = () => updateWhiteHeight();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const getCategoryName = (category: Category) => {
    const lang = i18n.language;
    if (lang === 'ar') {
      return category.name_ar || category.name_en || category.name || '';
    }
    return category.name_en || category.name_ar || category.name || '';
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiCall(API_ENDPOINTS.CATEGORIES);
        const list = Array.isArray(data) ? data : data?.data || [];
        setCategories(list);
        try {
          localStorage.setItem('cachedCategories', JSON.stringify(list));
        } catch {}
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    if (!categories || categories.length === 0) fetchCategories();
  }, []);

  // Filter out "Themes"
  const filteredCategories = categories.filter((cat) => {
    const name = getCategoryName(cat).toLowerCase();
    return name !== 'ثيمات' && name !== 'themes';
  });

  // روابط الصور الترويجية أسفل الكروت
  const whiteFridayCollectionLink = '/collection/5002';
  const smartWatchesSlug = createCategorySlug(1500, 'smart watches');
  const airpodsSlug = createCategorySlug(1300, 'airpods');

  return (
    <section className="bg-white py-10 md:py-14">
      <style>{`
        /* تدرجات ألوان فريدة */
        .category-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #07635d1a 0%, #07635d0d 100%);
          z-index: 0;
          opacity: 0;
          transition: opacity 0.35s ease;
        }
        .category-card:hover::before {
          opacity: 0.15;
        }

        /* تأثير الزجاج المُطفأ (frosted glass) */
        .category-label {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(89, 42, 38, 0.15);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        /* تأثير حديث للصورة */
        .card-image {
          will-change: transform, filter;
          transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1), 
                      filter 300ms ease;
        }
        .category-card:hover .card-image {
          transform: scale(1.04);
          filter: saturate(1.05) contrast(1.02);
        }

        /* تأثير الرفع العصري (Modern soft lift) */
        .category-card {
          transform-style: preserve-3d;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), 
                      box-shadow 0.35s ease,
                      border-color 0.35s ease;
        }
        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 28px -12px rgba(7, 99, 93, 0.18);
          border-color: rgba(7, 99, 93, 0.35);
        }

        /* تأثير الدخول الانسيابي عند التمرير */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease forwards;
          opacity: 0;
        }
        .animate-delay-1 { animation-delay: 0.1s; }
        .animate-delay-2 { animation-delay: 0.18s; }
        .animate-delay-3 { animation-delay: 0.26s; }
        .animate-delay-4 { animation-delay: 0.34s; }
        .animate-delay-5 { animation-delay: 0.42s; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ======== التصنيفات أولًا (مُعاد تصميمها بشكل عبقري) ======== */}
        <div className="mb-16" ref={containerRef}>
         

          {/* شبكة التصنيفات المبتكرة */}
          <div 
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 gap-4 md:gap-6"
            aria-label="تصنيفات المنتجات"
          >
            {filteredCategories.map((category, idx) => {
              const name = getCategoryName(category);
              const to = `/category/${createCategorySlug(category.id, name)}`;
              const imageUrl = buildImageUrl(getCategoryImage(Number(category.id)) || category.image || '');

              return (
                <div key={category.id} className="group">
                  <Link
                    to={to}
                    className="category-card group block rounded-2xl overflow-hidden border border-transparent hover:border-[#07635d]/20 bg-white shadow-sm relative"
                    aria-label={`تصفح ${name}`}
                    style={{ aspectRatio: imageRatios[category.id] || '1 / 1' }}
                  >
                  {/* صورة التصنيف: عرض إبداعي بقناع ديناميكي */}
                  <div className="absolute inset-0">
                    {imageUrl ? (
                      <div className="w-full h-full overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={name}
                          className="card-image w-full h-full object-contain object-center"
                          loading="lazy"
                          onLoad={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            const w = img.naturalWidth || 1;
                            const h = img.naturalHeight || 1;
                            setImageRatios((prev) => ({ ...prev, [category.id]: `${w} / ${h}` }));
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) parent.style.backgroundColor = '#f8f5f3';
                          }}
                        />
                      </div>
                    ) : (
                      <div 
                        className="w-full h-full bg-gradient-to-br from-[#f8f5f3] to-[#e9e1db] flex items-center justify-center"
                        style={{ 
                          boxShadow: 'inset 0 0 0 1px rgba(89, 42, 38, 0.05)' 
                        }}
                      >
                        <span className="text-[#07635d]/30 font-medium text-lg">
                          {name}
                        </span>
                      </div>
                    )}

                    {/* زاوية فنية (ornamental touch) */}
                    <div 
                      className="absolute top-4 right-4 w-8 h-8 rounded-full"
                      style={{
                        background: 'radial-gradient(circle, #07635d 30%, transparent 70%)',
                        opacity: 0.4,
                      }}
                    />
                  </div>
                  </Link>
                  {/* التسمية أسفل الكارت */}
                  <div className="mt-3 text-center">
                    <Link
                      to={to}
                      className="inline-block category-label px-5 py-2.5 rounded-full font-bold text-[#07635d] text-sm md:text-base whitespace-nowrap"
                      aria-label={`تصفح ${name}`}
                    >
                      {name}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======== صور ترويجية — صورة white يسار، ويمين صورتان فوق بعض ======== */}
        <div className="mt-8 md:mt-12 mb-12">
          <div className="sm:grid sm:grid-cols-2 gap-5 md:gap-8">
            {/* يسار: صورة White كما هي */}
            <Link
              to={whiteFridayCollectionLink}
              aria-label={isArabic ? 'تصفح مجموعة الجمعة البيضاء' : 'Browse White Friday Collection'}
              className="block group"
            >
              <img
                ref={whiteImgRef}
                src={whiteImage}
                alt={isArabic ? 'الجمعة البيضاء' : 'White Friday'}
                className="w-full h-auto rounded-2xl shadow-sm transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:shadow-lg group-hover:brightness-105"
                loading="lazy"
                decoding="async"
                onLoad={updateWhiteHeight}
              />
            </Link>

            {/* يمين: صورتان فوق بعض ومجموع ارتفاعهما = ارتفاع white */}
            <div
              className="grid grid-rows-2 gap-px"
              style={{ height: whiteDisplayHeight ? Math.round(whiteDisplayHeight) : undefined }}
            >
              <Link
                to={`/category/${smartWatchesSlug}`}
                aria-label={isArabic ? 'تصفح فئة الساعات الذكية' : 'Browse Smart Watches Category'}
                className="block group"
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white shadow-sm">
                  <img
                    src={watchImage}
                    alt={isArabic ? 'الساعات الذكية' : 'Smart Watches'}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-105"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </Link>

              <Link
                to={`/category/${airpodsSlug}`}
                aria-label={isArabic ? 'تصفح فئة الايربودز' : 'Browse AirPods Category'}
                className="block group"
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white shadow-sm">
                  <img
                    src={airImage}
                    alt={isArabic ? 'الايربودز' : 'AirPods'}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-105"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ======== باقي المحتوى (منقّح ليتماشى مع الإيقاع الجديد) ======== */}
        
        {/* آخر العروض */}
        <div className="mb-12 md:mb-14 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black">{isArabic ? 'آخر العروض' : 'Latest Offers'}</h2>
              <div className="h-1 w-20 bg-[#07635d] rounded-full mt-2"></div>
            </div>
          </div>
          <ArabicCollectionList arabicName="آخر العروض" limit={5} className="mb-10" />
        </div>

        {/* الجمعة البيضاء */}
        <div className="mb-10 md:mb-12 animate-fade-in-up animate-delay-1">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black">{isArabic ? 'أحدث المنتجات' : 'Latest Products'}</h2>
              <div className="h-1 w-20 bg-[#07635d] rounded-full mt-2"></div>
            </div>
          </div>
          <ArabicCollectionList arabicName="أحدث المنتجات" limit={5} className="mb-10" />
        </div>

        {/* مجموعة الجمعة البيضاء */}
        <div className="mb-10 md:mb-12 animate-fade-in-up animate-delay-2">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black">{isArabic ? 'الجمعة البيضاء' : 'White Friday'}</h2>
              <div className="h-1 w-20 bg-[#07635d] rounded-full mt-2"></div>
            </div>
          </div>
          <ArabicCollectionList arabicName="الجمعة البيضاء" limit={5} className="mb-10" />
        </div>

        {/* صورة الهيرو — الآن بتأثير مُحسّن */}
        <div className="mt-10 mb-12 animate-fade-in-up animate-delay-2">
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            <img 
              src={heroImage} 
              alt="عرض خاص" 
              className="w-full h-auto block"
            />
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
            />
          </div>
        </div>

        {/* منتجات حسب التصنيف — الآن بتنسيق مُنظّف وأنيق */}
        <div className="space-y-10">
          {filteredCategories.map((category, idx) => {
            const name = getCategoryName(category);
            const to = `/category/${createCategorySlug(category.id, name)}`;
            return (
              <div 
                key={category.id} 
                className={`animate-fade-in-up animate-delay-${(idx % 5) + 1}`}
              >
                <div className="flex items-end justify-between mb-4">
                  <h3 className="text-xl md:text-2xl font-extrabold text-black">{name}</h3>
                  <Link 
                    to={to} 
                    className="text-[#07635d] font-medium text-sm md:text-base hover:text-[#07635d] transition-colors"
                  >
                    {i18n.language === 'ar' ? 'عرض الكل' : 'explore more'}
                  </Link>
                </div>
                <CategoryProductsPreview categoryId={category.id} limit={5} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;