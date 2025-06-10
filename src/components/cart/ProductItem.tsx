
// @ts-nocheck
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { CartItem, SimpleVariant } from '@/interfaces';
import QuantitySelector from './QuantitySelector';
import { Check, Trash2, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProductItemProps {
  item: CartItem;
  onSelectToggle: (itemId: string, checked: boolean) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onDeleteItem: (itemId: string) => void;
}

const DELETE_BUTTON_WIDTH_PX = 80; 
const SWIPE_THRESHOLD_RATIO = 0.3; 

const ProductItem: React.FC<ProductItemProps> = ({ item, onSelectToggle, onQuantityChange, onDeleteItem }) => {
  const displayVariant = item.variant ? item.variant.replace(/\s*\(\+\d+\)\s*$/, '') : '';

  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartXRef = useRef(0);
  const initialTranslateXRef = useRef(0);
  const swipeableContentRef = useRef<HTMLDivElement>(null);

  const [isVariantSheetOpen, setIsVariantSheetOpen] = useState(false);
  const [tempSelectedVariantId, setTempSelectedVariantId] = useState<string | undefined>(
    item.availableVariants?.find(v => v.name === item.variant)?.id || item.availableVariants?.[0]?.id
  );
  
  useEffect(() => {
    // Reset tempSelectedVariantId when the sheet opens, based on current item.variant
    if (isVariantSheetOpen) {
      const currentVar = item.availableVariants?.find(v => v.name === item.variant);
      setTempSelectedVariantId(currentVar?.id || item.availableVariants?.[0]?.id);
    }
  }, [isVariantSheetOpen, item.variant, item.availableVariants]);


  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 1) return; 
    touchStartXRef.current = e.touches[0].clientX;
    initialTranslateXRef.current = translateX;
    setIsSwiping(true);
    if (swipeableContentRef.current) {
      swipeableContentRef.current.style.transition = 'none'; 
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwiping || e.touches.length > 1) return;
    const currentX = e.touches[0].clientX;
    let diffX = currentX - touchStartXRef.current;

    if (initialTranslateXRef.current + diffX > 0) {
      diffX = -initialTranslateXRef.current;
    }
    if (initialTranslateXRef.current + diffX < -DELETE_BUTTON_WIDTH_PX) {
      diffX = -DELETE_BUTTON_WIDTH_PX - initialTranslateXRef.current;
    }
    
    let newTranslateX = initialTranslateXRef.current + diffX;
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
      setTranslateX(-DELETE_BUTTON_WIDTH_PX); 
    } else {
      setTranslateX(0); 
    }
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (translateX !== 0) {
      e.stopPropagation(); 
      setTranslateX(0);
    }
  };
  
  const handleDelete = () => {
    onDeleteItem(item.id);
  };

  const handleConfirmVariant = () => {
    // In a real app, you'd call a prop function here to update the cart item in the parent state
    // e.g., onVariantChange(item.cartItemId, tempSelectedVariantId);
    const selectedVariantDetails = item.availableVariants?.find(v => v.id === tempSelectedVariantId);
    console.log(`Variant confirmed for item ${item.id}: ${tempSelectedVariantId} (${selectedVariantDetails?.name})`);
    // For now, we just close the sheet. The actual cart update is a next step.
    setIsVariantSheetOpen(false);
  };
  
  const hasAvailableVariants = item.availableVariants && item.availableVariants.length > 0;

  return (
    <div className="relative bg-card overflow-hidden">
      <div className="absolute top-0 right-0 h-full w-20 flex items-center justify-center bg-destructive text-destructive-foreground z-0">
        <button
          onClick={handleDelete}
          className="p-4 h-full w-full flex items-center justify-center"
          aria-label={`Delete item ${item.name}`}
        >
          <Trash2 size={24} />
        </button>
      </div>

      <div
        ref={swipeableContentRef}
        className={cn("relative z-10", item.selected ? 'bg-muted' : 'bg-card')}
        style={{ transform: `translateX(${translateX}px)`, transition: isSwiping ? 'none' : 'transform 0.3s ease-out' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleContentClick}
      >
        <div className={`flex items-center p-3 sm:p-4 space-x-3 sm:space-x-4`}>
          <Checkbox
            id={`item-${item.id}`}
            checked={item.selected}
            onCheckedChange={(checked) => {
                if (translateX === 0) { 
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
              hasAvailableVariants ? (
                <Sheet open={isVariantSheetOpen} onOpenChange={setIsVariantSheetOpen}>
                  <SheetTrigger asChild>
                    <button type="button" className="text-left block hover:opacity-80 transition-opacity focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                      <Badge
                        className="bg-green-600 hover:bg-green-600 text-white text-xs mt-1 px-1.5 py-0.5 inline-flex items-center cursor-pointer"
                      >
                        {displayVariant}
                        <ChevronDown className="w-3 h-3 ml-1 opacity-80 flex-shrink-0" />
                      </Badge>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-lg p-0 flex flex-col max-h-[75vh]">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle className="text-base">Select Variant for: {item.name}</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-grow p-4">
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Currently selected: <span className="font-medium text-foreground">{item.variant || 'N/A'}</span>
                        </p>
                        {item.availableVariants && item.availableVariants.length > 0 ? (
                          <>
                            <p className="text-sm font-medium text-foreground pt-2">Available options:</p>
                            <RadioGroup 
                              value={tempSelectedVariantId} 
                              onValueChange={setTempSelectedVariantId}
                              className="space-y-2"
                            >
                              {item.availableVariants.map((variantOpt: SimpleVariant) => (
                                <Label 
                                  key={variantOpt.id} 
                                  htmlFor={`variant-${item.id}-${variantOpt.id}`}
                                  className={cn(
                                    "flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-muted/50",
                                    tempSelectedVariantId === variantOpt.id && "bg-muted border-primary ring-1 ring-primary"
                                  )}
                                >
                                  <RadioGroupItem 
                                    value={variantOpt.id} 
                                    id={`variant-${item.id}-${variantOpt.id}`}
                                    className="shrink-0"
                                  />
                                  <span className="text-sm text-foreground">{variantOpt.name}</span>
                                </Label>
                              ))}
                            </RadioGroup>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">No other variants available for this item.</p>
                        )}
                      </div>
                    </ScrollArea>
                    <SheetFooter className="p-4 border-t sticky bottom-0 bg-card">
                      <SheetClose asChild>
                        <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                      </SheetClose>
                      <Button onClick={handleConfirmVariant} className="w-full sm:w-auto bg-foreground hover:bg-foreground/90 text-accent-foreground">
                        Confirm
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              ) : (
                <Badge
                  className="bg-green-600 hover:bg-green-600 text-white text-xs mt-1 px-1.5 py-0.5"
                >
                  {displayVariant}
                </Badge>
              )
            )}

            {item.stock !== undefined && item.stock > 0 && item.stock <= 5 && (
              <p className="text-xs text-destructive mt-1">Chỉ còn {item.stock}</p>
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
