import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductInquiryModal from "@/components/ProductInquiryModal";
import FlyToCartAnimation from "@/components/FlyToCartAnimation";
import { useCart } from "@/contexts/CartContext";
import CatalogHero from "@/components/catalog/CatalogHero";
import CatalogFilters from "@/components/catalog/CatalogFilters";
import CatalogToolbar from "@/components/catalog/CatalogToolbar";
import CatalogGrid from "@/components/catalog/CatalogGrid";
import QuickViewModal from "@/components/catalog/QuickViewModal";
import ProductComparison from "@/components/catalog/ProductComparison";
import CompareFloatingButton from "@/components/catalog/CompareFloatingButton";
import { Product } from "@/components/catalog/ProductCard";
import { productsData } from "@/data/productsData";

const Catalog = () => {
  const navigate = useNavigate();

  // Функции для работы с localStorage
  const saveToLocalStorage = (key: string, value: any) => {
    try {
      localStorage.setItem(`catalog_${key}`, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };

  const getFromLocalStorage = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(`catalog_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return defaultValue;
    }
  };

  const [searchQuery, setSearchQuery] = useState(() => getFromLocalStorage('searchQuery', ''));
  const [categoryFilter, setCategoryFilter] = useState(() => getFromLocalStorage('categoryFilter', 'all'));
  const [verifiedOnly, setVerifiedOnly] = useState(() => getFromLocalStorage('verifiedOnly', false));
  const [inStockOnly, setInStockOnly] = useState(() => getFromLocalStorage('inStockOnly', false));
  const [discountOnly, setDiscountOnly] = useState(() => getFromLocalStorage('discountOnly', false));
  const [fastDelivery, setFastDelivery] = useState(() => getFromLocalStorage('fastDelivery', false));
  const [customOrderOnly, setCustomOrderOnly] = useState(() => getFromLocalStorage('customOrderOnly', false));
  const [priceFrom, setPriceFrom] = useState(() => getFromLocalStorage('priceFrom', ''));
  const [priceTo, setPriceTo] = useState(() => getFromLocalStorage('priceTo', ''));

  const [minOrderFilter, setMinOrderFilter] = useState(() => getFromLocalStorage('minOrderFilter', 'all'));
  const [locationFilter, setLocationFilter] = useState(() => getFromLocalStorage('locationFilter', 'all'));
  const [sortBy, setSortBy] = useState(() => getFromLocalStorage('sortBy', 'name'));
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => getFromLocalStorage('viewMode', 'grid'));
  const [flyingAnimation, setFlyingAnimation] = useState<{
    isActive: boolean;
    startElement: HTMLElement | null;
    productImage?: string;
  }>({
    isActive: false,
    startElement: null,
    productImage: undefined
  });
  
  // Новые состояния для функциональности
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  
  const { addItem } = useCart();

  // useEffect для автосохранения состояний в localStorage
  useEffect(() => {
    saveToLocalStorage('searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    saveToLocalStorage('categoryFilter', categoryFilter);
  }, [categoryFilter]);

  useEffect(() => {
    saveToLocalStorage('verifiedOnly', verifiedOnly);
  }, [verifiedOnly]);

  useEffect(() => {
    saveToLocalStorage('inStockOnly', inStockOnly);
  }, [inStockOnly]);

  useEffect(() => {
    saveToLocalStorage('discountOnly', discountOnly);
  }, [discountOnly]);

  useEffect(() => {
    saveToLocalStorage('fastDelivery', fastDelivery);
  }, [fastDelivery]);

  useEffect(() => {
    saveToLocalStorage('customOrderOnly', customOrderOnly);
  }, [customOrderOnly]);

  useEffect(() => {
    saveToLocalStorage('priceFrom', priceFrom);
  }, [priceFrom]);

  useEffect(() => {
    saveToLocalStorage('priceTo', priceTo);
  }, [priceTo]);



  useEffect(() => {
    saveToLocalStorage('minOrderFilter', minOrderFilter);
  }, [minOrderFilter]);

  useEffect(() => {
    saveToLocalStorage('locationFilter', locationFilter);
  }, [locationFilter]);

  useEffect(() => {
    saveToLocalStorage('sortBy', sortBy);
  }, [sortBy]);



  useEffect(() => {
    saveToLocalStorage('viewMode', viewMode);
  }, [viewMode]);

  // Сохранение позиции скролла при уходе со страницы
  useEffect(() => {
    const handleScroll = () => {
      saveToLocalStorage('scrollPosition', window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Восстановление позиции скролла при возврате
  useEffect(() => {
    const savedScrollPosition = getFromLocalStorage('scrollPosition', 0);
    if (savedScrollPosition > 0) {
      setTimeout(() => {
        window.scrollTo(0, savedScrollPosition);
      }, 100);
    }
  }, []);

  // Фильтрация и сортировка товаров
  const filteredProducts = productsData
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesVerified = !verifiedOnly || product.verified;
      const matchesStock = !inStockOnly || product.inStock;
      const matchesDiscount = !discountOnly || product.discount;
      const matchesFastDelivery = !fastDelivery || product.fastDelivery;
      const matchesCustomOrder = !customOrderOnly || !product.inStock;
      const matchesPrice = (() => {
        const fromPrice = priceFrom ? parseFloat(priceFrom) : 0;
        const toPrice = priceTo ? parseFloat(priceTo) : Infinity;
        return product.price >= fromPrice && product.price <= toPrice;
      })();

      
      const matchesMinOrder = (() => {
        if (minOrderFilter === "all") return true;
        if (minOrderFilter === "1") return product.minOrder?.includes("1 штука");
        
        const minOrderValue = parseInt(product.minOrder?.split(" ")[0] || "1");
        if (minOrderFilter === "small") return minOrderValue <= 10;
        if (minOrderFilter === "medium") return minOrderValue >= 10 && minOrderValue <= 100;
        if (minOrderFilter === "large") return minOrderValue > 100;
        return true;
      })();
      
      const matchesLocation = (() => {
        if (locationFilter === "all") return true;
        const seller = product.seller.toLowerCase();
        switch (locationFilter) {
          case "moscow": return seller.includes("мос") || seller.includes("мск");
          case "spb": return seller.includes("спб") || seller.includes("питер");
          case "ekb": return seller.includes("екатеринбург");
          case "nsk": return seller.includes("новосибирск");
          case "kzn": return seller.includes("казан");
          case "nng": return seller.includes("нижний");
          default: return true;
        }
      })();

      return matchesSearch && matchesCategory && matchesVerified && matchesStock && matchesDiscount && matchesFastDelivery && matchesCustomOrder && matchesPrice && matchesMinOrder && matchesLocation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;

        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Получаем уникальные категории из товаров
  const categories = [...new Set(productsData.map(p => p.category))];

  // Функция сброса фильтров
  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setVerifiedOnly(false);
    setInStockOnly(false);
    setDiscountOnly(false);
    setFastDelivery(false);
    setCustomOrderOnly(false);
    setPriceFrom('');
    setPriceTo('');

    setMinOrderFilter("all");
    setLocationFilter("all");
    setSortBy("name");
  };



  const handleAnimationComplete = () => {
    setFlyingAnimation(prev => ({
      ...prev,
      isActive: false
    }));
  };

  const handleSendInquiry = (product: Product) => {
    setSelectedProduct(product);
    setIsInquiryModalOpen(true);
  };

  const handleCloseInquiry = () => {
    setSelectedProduct(null);
    setIsInquiryModalOpen(false);
  };

  // Обработчики новой функциональности
  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
    setIsQuickViewOpen(false);
  };

  const handleAddToCompare = (product: Product) => {
    setCompareProducts(prev => {
      const isAlreadyInCompare = prev.some(p => p.id === product.id);
      
      if (isAlreadyInCompare) {
        // Убираем из сравнения
        return prev.filter(p => p.id !== product.id);
      } else {
        // Добавляем в сравнение (максимум 3 товара)
        if (prev.length >= 3) {
          // Заменяем первый товар новым
          return [product, ...prev.slice(0, 2)];
        }
        return [product, ...prev];
      }
    });
  };

  const handleRemoveFromCompare = (productId: number) => {
    setCompareProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleOpenComparison = () => {
    setIsComparisonOpen(true);
  };

  const handleCloseComparison = () => {
    setIsComparisonOpen(false);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="ml-64">
        <div className="container mx-auto px-6 py-4">
          <CatalogHero />

          <div className="flex gap-6">
            {/* Боковая панель с фильтрами */}
            <div className="w-1/4 flex-shrink-0">
              <CatalogFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                verifiedOnly={verifiedOnly}
                setVerifiedOnly={setVerifiedOnly}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
                discountOnly={discountOnly}
                setDiscountOnly={setDiscountOnly}
                fastDelivery={fastDelivery}
                setFastDelivery={setFastDelivery}
                customOrderOnly={customOrderOnly}
                setCustomOrderOnly={setCustomOrderOnly}
                priceFrom={priceFrom}
                setPriceFrom={setPriceFrom}
                priceTo={priceTo}
                setPriceTo={setPriceTo}
                minOrderFilter={minOrderFilter}
                setMinOrderFilter={setMinOrderFilter}
                locationFilter={locationFilter}
                setLocationFilter={setLocationFilter}
                categories={categories}
                resetFilters={resetFilters}
                totalProducts={productsData.length}
                filteredProducts={filteredProducts.length}
              />
            </div>

            {/* Основной контент */}
            <div className="flex-1">
              <CatalogToolbar
                filteredProductsCount={filteredProducts.length}
                totalProducts={productsData.length}
                viewMode={viewMode}
                setViewMode={setViewMode}
                sortBy={sortBy}
                setSortBy={setSortBy}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                allProducts={productsData}
              />
              
              <div className="mt-4">
                <CatalogGrid
                products={filteredProducts}
                viewMode={viewMode}
                onSendInquiry={handleSendInquiry}
                onResetFilters={resetFilters}
                onQuickView={handleQuickView}
                onAddToCompare={handleAddToCompare}
                compareProducts={compareProducts.map(p => p.id)}
                onProductClick={handleProductClick}
                />
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </main>

      <ProductInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={handleCloseInquiry}
        product={selectedProduct}
      />

      <FlyToCartAnimation
        isActive={flyingAnimation.isActive}
        startElement={flyingAnimation.startElement}
        productImage={flyingAnimation.productImage}
        onAnimationComplete={handleAnimationComplete}
      />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
        onSendInquiry={handleSendInquiry}
      />

      <ProductComparison
        products={compareProducts}
        isOpen={isComparisonOpen}
        onClose={handleCloseComparison}
        onRemoveProduct={handleRemoveFromCompare}
        onSendInquiry={handleSendInquiry}
      />

      <CompareFloatingButton
        compareProducts={compareProducts}
        onOpenComparison={handleOpenComparison}
        onRemoveProduct={handleRemoveFromCompare}
      />
    </div>
  );
};

export default Catalog;