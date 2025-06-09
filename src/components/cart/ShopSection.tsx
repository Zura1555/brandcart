"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { CartItem } from '@/interfaces';
import ProductItem from './ProductItem';

interface ShopSectionProps {
  shopName: string;
  items: CartItem[];
  isShopSelected: boolean;
  onShopSelectToggle: (checked: boolean) => void;
  onItemSelectToggle: (itemId: string, checked: boolean) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
}

const ShopSection: React.FC<ShopSectionProps> = ({ shopName, items, isShopSelected, onShopSelectToggle, onItemSelectToggle, onQuantityChange }) => {
  if (items.length === 0) return null;

  return (
    <Card className="shadow-md rounded-lg overflow-hidden">
      <CardHeader className="border-b bg-card py-3 px-4 sm:px-6">
        <div className="flex justify-between items-center">
          <CardTitle className="font-headline text-lg sm:text-xl text-foreground">{shopName}</CardTitle>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`select-all-${shopName.replace(/\s+/g, '-')}`}
              checked={isShopSelected}
              onCheckedChange={(checked) => onShopSelectToggle(Boolean(checked))}
              aria-label={`Select all items from ${shopName}`}
            />
            <label htmlFor={`select-all-${shopName.replace(/\s+/g, '-')}`} className="text-xs sm:text-sm font-body text-muted-foreground cursor-pointer">
              Select All
            </label>
          </div>
        </div>
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
