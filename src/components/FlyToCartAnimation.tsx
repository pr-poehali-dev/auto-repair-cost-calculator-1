import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface FlyToCartAnimationProps {
  isActive: boolean;
  startElement: HTMLElement | null;
  productImage?: string;
  onComplete: () => void;
}

const FlyToCartAnimation = ({ isActive, startElement, productImage, onComplete }: FlyToCartAnimationProps) => {
  const [animationState, setAnimationState] = useState<'idle' | 'flying' | 'completed'>('idle');
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [endPosition, setEndPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isActive && startElement) {
      // Получаем позицию стартового элемента
      const startRect = startElement.getBoundingClientRect();
      
      // Если это карточка товара, берем позицию изображения для более точной анимации
      const productImageElement = startElement.querySelector('img');
      let actualStartRect = startRect;
      
      if (productImageElement) {
        actualStartRect = productImageElement.getBoundingClientRect();
      }
      
      // Ищем иконку корзины в header
      const cartIcon = document.querySelector('[data-cart-icon]') as HTMLElement;
      if (!cartIcon) {
        onComplete();
        return;
      }
      
      const endRect = cartIcon.getBoundingClientRect();
      
      setStartPosition({
        x: actualStartRect.left + actualStartRect.width / 2,
        y: actualStartRect.top + actualStartRect.height / 2
      });
      
      setEndPosition({
        x: endRect.left + endRect.width / 2,
        y: endRect.top + endRect.height / 2
      });
      
      setAnimationState('flying');
      
      // Завершаем анимацию через время полета
      const timer = setTimeout(() => {
        setAnimationState('completed');
        onComplete();
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, startElement, onComplete]);

  useEffect(() => {
    if (animationState === 'completed') {
      const resetTimer = setTimeout(() => {
        setAnimationState('idle');
      }, 100);
      
      return () => clearTimeout(resetTimer);
    }
  }, [animationState]);

  if (animationState === 'idle' || !isActive) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed pointer-events-none z-[9999] transition-all duration-800 ease-in-out ${
        animationState === 'flying' 
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-0'
      }`}
      style={{
        left: animationState === 'flying' ? endPosition.x - 32 : startPosition.x - 32,
        top: animationState === 'flying' ? endPosition.y - 32 : startPosition.y - 32,
        transform: animationState === 'flying' 
          ? 'translate(-50%, -50%) scale(0.8)' 
          : 'translate(-50%, -50%) scale(1)',
      }}
    >
      {productImage ? (
        <div className="w-16 h-16 rounded-lg overflow-hidden shadow-xl border-2 border-primary bg-white">
          <img 
            src={productImage} 
            alt="Flying product" 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center shadow-xl">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2"
          >
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
      )}
      
      {/* Эффект частиц */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-primary rounded-full animate-ping`}
            style={{
              left: `${Math.random() * 40}px`,
              top: `${Math.random() * 40}px`,
              animationDelay: `${i * 100}ms`,
              animationDuration: '600ms'
            }}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

export default FlyToCartAnimation;