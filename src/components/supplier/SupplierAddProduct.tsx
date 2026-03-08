import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';

const SupplierAddProduct = () => {
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить новый товар</CardTitle>
        <CardDescription>Заполните информацию о товаре для размещения в каталоге</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Название товара *</Label>
            <Input 
              id="name" 
              placeholder="Например: Электродвигатель АИР 250M4" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Категория *</Label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motors">Электродвигатели</SelectItem>
                  <SelectItem value="pumps">Насосы</SelectItem>
                  <SelectItem value="gearboxes">Редукторы</SelectItem>
                  <SelectItem value="bearings">Подшипники</SelectItem>
                  <SelectItem value="couplings">Муфты</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Цена *</Label>
              <Input 
                id="price" 
                type="number" 
                placeholder="0" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание *</Label>
            <Textarea 
              id="description" 
              placeholder="Подробное описание товара, технические характеристики..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label>Изображения товара</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="images" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2 text-gray-600">
                  <Icon name="Upload" size={32} />
                  <p className="text-sm font-medium">Нажмите для загрузки изображений</p>
                  <p className="text-xs text-gray-500">PNG, JPG до 5MB</p>
                </div>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="article">Артикул</Label>
              <Input 
                id="article" 
                placeholder="ABC-12345" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Производитель</Label>
              <Input 
                id="brand" 
                placeholder="Название производителя" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Наличие (шт)</Label>
              <Input 
                id="stock" 
                type="number" 
                placeholder="0" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Вес (кг)</Label>
              <Input 
                id="weight" 
                type="number" 
                placeholder="0" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warranty">Гарантия (мес)</Label>
              <Input 
                id="warranty" 
                type="number" 
                placeholder="12" 
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex items-center gap-2">
              <Icon name="Plus" size={18} />
              Добавить товар
            </Button>
            <Button type="button" variant="outline">
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SupplierAddProduct;
