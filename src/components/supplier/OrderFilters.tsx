import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface BulkActions {
  selectedOrders: Set<string>;
  action: string;
}

interface OrderFiltersProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  bulkActions: BulkActions;
  setBulkActions: (actions: BulkActions) => void;
}

export default function OrderFilters({ 
  filterStatus, 
  setFilterStatus, 
  bulkActions, 
  setBulkActions 
}: OrderFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="status-filter">Статус:</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все заказы</SelectItem>
                <SelectItem value="new">Новые</SelectItem>
                <SelectItem value="processing">В обработке</SelectItem>
                <SelectItem value="shipped">Отправленные</SelectItem>
                <SelectItem value="delivered">Доставленные</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Input placeholder="Поиск по номеру заказа..." className="w-60" />
            <Button variant="outline" size="sm">
              <Icon name="Search" size={16} />
            </Button>
          </div>

          {bulkActions.selectedOrders.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">
                Выбрано: {bulkActions.selectedOrders.size}
              </span>
              <Select onValueChange={(value) => setBulkActions({...bulkActions, action: value})}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Массовые действия" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirm">Подтвердить заказы</SelectItem>
                  <SelectItem value="pack">Отметить упакованными</SelectItem>
                  <SelectItem value="ship">Отправить</SelectItem>
                  <SelectItem value="cancel">Отменить</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm">Применить</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}