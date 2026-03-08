import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      <Button
        onClick={scrollToTop}
        size="sm"
        className="rounded-full w-14 h-14 shadow-2xl bg-gradient-to-br from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-2 border-white/40 hover:border-white/60 transition-all duration-300 backdrop-blur-sm hover:scale-110 hover:shadow-primary/50 hover:shadow-3xl group"
        title="Вернуться вверх"
      >
        <Icon name="ChevronUp" size={24} className="group-hover:-translate-y-1 transition-transform duration-300" />
      </Button>
    </div>
  );
};

export default ScrollToTop;