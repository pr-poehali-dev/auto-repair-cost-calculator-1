import { Card, CardContent } from "@/components/ui/card";

interface StatsDisplayProps {
  totalCategories: number;
  totalProducts: number;
}

const StatsDisplay = ({ totalCategories, totalProducts }: StatsDisplayProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">{totalCategories}</div>
          <div className="text-sm text-gray-600">Категорий</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {totalProducts.toLocaleString('ru-RU')}
          </div>
          <div className="text-sm text-gray-600">Товаров</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsDisplay;