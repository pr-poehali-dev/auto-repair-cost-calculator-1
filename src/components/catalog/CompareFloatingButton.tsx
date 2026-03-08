import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Product } from "./ProductCard";

interface CompareFloatingButtonProps {
  compareProducts: Product[];
  onOpenComparison: () => void;
  onRemoveProduct: (productId: number) => void;
}

const CompareFloatingButton = ({
  compareProducts,
  onOpenComparison,
  onRemoveProduct
}: CompareFloatingButtonProps) => {
  if (compareProducts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800 flex items-center">
            <Icon name="BarChart" size={16} className="mr-2 text-blue-600" />
            Сравнение
            <Badge className="ml-2 bg-blue-100 text-blue-800">{compareProducts.length}</Badge>
          </h4>
        </div>
        
        <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
          {compareProducts.map((product) => (
            <div key={product.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-8 h-8 object-cover rounded"
              />
              <span className="text-xs text-gray-700 flex-1 line-clamp-1">
                {product.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onRemoveProduct(product.id)}
              >
                <Icon name="X" size={12} />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={onOpenComparison}
          >
            Сравнить ({compareProducts.length})
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => compareProducts.forEach(p => onRemoveProduct(p.id))}
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompareFloatingButton;