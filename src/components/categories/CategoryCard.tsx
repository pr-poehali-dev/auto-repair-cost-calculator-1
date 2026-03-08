import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    description: string;
    icon: string;
    image: string;
    productCount: number;
    color: string;
    href: string;
  };
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Card 
      className="group overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ring-1 ring-gray-100 hover:ring-primary/20"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80`}></div>
        
        <div className="absolute top-4 left-4 p-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
          <Icon name={category.icon} size={24} className="text-white" />
        </div>

        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-primary to-emerald-600 text-white border-0 shadow-lg">
          {category.productCount.toLocaleString('ru-RU')} товаров
        </Badge>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-200 transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-gray-200 line-clamp-2">
            {category.description}
          </p>
        </div>
      </div>

      <CardContent className="p-4 bg-gradient-to-br from-gray-50 to-white">
        <Button 
          className="w-full bg-gradient-to-r from-primary via-primary/90 to-emerald-600 hover:from-emerald-700 hover:to-primary shadow-md hover:shadow-lg transition-all"
          onClick={() => window.location.href = category.href}
        >
          <Icon name="ArrowRight" size={16} className="mr-2" />
          Перейти к товарам
        </Button>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;