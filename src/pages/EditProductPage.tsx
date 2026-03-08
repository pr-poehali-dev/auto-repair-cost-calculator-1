import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ProductImageUploader from '@/components/product/ProductImageUploader';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  short_description?: string;
  category_id: number;
  category_name?: string;
  sku?: string;
  price: number;
  currency: string;
  discount_percentage: number;
  stock_quantity: number;
  min_order_quantity: number;
  max_order_quantity?: number;
  weight_kg?: number;
  main_image_url?: string;
  gallery_images?: string[];
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  status: 'draft' | 'active' | 'inactive' | 'archived';
  is_featured: boolean;
  attributes?: Record<string, string>;
  created_at: string;
  updated_at: string;
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

const EditProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
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

  const generateImageId = () => `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const convertToProductImages = (mainImageUrl?: string, galleryImages?: string[]): ProductImage[] => {
    const images: ProductImage[] = [];
    
    // Добавляем главное изображение
    if (mainImageUrl) {
      images.push({
        id: generateImageId(),
        url: mainImageUrl,
        isMain: true,
        isUploading: false
      });
    }
    
    // Добавляем остальные изображения
    if (galleryImages && galleryImages.length > 0) {
      galleryImages.forEach(url => {
        if (url) {
          images.push({
            id: generateImageId(),
            url,
            isMain: false,
            isUploading: false
          });
        }
      });
    }
    
    return images;
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/a07998f6-4bc3-4ea6-9df6-a92d86541323');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProduct = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://functions.poehali.dev/8fe277e5-ff21-4acb-a688-5dae6eb30c39/${id}`,
        {
          headers: {
            'X-Supplier-ID': supplierId.toString()
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Товар не найден');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const productData: Product = await response.json();
      setProduct(productData);
      
      // Populate form with product data
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        short_description: productData.short_description || '',
        category_id: productData.category_id || '',
        sku: productData.sku || '',
        price: productData.price?.toString() || '',
        currency: productData.currency || 'RUB',
        discount_percentage: productData.discount_percentage?.toString() || '0',
        stock_quantity: productData.stock_quantity?.toString() || '0',
        min_order_quantity: productData.min_order_quantity?.toString() || '1',
        max_order_quantity: productData.max_order_quantity?.toString() || '',
        weight_kg: productData.weight_kg?.toString() || '',
        images: convertToProductImages(productData.main_image_url, productData.gallery_images),
        meta_title: productData.meta_title || '',
        meta_description: productData.meta_description || '',
        tags: productData.tags || [],
        status: productData.status === 'archived' ? 'inactive' : productData.status,
        is_featured: productData.is_featured || false,
        attributes: productData.attributes || {}
      });

    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке товара');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProduct();
    
    // Check for success message from location state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      navigate(location.pathname, { replace: true });
    }
  }, [id]);

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
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

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

      const response = await fetch(
        `https://functions.poehali.dev/8fe277e5-ff21-4acb-a688-5dae6eb30c39/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Supplier-ID': supplierId.toString()
          },
          body: JSON.stringify(productData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setProduct(result);
      setSuccessMessage('Товар успешно обновлен!');
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error('Failed to update product:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при обновлении товара');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm('Вы уверены, что хотите архивировать этот товар?')) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `https://functions.poehali.dev/8fe277e5-ff21-4acb-a688-5dae6eb30c39/${id}`,
        {
          method: 'DELETE',
          headers: {
            'X-Supplier-ID': supplierId.toString()
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      navigate('/supplier/products', {
        state: { message: 'Товар успешно архивирован' }
      });

    } catch (err) {
      console.error('Failed to archive product:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при архивировании товара');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Icon name="AlertCircle" size={48} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate('/supplier/products')} variant="outline">
                  Вернуться к списку
                </Button>
                <Button onClick={fetchProduct}>
                  Попробовать снова
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Редактировать товар</h1>
          <p className="text-gray-600 mt-2">
            {product && `ID: ${product.id} • Создан: ${new Date(product.created_at).toLocaleDateString()}`}
          </p>
        </div>
      </div>

      {successMessage && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-green-600">
              <Icon name="CheckCircle" size={20} className="mr-2" />
              <span>{successMessage}</span>
            </div>
          </CardContent>
        </Card>
      )}

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
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="flex gap-2 flex-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/supplier/products')}
              disabled={saving}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить изменения
                </>
              )}
            </Button>
          </div>
          
          <Button
            type="button"
            variant="destructive"
            onClick={handleArchive}
            disabled={saving}
            className="sm:w-auto"
          >
            <Icon name="Archive" size={16} className="mr-2" />
            Архивировать
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;