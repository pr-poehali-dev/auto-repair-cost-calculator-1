import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Закрытие подсказок при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // База данных предложений для автоподсказки
  const allSuggestions = [
    'Металлопрокат', 'Металлические трубы', 'Металлическая арматура', 'Металлический лист',
    'Стройматериалы', 'Строительный кирпич', 'Строительный цемент', 'Строительные блоки',
    'Продукты питания', 'Продукты молочные', 'Продукты мясные', 'Продукты консервированные',
    'Упаковка', 'Упаковочные материалы', 'Упаковочная пленка', 'Упаковочные коробки',
    'Текстиль', 'Текстильные материалы', 'Ткани хлопковые', 'Ткани синтетические',
    'Электроника', 'Электронные компоненты', 'Электрооборудование', 'Электротовары',
    'Химия', 'Химические реактивы', 'Химическое сырье', 'Химические материалы'
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/catalog?search=${encodeURIComponent(tag)}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length > 1) {
      const filtered = allSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    navigate(`/catalog?search=${encodeURIComponent(suggestion)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <section id="search-section" className="py-10 sm:py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-8 sm:mb-10 px-2">
            Найдите то, что нужно вашему бизнесу
          </h2>
          
          <div className="bg-white rounded-xl p-5 sm:p-8 shadow-lg border">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
              <div className="flex-1 relative" ref={searchRef}>
                <Input 
                  placeholder="Поиск товаров и поставщиков..." 
                  className="text-base sm:text-lg h-12 sm:h-14 px-4 rounded-lg"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                />
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Icon name="Search" size={16} className="mr-3 text-gray-400" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button size="lg" className="px-6 sm:px-10 h-12 sm:h-14 w-full sm:w-auto text-base sm:text-lg font-semibold rounded-lg" onClick={handleSearch}>
                <Icon name="Search" size={20} className="mr-2" />
                Поиск
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-5 sm:mt-6">
              <span className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-0 w-full sm:w-auto">Популярные запросы:</span>
              {["Металлопрокат", "Стройматериалы", "Продукты питания", "Упаковка"].map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors text-sm sm:text-base px-3 py-2 rounded-full" onClick={() => handleTagClick(tag)}>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;