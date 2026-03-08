import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { VIPAdFormat, getPriceDisplay } from './types';

interface LockedFormatsSectionProps {
  lockedFormats: VIPAdFormat[];
}

export default function LockedFormatsSection({ lockedFormats }: LockedFormatsSectionProps) {
  if (lockedFormats.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Lock" size={20} />
          Эксклюзивные форматы (требуется апгрейд)
        </CardTitle>
        <CardDescription>
          Эти премиум форматы доступны на корпоративном тарифе
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lockedFormats.map((format) => (
            <Card key={format.id} className="border-2 border-gray-200 bg-gray-50 opacity-75">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-700">
                      <Icon name="Lock" size={16} className="text-gray-500" />
                      {format.name}
                    </CardTitle>
                    <Badge className="bg-gray-200 text-gray-600 mt-1">
                      Корпоративный тариф
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-gray-600">{format.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="p-3 bg-gold-100 rounded-lg inline-block mb-3">
                    <Icon name="Crown" size={24} className="text-gold-600" />
                  </div>
                  <p className="text-lg font-bold text-gold-600">{getPriceDisplay(format)}</p>
                  <p className="text-sm text-gray-600 mb-3">
                    Средний ROI: {format.performance.averageROI}%
                  </p>
                </div>

                <Button className="w-full bg-gold-600 hover:bg-gold-700">
                  <Icon name="Crown" size={16} className="mr-2" />
                  Повысить до корпоративного
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}