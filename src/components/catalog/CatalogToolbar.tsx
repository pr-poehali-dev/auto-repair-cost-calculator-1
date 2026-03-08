import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";

interface CatalogToolbarProps {
  filteredProductsCount: number;
  totalProducts: number;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  allProducts: any[];
}

const CatalogToolbar = ({
  filteredProductsCount,
  totalProducts,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  allProducts
}: CatalogToolbarProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Генерация подсказок на основе данных товаров
  const generateSuggestions = (query: string): string[] => {
    if (!query || query.length < 2) return [];
    
    const lowercaseQuery = query.toLowerCase();
    const suggestionSet = new Set<string>();
    
    allProducts.forEach(product => {
      // Подсказки из названий товаров
      if (product.name.toLowerCase().includes(lowercaseQuery)) {
        suggestionSet.add(product.name);
      }
      
      // Подсказки из категорий
      if (product.category.toLowerCase().includes(lowercaseQuery)) {
        suggestionSet.add(product.category);
      }
      
      // Подсказки из названий поставщиков
      if (product.seller.toLowerCase().includes(lowercaseQuery)) {
        suggestionSet.add(product.seller);
      }
    });
    
    return Array.from(suggestionSet).slice(0, 5); // Ограничиваем до 5 подсказок
  };

  // Обновление подсказок при изменении поискового запроса
  useEffect(() => {
    const newSuggestions = generateSuggestions(searchQuery);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0 && searchQuery.length >= 2);
    setSelectedSuggestion(-1);
  }, [searchQuery, allProducts]);

  // Обработка клавиш для навигации по подсказкам
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          setSearchQuery(suggestions[selectedSuggestion]);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        break;
    }
  };

  // Выбор подсказки кликом
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    searchRef.current?.focus();
  };

  // Скрытие подсказок при клике вне элемента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Поиск товаров */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="relative">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            ref={searchRef}
            type="text"
            placeholder="Поиск товаров, поставщиков, категорий..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchQuery.length >= 2) {
                setShowSuggestions(suggestions.length > 0);
              }
            }}
            className="pl-10 pr-4 py-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-base"
          />
          
          {/* Выпадающий список подсказок */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                    index === selectedSuggestion 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon name="Search" size={14} className="text-gray-400" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Панель инструментов */}
      <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <p className="text-gray-700 font-medium">
            Показано <span className="text-blue-600 font-semibold">{filteredProductsCount}</span> из {totalProducts} товаров
          </p>
        </div>
      
      <div className="flex items-center gap-4">
        {/* Переключатель вида */}
        <div className="flex items-center border border-gray-200 rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="px-3"
          >
            <Icon name="Grid3x3" size={16} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="px-3"
          >
            <Icon name="List" size={16} />
          </Button>
        </div>

        {/* Сортировка */}
        <div className="flex items-center gap-2">
          <Icon name="ArrowUpDown" size={16} className="text-gray-500" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">По названию</SelectItem>
              <SelectItem value="price-asc">Сначала дешевые</SelectItem>
              <SelectItem value="price-desc">Сначала дорогие</SelectItem>
              <SelectItem value="rating">По рейтингу</SelectItem>
              <SelectItem value="reviews">По популярности</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CatalogToolbar;