
"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  maxQuantity?: number;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onIncrement, onDecrement, maxQuantity = 99 }) => {
  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={onDecrement} disabled={quantity <= 1} aria-label="Decrease quantity">
        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
      <span className="font-body font-semibold text-sm sm:text-md w-6 sm:w-8 text-center tabular-nums">{quantity}</span>
      <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={onIncrement} disabled={quantity >= maxQuantity} aria-label="Increase quantity">
        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
};

export default QuantitySelector;
