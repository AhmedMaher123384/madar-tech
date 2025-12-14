import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../../utils/toastConfig';
import { Heart, ShoppingCart, CheckCircle } from 'lucide-react';
import { createProductSlug } from '../../utils/slugify';
import { addToCartUnified, addToWishlistUnified, removeFromWishlistUnified } from '../../utils/cartUtils';
import { buildImageUrl } from '../../config/api';
import { PRODUCT_PLACEHOLDER_SRC } from '../../utils/placeholders';
import PriceDisplay from '../ui/PriceDisplay';

interface Product {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  price: number;
  originalPrice?: number;
  isAvailable: boolean;
  categoryId?: number | null;
  subcategoryId?: number | null;
  mainImage: string;
  detailedImages?: string[];
  createdAt?: string;
  hasRequiredOptions?: boolean;
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { t, i18n } = useTranslation(['product_card', 'product', 'common']);
  const isRTL = i18n.language === 'ar';
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const navigate = useNavigate();

  const getLocalizedContent = (field: 'name' | 'description') => {
    const currentLang = i18n.language;
    const arField = `${field}_ar` as keyof Product;
    const enField = `${field}_en` as keyof Product;
    if (currentLang === 'ar') {
      return (product[arField] as string) || product[field] || (product[enField] as string);
    } else {
      return (product[enField] as string) || product[field] || (product[arField] as string);
    }
  };

  useEffect(() => {
    checkWishlistStatus();
  }, [product.id]);

