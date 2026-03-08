import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  views: number;
  favorites: number;
  requests: number;
  status: 'active' | 'inactive';
}

const SupplierProductsTable = () => {
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: 'Электродвигатель АИР 250M4',
      category: 'Электродвигатели',
      price: '45 000 ₽',
      views: 342,
      favorites: 28,
      requests: 15,
      status: 'active'
    },
    {
      id: 2,
      name: 'Насос центробежный КМ 80-50-200',
      category: 'Насосы',
      price: '32 500 ₽',
      views: 298,
      favorites: 24,
      requests: 12,
      status: 'active'
    },
    {
      id: 3,
      name: 'Редуктор червячный Ч-160',
      category: 'Редукторы',
      price: '28 900 ₽',
      views: 256,
      favorites: 19,
      requests: 9,
      status: 'active'
    },
    {
      id: 4,
      name: 'Подшипник 6310 2RS',
      category: 'Подшипники',
      price: '1 850 ₽',
      views: 187,
      favorites: 15,
      requests: 6,
      status: 'inactive'
    },
    {
      id: 5,
      name: 'Муфта упругая МУВП-5',
      category: 'Муфты',
      price: '3 400 ₽',
      views: 134,
      favorites: 11,
      requests: 4,
      status: 'active'
    }
  ]);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Товар</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Icon name="Eye" size={16} />
                  Просмотры
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Icon name="Heart" size={16} />
                  Избранное
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Icon name="MessageSquare" size={16} />
                  Запросы
                </div>
              </TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell className="text-center">{product.views}</TableCell>
                <TableCell className="text-center">{product.favorites}</TableCell>
                <TableCell className="text-center">{product.requests}</TableCell>
                <TableCell>
                  {product.status === 'active' ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Активен
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Неактивен
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Icon name="Eye" size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SupplierProductsTable;
