// @ts-nocheck
"use client";

import type React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CartItem, Shop } from '@/interfaces';
import ProductItem from './ProductItem';
import { ChevronRight, Gift } from 'lucide-react';

interface ShopSectionProps {
  shop: Shop; // Pass the whole shop object
  items: CartItem[];
  isShopSelected: boolean;
  onShopSelectToggle: (checked: boolean) => void;
  onItemSelectToggle: (itemId: string, checked: boolean) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
}

const ShopSection: React.FC<ShopSectionProps> = ({ shop, items, isShopSelected, onShopSelectToggle, onItemSelectToggle, onQuantityChange }) => {
  if (items.length === 0) return null;

  return (
    <Card className="shadow-md rounded-lg overflow-hidden bg-card">
      <CardHeader className="border-b bg-card py-3 px-4 sm:px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`select-all-${shop.name.replace(/\s+/g, '-')}`}
              checked={isShopSelected}
              onCheckedChange={(checked) => onShopSelectToggle(Boolean(checked))}
              aria-label={`Select all items from ${shop.name}`}
              className="border-primary data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            {shop.isFavorite && (
              <Badge className="bg-red-100 text-accent text-xs px-1.5 py-0.5 font-normal">Yêu thích+</Badge>
            )}
            <CardTitle className="font-semibold text-base text-foreground flex items-center cursor-pointer">
              {shop.logoUrl && (
                <div className="mr-2 flex-shrink-0">
                  <Image
                    src={shop.logoUrl}
                    alt={`${shop.name} logo`}
                    width={60} 
                    height={24} 
                    className="object-contain max-h-[24px]" // Ensures image fits and respects max height
                    data-ai-hint={shop.logoDataAiHint}
                    priority={false} 
                  />
                </div>
              )}
              {shop.name}
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-1" />
            </CardTitle>
          </div>
          {shop.editLinkText && (
            <Button variant="link" className="text-sm text-muted-foreground p-0 h-auto hover:text-accent">
              {shop.editLinkText}
            </Button>
          )}
        </div>
        {shop.promotionText && (
          <div className="mt-2 flex items-center text-xs text-accent bg-red-50 p-2 rounded-md cursor-pointer">
            <Gift className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="flex-grow min-w-0 truncate">{shop.promotionText}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0" />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {items.map(item => (
            <ProductItem
              key={item.id}
              item={item}
              onSelectToggle={onItemSelectToggle}
              onQuantityChange={onQuantityChange}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopSection;
