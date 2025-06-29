
// @ts-nocheck
"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { CartItem, SimpleVariant, Product } from '@/interfaces';
import QuantitySelector from './QuantitySelector';
import { Check, Trash2, ChevronDown, Minus, Plus, X, Ruler } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";


interface ProductItemProps {
  item: CartItem;
  onSelectToggle: (cartItemId: string, checked: boolean) => void;
  onQuantityChange: (cartItemId: string, quantity: number) => void;
  onDeleteItem: (cartItemId: string) => void;
  onVariantChange: (cartItemId: string, newVariantData: SimpleVariant) => void;
}

const DELETE_BUTTON_WIDTH_PX = 80;
const SWIPE_THRESHOLD_RATIO = 0.3;

const ProductItem: React.FC<ProductItemProps> = ({ item, onSelectToggle, onQuantityChange, onDeleteItem, onVariantChange }) => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartXRef = useRef(0);
  const initialTranslateXRef = useRef(0);
  const swipeableContentRef = useRef<HTMLDivElement>(null);

  const [isVariantSheetOpen, setIsVariantSheetOpen] = useState(false);
  const [isSizeGuideDialogOpen, setIsSizeGuideDialogOpen] = useState(false);
  

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
    const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', 'Freesize'];
    if (parts[0] && commonSizes.some(s => parts[0].toUpperCase() === s.toUpperCase())) {
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
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Freesize'];
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
      const colorMatch = (uniqueColors.length === 0 || !color) || parsedV.color === color;
      const sizeMatch = (allPossibleSizes.length === 0 || !size) || parsedV.size === size;

      if (uniqueColors.length > 0 && allPossibleSizes.length > 0) {
        return parsedV.color === color && parsedV.size === size;
      } else if (uniqueColors.length > 0) {
        return parsedV.color === color;
      } else if (allPossibleSizes.length > 0) {
        return parsedV.size === size;
      }
      if (uniqueColors.length === 0 && allPossibleSizes.length === 0 && item.availableVariants?.length === 1) {
        return true; 
      }
      return false;
    });
  }, [item.availableVariants, parseVariantName, uniqueColors.length, allPossibleSizes.length]);

  const selectedVariantInSheet = useMemo(() => {
    return getVariantFromSelection(tempSelectedColorName, tempSelectedSizeValue);
  }, [tempSelectedColorName, tempSelectedSizeValue, getVariantFromSelection]);

  const currentDisplayDetailsInSheet = useMemo(() => {
    return {
      price: selectedVariantInSheet?.price ?? item.price,
      imageUrl: selectedVariantInSheet?.imageUrl ?? item.imageUrl,
      stock: selectedVariantInSheet?.stock,
      originalPrice: selectedVariantInSheet?.originalPrice ?? item.originalPrice,
      dataAiHint: selectedVariantInSheet?.dataAiHint ?? item.dataAiHint,
    };
  }, [selectedVariantInSheet, item.price, item.imageUrl, item.originalPrice, item.dataAiHint, item.stock]);
  
  const allImageUrls = useMemo(() => {
    const urls = new Set<string>();
    
    // Always add the current item's image first if its color matches the selected color, or if no color is selected yet.
    const currentParsedColor = parseVariantName(item.variant).color;
    if (item.imageUrl && (!tempSelectedColorName || currentParsedColor === tempSelectedColorName)) {
      urls.add(item.imageUrl);
    }
    
    const variantsForSelectedColor = item.availableVariants?.filter(v => {
        if (!tempSelectedColorName) return true; // Show all if no color selected yet
        const parsed = parseVariantName(v.name);
        return parsed.color === tempSelectedColorName;
    }) || [];
    
    variantsForSelectedColor.forEach(v => {
        if (v.imageUrl) urls.add(v.imageUrl);
    });

    // If after all that, the cart item's image wasn't added (e.g., color changed), add it again to be safe.
    if (item.imageUrl && !urls.has(item.imageUrl) && (!tempSelectedColorName || currentParsedColor === tempSelectedColorName)) {
        const urlArray = Array.from(urls);
        urlArray.unshift(item.imageUrl);
        return urlArray;
    }

    if (urls.size === 0 && item.imageUrl) {
        urls.add(item.imageUrl);
    }

    return Array.from(urls);
  }, [item.availableVariants, item.imageUrl, item.variant, tempSelectedColorName, parseVariantName]);
  
  const availableSizesForSelectedColor = useMemo(() => {
    if (!item.availableVariants) return new Set<string>();
    if (uniqueColors.length === 0 || !tempSelectedColorName) {
      const sizes = new Set<string>();
      item.availableVariants.forEach(v => {
        const parsed = parseVariantName(v.name);
        if (parsed.size) sizes.add(parsed.size);
      });
      return sizes;
    }

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
    onDeleteItem(item.cartItemId);
  };

  const handleConfirmVariant = () => {
    if (selectedVariantInSheet) {
      onVariantChange(item.cartItemId, selectedVariantInSheet);
    }
    setIsVariantSheetOpen(false);
  };
  
  const canConfirmSelection = !!selectedVariantInSheet && (selectedVariantInSheet.stock === undefined || selectedVariantInSheet.stock > 0);
  
  const { color: parsedColorFromVariant, size: parsedSizeFromVariant } = parseVariantName(item.variant);

  let displayColor = parsedColorFromVariant || "N/A";
  let displaySize = parsedSizeFromVariant;
  let displayCode = item.productCode || "N/A";

  if (!displaySize) { 
    if (item.availableVariants && allPossibleSizes.length > 0) {
      displaySize = allPossibleSizes[0]; 
    } else {
      displaySize = "M"; 
    }
  }
  
  const badgeDisplayString = [displayColor, displaySize, displayCode]
    .filter(part => part !== "N/A" || (displayColor !== "N/A" || displaySize !== "M" || displayCode !== "N/A")) 
    .join(" / ");
  
  const showSelectVariantPlaceholder = item.availableVariants && !parsedColorFromVariant && !parsedSizeFromVariant && !item.productCode;


  let stockStatusTextInSheet = '';
  let stockStatusClassesInSheet = 'text-xs font-medium ';

  if (currentDisplayDetailsInSheet.stock !== undefined) {
    if (currentDisplayDetailsInSheet.stock > 10) {
      stockStatusTextInSheet = t('cart.sheet.stock.inStock');
      stockStatusClassesInSheet += 'text-green-600';
    } else if (currentDisplayDetailsInSheet.stock > 0) {
      stockStatusTextInSheet = t('cart.sheet.stock.remaining', { count: currentDisplayDetailsInSheet.stock });
      stockStatusClassesInSheet += 'text-orange-600';
    } else {
      stockStatusTextInSheet = t('cart.sheet.stock.outOfStock');
      stockStatusClassesInSheet += 'text-destructive';
    }
  }

  let itemCardStockStatusText = '';
  let itemCardStockStatusClasses = 'text-xs '; 

  if (item.stock !== undefined) {
    if (item.stock > 10) {
      itemCardStockStatusText = t('cart.sheet.stock.inStock');
      itemCardStockStatusClasses += 'text-green-600';
    } else if (item.stock > 0) {
      itemCardStockStatusText = t('cart.sheet.stock.remaining', { count: item.stock });
      itemCardStockStatusClasses += 'text-orange-600';
    } else {
      itemCardStockStatusText = t('cart.sheet.stock.outOfStock');
      itemCardStockStatusClasses += 'text-destructive';
    }
  }
  
  const isOutOfStock = item.stock === 0;

  return (
    <div className="relative bg-card overflow-hidden">
      <div
        className={cn(
          "absolute top-0 right-0 h-full w-20 flex items-center justify-center bg-destructive text-destructive-foreground z-0 transition-opacity duration-200 ease-out",
          isOutOfStock && translateX === 0 ? "opacity-0" : "opacity-100"
        )}
      >
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
        className={cn(
          "relative z-10", 
          item.selected && !isOutOfStock ? 'bg-muted' : 'bg-card',
          isOutOfStock && "opacity-60"
        )}
        style={{ transform: `translateX(${translateX}px)`, transition: isSwiping ? 'none' : 'transform 0.3s ease-out' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleContentClick}
      >
        <div className={`flex items-start p-3 sm:p-4 space-x-3 sm:space-x-4`}>
          <Checkbox
            id={`item-${item.cartItemId}`}
            checked={item.selected}
            disabled={isOutOfStock}
            onCheckedChange={(checked) => {
                if (translateX === 0 && !isOutOfStock) {
                    onSelectToggle(item.cartItemId, Boolean(checked));
                }
            }}
            className="shrink-0 mt-1" 
            aria-label={`Select item ${item.name}`}
          />
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={96} 
            height={96}
            className="rounded-md object-cover w-24 h-24 shrink-0 border"
            data-ai-hint={item.dataAiHint}
            priority={false}
            sizes="96px"
          />
          <div className="flex-grow min-w-0">
            <h3 className="font-body font-semibold text-sm sm:text-md text-foreground truncate" title={item.name}>{item.name}</h3>
            
            <div className="flex items-center space-x-2 mt-1">
              <Sheet open={isVariantSheetOpen} onOpenChange={setIsVariantSheetOpen}>
                <SheetTrigger asChild>
                  <button 
                    type="button" 
                    className={cn(
                      "text-left block hover:opacity-80 transition-opacity focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
                      isOutOfStock && "cursor-not-allowed opacity-70"
                    )}
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                          "bg-green-600 hover:bg-green-600 text-white text-xs px-1.5 py-0.5 inline-flex items-center",
                           "cursor-pointer"
                      )}
                    >
                      {showSelectVariantPlaceholder ? (
                         <span className="italic text-white/80 truncate">{t('cart.sheet.selectVariantPlaceholder')}</span>
                      ) : (
                         badgeDisplayString && <span className="truncate">{badgeDisplayString}</span>
                      )}
                      <ChevronDown className="w-3 h-3 ml-1 opacity-80 flex-shrink-0" />
                    </Badge>
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85vh] sm:max-h-[80vh] flex flex-col p-0 rounded-t-lg">
                    <SheetHeader className="p-4 border-b sticky top-0 bg-card z-10 flex flex-row items-center justify-between">
                        <SheetTitle className="text-lg font-semibold text-center flex-grow">{t('cart.sheet.productInfoTitle')}</SheetTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsVariantSheetOpen(false)} className="h-8 w-8">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </SheetHeader>
                      
                    <div className="flex-1 overflow-y-auto min-h-0">
                      <div className="p-4 space-y-5">
                          <div>
                          <Carousel className="w-full max-w-sm mx-auto" opts={{ loop: allImageUrls.length > 1 }}>
                            <CarouselContent>
                              {allImageUrls.map((url, index) => (
                                <CarouselItem key={index}>
                                  <div className="aspect-square relative bg-muted rounded-md">
                                    <Image
                                      src={url}
                                      alt={`${item.name} image ${index + 1}`}
                                      fill
                                      className="rounded-md object-cover border"
                                      sizes="(max-width: 640px) 90vw, 384px"
                                    />
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            {allImageUrls.length > 1 && (
                              <>
                                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 text-white bg-black/30 hover:bg-black/50 hover:text-white border-none" />
                                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-white bg-black/30 hover:bg-black/50 hover:text-white border-none" />
                              </>
                            )}
                          </Carousel>
                          <div className="mt-4">
                            <div className="flex items-baseline justify-between">
                                <p className="text-xl font-bold text-foreground">{currentDisplayDetailsInSheet.price.toLocaleString('vi-VN')}₫</p>
                                {currentDisplayDetailsInSheet.originalPrice && (
                                    <p className="text-sm text-muted-foreground line-through">{currentDisplayDetailsInSheet.originalPrice.toLocaleString('vi-VN')}₫</p>
                                )}
                            </div>
                              {stockStatusTextInSheet && (
                              <p className={cn(stockStatusClassesInSheet, "mt-1")}>{stockStatusTextInSheet}</p>
                              )}
                            <p className="text-base text-foreground mt-2 font-medium line-clamp-3">{item.name}</p>
                          </div>
                        </div>
                        
                        {item.availableVariants ? (
                          <>
                            {uniqueColors.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-sm font-semibold text-foreground">{t('cart.sheet.selectColor')}</p>
                                <div className="flex flex-wrap gap-2">
                                  {uniqueColors.map(color => {
                                    const variantForColor = item.availableVariants?.find(v => parseVariantName(v.name).color === color);
                                    const isSelected = tempSelectedColorName === color;
                                    return (
                                      <button
                                        key={color}
                                        type="button"
                                        onClick={() => {
                                          setTempSelectedColorName(color);
                                          if (allPossibleSizes.length > 0) setTempSelectedSizeValue(null);
                                        }}
                                        className={cn(
                                          "flex items-center gap-2 text-left p-1 rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background",
                                          isSelected ? "bg-muted border-foreground" : "bg-card border-input hover:bg-muted/50"
                                        )}
                                        aria-label={color}
                                      >
                                        <Image
                                          src={variantForColor?.imageUrl || `https://placehold.co/40x40.png`}
                                          alt={color}
                                          width={24}
                                          height={24}
                                          className="rounded-sm object-cover border"
                                          data-ai-hint={color.toLowerCase()}
                                        />
                                        <span className="text-sm font-medium pr-2">{color}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {allPossibleSizes.length > 0 && (
                                <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold text-foreground">{t('cart.sheet.selectSize')}</p>
                                  <Dialog open={isSizeGuideDialogOpen} onOpenChange={setIsSizeGuideDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button variant="link" className="text-sm p-0 h-auto flex items-center gap-1 text-muted-foreground hover:text-foreground">
                                        <Ruler className="w-3.5 h-3.5" />
                                        {t('cart.sheet.findMySize.trigger')}
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md p-0">
                                      <DialogHeader className="p-4 border-b">
                                        <DialogTitle>{t('cart.sheet.findMySize.tableTitle')}</DialogTitle>
                                      </DialogHeader>
                                      <ScrollArea className="max-h-[70vh]">
                                        <div className="p-4">
                                          <Image 
                                            src="https://file.hstatic.net/1000284478/file/mlb_new_ao_unisex_-_desktop_9701027a890a4e1d885ae36d5ce8ece7.jpg" 
                                            alt="Size guide chart" 
                                            width={700} 
                                            height={1000}
                                            className="w-full h-auto rounded-md" 
                                            data-ai-hint="size guide" />
                                        </div>
                                      </ScrollArea>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {allPossibleSizes.map(size => {
                                    const variantForThisSize = getVariantFromSelection(tempSelectedColorName, size);
                                    const isSizeAvailableForColor = availableSizesForSelectedColor.has(size);
                                    const isSizeInStock = variantForThisSize ? (variantForThisSize.stock === undefined || variantForThisSize.stock > 0) : true;
                                    const isSizeDisabled = !isSizeAvailableForColor || !isSizeInStock;
                                    const isSelected = tempSelectedSizeValue === size && !isSizeDisabled;
                                    
                                    return (
                                      <Button
                                        key={size}
                                        type="button"
                                        variant={isSelected ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                          if (!isSizeDisabled) setTempSelectedSizeValue(size);
                                        }}
                                        disabled={isSizeDisabled}
                                        className={cn(
                                          isSelected ? "bg-foreground text-accent-foreground hover:bg-foreground/90" : "border-input text-foreground hover:bg-muted",
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
                          </>
                        ) : (
                          <p className="text-sm text-center text-muted-foreground py-8">{t('cart.sheet.noOtherVariants')}</p>
                        )}
                      </div>
                    </div>

                    <SheetFooter className="p-4 border-t sticky bottom-0 bg-card z-10">
                      <Button onClick={handleConfirmVariant} className="w-full bg-foreground hover:bg-foreground/90 text-accent-foreground text-base py-3 h-auto" disabled={!canConfirmSelection}>
                        {t('cart.sheet.updateButton')}
                      </Button>
                    </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

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
            
            <div className="flex items-center mt-2 space-x-4">
              <QuantitySelector
                quantity={item.quantity}
                onIncrement={() => onQuantityChange(item.cartItemId, item.quantity + 1)}
                onDecrement={() => onQuantityChange(item.cartItemId, item.quantity - 1)}
                maxQuantity={item.stock !== undefined ? Math.min(item.stock, 99) : 99}
                disabled={isOutOfStock}
              />
              {itemCardStockStatusText && (
                <p className={itemCardStockStatusClasses}>{itemCardStockStatusText}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
