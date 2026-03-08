import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import ProductImageUploader from '@/components/product/ProductImageUploader';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductImage {
  id: string;
  url: string;
  file?: File;
  isMain: boolean;
  isUploading?: boolean;
}

interface ProductFormData {
  name: string;
  description: string;
  short_description: string;
  category_id: number | '';
  sku: string;
  price: string;
  currency: string;
  discount_percentage: string;
  stock_quantity: string;
  min_order_quantity: string;
  max_order_quantity: string;
  weight_kg: string;
  images: ProductImage[];
  meta_title: string;
  meta_description: string;
  tags: string[];
  status: 'draft' | 'active' | 'inactive';
  is_featured: boolean;
  attributes: Record<string, string>;
}

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock supplier ID for demo
  const supplierId = 1;

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    short_description: '',
    category_id: '',
    sku: '',
    price: '',
    currency: 'RUB',
    discount_percentage: '0',
    stock_quantity: '0',
    min_order_quantity: '1',
    max_order_quantity: '',
    weight_kg: '',
    images: [],
    meta_title: '',
    meta_description: '',
    tags: [],
    status: 'draft',
    is_featured: false,
    attributes: {}
  });

  const [newTag, setNewTag] = useState('');
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/a07998f6-4bc3-4ea6-9df6-a92d86541323');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addAttribute = () => {
    if (newAttributeName.trim() && newAttributeValue.trim()) {
      setFormData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [newAttributeName.trim()]: newAttributeValue.trim()
        }
      }));
      setNewAttributeName('');
      setNewAttributeValue('');
    }
  };

  const removeAttribute = (attrName: string) => {
    setFormData(prev => {
      const newAttributes = { ...prev.attributes };
      delete newAttributes[attrName];
      return {
        ...prev,
        attributes: newAttributes
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Название товара обязательно');
      }
      if (!formData.category_id) {
        throw new Error('Выберите категорию');
      }
      if (!formData.price || parseFloat(formData.price) < 0) {
        throw new Error('Укажите корректную цену');
      }

      // Prepare images data
      const mainImage = formData.images.find(img => img.isMain);
      const galleryImages = formData.images.filter(img => !img.isMain).map(img => img.url);

      // Prepare data for API
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        short_description: formData.short_description.trim() || null,
        category_id: Number(formData.category_id),
        sku: formData.sku.trim() || null,
        price: parseFloat(formData.price),
        currency: formData.currency,
        discount_percentage: parseFloat(formData.discount_percentage) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        min_order_quantity: parseInt(formData.min_order_quantity) || 1,
        max_order_quantity: formData.max_order_quantity ? parseInt(formData.max_order_quantity) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        main_image_url: mainImage?.url || null,
        gallery_images: galleryImages,
        meta_title: formData.meta_title.trim() || null,
        meta_description: formData.meta_description.trim() || null,
        tags: formData.tags,
        status: formData.status,
        is_featured: formData.is_featured,
        attributes: formData.attributes
      };

      const response = await fetch('https://functions.poehali.dev/8fe277e5-ff21-4acb-a688-5dae6eb30c39', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Supplier-ID': supplierId.toString()
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Navigate to product edit page or products list
      navigate(`/supplier/products/${result.id}/edit`, {
        state: { message: 'Товар успешно создан!' }
      });

    } catch (err) {
      console.error('Failed to create product:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при создании товара');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            <Icon name="Home" size={16} />
          </Button>
          <span className="text-gray-400">•</span>
          <Button
            variant="ghost"
            onClick={() => navigate('/supplier/products')}
            className="p-2"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Добавить товар</h1>
          <p className="text-gray-600 mt-2">Создание нового товара в каталоге</p>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <Icon name="AlertCircle" size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
            <CardDescription>Базовые данные о товаре</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Название товара *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Введите название товара"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Категория *</Label>
                <Select
                  value={formData.category_id.toString()}
                  onValueChange={(value) => handleInputChange('category_id', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="short_description">Краткое описание</Label>
              <Input
                id="short_description"
                value={formData.short_description}
                onChange={(e) => handleInputChange('short_description', e.target.value)}
                placeholder="Краткое описание товара"
                maxLength={500}
              />
            </div>

            <div>
              <Label htmlFor="description">Полное описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Подробное описание товара"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing and Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Цена и склад</CardTitle>
            <CardDescription>Настройки цены и наличия товара</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Цена *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="currency">Валюта</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RUB">₽ Рубль</SelectItem>
                    <SelectItem value="USD">$ Доллар</SelectItem>
                    <SelectItem value="EUR">€ Евро</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discount_percentage">Скидка (%)</Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.discount_percentage}
                  onChange={(e) => handleInputChange('discount_percentage', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="stock_quantity">Количество на складе</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="min_order_quantity">Минимальный заказ</Label>
                <Input
                  id="min_order_quantity"
                  type="number"
                  min="1"
                  value={formData.min_order_quantity}
                  onChange={(e) => handleInputChange('min_order_quantity', e.target.value)}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="max_order_quantity">Максимальный заказ</Label>
                <Input
                  id="max_order_quantity"
                  type="number"
                  min="1"
                  value={formData.max_order_quantity}
                  onChange={(e) => handleInputChange('max_order_quantity', e.target.value)}
                  placeholder="Без ограничений"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">Артикул (SKU)</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Артикул товара"
                />
              </div>
              <div>
                <Label htmlFor="weight_kg">Вес (кг)</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.weight_kg}
                  onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                  placeholder="0.000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <ProductImageUploader
          images={formData.images}
          onImagesChange={(images) => handleInputChange('images', images)}
          maxImages={10}
        />

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Теги</CardTitle>
            <CardDescription>Ключевые слова для поиска</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Добавить тег"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Icon name="Plus" size={16} />
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-blue-600 hover:text-blue-800">
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attributes */}
        <Card>
          <CardHeader>
            <CardTitle>Дополнительные характеристики</CardTitle>
            <CardDescription>Пользовательские атрибуты товара</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                value={newAttributeName}
                onChange={(e) => setNewAttributeName(e.target.value)}
                placeholder="Название характеристики"
              />
              <Input
                value={newAttributeValue}
                onChange={(e) => setNewAttributeValue(e.target.value)}
                placeholder="Значение"
              />
              <Button type="button" onClick={addAttribute} variant="outline">
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить
              </Button>
            </div>
            
            {Object.keys(formData.attributes).length > 0 && (
              <div className="space-y-2">
                {Object.entries(formData.attributes).map(([name, value]) => (
                  <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium">{name}:</span> {value}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttribute(name)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Настройки</CardTitle>
            <CardDescription>Статус публикации и дополнительные опции</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Статус</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'draft' | 'active' | 'inactive') => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="inactive">Неактивен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
                <Label htmlFor="is_featured">Рекомендуемый товар</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/supplier/products')}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Создание...
              </>
            ) : (
              <>
                <Icon name="Save" size={16} className="mr-2" />
                Создать товар
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;