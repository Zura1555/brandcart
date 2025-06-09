
// @ts-nocheck
"use client";

import type React from 'react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { CartItem } from '@/interfaces';
import QuantitySelector from './QuantitySelector';
import { Check } from 'lucide-react';

interface ProductItemProps {
  item: CartItem;
  onSelectToggle: (itemId: string, checked: boolean) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ item, onSelectToggle, onQuantityChange }) => {
  const displayVariant = item.variant ? item.variant.replace(/\s*\(\+\d+\)\s*$/, '') : '';

  return (
    <div className={`flex items-center p-3 sm:p-4 space-x-3 sm:space-x-4 bg-card transition-colors duration-200 ease-in-out ${item.selected ? 'bg-accent/5' : ''}`}>
      <Checkbox
        id={`item-${item.id}`}
        checked={item.selected}
        onCheckedChange={(checked) => onSelectToggle(item.id, Boolean(checked))}
        className="shrink-0"
        aria-label={`Select item ${item.name}`}
      />
      <Image
        src={item.imageUrl}
        alt={item.name}
        width={80}
        height={80}
        className="rounded-md object-cover w-20 h-20 shrink-0 border"
        data-ai-hint={item.dataAiHint}
        priority={false}
      />
      <div className="flex-grow min-w-0">
        <h3 className="font-body font-semibold text-sm sm:text-md text-foreground truncate" title={item.name}>{item.name}</h3>
        {displayVariant && (
          <Badge variant="outline" className="text-xs text-muted-foreground border-gray-300 mt-1 px-1.5 py-0.5">{displayVariant}</Badge>
        )}
        {item.stock !== undefined && item.stock > 0 && item.stock <= 5 && (
          <p className="text-xs text-foreground mt-1">Chỉ còn {item.stock}</p>
        )}
        <div className="flex items-baseline space-x-2 mt-1">
          <p className="text-sm font-bold text-foreground">₫{item.price.toLocaleString('de-DE')}</p>
          {item.originalPrice && (
            <p className="text-xs text-muted-foreground line-through">₫{item.originalPrice.toLocaleString('de-DE')}</p>
          )}
        </div>
        {item.discountDescription && (
          <div className="mt-1 flex items-center text-xs text-green-600">
            <Check className="w-3 h-3 mr-1 flex-shrink-0" />
            <span>{item.discountDescription}</span>
          </div>
        )}
      </div>
      <div className="shrink-0">
        <QuantitySelector
          quantity={item.quantity}
          onIncrement={() => onQuantityChange(item.id, item.quantity + 1)}
          onDecrement={() => onQuantityChange(item.id, item.quantity - 1)}
        />
      </div>
    </div>
  );
};

export default ProductItem;
