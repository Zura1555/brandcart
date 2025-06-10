
// @ts-nocheck
"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { CartItem, SimpleVariant } from '@/interfaces';
import QuantitySelector from './QuantitySelector';
import { Check, Trash2, ChevronDown, Minus, Plus } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductItemProps {
  item: CartItem;
  onSelectToggle: (itemId: string, checked: boolean) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onDeleteItem: (itemId: string) => void;
  onVariantChange: (itemId: string, newVariantData: SimpleVariant) => void;
}

const DELETE_BUTTON_WIDTH_PX = 80; 
const SWIPE_THRESHOLD_RATIO = 0.3; 

const ProductItem: React.FC<ProductItemProps> = ({ item, onSelectToggle, onQuantityChange, onDeleteItem, onVariantChange }) => {
  const { t } = useLanguage();
  const displayVariant = item.variant ? item.variant.replace(/\s*\(\+\d+\)\s*$/, '') : '';

  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartXRef = useRef(0);
  const initialTranslateXRef = useRef(0);
  const swipeableContentRef = useRef<HTMLDivElement>(null);

  const [isVariantSheetOpen, setIsVariantSheetOpen] = useState(false);
  
  const cleanVariantName = (name: string | undefined): string => {
    if (!name) return '';
    return name.replace(/\s*\(\+\d+\)\s*$/, '');
  };

  const parseVariantName = (name: string | undefined): { color: string | null, size: string | null } => {
    if (!name) return { color: null, size: null };
    const cleanedName = cleanVariantName(name);
    const parts = cleanedName.split(',').map(p => p.trim());
    if (parts.length === 2) {
      return { color: parts[0] || null, size: parts[1] || null };
    }
    // Try to intelligently guess if it's a color or size based on common terms or patterns
    // This is a simplification; a more robust system would have structured variant data
    const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42'];
    if (commonSizes.includes(parts[0])) {
        return { color: null, size: parts[0]};
    }
    return { color: parts[0] || null, size: null };
  };
  
  const [tempSelectedColorName, setTempSelectedColorName] = useState<string | null>(null);
  const [tempSelectedSizeValue, setTempSelectedSizeValue] = useState<string | null>(null);

  useEffect(() => {
    if (isVariantSheetOpen) {
      const currentParsed = parseVariantName(item.variant);
      setTempSelectedColorName(currentParsed.color);
      setTempSelectedSizeValue(currentParsed.size);
    }
  }, [isVariantSheetOpen, item.variant]);

  const uniqueColors = useMemo(() => {
    if (!item.availableVariants) return [];
    const colors = new Set<string>();
    item.availableVariants.forEach(v => {
      const parsed = parseVariantName(v.name);
      if (parsed.color) colors.add(parsed.color);
    });
    return Array.from(colors);
  }, [item.availableVariants]);

  const allPossibleSizes = useMemo(() => {
     if (!item.availableVariants) return [];
    const sizes = new Set<string>();
    item.availableVariants.forEach(v => {
      const parsed = parseVariantName(v.name);
      if (parsed.size) sizes.add(parsed.size);
    });
    return Array.from(sizes).sort((a, b) => { // Basic sort, might need refinement for numeric vs. S/M/L
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        const aIndex = sizeOrder.indexOf(a);
        const bIndex = sizeOrder.indexOf(b);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.localeCompare(b);
    });
  }, [item.availableVariants]);

  const availableSizesForSelectedColor = useMemo(() => {
    if (!tempSelectedColorName || !item.availableVariants) {
      // If no color selected, or no variants, make all unique sizes appear "available" for UI rendering
      // but they might become disabled if a color is subsequently picked that doesn't have them.
      // Or, if the product only has size variants (no color distinction in names)
      if (uniqueColors.length === 0 && allPossibleSizes.length > 0) return new Set(allPossibleSizes);
      return new Set<string>();
    }
    const sizes = new Set<string>();
    item.availableVariants.forEach(v => {
      const parsed = parseVariantName(v.name);
      if (parsed.color === tempSelectedColorName && parsed.size) {
        sizes.add(parsed.size);
      }
    });
    return sizes;
  }, [tempSelectedColorName, item.availableVariants, allPossibleSizes, uniqueColors]);
  
  const getVariantFromSelection = (color: string | null, size: string | null): SimpleVariant | undefined => {
    if (!item.availableVariants) return undefined;
    return item.availableVariants.find(v => {
      const parsed = parseVariantName(v.name);
      const colorMatch = !color || parsed.color === color; // No color selected means any color matches (e.g. size-only variants)
      const sizeMatch = !size || parsed.size === size;     // No size selected means any size matches (e.g. color-only variants)
      
      if (uniqueColors.length > 0 && allPossibleSizes.length > 0) { // Both color and size matter
        return parsed.color === color && parsed.size === size;
      } else if (uniqueColors.length > 0) { // Only color matters
        return parsed.color === color;
      } else if (allPossibleSizes.length > 0) { // Only size matters
        return parsed.size === size;
      }
      return false; // Should not happen if variants exist
    });
  };

  const { currentPrice, currentImageUrl } = useMemo(() => {
    const selectedVariant = getVariantFromSelection(tempSelectedColorName, tempSelectedSizeValue);
    return {
      currentPrice: selectedVariant?.price ?? item.price,
      currentImageUrl: selectedVariant?.imageUrl ?? item.imageUrl,
    };
  }, [tempSelectedColorName, tempSelectedSizeValue, item, getVariantFromSelection]);


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
    const finalSelectedVariant = getVariantFromSelection(tempSelectedColorName, tempSelectedSizeValue);
    if (finalSelectedVariant) {
      onVariantChange(item.id, finalSelectedVariant);
    } else {
      console.warn("No matching variant found for selection:", tempSelectedColorName, tempSelectedSizeValue);
    }
    setIsVariantSheetOpen(false);
  };
  
  const hasAvailableVariants = item.availableVariants && item.availableVariants.length > 0;
  const canConfirmSelection = !!getVariantFromSelection(tempSelectedColorName, tempSelectedSizeValue);


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
                  <SheetContent side="bottom" className="rounded-t-lg p-0 flex flex-col max-h-[85vh] sm:max-h-[80vh]">
                    <SheetHeader className="p-4 border-b sticky top-0 bg-card z-10">
                       <SheetTitle className="text-lg text-center font-semibold">{t('cart.sheet.productInfoTitle')}</SheetTitle>
                    </SheetHeader>

                    <ScrollArea className="flex-grow">
                      <div className="p-4 space-y-5">
                        {/* Product Info Section */}
                        <div className="flex items-start space-x-3">
                          <Image
                            src={currentImageUrl}
                            alt={item.name} // Alt should be descriptive
                            width={88}
                            height={88}
                            className="rounded-md object-cover w-20 h-20 sm:w-24 sm:h-24 border flex-shrink-0"
                            data-ai-hint={item.dataAiHint || "product image"}
                          />
                          <div className="flex-grow min-w-0">
                            {item.brand && <p className="text-sm font-semibold text-foreground">{item.brand}</p>}
                            <p className="text-sm text-foreground mt-0.5 line-clamp-2">{item.name}</p>
                            <p className="text-lg font-bold text-foreground mt-1">{currentPrice.toLocaleString('vi-VN')}₫</p>
                            <div className="flex items-center space-x-2 text-lg text-foreground mt-2">
                              <Button variant="outline" size="icon" className="h-7 w-7 opacity-50 cursor-not-allowed" disabled><Minus className="h-4 w-4" /></Button>
                              <span className="font-semibold tabular-nums">{item.quantity}</span>
                              <Button variant="outline" size="icon" className="h-7 w-7 opacity-50 cursor-not-allowed" disabled><Plus className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Color Section */}
                        {uniqueColors.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground">{t('cart.sheet.selectColor')}</p>
                            <div className="flex space-x-2 overflow-x-auto pb-2 -mb-2">
                              {uniqueColors.map(color => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => {
                                    setTempSelectedColorName(color);
                                    // If product has both colors and sizes, reset size when color changes.
                                    if (allPossibleSizes.length > 0) setTempSelectedSizeValue(null);
                                  }}
                                  className={cn(
                                    "rounded border p-0.5 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background",
                                    tempSelectedColorName === color ? "border-foreground border-2" : "border-muted hover:border-muted-foreground"
                                  )}
                                  aria-label={color}
                                >
                                  <Image
                                    src={`https://placehold.co/56x56.png`} // Placeholder for color swatch
                                    alt={color}
                                    width={56}
                                    height={56}
                                    className="rounded-sm object-cover"
                                    data-ai-hint={color.toLowerCase()}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Size Section */}
                        {allPossibleSizes.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground">{t('cart.sheet.selectSize')}</p>
                            <div className="flex flex-wrap gap-2">
                              {allPossibleSizes.map(size => {
                                const isAvailable = uniqueColors.length === 0 || (tempSelectedColorName && availableSizesForSelectedColor.has(size)) || (!tempSelectedColorName && item.availableVariants?.some(v => parseVariantName(v.name).size === size));
                                return (
                                  <Button
                                    key={size}
                                    type="button"
                                    variant={tempSelectedSizeValue === size && isAvailable ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                      if (isAvailable) setTempSelectedSizeValue(size);
                                    }}
                                    disabled={!isAvailable}
                                    className={cn(
                                      "px-4 py-2 h-auto text-sm rounded",
                                      tempSelectedSizeValue === size && isAvailable ? "bg-foreground text-accent-foreground hover:bg-foreground/90" : "border-input text-foreground hover:bg-muted",
                                      !isAvailable && "bg-muted/50 text-muted-foreground opacity-70 cursor-not-allowed hover:bg-muted/50"
                                    )}
                                  >
                                    {size}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                         {(uniqueColors.length === 0 && allPossibleSizes.length === 0) && (
                            <p className="text-sm text-muted-foreground">{t('cart.sheet.noVariantsAvailable')}</p>
                         )}
                      </div>
                    </ScrollArea>

                    <SheetFooter className="p-4 border-t sticky bottom-0 bg-card z-10">
                      <Button onClick={handleConfirmVariant} className="w-full bg-foreground hover:bg-foreground/90 text-accent-foreground text-base py-3 h-auto" disabled={!canConfirmSelection}>
                        {t('cart.sheet.updateButton')}
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

