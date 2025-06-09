"use client";

import type React from 'react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import type { CartItem } from '@/interfaces';
import QuantitySelector from './QuantitySelector';

interface ProductItemProps {
  item: CartItem;
  onSelectToggle: (itemId: string, checked: boolean) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ item, onSelectToggle, onQuantityChange }) => {
  return (
    <div className={`flex items-center p-3 sm:p-4 space-x-3 sm:space-x-4 transition-colors duration-200 ease-in-out ${item.selected ? 'bg-accent/10' : 'bg-card hover:bg-muted/50'}`}>
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
        width={72}
        height={72}
        className="rounded-md object-cover w-16 h-16 sm:w-20 sm:h-20 shrink-0 border"
        data-ai-hint={item.dataAiHint}
        priority={false} 
      />
      <div className="flex-grow min-w-0">
        <h3 className="font-body font-semibold text-sm sm:text-md truncate" title={item.name}>{item.name}</h3>
        <p className="font-body text-xs sm:text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
      </div>
      <QuantitySelector
        quantity={item.quantity}
        onIncrement={() => onQuantityChange(item.id, item.quantity + 1)}
        onDecrement={() => onQuantityChange(item.id, item.quantity - 1)}
      />
    </div>
  );
};

export default ProductItem;
