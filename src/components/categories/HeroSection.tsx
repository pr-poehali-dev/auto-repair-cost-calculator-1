import Icon from "@/components/ui/icon";

interface HeroSectionProps {
  totalCategories: number;
  totalProducts: number;
}

const HeroSection = ({ totalCategories, totalProducts }: HeroSectionProps) => {
  return (
    <div className="mb-8 bg-gradient-to-br from-primary via-primary/90 to-emerald-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
      <div className="relative z-10">
        <h1 className="text-4xl font-bold mb-3">Категории товаров</h1>
        <p className="text-xl text-white/80 mb-6">
          {totalCategories} категорий • {totalProducts.toLocaleString('ru-RU')} товаров
        </p>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
            <Icon name="Grid3x3" size={16} className="text-emerald-200" />
            <span>Удобная навигация</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
            <Icon name="Search" size={16} className="text-emerald-200" />
            <span>Быстрый поиск</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
            <Icon name="TrendingUp" size={16} className="text-emerald-200" />
            <span>Актуальный ассортимент</span>
          </div>
        </div>
      </div>
      <div className="absolute right-0 top-0 h-full w-64 bg-gradient-to-l from-white/10 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-300"></div>
    </div>
  );
};

export default HeroSection;