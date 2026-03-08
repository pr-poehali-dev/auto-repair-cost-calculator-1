import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface HeroSectionProps {
  isModalOpen?: boolean;
  shouldRestart?: boolean;
}

const HeroSection = ({ isModalOpen = false, shouldRestart = false }: HeroSectionProps) => {
  const navigate = useNavigate();
  
  const images = [
    { src: "https://cdn.poehali.dev/files/3dd3af2d-1667-46a5-a4f1-273d18dcf9df.png", alt: "Business Market - Логотип компании" },
    { src: "/img/8b7fccbc-5aa7-4f7b-82e2-aabfd14263ff.jpg", alt: "Российские бизнес-партнеры заключают сделку" },
    { src: "/img/967a43bb-bb29-400c-ae7e-cad802988407.jpg", alt: "Современный офис с командной работой" },
    { src: "/img/a8a12200-5509-4746-826f-bafbbb74fb68.jpg", alt: "Современная логистика и склад" },
    { src: "/img/13af019d-fd32-49c0-88e6-fbb18b518599.jpg", alt: "Цифровая торговая платформа" }
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    // Сбрасываем на логотип при перезапуске
    if (shouldRestart) {
      setCurrentImageIndex(0);
    }
  }, [shouldRestart]);

  useEffect(() => {
    // Останавливаем слайд-шоу если модальное окно открыто
    if (isModalOpen) {
      // Останавливаем на логотипе когда модальное окно открыто
      setCurrentImageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [images.length, isModalOpen]);

  return (
    <section className="pt-2 sm:pt-4 pb-16 sm:pb-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start lg:items-center">
          <div className="space-y-8 lg:space-y-10">
            <div className="space-y-5 sm:space-y-6">
              <Badge variant="secondary" className="w-fit">
                <Icon name="Star" size={14} className="mr-1" />
                Верифицированная платформа
              </Badge>
              <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-[1.15] sm:leading-tight">
                Корпоративная платформа
                <span className="text-primary"> Business Market</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
                Цифровая торговая площадка для оптовых покупателей и продавцов. Помогаем предприятиям 
                малого и среднего бизнеса быстро находить надежных поставщиков и новых клиентов, 
                эффективно продвигать свою продукцию на рынке.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
              <Button size="lg" className="text-base sm:text-lg h-12 sm:h-14 w-full sm:w-auto font-semibold" onClick={() => navigate('/login')}>
                <Icon name="Search" size={18} className="mr-2" />
                Начать работу
              </Button>
              <Button variant="outline" size="lg" className="text-base sm:text-lg h-12 sm:h-14 w-full sm:w-auto font-semibold" onClick={() => navigate('/register')}>
                <Icon name="Store" size={18} className="mr-2" />
                Подключить поставщика
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">2,500+</div>
                <div className="text-sm sm:text-base text-gray-600 mt-1">Поставщиков</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">15,000+</div>
                <div className="text-sm sm:text-base text-gray-600 mt-1">Товаров</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">98%</div>
                <div className="text-sm sm:text-base text-gray-600 mt-1">Довольных клиентов</div>
              </div>
            </div>
          </div>

          <div className="relative order-first lg:order-last mt-2 lg:translate-y-[-20%] w-full mx-auto">
            <div className="relative overflow-hidden rounded-xl shadow-2xl h-64 sm:h-80 lg:h-96">
              {images.map((image, index) => (
                <img 
                  key={index}
                  src={image.src} 
                  alt={image.alt}
                  className={`w-full h-full absolute top-0 left-0 ${
                    index === 0 
                      ? 'object-contain bg-white p-8' 
                      : 'object-cover transition-all duration-1000 ease-in-out'
                  } ${
                    index === currentImageIndex 
                      ? index === 0 
                        ? 'opacity-100' 
                        : 'opacity-100 transform scale-100'
                      : 'opacity-0 transform scale-105'
                  }`}
                />
              ))}
              
              {/* Индикаторы слайдов */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={20} className="text-green-500" />
                <span className="font-medium text-sm">Верифицировано</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;