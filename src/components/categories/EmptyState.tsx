import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface EmptyStateProps {
  searchQuery: string;
  onClearSearch: () => void;
}

const EmptyState = ({ searchQuery, onClearSearch }: EmptyStateProps) => {
  return (
    <Card className="text-center py-16 shadow-lg border-0">
      <CardContent>
        <div className="max-w-md mx-auto">
          <Icon name="SearchX" size={64} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Категории не найдены</h3>
          <p className="text-gray-600 mb-6">
            По вашему запросу "{searchQuery}" категории не найдены. Попробуйте изменить поисковый запрос.
          </p>
          <Button 
            onClick={onClearSearch}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Показать все категории
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;