import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import ProductCard, { Product } from "./ProductCard";

interface CatalogGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  onSendInquiry: (product: Product) => void;
  onResetFilters: () => void;
  onQuickView?: (product: Product) => void;
  onAddToCompare?: (product: Product) => void;
  compareProducts?: number[];
  onProductClick?: (productId: number) => void;
}

const CatalogGrid = ({
  products,
  viewMode,
  onSendInquiry,
  onResetFilters,
  onQuickView,
  onAddToCompare,
  compareProducts = [],
  onProductClick
}: CatalogGridProps) => {
  if (products.length === 0) {
    return (
      <Card className="text-center py-16 shadow-lg border-0">
        <CardContent>
          <div className="max-w-md mx-auto">
            <Icon name="SearchX" size={64} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Товары не найдены</h3>
            <p className="text-gray-600 mb-6">
              К сожалению, по вашему запросу ничего не найдено. Попробуйте изменить параметры поиска.
            </p>
            <Button onClick={onResetFilters} className="bg-blue-600 hover:bg-blue-700">
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Сбросить все фильтры
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={viewMode === 'grid' 
      ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-4" 
      : "space-y-3"
    } style={viewMode === 'grid' ? { gridAutoRows: '1fr' } : {}}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          viewMode={viewMode}
          onSendInquiry={onSendInquiry}
          onQuickView={onQuickView}
          onAddToCompare={onAddToCompare}
          isInCompare={compareProducts.includes(product.id)}
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
};

export default CatalogGrid;