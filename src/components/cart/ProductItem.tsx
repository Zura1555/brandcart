
// @ts-nocheck
"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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

  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartXRef = useRef(0);
  const initialTranslateXRef = useRef(0);
  const swipeableContentRef = useRef<HTMLDivElement>(null);

  const [isVariantSheetOpen, setIsVariantSheetOpen] = useState(false);

  const cleanVariantName = useCallback((name: string | undefined): string => {
    if (!name) return '';
    return name.replace(/\s*\(\+\d+\)\s*$/, '');
  }, []);

  const parseVariantName = useCallback((name: string | undefined): { color: string | null, size: string | null } => {
    if (!name) return { color: null, size: null };
    const cleanedName = cleanVariantName(name);
    const parts = cleanedName.split(',').map(p => p.trim());
    if (parts.length === 2) {
      return { color: parts[0] || null, size: parts[1] || null };
    }
    const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42'];
    if (commonSizes.includes(parts[0]?.toUpperCase())) {
        return { color: null, size: parts[0]};
    }
    return { color: parts[0] || null, size: null };
  }, [cleanVariantName]);

  const [tempSelectedColorName, setTempSelectedColorName] = useState<string | null>(null);
  const [tempSelectedSizeValue, setTempSelectedSizeValue] = useState<string | null>(null);

  useEffect(() => {
    if (isVariantSheetOpen) {
      const currentParsed = parseVariantName(item.variant);
      setTempSelectedColorName(currentParsed.color);
      setTempSelectedSizeValue(currentParsed.size);
    }
  }, [isVariantSheetOpen, item.variant, parseVariantName]);

  const uniqueColors = useMemo(() => {
    if (!item.availableVariants) return [];
    const colors = new Set<string>();
    item.availableVariants.forEach(v => {
      const parsed = parseVariantName(v.name);
      if (parsed.color) colors.add(parsed.color);
    });
    return Array.from(colors);
  }, [item.availableVariants, parseVariantName]);

  const allPossibleSizes = useMemo(() => {
     if (!item.availableVariants) return [];
    const sizes = new Set<string>();
    item.availableVariants.forEach(v => {
      const parsed = parseVariantName(v.name);
      if (parsed.size) sizes.add(parsed.size);
    });
    return Array.from(sizes).sort((a, b) => {
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        const aIndex = sizeOrder.indexOf(a.toUpperCase());
        const bIndex = sizeOrder.indexOf(b.toUpperCase());
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        try {
          const aNum = parseInt(a);
          const bNum = parseInt(b);
          if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        } catch (e) { /* ignore if not numeric */ }
        return a.localeCompare(b);
    });
  }, [item.availableVariants, parseVariantName]);

  const getVariantFromSelection = useCallback((color: string | null, size: string | null): SimpleVariant | undefined => {
    if (!item.availableVariants) return undefined;
    return item.availableVariants.find(v => {
      const parsedV = parseVariantName(v.name);
      // Match color: either no color is part of selection criteria, or it matches.
      const colorMatch = (uniqueColors.length === 0 || !color) || parsedV.color === color;
      // Match size: either no size is part of selection criteria, or it matches.
      const sizeMatch = (allPossibleSizes.length === 0 || !size) || parsedV.size === size;

      if (uniqueColors.length > 0 && allPossibleSizes.length > 0) {
        return parsedV.color === color && parsedV.size === size;
      } else if (uniqueColors.length > 0) {
        return parsedV.color === color;
      } else if (allPossibleSizes.length > 0) {
        return parsedV.size === size;
      }
      // If a product has NO variants defined with color OR size (e.g. a single-variant product listed in availableVariants)
      if (uniqueColors.length === 0 && allPossibleSizes.length === 0 && item.availableVariants?.length === 1) {
        return true; // Match the only variant
      }
      return false;
    });
  }, [item.availableVariants, parseVariantName, uniqueColors.length, allPossibleSizes.length]);

  const selectedVariantInSheet = useMemo(() => {
    return getVariantFromSelection(tempSelectedColorName, tempSelectedSizeValue);
  }, [tempSelectedColorName, tempSelectedSizeValue, getVariantFromSelection]);

  const currentDisplayDetails = useMemo(() => {
    return {
      price: selectedVariantInSheet?.price ?? item.price,
      imageUrl: selectedVariantInSheet?.imageUrl ?? item.imageUrl,
      stock: selectedVariantInSheet?.stock, // Can be undefined if variant or its stock is not defined
      originalPrice: selectedVariantInSheet?.originalPrice ?? item.originalPrice,
      dataAiHint: selectedVariantInSheet?.dataAiHint ?? item.dataAiHint,
    };
  }, [selectedVariantInSheet, item.price, item.imageUrl, item.originalPrice, item.dataAiHint]);
  
  const availableSizesForSelectedColor = useMemo(() => {
    if (!item.availableVariants) return new Set<string>();
    // If no color is selected, or if the product primarily varies by size (no distinct colors)
    if (uniqueColors.length === 0 || !tempSelectedColorName) {
      const sizes = new Set<string>();
      item.availableVariants.forEach(v => {
        const parsed = parseVariantName(v.name);
        if (parsed.size) sizes.add(parsed.size);
      });
      return sizes;
    }

    // If a color is selected
    const sizes = new Set<string>();
    item.availableVariants.forEach(v => {
      const parsed = parseVariantName(v.name);
      if (parsed.color === tempSelectedColorName && parsed.size) {
        sizes.add(parsed.size);
      }
    });
    return sizes;
  }, [tempSelectedColorName, item.availableVariants, parseVariantName, uniqueColors.length]);


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
    if (selectedVariantInSheet) {
      // The check for stock > 0 is handled by the button's disabled state
      onVariantChange(item.id, selectedVariantInSheet);
    }
    setIsVariantSheetOpen(false);
  };

  const hasAvailableVariants = item.availableVariants && item.availableVariants.length > 0;
  
  // Determine if the "Update" button should be enabled
  const canConfirmSelection = !!selectedVariantInSheet && (selectedVariantInSheet.stock === undefined || selectedVariantInSheet.stock > 0);

  const displayVariantNameInBadge = cleanVariantName(item.variant);

  // Stock status display logic
  let stockStatusText = '';
  let stockStatusClasses = 'text-sm font-medium ';

  if (currentDisplayDetails.stock !== undefined) {
    if (currentDisplayDetails.stock > 10) {
      stockStatusText = t('cart.sheet.stock.inStock');
      stockStatusClasses += 'text-green-600';
    } else if (currentDisplayDetails.stock > 0) {
      stockStatusText = t('cart.sheet.stock.remaining', { count: currentDisplayDetails.stock });
      stockStatusClasses += 'text-orange-600';
    } else {
      stockStatusText = t('cart.sheet.stock.outOfStock');
      stockStatusClasses += 'text-destructive';
    }
  } else {
    // Fallback if stock is undefined (e.g. product doesn't track stock, or variant doesn't have specific stock)
    // Depending on business logic, this could also be "In stock" or hidden.
    // For now, let's assume undefined means we don't show specific status or treat as "In stock" by default if not explicitly 0.
    // If you want to treat undefined as out of stock:
    // stockStatusText = t('cart.sheet.stock.outOfStock');
    // stockStatusClasses += 'text-destructive';
  }


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

            {displayVariantNameInBadge && (
              hasAvailableVariants ? (
                <Sheet open={isVariantSheetOpen} onOpenChange={setIsVariantSheetOpen}>
                  <SheetTrigger asChild>
                    <button type="button" className="text-left block hover:opacity-80 transition-opacity focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                      <Badge
                        className="bg-green-600 hover:bg-green-600 text-white text-xs mt-1 px-1.5 py-0.5 inline-flex items-center cursor-pointer"
                      >
                        {displayVariantNameInBadge}
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
                        <div className="flex items-start space-x-3">
                          <Image
                            src={currentDisplayDetails.imageUrl}
                            alt={item.name}
                            width={88}
                            height={88}
                            className="rounded-md object-cover w-20 h-20 sm:w-24 sm:h-24 border flex-shrink-0"
                            data-ai-hint={currentDisplayDetails.dataAiHint || "product image"}
                          />
                          <div className="flex-grow min-w-0">
                            {item.brand && <p className="text-sm font-semibold text-foreground">{item.brand}</p>}
                            <p className="text-sm text-foreground mt-0.5 line-clamp-2">{item.name}</p>
                            <div className="flex items-baseline space-x-2 mt-1">
                                <p className="text-lg font-bold text-foreground">{currentDisplayDetails.price.toLocaleString('vi-VN')}₫</p>
                                {stockStatusText && (
                                  <>
                                    <span className="text-sm text-muted-foreground">|</span>
                                    <span className={stockStatusClasses}>{stockStatusText}</span>
                                  </>
                                )}
                            </div>
                            <div className="flex items-center space-x-2 text-lg text-foreground mt-2">
                              <Button variant="outline" size="icon" className="h-7 w-7 opacity-50 cursor-not-allowed" disabled><Minus className="h-4 w-4" /></Button>
                              <span className="font-semibold tabular-nums">{item.quantity}</span>
                              <Button variant="outline" size="icon" className="h-7 w-7 opacity-50 cursor-not-allowed" disabled><Plus className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        </div>

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
                                    if (allPossibleSizes.length > 0) setTempSelectedSizeValue(null);
                                  }}
                                  className={cn(
                                    "rounded border p-0.5 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background",
                                    tempSelectedColorName === color ? "border-foreground border-2" : "border-muted hover:border-muted-foreground"
                                  )}
                                  aria-label={color}
                                >
                                  <Image
                                    src={`https://placehold.co/56x56.png`}
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

                        {allPossibleSizes.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground">{t('cart.sheet.selectSize')}</p>
                            <div className="flex flex-wrap gap-2">
                              {allPossibleSizes.map(size => {
                                const variantForThisSize = getVariantFromSelection(tempSelectedColorName, size);
                                const isSizeAvailableForColor = availableSizesForSelectedColor.has(size);
                                const isSizeInStock = variantForThisSize ? (variantForThisSize.stock === undefined || variantForThisSize.stock > 0) : true;
                                const isSizeDisabled = !isSizeAvailableForColor || !isSizeInStock;
                                
                                return (
                                  <Button
                                    key={size}
                                    type="button"
                                    variant={tempSelectedSizeValue === size && !isSizeDisabled ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                      if (!isSizeDisabled) setTempSelectedSizeValue(size);
                                    }}
                                    disabled={isSizeDisabled}
                                    className={cn(
                                      "px-4 py-2 h-auto text-sm rounded",
                                      tempSelectedSizeValue === size && !isSizeDisabled ? "bg-foreground text-accent-foreground hover:bg-foreground/90" : "border-input text-foreground hover:bg-muted",
                                      isSizeDisabled && "bg-muted/50 text-muted-foreground opacity-70 cursor-not-allowed hover:bg-muted/50"
                                    )}
                                  >
                                    {size}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                         {(uniqueColors.length === 0 && allPossibleSizes.length === 0 && item.availableVariants && item.availableVariants.length > 1) && (
                            // This case implies variants exist but are not structured as color/size. Could list them directly.
                            <p className="text-sm text-muted-foreground">{t('cart.sheet.complexVariants')}</p>
                         )}
                         {(!item.availableVariants || item.availableVariants.length === 0 || (item.availableVariants.length === 1 && !uniqueColors.length && !allPossibleSizes.length)) && (
                            <p className="text-sm text-muted-foreground">{t('cart.sheet.noOtherVariants')}</p>
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
                  {displayVariantNameInBadge}
                </Badge>
              )
            )}

            {item.stock !== undefined && item.stock > 0 && item.stock <= 5 && !isVariantSheetOpen && ( // Only show if sheet is NOT open
              <p className="text-xs text-destructive mt-1">{t('cart.sheet.stock.remaining', { count: item.stock })}</p>
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
