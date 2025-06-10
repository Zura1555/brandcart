
// @ts-nocheck
"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { CartItem } from '@/interfaces';
import QuantitySelector from './QuantitySelector';
import { Check, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ProductItemProps {
  item: CartItem;
  onSelectToggle: (itemId: string, checked: boolean) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onDeleteItem: (itemId: string) => void;
}

const DELETE_BUTTON_WIDTH_PX = 80; // Corresponds to w-20 in Tailwind (5rem * 16px/rem)
const SWIPE_THRESHOLD_RATIO = 0.3; // Percentage of button width to trigger snap

const ProductItem: React.FC<ProductItemProps> = ({ item, onSelectToggle, onQuantityChange, onDeleteItem }) => {
  const displayVariant = item.variant ? item.variant.replace(/\s*\(\+\d+\)\s*$/, '') : '';

  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartXRef = useRef(0);
  const initialTranslateXRef = useRef(0);
  const swipeableContentRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 1) return; // Ignore multi-touch
    touchStartXRef.current = e.touches[0].clientX;
    initialTranslateXRef.current = translateX;
    setIsSwiping(true);
    if (swipeableContentRef.current) {
      swipeableContentRef.current.style.transition = 'none'; // Disable transition during swipe for responsiveness
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwiping || e.touches.length > 1) return;
    const currentX = e.touches[0].clientX;
    let diffX = currentX - touchStartXRef.current;

    // Prevent swiping further right than initial position
    if (initialTranslateXRef.current + diffX > 0) {
      diffX = -initialTranslateXRef.current;
    }
    // Prevent swiping further left than delete button width
    if (initialTranslateXRef.current + diffX < -DELETE_BUTTON_WIDTH_PX) {
      diffX = -DELETE_BUTTON_WIDTH_PX - initialTranslateXRef.current;
    }
    
    let newTranslateX = initialTranslateXRef.current + diffX;
    // Ensure newTranslateX doesn't go beyond 0 to the right or -DELETE_BUTTON_WIDTH_PX to the left
    newTranslateX = Math.max(-DELETE_BUTTON_WIDTH_PX, Math.min(0, newTranslateX));

    setTranslateX(newTranslateX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    if (swipeableContentRef.current) {
      swipeableContentRef.current.style.transition = 'transform 0.3s ease-out';
    }

    if (translateX < -DELETE_BUTTON_WIDTH_PX * SWIPE_THRESHOLD_RATIO) {
      setTranslateX(-DELETE_BUTTON_WIDTH_PX); // Snap open
    } else {
      setTranslateX(0); // Snap closed
    }
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If swiped open, clicking content should close it without toggling selection.
    if (translateX !== 0) {
      e.stopPropagation(); // Prevent checkbox toggle or other interactions on content
      setTranslateX(0);
    }
  };
  
  const handleDelete = () => {
    onDeleteItem(item.id);
    // The item will be removed from the list, so no need to manually reset translateX for this specific item.
  };

  return (
    <div className="relative bg-card overflow-hidden">
      {/* Delete Button - Sits behind the swipeable content */}
      <div className="absolute top-0 right-0 h-full w-20 flex items-center justify-center bg-destructive text-destructive-foreground z-0">
        <button
          onClick={handleDelete}
          className="p-4 h-full w-full flex items-center justify-center"
          aria-label={`Delete item ${item.name}`}
        >
          <Trash2 size={24} />
        </button>
      </div>

      {/* Swipeable Content Wrapper - This is what moves */}
      <div
        ref={swipeableContentRef}
        className={cn("relative z-10", item.selected ? 'bg-muted' : 'bg-card')}
        style={{ transform: `translateX(${translateX}px)`, transition: isSwiping ? 'none' : 'transform 0.3s ease-out' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleContentClick}
      >
        {/* Actual product content - Checkbox, Image, Text, QuantitySelector */}
        <div className={`flex items-center p-3 sm:p-4 space-x-3 sm:space-x-4`}>
          <Checkbox
            id={`item-${item.id}`}
            checked={item.selected}
            onCheckedChange={(checked) => {
                if (translateX === 0) { // Only allow select/deselect if not swiped
                    onSelectToggle(item.id, Boolean(checked));
                }
            }}
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
              <Badge 
                variant="outline" 
                className="bg-accent text-accent-foreground text-xs mt-1 px-1.5 py-0.5"
              >
                {displayVariant}
              </Badge>
            )}
            {item.stock !== undefined && item.stock > 0 && item.stock <= 5 && (
              <p className="text-xs text-foreground mt-1">Chỉ còn {item.stock}</p>
            )}
            <div className="flex items-baseline space-x-2 mt-1">
              <p className="text-sm font-bold text-foreground">{item.price.toLocaleString('vi-VN')}₫</p>
              {item.originalPrice && (
                <p className="text-xs text-muted-foreground line-through">{item.originalPrice.toLocaleString('vi-VN')}₫</p>
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
      </div>
    </div>
  );
};

export default ProductItem;
