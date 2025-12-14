import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Layers, ListTree, FolderOpen } from 'lucide-react';
import { createCategorySlug } from '../../utils/slugify';
import { apiCall, API_ENDPOINTS } from '../../config/api';

interface Category {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description?: string;
  image?: string;
  parentId?: number | null;
}

interface Subcategory extends Category {
  parentId: number;
}

interface Collection {
  _id: string;
  name: string | { ar?: string; en?: string };
  name_ar?: string;
  name_en?: string;
  description?: string;
  featured?: boolean;
  isActive?: boolean;
}

type Variant = 'default' | 'navbar';

interface Props {
  variant?: Variant;
}

const CategoryCollectionBar: React.FC<Props> = ({ variant = 'default' }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('bar_cached_categories');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [subcategories, setSubcategories] = useState<Subcategory[]>(() => {
    const saved = localStorage.getItem('bar_cached_subcategories');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [collections, setCollections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('bar_cached_collections');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);

  const closeMenuTimerRef = useRef<number | null>(null);
  const cancelClose = () => {
    if (closeMenuTimerRef.current !== null) {
      clearTimeout(closeMenuTimerRef.current);
      closeMenuTimerRef.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeMenuTimerRef.current = window.setTimeout(() => {
      setOpenCategoryId(null);
      closeMenuTimerRef.current = null;
    }, 200); // زدنا الوقت شوية علشان التفاعل أنعم
  };

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (openCategoryId === null) return;
      const target = e.target as HTMLElement | null;
      const rootEl = target?.closest('[data-submenu-root-id]') as HTMLElement | null;
      const rootIdStr = rootEl?.getAttribute('data-submenu-root-id');
      if (!rootIdStr || Number(rootIdStr) !== openCategoryId) {
        setOpenCategoryId(null);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenCategoryId(null);
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keyup', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keyup', handleEsc);
    };
  }, [openCategoryId]);

  const getLocalized = (item: any, field: string) => {
    const lang = i18n.language === 'ar' ? 'ar' : 'en';
    const other = lang === 'ar' ? 'en' : 'ar';

    const langField = `${field}_${lang}`;
    const otherField = `${field}_${other}`;
    const langValue = item?.[langField];
    const otherValue = item?.[otherField];
    if (typeof langValue === 'string' && langValue.trim()) return langValue;
    if (typeof otherValue === 'string' && otherValue.trim()) return otherValue;

    const base = item?.[field];
    if (typeof base === 'string' && base.trim()) return base;
    if (base && typeof base === 'object') {
      const objLang = base?.[lang];
      const objOther = base?.[other];
      if (typeof objLang === 'string' && objLang.trim()) return objLang;
      if (typeof objOther === 'string' && objOther.trim()) return objOther;
      const first = Object.values(base).find(v => typeof v === 'string' && v.trim());
      if (typeof first === 'string') return first;
    }
    return '';
  };

  const themesFilter = (c: Category) => {
    const name = (getLocalized(c, 'name') || '').toLowerCase();
    return !(name === 'ثيمات' || name === 'themes');
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [catsRes, colsRes] = await Promise.all([
          apiCall(API_ENDPOINTS.CATEGORIES),
          apiCall(API_ENDPOINTS.COLLECTIONS),
        ]);

        const cats: Category[] = Array.isArray((catsRes as any)?.data)
          ? (catsRes as any).data
          : Array.isArray(catsRes)
            ? (catsRes as any)
            : [];
        const subs: Subcategory[] = cats.filter((c: any) => c && c.parentId != null) as Subcategory[];

        const cols: Collection[] = Array.isArray((colsRes as any)?.data)
          ? (colsRes as any).data
          : Array.isArray(colsRes)
            ? (colsRes as any)
            : [];

        let mainCats = cats.filter((c) => (c.parentId === null || c.parentId === undefined)).filter(themesFilter);
        if (mainCats.length === 0 && cats.length > 0) {
          mainCats = cats.filter(themesFilter);
        }
        setCategories(mainCats);
        setSubcategories(subs);
        setCollections(cols);

        localStorage.setItem('bar_cached_categories', JSON.stringify(mainCats));
        localStorage.setItem('bar_cached_subcategories', JSON.stringify(subs));
        localStorage.setItem('bar_cached_collections', JSON.stringify(cols));
      } catch (error) {
        console.error('Error loading bar data:', error);
      }
    };

    fetchAll();
  }, []);

  const subByParent = useMemo(() => {
    const map: Record<number, Subcategory[]> = {};
    for (const sub of subcategories) {
      if (!map[sub.parentId]) map[sub.parentId] = [];
      map[sub.parentId].push(sub);
    }
    return map;
  }, [subcategories]);

  const handleCategoryClick = (cat: Category) => {
    const slug = createCategorySlug(
      cat.id,
      getLocalized(cat, 'name') || String(cat.name || '')
    );
    navigate(`/category/${slug}`);
  };

  const handleSubcategoryClick = (sub: Subcategory) => {
    setOpenCategoryId(null);
    const slug = createCategorySlug(
      sub.id,
      getLocalized(sub, 'name') || String(sub.name || '')
    );
    navigate(`/subcategory/${slug}`);
  };

  const handleCollectionClick = (col: Collection) => {
    navigate(`/collection/${col._id}`);
  };

  // ✅-navbar variant — النسخة المُحسَّنة "تحفه"
  if (variant === 'navbar') {
    return (
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="w-full bg-white text-gray-800 border-t border-[#07635d]/20 border-b border-gray-100 shadow-sm"
      >
        <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-0.5 py-1.5 px-2">
          {[
            ...categories.map((cat) => ({ type: 'category' as const, cat })),
            ...collections.map((col) => ({ type: 'collection' as const, col })),
          ].map((item, idx) => {
            if (item.type === 'category') {
              const cat = item.cat;
              const hasSubs = Array.isArray(subByParent[cat.id]) && subByParent[cat.id].length > 0;
              return (
                <div
                  key={`cat-${cat.id}`}
                  className="relative group"
                  data-submenu-root-id={cat.id}
                  onMouseEnter={() => { if (hasSubs) { cancelClose(); setOpenCategoryId(cat.id); } }}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className={`
                      relative px-3 py-1.5 text-sm font-medium
                      text-gray-700 hover:text-gray-900
                      rounded-xl
                      transition-all duration-300
                      bg-gradient-to-b from-white to-white/80
                      hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]
                      border border-transparent hover:border-gray-200/50
                    `}
                  >
                    <span className="relative z-10 whitespace-nowrap">{getLocalized(cat, 'name')}</span>
                    {hasSubs && (
                      <ChevronDown
                        className={`w-4 h-4 ml-1 inline-block align-middle transition-transform duration-300 ${
                          openCategoryId === cat.id ? 'rotate-180 text-gray-900' : 'text-gray-500'
                        }`}
                      />
                    )}
                  </button>

                  {hasSubs && openCategoryId === cat.id && (
                    <div
                      onMouseEnter={cancelClose}
                      onMouseLeave={scheduleClose}
                      className={`
                        absolute mt-2 min-w-[240px]
                        bg-white rounded-2xl
                        border border-gray-100/80
                        shadow-xl
                        backdrop-blur-sm
                        p-2 z-[70]
                        transition-all duration-300 ease-out
                        opacity-0 translate-y-1
                        ${openCategoryId === cat.id ? 'opacity-100 translate-y-0' : ''}
                      `}
                      style={{ [isRTL ? 'right' : 'left']: '50%', transform: isRTL ? 'translateX(50%)' : 'translateX(-50%)' }}
                    >
                      <div className="px-3 py-2 text-gray-600 text-xs font-medium flex items-center gap-2 bg-gray-50/50 rounded-xl mb-1.5">
                        <ListTree className="w-3.5 h-3.5 text-[#07635d]" />
                        <span>{t('subcategories') || 'Subcategories'}</span>
                      </div>
                      <div className="space-y-0.5">
                        {subByParent[cat.id].map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSubcategoryClick(sub)}
                            className={`
                              w-full text-left px-3 py-2 text-sm text-gray-700
                              rounded-xl
                              transition-all duration-200
                              hover:bg-[#07635d]/10 hover:text-gray-900
                            `}
                          >
                            {getLocalized(sub, 'name')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Collection item — ✅ محسّن
            const col = item.col;
            return (
              <button
                key={`col-${col._id}`}
                onClick={() => handleCollectionClick(col)}
                className={`
                  relative px-3 py-1.5 text-sm font-medium
                  text-gray-700 hover:text-gray-900
                  rounded-xl
                  transition-all duration-300
                  bg-gradient-to-b from-white to-white/80
                  hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]
                  border border-transparent hover:border-gray-200/50
                  flex items-center gap-1.5
                `}
                title={getLocalized(col, 'description') || ''}
              >
                <span className="whitespace-nowrap">{getLocalized(col, 'name')}</span>
                {col.featured && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#07635d]/15 text-[#07635d]">
                    {t('featured') || 'Featured'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default variant — محسّن كمان (لكن لو مش مستخدمه، ممكن تحذفه)
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="w-full z-40">
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-white/90 mb-1.5">
                <Layers className="w-4 h-4 text-[#18b5d8]" />
                <span className="text-sm font-semibold">{t('categories')}</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {categories.map((cat) => {
                  const hasSubs = Array.isArray(subByParent[cat.id]) && subByParent[cat.id].length > 0;
                  return (
                    <div
                      key={cat.id}
                      className="relative"
                      data-submenu-root-id={cat.id}
                      onMouseEnter={() => { if (hasSubs) { cancelClose(); setOpenCategoryId(cat.id); } }}
                      onMouseLeave={scheduleClose}
                    >
                      <button
                        onClick={() => handleCategoryClick(cat)}
                        className="group inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all"
                      >
                        <span className="font-medium">{getLocalized(cat, 'name')}</span>
                        {hasSubs && (
                          <ChevronDown className={`w-4 h-4 transition-transform ${openCategoryId === cat.id ? 'rotate-180' : ''}`} />
                        )}
                      </button>

                      {hasSubs && openCategoryId === cat.id && (
                        <div
                          onMouseEnter={cancelClose}
                          onMouseLeave={scheduleClose}
                          className="absolute mt-2 min-w-[240px] bg-[#0f172a]/95 text-white rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm p-3"
                          style={{ [isRTL ? 'right' : 'left']: 0 }}
                        >
                          <div className="flex items-center gap-2 px-3 py-2 text-white/80 text-xs font-medium bg-white/5 rounded-xl mb-2">
                            <ListTree className="w-4 h-4" />
                            <span>{t('subcategories') || 'Subcategories'}</span>
                          </div>
                          <div className="space-y-1">
                            {subByParent[cat.id].map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => handleSubcategoryClick(sub)}
                                className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-xl text-sm"
                              >
                                {getLocalized(sub, 'name')}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-6 w-px bg-white/10 hidden md:block" />

            <div className="flex-1 hidden md:block">
              <div className="flex items-center gap-2 text-white/90 mb-1.5">
                <FolderOpen className="w-4 h-4 text-[#0891b2]" />
                <span className="text-sm font-semibold">{t('collections')}</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {collections.map((col) => (
                  <button
                    key={col._id}
                    onClick={() => handleCollectionClick(col)}
                    className="group inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all"
                    title={getLocalized(col, 'description') || ''}
                  >
                    <span className="font-medium">{getLocalized(col, 'name')}</span>
                    {col.featured && <span className="text-xs px-2 py-1 rounded bg-[#18b5d8]/20 text-[#18b5d8]">{t('featured') || 'Featured'}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCollectionBar;