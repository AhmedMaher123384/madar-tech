// === بداية قسم: تصدير المكون ===
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../utils/toastConfig';
import { Filter, Package } from 'lucide-react';
import ProductCard from './ui/ProductCard';
import WhatsAppButton from './ui/WhatsAppButton';
import { apiCall, API_ENDPOINTS } from '../config/api';
// === نهاية قسم: تصدير المكون ===

// === بداية قسم: أنواع البيانات ===
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  categoryId?: number | null;
  subcategoryId?: number | null;
  mainImage: string;
  detailedImages?: string[];
  createdAt?: string;
}

interface Collection {
  _id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  description?: string;
  description_ar?: string;
  description_en?: string;
  image?: string;
  type: 'manual' | 'automated';
}
// === نهاية قسم: أنواع البيانات ===

// === بداية قسم: المكون الرئيسي ===
const CollectionPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { id } = useParams<{ id: string }>();

  const [products, setProducts] = useState<Product[]>(() => {
    const key = `cachedCollectionProducts_${id}`;
    const saved = localStorage.getItem(key);
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [collection, setCollection] = useState<Collection | null>(() => {
    const key = `cachedCollection_${id}`;
    const saved = localStorage.getItem(key);
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(!collection);

  // === بداية قسم: دالة مساعدة للترجمة ===
  const getLocalizedContent = (item: any, field: string): string => {
    if (!item) return '';
    const currentLang = i18n.language;
    const otherLang = currentLang === 'ar' ? 'en' : 'ar';
    const langField = `${field}_${currentLang}`;
    const otherLangField = `${field}_${otherLang}`;

    const val = item[langField];
    if (typeof val === 'string' && val.trim()) return val.trim();

    const alt = item[otherLangField];
    if (typeof alt === 'string' && alt.trim()) return alt.trim();

    const base = item[field];
    if (typeof base === 'string' && base.trim()) return base.trim();
    if (base && typeof base === 'object') {
      const cur = base[currentLang];
      if (typeof cur === 'string' && cur.trim()) return cur.trim();
      const oth = base[otherLang];
      if (typeof oth === 'string' && oth.trim()) return oth.trim();
    }
    return '';
  };
  // === نهاية قسم: دالة مساعدة للترجمة ===

  // === بداية قسم: مساعدات المطابقة عبر slug ===
  const normalizeArabic = (s: string) =>
    s
      .replace(/[\u064B-\u0652]/g, '') // إزالة التشكيل
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/ة/g, 'ه');

  const simpleSlug = (s: string) => {
    const base = normalizeArabic(String(s || '').trim());
    return base
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  };
  // === نهاية قسم: مساعدات المطابقة عبر slug ===

  // === بداية قسم: جلب البيانات ===
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchCollectionAndProducts = async () => {
      setLoading(true);
      try {
        const routeId = decodeURIComponent(id);
        const isNumeric = /^\d+$/.test(routeId);

        // 1) محاولة الجلب المباشر باستخدام قيمة المسار
        let collectionRes: any = null;
        let productsRes: any = null;
        try {
          [collectionRes, productsRes] = await Promise.all([
            apiCall(API_ENDPOINTS.COLLECTION_BY_ID(routeId)),
            apiCall(API_ENDPOINTS.COLLECTION_PRODUCTS(routeId)),
          ]);
        } catch (e) {
          // سنتعامل مع الـ fallback بالأسفل
        }

        // تنسيق الـ collection
        let col: any = collectionRes?.data || collectionRes || null;

        // تنسيق المنتجات (دعم أشكال API المختلفة)
        const parseProducts = (res: any): Product[] => {
          if (Array.isArray(res)) return res as Product[];
          if (Array.isArray(res?.products)) return res.products as Product[];
          if (Array.isArray(res?.data?.products)) return res.data.products as Product[];
          if (Array.isArray(res?.data)) return res.data as Product[];
          if (Array.isArray(res?.data?.data)) return res.data.data as Product[];
          return [];
        };
        let prods: Product[] = parseProducts(productsRes);

        const hasValidCollection = col && (col._id || col.id || col.name || col.name_ar || col.name_en);
        const productsEmpty = !Array.isArray(prods) || prods.length === 0;

        // 2) Fallback: ابحث داخل قائمة المجموعات باستخدام الـ _id أو id أو slug من الاسم
        if (!hasValidCollection || productsEmpty) {
          const listRes = await apiCall(API_ENDPOINTS.COLLECTIONS);
          const list: any[] = Array.isArray(listRes?.data) ? listRes.data : (Array.isArray(listRes) ? listRes : []);
          const found = list.find((c: any) => {
            const _idStr = c._id ? String(c._id) : '';
            const idStr = c.id ? String(c.id) : '';
            const nameAr = typeof c.name === 'string' ? c.name : (c.name_ar ?? c.name?.ar ?? '');
            const nameEn = typeof c.name === 'string' ? c.name : (c.name_en ?? c.name?.en ?? '');
            const slugAr = simpleSlug(nameAr);
            const slugEn = simpleSlug(nameEn);
            return (
              _idStr === routeId ||
              idStr === routeId ||
              slugAr === routeId ||
              slugEn === routeId ||
              (isNumeric && Number(c.id) === Number(routeId))
            );
          });
          if (found) {
            col = found;
            // حاول جلب المنتجات باستخدام المعرف المحسوم
            const resolvedId = found._id ?? found.id ?? routeId;
            try {
              const resolvedProdsRes = await apiCall(API_ENDPOINTS.COLLECTION_PRODUCTS(resolvedId));
              prods = parseProducts(resolvedProdsRes);
            } catch (e) {
              // سنعتمد على fallback للمنتجات
            }
          }
        }

        // 3) إذا لا تزال المنتجات فارغة، استخدم mock-data مع تصفية بناءً على تعريف المجموعة
        if (!Array.isArray(prods) || prods.length === 0) {
          try {
            const mockProds = await fetch('/mock-data/products.json').then((r) => (r.ok ? r.json() : []));
            if (col?.type === 'manual' && Array.isArray(col?.products)) {
              prods = Array.isArray(mockProds) ? mockProds.filter((p: any) => col.products.includes(p.id)) : [];
            } else if (col?.type === 'automated' && Array.isArray(col?.conditions)) {
              const conditions = col.conditions;
              const matchesCondition = (p: any) => {
                return conditions.every((cond: any) => {
                  const key = cond.field || cond.key;
                  const val = cond.value;
                  if (!key) return true;
                  const pv = p[key];
                  if (Array.isArray(pv)) return pv.includes(val);
                  return String(pv).toLowerCase() === String(val).toLowerCase();
                });
              };
              prods = Array.isArray(mockProds) ? mockProds.filter((p: any) => matchesCondition(p)) : [];
            } else {
              prods = Array.isArray(mockProds) ? mockProds : [];
            }
          } catch (e) {
            // تجاهل خطأ fallback
          }
        }

        setCollection(col);
        setProducts(prods);

        // تخزين مؤقت حسب قيمة المسار الحالية للحفاظ على الاتساق
        localStorage.setItem(`cachedCollection_${routeId}`, JSON.stringify(col || {}));
        localStorage.setItem(`cachedCollectionProducts_${routeId}`, JSON.stringify(Array.isArray(prods) ? prods : []));
      } catch (error) {
        console.error('Error fetching collection/products:', error);
        smartToast.frontend.error(t('loading_error') || 'فشل تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionAndProducts();
  }, [id, t]);
  // === نهاية قسم: جلب البيانات ===

  // === بداية قسم: ترتيب المنتجات ===
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'name':
      default:
        const nameA = getLocalizedContent(a as any, 'name') || '';
        const nameB = getLocalizedContent(b as any, 'name') || '';
        return nameA.localeCompare(nameB);
    }
  });
  // === نهاية قسم: ترتيب المنتجات ===

  // === بداية قسم: حالة التحميل ===
  if (loading) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center px-4 py-20">
        <div className="text-center">
 <div className="inline-block w-8 h-8 border-4 border-[#07635d] border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-[#0A2A55] mt-4">{t('loading')}</h2>
          <p className="text-gray-600 mt-2">{t('loading_collection')}</p>
        </div>
      </section>
    );
  }
  // === نهاية قسم: حالة التحميل ===

  // === بداية قسم: حالة الخطأ / عدم وجود المجموعة ===
  if (!collection || !id) {
    return (
      <section className="min-h-screen bg-white py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
 <div className="inline-block w-12 h-12 rounded-full bg-[#07635d]/10 flex items-center justify-center mb-4">
 <Package className="w-6 h-6 text-[#07635d]" />
          </div>
          <h2 className="text-xl font-bold text-[#0A2A55] mb-2">{t('error')}</h2>
          <p className="text-gray-700 mb-6">
            {t('collection_not_found') || 'المجموعة غير متوفرة'}
          </p>
          <Link
            to="/"
 className="inline-block px-6 py-3 bg-[#07635d] text-white font-medium rounded-md hover:bg-[#07635d]"
          >
            {t('back_to_home')}
          </Link>
        </div>
      </section>
    );
  }
  // === نهاية قسم: حالة الخطأ ===

  // === بداية قسم: العرض الأساسي ===
  return (
    <section className="min-h-screen bg-white py-6 sm:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* === بداية قسم: رأس المجموعة === */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0A2A55]">
            {getLocalizedContent(collection, 'name')}
          </h1>
 <div className="h-1 w-24 bg-[#07635d] rounded-full mx-auto mt-3"></div>
          {getLocalizedContent(collection, 'description') && (
            <p className="text-gray-700 mt-4 max-w-3xl mx-auto leading-relaxed">
              {getLocalizedContent(collection, 'description')}
            </p>
          )}
        </div>
        {/* === نهاية قسم: رأس المجموعة === */}

        {/* === بداية قسم: شريط الفرز (بدون عداد أو زر شكل عرض) === */}
        <div className="flex items-center gap-2 mb-8 w-full max-w-md">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
 className="w-full px-3 py-2 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#07635d] focus:border-[#07635d]"
          >
            <option value="name">{t('sort_by_name')}</option>
            <option value="price-low">{t('price_low_to_high')}</option>
            <option value="price-high">{t('price_high_to_low')}</option>
          </select>
        </div>
        {/* === نهاية قسم: شريط الفرز === */}

        {/* === بداية قسم: عرض المنتجات === */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {sortedProducts.map((product) => (
              <div key={product.id} className="w-full">
                <ProductCard product={product} viewMode="grid" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-gray-50 rounded-lg">
            <div className="inline-block w-12 h-12 rounded-full bg-[#07635d]/10 flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-[#07635d]" />
            </div>
            <h3 className="text-xl font-bold text-[#0A2A55] mb-2">{t('no_products_in_collection')}</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {t('products_coming_soon')}
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#07635d] text-white font-medium rounded-md hover:bg-[#07635d]"
            >
              {t('back_to_home')}
            </Link>
          </div>
        )}
        {/* === نهاية قسم: عرض المنتجات === */}

        {/* === بداية قسم: زر الواتساب (ثابت) === */}
        <div className="fixed bottom-4 right-4 z-40">
          <WhatsAppButton />
        </div>
        {/* === نهاية قسم: زر الواتساب === */}
        
      </div>
    </section>
  );
  // === نهاية قسم: العرض الأساسي ===
};
// === نهاية قسم: المكون الرئيسي ===

export default CollectionPage;
// === نهاية الملف ===