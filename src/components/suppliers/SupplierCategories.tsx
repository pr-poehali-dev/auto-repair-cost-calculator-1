import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface SupplierCategoriesProps {
  suppliers: any[];
  categories: string[];
  onCategorySelect: (category: string) => void;
}

const SupplierCategories = ({ suppliers, categories, onCategorySelect }: SupplierCategoriesProps) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map(category => {
        const categorySuppliers = suppliers.filter(s => s.category === category);
        const avgRating = (categorySuppliers.reduce((sum, s) => sum + s.rating, 0) / categorySuppliers.length).toFixed(1);
        
        return (
          <Card key={category} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Package" size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{category}</h3>
                  <p className="text-sm text-gray-600">{categorySuppliers.length} поставщиков</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Средний рейтинг:</span>
                  <span className="font-medium">{avgRating}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Верифицированных:</span>
                  <span className="font-medium">{categorySuppliers.filter(s => s.verified).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Товарных позиций:</span>
                  <span className="font-medium">{categorySuppliers.reduce((sum, s) => sum + s.products, 0)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4" 
                variant="outline"
                onClick={() => onCategorySelect(category)}
              >
                Смотреть поставщиков
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SupplierCategories;