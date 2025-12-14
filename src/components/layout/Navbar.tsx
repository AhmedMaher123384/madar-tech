import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../../utils/toastConfig';
import {
  Menu,
  X,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  ChevronDown,
  Package,
  Home,
  Grid3X3,
  Search,
} from 'lucide-react';
import logo from '../../assets/logo.png';
import AuthModal from '../modals/AuthModal';
import CartDropdown from '../ui/CartDropdown';
import LiveSearch from '../ui/LiveSearch';
import LanguageCurrencySelector from '../ui/LanguageCurrencySelector';
import { createCategorySlug } from '../../utils/slugify';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../config/api';
import CategoryCollectionBar from './CategoryCollectionBar';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
}

interface Category {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: string;
  image: string;
}

function Navbar() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [wishlistItemsCount, setWishlistItemsCount] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('cachedCategories');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const getInitials = (name: string): string => {
    if (!name) return '';
    return name
      .split(' ')
      .filter((word) => word.length > 0)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setScrolled(false);
        setShowNavbar(true);
      } else {
        setScrolled(true);
        if (isLogoHovered) {
          setShowNavbar(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setShowNavbar(false);
        } else if (currentScrollY < lastScrollY) {
          setShowNavbar(true);
        }
      }
      setLastScrollY(currentScrollY);
    };
    const throttledControlNavbar = throttle(controlNavbar, 10);
    window.addEventListener('scroll', throttledControlNavbar);
    return () => window.removeEventListener('scroll', throttledControlNavbar);
  }, [lastScrollY, isLogoHovered]);

  useEffect(() => {
    if (isLogoHovered && scrolled) setShowNavbar(true);
  }, [isLogoHovered, scrolled]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
        setTimeout(() => {
          if (!isCartHovered) setIsCartDropdownOpen(false);
        }, 400);
      }
    };
    if (isUserMenuOpen || isCartDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, isCartDropdownOpen, isCartHovered]);

  useEffect(() => {
    if (isMenuOpen) setShowNavbar(false);
    else setShowNavbar(true);
  }, [isMenuOpen]);

  const throttle = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: number | null = null;
    let lastExecTime = 0;
    return (...args: any[]) => {
      const currentTime = Date.now();
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  };

  // Helper: localized text (supports name/name_ar/name_en)
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
    return typeof base === 'string' ? base : '';
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    fetchCartCount();
    fetchWishlistCount();
    fetchCategories();

    const handleCartUpdate = () => fetchCartCount();
    const handleCartCountChange = () => {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const cartItems = JSON.parse(localCart);
          if (Array.isArray(cartItems)) {
            const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
            setCartItemsCount(totalItems);
            const userData = localStorage.getItem('user');
            if (userData) setTimeout(() => fetchCartCount(), 100);
            return;
          }
        } catch { /* ignore */ }
      }
      const userData = localStorage.getItem('user');
      if (userData) fetchCartCount();
      else setCartItemsCount(0);
    };
    const handleWishlistUpdate = () => fetchWishlistCount();
    const handleCategoriesUpdate = () => fetchCategories();

    const cartEvents = ['cartUpdated', 'productAddedToCart', 'forceCartUpdate'];
    const cartCountEvents = ['cartCountChanged'];
    const wishlistEvents = ['wishlistUpdated', 'productAddedToWishlist', 'productRemovedFromWishlist', 'wishlistCleared'];

    cartEvents.forEach((event) => window.addEventListener(event, handleCartUpdate));
    cartCountEvents.forEach((event) => window.addEventListener(event, handleCartCountChange));
    wishlistEvents.forEach((event) => window.addEventListener(event, handleWishlistUpdate));
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cartUpdated' || e.key === 'lastCartUpdate' || e.key === 'forceCartRefresh')
        handleCartUpdate();
      if (e.key === 'wishlistUpdated' || e.key === 'lastWishlistUpdate') handleWishlistUpdate();
    };
    window.addEventListener('storage', handleStorageChange);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      const savedCartCount = localStorage.getItem(`cartCount_${user.id}`);
      const savedWishlistCount = localStorage.getItem(`wishlistCount_${user.id}`);
      if (savedCartCount) setCartItemsCount(parseInt(savedCartCount));
      if (savedWishlistCount) setWishlistItemsCount(parseInt(savedWishlistCount));
    } else {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          setWishlistItemsCount(Array.isArray(parsedWishlist) ? parsedWishlist.length : 0);
        } catch {
          setWishlistItemsCount(0);
        }
      } else setWishlistItemsCount(0);
    }

    return () => {
      cartEvents.forEach((event) => window.removeEventListener(event, handleCartUpdate));
      cartCountEvents.forEach((event) => window.removeEventListener(event, handleCartCountChange));
      wishlistEvents.forEach((event) => window.removeEventListener(event, handleWishlistUpdate));
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>(
          '.search-input, .live-search-input, input[placeholder*="ابحث" i], input[placeholder*="Search" i]'
        );
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  const fetchCartCount = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          try {
            const cartItems = JSON.parse(localCart);
            if (Array.isArray(cartItems)) {
              const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
              setCartItemsCount(totalItems);
              localStorage.setItem('lastCartCount', totalItems.toString());
              return;
            }
          } catch { /* ignore */ }
        }
        setCartItemsCount(0);
        localStorage.setItem('lastCartCount', '0');
        return;
      }

      const user = JSON.parse(userData);
      if (!user?.id) {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          try {
            const cartItems = JSON.parse(localCart);
            if (Array.isArray(cartItems)) {
              const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
              setCartItemsCount(totalItems);
              return;
            }
          } catch { /* ignore */ }
        }
        setCartItemsCount(0);
        return;
      }

      const data = await apiCall(API_ENDPOINTS.USER_CART(user.id));
      let totalItems = 0;
      if (Array.isArray(data)) {
        totalItems = data.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      } else if (data && typeof data === 'object' && Array.isArray(data.cart)) {
        totalItems = data.cart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      } else if (data && typeof data === 'object' && typeof data.totalItems === 'number') {
        totalItems = data.totalItems;
      }
      setCartItemsCount(totalItems);
      localStorage.setItem('lastCartCount', totalItems.toString());
      localStorage.setItem(`cartCount_${user.id}`, totalItems.toString());
    } catch (error) {
      console.error('Error fetching cart count:', error);
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const cartItems = JSON.parse(localCart);
          if (Array.isArray(cartItems)) {
            const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
            setCartItemsCount(totalItems);
            return;
          }
        } catch { /* ignore */ }
      }
      setCartItemsCount(0);
      localStorage.setItem('lastCartCount', '0');
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      let wishlistCount = 0;
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          wishlistCount = Array.isArray(parsedWishlist) ? parsedWishlist.length : 0;
        } catch { /* ignore */ }
      }
      setWishlistItemsCount(wishlistCount);
      localStorage.setItem('lastWishlistCount', wishlistCount.toString());
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user?.id) localStorage.setItem(`wishlistCount_${user.id}`, wishlistCount.toString());
        } catch { /* ignore */ }
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
      setWishlistItemsCount(0);
      localStorage.setItem('lastWishlistCount', '0');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.CATEGORIES);
      const filteredCategories = data.filter((category: Category) => category.name !== 'ثيمات');
      setCategories(filteredCategories);
      localStorage.setItem('cachedCategories', JSON.stringify(filteredCategories));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
    smartToast.frontend.success(`مرحباً بك ${userData.firstName}! 🎉`);
  };

  const handleLogout = () => {
    const currentUser = user;
    setUser(null);
    localStorage.removeItem('user');
    if (currentUser?.id) {
      localStorage.removeItem(`cartCount_${currentUser.id}`);
      localStorage.removeItem(`wishlistCount_${currentUser.id}`);
    }
    setIsUserMenuOpen(false);
    setCartItemsCount(0);
    setWishlistItemsCount(0);
    navigate('/');
    smartToast.frontend.success('تم تسجيل الخروج بنجاح');
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  const openMenuWithCircularReveal = () => {
    setIsMenuOpen(true);
  };

  // Removed contact phone/email per new navbar design

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`sticky top-0 w-full z-50 transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="container mx-auto px-3 sm:px-4">
            {/* Mobile Top Bar */}
            <div className="md:hidden grid grid-cols-3 items-center h-14">
              {/* Left: Menu */}
              <div className="flex items-center justify-self-start">
                <button
                  ref={menuButtonRef}
                  onClick={openMenuWithCircularReveal}
                  className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                  aria-label="القائمة"
                >
                  <Menu size={22} />
                </button>
              </div>

              {/* Center: Logo (perfectly centered) */}
              <div className="flex items-center justify-center">
                <Link
                  to="/"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSearchOpen(false);
                  }}
                  className="cursor-pointer my-1"
                >
                  <img src={logo} alt="Logo" className="h-9 w-auto" />
                </Link>
              </div>

              {/* Right: Search + Cart */}
              <div className="flex items-center justify-self-end space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => setIsSearchOpen((prev) => !prev)}
                  className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                  aria-label="بحث"
                >
                  <Search size={20} />
                </button>
                <div className="relative" ref={cartDropdownRef}>
                  <button
                    onClick={() => setIsCartDropdownOpen(!isCartDropdownOpen)}
                    className="relative p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                    aria-label="سلة"
                  >
                    <ShoppingCart size={20} />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#07635d] text-white border-2 border-white rounded-full min-w-[16px] h-[16px] flex items-center justify-center text-[9px] font-bold">
                        {cartItemsCount}
                      </span>
                    )}
                  </button>
                  {isCartDropdownOpen && (
                    <div className="absolute top-full mt-2 z-50 rtl:left-0 ltr:right-0">
                      <CartDropdown
                        isOpen={isCartDropdownOpen}
                        onClose={() => setIsCartDropdownOpen(false)}
                        onHoverChange={setIsCartHovered}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Bar — صف واحد: يسار لوجو، وسط كاتيجوريز، يمين أيقونات */}
            <div className="hidden md:flex items-center justify-between h-16 sm:h-20 gap-4">
              {/* يسار: اللوجو */}
              <div className="flex items-center">
                <Link
                  to="/"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSearchOpen(false);
                  }}
                  className="cursor-pointer my-1"
                >
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-10 sm:h-12 md:h-14 w-auto"
                  />
                </Link>
              </div>

              {/* الوسط: كاتيجوريز بشكل أنيق ومسدود */}
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-2">
                  {categories && categories.length > 0 ? (
                    categories.slice(0, 12).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${createCategorySlug(cat.id, getLocalized(cat, 'name') || cat.name)}`}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-xl transition-all duration-200 hover:bg-[#07635d]/10 hover:border-[#07635d]/40 border border-transparent whitespace-nowrap"
                        title={getLocalized(cat, 'description') || ''}
                      >
                        {getLocalized(cat, 'name') || cat.name}
                      </Link>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">{t('common.loading')}</span>
                  )}
                </div>
              </div>

              {/* يمين: باقي الأيقونات (بحث، لغة/عملة، مفضلة، سلة، حساب) */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => setIsSearchOpen((prev) => !prev)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                  aria-label="بحث"
                >
                  <Search size={18} className="sm:w-4.5 sm:h-4.5" />
                </button>

                <div className="transform scale-60 origin-right">
                  <LanguageCurrencySelector />
                </div>

                <Link
                  to="/wishlist"
                  className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                >
                  <Heart size={18} className="sm:w-4.5 sm:h-4.5" />
                  {wishlistItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#07635d] text-white border-2 border-white rounded-full min-w-[16px] h-[16px] flex items-center justify-center text-[9px] font-bold">
                      {wishlistItemsCount}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={cartDropdownRef}>
                  <button
                    onClick={() => setIsCartDropdownOpen(!isCartDropdownOpen)}
                    className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                    aria-label="سلة"
                  >
                    <ShoppingCart size={18} className="sm:w-4.5 sm:h-4.5" />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#07635d] text-white border-2 border-white rounded-full min-w-[16px] h-[16px] flex items-center justify-center text-[9px] font-bold">
                        {cartItemsCount}
                      </span>
                    )}
                  </button>
                  {isCartDropdownOpen && (
                    <div className="absolute top-full mt-2 z-50 rtl:left-0 ltr:right-0">
                      <CartDropdown
                        isOpen={isCartDropdownOpen}
                        onClose={() => setIsCartDropdownOpen(false)}
                        onHoverChange={setIsCartHovered}
                      />
                    </div>
                  )}
                </div>

                {user ? (
                  <button
                    onClick={() => navigate('/profile')}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                    aria-label="حسابي"
                    title="حسابي"
                  >
                    <User size={18} className="sm:w-4.5 sm:h-4.5" />
                  </button>
                ) : (
                  <button
                    onClick={openAuthModal}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                    aria-label="تسجيل الدخول"
                    title="تسجيل الدخول"
                  >
                    <User size={18} className="sm:w-4.5 sm:h-4.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Overlay */}
            {isSearchOpen && (
              <div className="relative py-3 border-t border-gray-100">
                <div className="w-full max-w-2xl mx-auto">
                  <LiveSearch
                    triggerVariant="bar"
                    appearance="light"
                    onClose={() => setIsSearchOpen(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* أزلنا صف الفئات المنفصل ليصبح الشريط صفاً واحداً */}
      </nav>

      {/* Mobile Menu - Bottom Sheet */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="w-full max-w-md h-[85vh] bg-white shadow-2xl rounded-t-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="pt-3">
              <div className="mx-auto h-1 w-12 rounded-full bg-gray-300" />
            </div>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  <img src={logo} alt="Logo" className="h-8 w-auto" />
                </Link>
              </div>
              {/* أزلنا أيقونات الاتصال للموبايل حسب المتطلبات */}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Language & Currency */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#07635d]">اللغة والعملة</div>
                <div className="relative bg-white border border-[#07635d]/30 rounded-xl shadow-sm px-2 py-2">
                  <LanguageCurrencySelector />
                </div>
              </div>

              {/* Inline Search Bar */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#07635d]">البحث</div>
                <div className="relative bg-white border border-[#07635d]/30 rounded-xl shadow-sm px-2 py-2">
                  <LiveSearch triggerVariant="bar" appearance="light" onClose={() => {}} />
                </div>
              </div>
              {user ? (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#07635d] to-[#07635d] flex items-center justify-center text-black font-bold text-sm">
                      {getInitials(user.name || user.firstName || '')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {user.name?.split(' ')[0] || user.firstName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-sm text-gray-700 hover:text-[#07635d] font-medium py-1.5 px-2 rounded flex items-center"
                    >
                      <User size={14} className="ml-1.5 rtl:mr-1.5" />
                      {t('nav.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-red-600 hover:text-red-700 font-medium py-1.5 px-2 rounded flex items-center"
                    >
                      <LogOut size={14} className="ml-1.5 rtl:mr-1.5" />
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="w-full bg-[#07635d] hover:bg-[#07635d] text-black py-3 rounded-xl font-semibold transition-colors shadow-sm"
                >
                  {t('nav.login')}
                </button>
              )}
              {/* Quick Actions - تحسين المظهر وإزالة زر الفئات */}
              <div className="px-1">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: t('nav.home'), href: '/', icon: Home },
                    { name: t('nav.products'), href: '/products', icon: Grid3X3 },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex flex-col items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 shadow-sm hover:shadow-md hover:border-[#07635d]/40 hover:bg-[#07635d]/10 transition-all"
                    >
                      <link.icon size={22} className="mb-1 text-[#07635d]" />
                      <span className="text-xs font-semibold">{link.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* إزالة تكرار صفحات القائمة للحفاظ على نسخة واحدة فقط */}

              {/* Category Chips */}
              <div className="pt-2">
                <div className="px-1 grid grid-cols-2 gap-2">
                  {categories && categories.length > 0 ? (
                    categories.slice(0, 12).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${createCategorySlug(cat.id, getLocalized(cat, 'name') || cat.name)}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-800 text-xs font-medium hover:border-[#07635d]/40 hover:bg-[#07635d]/10 truncate"
                      >
                        {getLocalized(cat, 'name') || cat.name}
                      </Link>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">{t('common.loading')}</span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 font-medium"
                >
                  <span className="flex items-center">
                    <Heart size={18} className="ml-3 rtl:mr-3" />
                    {t('nav.wishlist')}
                  </span>
                  {wishlistItemsCount > 0 && (
                    <span className="bg-[#07635d] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {wishlistItemsCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default Navbar;