  useEffect(() => {
    const handleWishlistUpdate = (event: any) => {
      if (event.detail && Array.isArray(event.detail)) {
        setIsInWishlist(event.detail.includes(product.id));
      } else {
        checkWishlistStatus();
      }
    };
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [product.id]);

  const checkWishlistStatus = () => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          setIsInWishlist(parsedWishlist.includes(product.id));
        }
      }
    } catch (error) {
      console.error(t('product_card.wishlist_error'), error);
      setIsInWishlist(false);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isInWishlist) {
        const success = await removeFromWishlistUnified(product.id, getLocalizedContent('name'));
        if (success) setIsInWishlist(false);
      } else {
        const success = await addToWishlistUnified(product.id, getLocalizedContent('name'));
        if (success) setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      smartToast.frontend.error(t('product.wishlist_error'));
    }
  };

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.hasRequiredOptions) {
      const productPath = `/product/${createProductSlug(product.id, getLocalizedContent('name'))}`;
      navigate(productPath);
      return;
    }
    try {
      const success = await addToCartUnified(product.id, getLocalizedContent('name'), quantity);
      // لا تُظهر أي توست عند الإضافة للسلة وفق المطلوب
    } catch (error) {
      console.error('Error adding product to cart:', error);
      // لا تُظهر أي توست عند الإضافة للسلة وفق المطلوب
    }
  };

  const increaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < 10) setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productPath = `/product/${createProductSlug(product.id, getLocalizedContent('name'))}`;
    navigate(productPath);
  };

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = product.originalPrice && product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // ======================= LIST VIEW — الاسم سطر واحد فقط =======================
  if (viewMode === 'list') {
    return (
      <Link
        to={`/product/${createProductSlug(product.id, getLocalizedContent('name'))}`}
        className={`block bg-white rounded-xl border border-[#07635d]/20 shadow-[0_8px_24px_-4px_rgba(217,168,144,0.12),0_4px_8px_-2px_rgba(0,0,0,0.08)] w-full min-h-[160px] overflow-hidden ${
          isRTL ? 'text-right' : 'text-left'
        } hover:shadow-[0_12px_32px_-4px_rgba(217,168,144,0.18),0_6px_12px_-2px_rgba(0,0,0,0.12)] transition-all duration-400`}
        onClick={handleProductClick}
        aria-label={t('product.view_product_details', { name: getLocalizedContent('name') })}
      >
        <div className="flex p-4 gap-4 h-full">
          <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden relative border border-[#07635d]/10">
            <img
              src={buildImageUrl(product.mainImage)}
              alt={getLocalizedContent('name')}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = PRODUCT_PLACEHOLDER_SRC;
              }}
            />
            {!product.isAvailable && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-medium bg-[#07635d] px-3 py-1 rounded-full text-xs tracking-wide">
                  {t('common.outOfStock')}
                </span>
              </div>
            )}
            {hasDiscount && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-[#07635d] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                  -{discountPercent}%
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                {/* 👇 الاسم: سطر واحد فقط — truncate كامل */}
                <h3
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className="text-lg font-medium text-gray-900 truncate"
                  style={{ 
                    fontFamily: "'Cormorant Garamond', 'ui-serif', serif",
                    maxWidth: 'calc(100% - 32px)' // يفسح مكان للـ heart
                  }}
                >
                  {getLocalizedContent('name')}
                </h3>
                <button
                  onClick={toggleWishlist}
                  className={`p-1.5 rounded-full transition-all duration-300 ${
                    isInWishlist 
                      ? 'text-[#07635d] bg-[#fdf9f7] scale-110' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                  type="button"
                  aria-label={isInWishlist ? t('product_card.remove_from_wishlist') : t('product_card.add_to_wishlist')}
                >
                  <Heart 
                    className={`w-5 h-5 ${isInWishlist ? 'fill-[#07635d] animate-pulse' : ''}`} 
                  />
                </button>
              </div>

              <p className="text-gray-600 text-sm mt-1.5 line-clamp-1 leading-relaxed break-words">
                {truncateDescription(
                  getLocalizedContent('description') ||
                    `${t('common.discover')} ${getLocalizedContent('name')}`,
                  4
                )}
              </p>
            </div>

            <div className="mt-2 space-y-1.5">
              <PriceDisplay price={product.price} originalPrice={product.originalPrice} size="sm" variant="card" />
              <div className="flex items-center gap-1.5">
                <CheckCircle className={`w-3.5 h-3.5 ${product.isAvailable ? 'text-green-600' : 'text-green-600'}`} />
                <span className={`text-xs font-medium ${product.isAvailable ? 'text-green-600' : 'text-green-600'}`}>
                  {product.isAvailable ? t('available') : t('unavailable')}
                </span>
              </div>
            </div>
          </div>

          {product.isAvailable && (
            <div className="flex-shrink-0 flex flex-col items-end gap-2 w-24">
              <div className="flex items-center gap-1">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="w-7 h-7 rounded-full border border-[#07635d] bg-white text-[#07635d] flex items-center justify-center text-sm font-medium disabled:opacity-50 hover:bg-[#fdf9f7]"
                >
                  −
                </button>
                <span className="w-8 text-center font-medium text-[#07635d]">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= 10}
                  className="w-7 h-7 rounded-full border border-[#07635d] bg-white text-[#07635d] flex items-center justify-center text-sm font-medium disabled:opacity-50 hover:bg-[#fdf9f7]"
                >
                  +
                </button>
              </div>
              <button
                onClick={addToCart}
                className={`
                  flex items-center justify-center gap-1.5
                  bg-[#07635d] text-white hover:opacity-90
                  px-3 py-2 rounded-full
                  font-medium text-sm
                  shadow-[0_4px_10px_rgba(217,168,144,0.3)]
                  hover:shadow-[0_6px_14px_rgba(217,168,144,0.4)]
                  active:scale-95 active:shadow-[0_2px_6px_rgba(217,168,144,0.35)]
                  transition-all duration-300
                  w-full
                `}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('addToCart')}</span>
              </button>
            </div>
          )}
        </div>
      </Link>
    );
  }

  // ======================= GRID VIEW — الاسم سطر واحد فقط =======================
  return (
    <Link
      to={`/product/${createProductSlug(product.id, getLocalizedContent('name'))}`}
      className={`block bg-white rounded-xl border border-[#07635d]/20 shadow-[0_8px_24px_-4px_rgba(217,168,144,0.12),0_4px_8px_-2px_rgba(0,0,0,0.08)] w-full max-w-xs min-h-[480px] flex flex-col mx-auto ${
        isRTL ? 'text-right' : 'text-left'
      } hover:shadow-[0_12px_32px_-4px_rgba(217,168,144,0.18),0_6px_12px_-2px_rgba(0,0,0,0.12)] transition-all duration-400`}
      onClick={handleProductClick}
      aria-label={t('product.view_product_details', { name: getLocalizedContent('name') })}
    >
      <div className="relative flex-shrink-0">
        <div className="aspect-square w-full overflow-hidden rounded-xl border-b border-[#07635d]/10">
          <img
            src={buildImageUrl(product.mainImage)}
            alt={getLocalizedContent('name')}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = PRODUCT_PLACEHOLDER_SRC;
            }}
          />
          {!product.isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium bg-[#07635d] px-4 py-2 rounded-full text-sm tracking-wide">
                {t('common.outOfStock')}
              </span>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute -top-3 -right-3 z-10">
              <div className="bg-[#07635d] text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                -{discountPercent}%
              </div>
            </div>
          )}
        </div>

        <button
          onClick={toggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-20 ${
            isInWishlist 
              ? 'text-[#07635d] bg-white scale-110 shadow-sm' 
              : 'text-gray-400 bg-white/90 hover:bg-white hover:text-gray-600'
          }`}
          type="button"
          aria-label={isInWishlist ? t('product_card.remove_from_wishlist') : t('product_card.add_to_wishlist')}
        >
          <Heart 
            className={`w-5 h-5 ${isInWishlist ? 'fill-[#07635d] animate-pulse' : ''}`} 
          />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          {/* 👇 الاسم: سطر واحد فقط — truncate كامل */}
          <h3
            dir={isRTL ? 'rtl' : 'ltr'}
            className="text-base font-medium text-gray-900 truncate"
            style={{ 
              fontFamily: "'Cormorant Garamond', 'ui-serif', serif",
              maxWidth: 'calc(100% - 32px)' // يفسح مكان للـ heart
            }}
          >
            {getLocalizedContent('name')}
          </h3>
        </div>

        <p className="text-gray-600 text-sm mb-3 flex-grow line-clamp-1 leading-relaxed break-words">
          {truncateDescription(
            getLocalizedContent('description') ||
              `${t('common.discover')} ${getLocalizedContent('name')}`,
            4
          )}
        </p>

        <div className="space-y-2 mb-4">
          <PriceDisplay price={product.price} originalPrice={product.originalPrice} size="md" variant="card" />
          <div className="flex items-center gap-2">
            <CheckCircle className={`w-4 h-4 ${product.isAvailable ? 'text-green-600' : 'text-green-600'}`} />
            <span className={`text-sm font-medium ${product.isAvailable ? 'text-green-600' : 'text-green-600'}`}>
              {product.isAvailable ? t('available') : t('unavailable')}
            </span>
          </div>
        </div>

        {product.isAvailable && (
          <div className="space-y-3 mt-auto">
            <div className="flex items-center justify-center gap-2">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-full border border-[#07635d] bg-white text-[#07635d] flex items-center justify-center text-sm font-medium disabled:opacity-50 hover:bg-[#fdf9f7]"
                >
                  −
                </button>
                <span className="w-10 text-center font-medium text-[#07635d]">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= 10}
                  className="w-8 h-8 rounded-full border border-[#07635d] bg-white text-[#07635d] flex items-center justify-center text-sm font-medium disabled:opacity-50 hover:bg-[#fdf9f7]"
                >
                  +
                </button>
              </div>

              <button
                onClick={addToCart}
                className={`
                w-full flex items-center justify-center gap-2
                bg-[#07635d] text-white hover:opacity-90
                py-3 rounded-full
                font-semibold text-sm
                shadow-[0_4px_10px_rgba(217,168,144,0.3)]
                hover:shadow-[0_6px_14px_rgba(217,168,144,0.4)]
                active:scale-95 active:shadow-[0_2px_6px_rgba(217,168,144,0.35)]
                transition-all duration-300
              `}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('addToCart')}</span>
              </button>
          </div>
        )}
      </div>
    </Link>
  );

  function truncateDescription(text: string, maxWords: number = 4): string {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '..';
  }
};

export default ProductCard;