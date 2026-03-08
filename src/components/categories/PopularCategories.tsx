import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface CategoryType {
  id: number;
  name: string;
  description: string;
  icon: string;
  productCount: number;
  color: string;
  href: string;
}

interface PopularCategoriesProps {
  categories: CategoryType[];
}

const PopularCategories = ({ categories }: PopularCategoriesProps) => {
  const topCategories = categories
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 3);

  return (
    <div className="mt-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Популярные категории</h2>
        <p className="text-gray-600">Самые востребованные товарные группы</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {topCategories.map((category) => (
          <Card key={`popular-${category.id}`} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full bg-gradient-to-r ${category.color}`}>
                  <Icon name={category.icon} size={20} className="text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {category.productCount.toLocaleString('ru-RU')} товаров
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = category.href}
              >
                Просмотреть товары
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PopularCategories;