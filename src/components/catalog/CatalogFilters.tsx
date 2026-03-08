import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Icon from "@/components/ui/icon";

interface CatalogFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (value: boolean) => void;
  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;
  discountOnly: boolean;
  setDiscountOnly: (value: boolean) => void;
  fastDelivery: boolean;
  setFastDelivery: (value: boolean) => void;
  customOrderOnly: boolean;
  setCustomOrderOnly: (value: boolean) => void;
  priceFrom: string;
  setPriceFrom: (value: string) => void;
  priceTo: string;
  setPriceTo: (value: string) => void;

  minOrderFilter: string;
  setMinOrderFilter: (value: string) => void;
  locationFilter: string;
  setLocationFilter: (value: string) => void;
  categories: string[];
  resetFilters: () => void;
  totalProducts: number;
  filteredProducts: number;
}

const CatalogFilters = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  verifiedOnly,
  setVerifiedOnly,
  inStockOnly,
  setInStockOnly,
  discountOnly,
  setDiscountOnly,
  fastDelivery,
  setFastDelivery,
  customOrderOnly,
  setCustomOrderOnly,
  priceFrom,
  setPriceFrom,
  priceTo,
  setPriceTo,

  minOrderFilter,
  setMinOrderFilter,
  locationFilter,
  setLocationFilter,
  categories,
  resetFilters,
  totalProducts,
  filteredProducts
}: CatalogFiltersProps) => {
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,

    order: true,
    location: true,
    options: true,
    stats: true
  });

  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Проверяем есть ли активные фильтры (исключая поиск)
  const hasActiveFilters = 
    categoryFilter !== "all" ||
    verifiedOnly ||
    inStockOnly ||
    discountOnly ||
    fastDelivery ||
    customOrderOnly ||
    priceFrom !== "" ||
    priceTo !== "" ||

    minOrderFilter !== "all" ||
    locationFilter !== "all";

  return (
    <Card 
      className="shadow-lg border-0 w-full max-w-sm" 
      style={{ 
        position: 'static',
        top: 'auto',
        left: 'auto',
        right: 'auto',
        bottom: 'auto',
        transform: 'none'
      }}
    >
      <CardHeader className="bg-gradient-to-r from-primary/5 to-emerald-50 rounded-t-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-gray-800">
            <Icon name="Filter" size={20} className="mr-2 text-primary" />
            Фильтры
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
            className="text-gray-600 hover:text-primary p-1"
          >
            <Icon 
              name={isFiltersCollapsed ? "ChevronDown" : "ChevronUp"} 
              size={18} 
            />
          </Button>
        </div>
        {hasActiveFilters && !isFiltersCollapsed && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters} 
            className="w-full text-primary border-primary/30 hover:bg-primary/5 hover:border-primary active:bg-primary/10 transition-all duration-200 shadow-sm mt-3"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Сброс
          </Button>
        )}
      </CardHeader>
      {!isFiltersCollapsed && (
        <CardContent className="space-y-4 p-6">
        {/* Категория */}
        <Collapsible open={openSections.category} onOpenChange={() => toggleSection('category')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md transition-colors">
            <span className="text-sm font-semibold text-gray-700 flex items-center">
              <Icon name="Grid3X3" size={16} className="mr-2 text-primary" />
              Категория
            </span>
            <Icon 
              name={openSections.category ? "ChevronUp" : "ChevronDown"} 
              size={16} 
              className="text-gray-400 transition-transform duration-200" 
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500">
                <SelectValue placeholder="Все категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CollapsibleContent>
        </Collapsible>

        {/* Ценовой диапазон */}
        <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md transition-colors">
            <span className="text-sm font-semibold text-gray-700 flex items-center">
              <Icon name="RussianRuble" fallback="Coins" size={16} className="mr-2 text-emerald-600" />
              Цена
            </span>
            <Icon 
              name={openSections.price ? "ChevronUp" : "ChevronDown"} 
              size={16} 
              className="text-gray-400 transition-transform duration-200" 
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="От"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
                <span className="text-gray-500 text-sm">₽</span>
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="До"
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  className="border-gray-200 focus:border-primary focus:ring-primary/20"
                />
                <span className="text-gray-500 text-sm">₽</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>



        {/* Минимальный заказ */}
        <Collapsible open={openSections.order} onOpenChange={() => toggleSection('order')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md transition-colors">
            <span className="text-sm font-semibold text-gray-700 flex items-center">
              <Icon name="ShoppingCart" size={16} className="mr-2 text-emerald-600" />
              Минимальный заказ
            </span>
            <Icon 
              name={openSections.order ? "ChevronUp" : "ChevronDown"} 
              size={16} 
              className="text-gray-400 transition-transform duration-200" 
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <Select value={minOrderFilter} onValueChange={setMinOrderFilter}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500">
                <SelectValue placeholder="Любой объем" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любой объем</SelectItem>
                <SelectItem value="1">1 штука</SelectItem>
                <SelectItem value="small">До 10 штук</SelectItem>
                <SelectItem value="medium">10-100 штук</SelectItem>
                <SelectItem value="large">100+ штук</SelectItem>
              </SelectContent>
            </Select>
          </CollapsibleContent>
        </Collapsible>

        {/* Локация поставщика */}
        <Collapsible open={openSections.location} onOpenChange={() => toggleSection('location')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md transition-colors">
            <span className="text-sm font-semibold text-gray-700 flex items-center">
              <Icon name="MapPin" size={16} className="mr-2 text-primary" />
              Регион поставщика
            </span>
            <Icon 
              name={openSections.location ? "ChevronUp" : "ChevronDown"} 
              size={16} 
              className="text-gray-400 transition-transform duration-200" 
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500">
                <SelectValue placeholder="Все регионы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все регионы</SelectItem>
                <SelectItem value="moscow">Москва и МО</SelectItem>
                <SelectItem value="spb">Санкт-Петербург</SelectItem>
                <SelectItem value="ekb">Екатеринбург</SelectItem>
                <SelectItem value="nsk">Новосибирск</SelectItem>
                <SelectItem value="kzn">Казань</SelectItem>
                <SelectItem value="nng">Нижний Новгород</SelectItem>
                <SelectItem value="other">Другие регионы</SelectItem>
              </SelectContent>
            </Select>
          </CollapsibleContent>
        </Collapsible>

        {/* Чекбоксы */}
        <Collapsible open={openSections.options} onOpenChange={() => toggleSection('options')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md transition-colors">
            <span className="text-sm font-semibold text-gray-700 flex items-center">
              <Icon name="Settings" size={16} className="mr-2 text-primary" />
              Дополнительные опции
            </span>
            <Icon 
              name={openSections.options ? "ChevronUp" : "ChevronDown"} 
              size={16} 
              className="text-gray-400 transition-transform duration-200" 
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="space-y-4">

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="inStock"
                  checked={inStockOnly}
                  onCheckedChange={setInStockOnly}
                />
                <label htmlFor="inStock" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center">
                  <Icon name="Package" size={16} className="mr-1 text-emerald-600" />
                  Товары в наличии
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="customOrder"
                  checked={customOrderOnly}
                  onCheckedChange={setCustomOrderOnly}
                />
                <label htmlFor="customOrder" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center">
                  <Icon name="Clock" size={16} className="mr-1 text-primary" />
                  Под заказ
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="discount"
                  checked={discountOnly}
                  onCheckedChange={setDiscountOnly}
                />
                <label htmlFor="discount" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center">
                  <Icon name="Percent" size={16} className="mr-1 text-emerald-600" />
                  Товары со скидкой
                </label>
              </div>


            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Статистика */}
        <Collapsible open={openSections.stats} onOpenChange={() => toggleSection('stats')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-md transition-colors">
            <span className="text-sm font-semibold text-gray-700 flex items-center">
              <Icon name="BarChart3" size={16} className="mr-2 text-primary" />
              Статистика каталога
            </span>
            <Icon 
              name={openSections.stats ? "ChevronUp" : "ChevronDown"} 
              size={16} 
              className="text-gray-400 transition-transform duration-200" 
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Всего товаров:</span>
                  <span className="font-medium">{totalProducts}</span>
                </div>
                <div className="flex justify-between">
                  <span>Найдено:</span>
                  <span className="font-medium text-primary">{filteredProducts}</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>



        </CardContent>
      )}

    </Card>
  );
};

export default CatalogFilters;