
"use client";

import Image from 'next/image';
import type React from 'react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ChevronDown, X, Ruler, Check } from 'lucide-react';
import type { Product, SimpleVariant } from '@/interfaces';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RecentlyViewedItemCardProps {
  item: Product;
  onAddToCart: (item: Product) => void;
}

const RecentlyViewedItemCard: React.FC<RecentlyViewedItemCardProps> = ({ item, onAddToCart }) => {
  const { t } = useLanguage();
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
        } catch (e) { /* ignore */ }
        return a.localeCompare(b);
    });
  }, [item.availableVariants, parseVariantName]);

  const getVariantFromSelection = useCallback((color: string | null, size: string | null): SimpleVariant | undefined => {
    if (!item.availableVariants || item.availableVariants.length === 0) return item.availableVariants?.[0] ?? { id: item.id, name: item.variant || '' };
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
  }, [item, parseVariantName, uniqueColors.length, allPossibleSizes.length]);

  const selectedVariantInSheet = useMemo(() => {
    return getVariantFromSelection(tempSelectedColorName, tempSelectedSizeValue);
  }, [tempSelectedColorName, tempSelectedSizeValue, getVariantFromSelection]);

  const currentDisplayDetailsInSheet = useMemo(() => {
    return {
      price: selectedVariantInSheet?.price ?? item.price,
      imageUrl: selectedVariantInSheet?.imageUrl ?? item.imageUrl,
      stock: selectedVariantInSheet?.stock,
      originalPrice: selectedVariantInSheet?.originalPrice,
      dataAiHint: selectedVariantInSheet?.dataAiHint ?? item.dataAiHint,
    };
  }, [selectedVariantInSheet, item]);
  
  const allImageUrls = useMemo(() => {
    const urls = new Set<string>();
    
    // Always add the current item's image first if its color matches the selected color, or if no color is selected yet.
    if (item.imageUrl && (!tempSelectedColorName || parseVariantName(item.variant).color === tempSelectedColorName)) {
      urls.add(item.imageUrl);
    }

    const variantsForSelectedColor = item.availableVariants?.filter(v => {
        if (!tempSelectedColorName) return true;
        const parsed = parseVariantName(v.name);
        return parsed.color === tempSelectedColorName;
    });
    
    variantsForSelectedColor?.forEach(v => {
        if (v.imageUrl) urls.add(v.imageUrl);
    });

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
  
  const hasVariants = item.availableVariants && item.availableVariants.length > 1;
  const canConfirmSelection = !!selectedVariantInSheet && (selectedVariantInSheet.stock === undefined || selectedVariantInSheet.stock > 0);

  const handleAddToCartButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasVariants) {
      setIsVariantSheetOpen(true);
    } else {
      onAddToCart(item);
    }
  };

  const handleConfirmAndAddToCart = () => {
    if (!selectedVariantInSheet) return;

    const productToAdd: Product = {
      ...item,
      id: selectedVariantInSheet.id,
      name: item.name,
      price: selectedVariantInSheet.price ?? item.price,
      originalPrice: selectedVariantInSheet.originalPrice,
      brand: item.brand,
      imageUrl: selectedVariantInSheet.imageUrl ?? item.imageUrl,
      dataAiHint: selectedVariantInSheet.dataAiHint ?? item.dataAiHint,
      productCode: item.productCode,
      variant: selectedVariantInSheet.name,
      stock: selectedVariantInSheet.stock,
      availableVariants: item.availableVariants,
      discountDescription: item.discountDescription,
    };
    
    onAddToCart(productToAdd);
    setIsVariantSheetOpen(false);
  };
  
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')}₫`;
  };

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

  return (
    <Card className="w-[150px] sm:w-[170px] flex-shrink-0 shadow-sm rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow">
      <Sheet open={isVariantSheetOpen} onOpenChange={setIsVariantSheetOpen}>
        <div className="relative aspect-[3/4] w-full bg-muted/20 group">
          <Image
            src={item.thumbnailImageUrl || item.imageUrl}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={item.dataAiHint || 'product image'}
            sizes="(max-width: 640px) 150px, 170px"
          />
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 h-9 w-9 bg-background/70 backdrop-blur-sm hover:bg-background border-muted-foreground/30 hover:border-foreground text-foreground rounded-full shadow"
              onClick={handleAddToCartButtonClick}
              aria-label={t('cart.addToCartLabel', { itemName: item.name })}
            >
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent side="bottom" className="max-h-[85vh] sm:max-h-[80vh] flex flex-col p-0 rounded-t-lg">
          <SheetHeader className="p-4 border-b sticky top-0 bg-card z-10 flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold text-center flex-grow">{t('cart.sheet.productInfoTitle')}</h3>
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
                          <p className="text-xl font-bold text-foreground">{formatCurrency(currentDisplayDetailsInSheet.price)}</p>
                          {currentDisplayDetailsInSheet.originalPrice && (
                              <p className="text-sm text-muted-foreground line-through">{formatCurrency(currentDisplayDetailsInSheet.originalPrice)}</p>
                          )}
                      </div>
                      {stockStatusTextInSheet && (
                          <p className={cn(stockStatusClassesInSheet, "mt-1")}>{stockStatusTextInSheet}</p>
                      )}
                      <p className="text-base text-foreground mt-2 font-medium line-clamp-3">{item.name}</p>
                    </div>
                  </div>

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
                   {(uniqueColors.length === 0 && allPossibleSizes.length === 0 && item.availableVariants && item.availableVariants.length > 1) && (
                      <p className="text-sm text-muted-foreground">{t('cart.sheet.complexVariants')}</p>
                   )}
                   {(!item.availableVariants || item.availableVariants.length <= 1) && !uniqueColors.length && !allPossibleSizes.length && (
                      <p className="text-sm text-muted-foreground">{t('cart.sheet.noOtherVariants')}</p>
                   )}
                </div>
              </div>
              
              <SheetFooter className="p-4 border-t sticky bottom-0 bg-card z-10">
                <Button onClick={handleConfirmAndAddToCart} className="w-full bg-foreground hover:bg-foreground/90 text-accent-foreground text-base py-3 h-auto" disabled={!canConfirmSelection}>
                  {t('cart.addToCartButton')}
                </Button>
              </SheetFooter>
        </SheetContent>
      </Sheet>
      <CardContent className="p-2.5 space-y-1">
        {item.brand && <p className="text-[11px] font-semibold text-foreground uppercase truncate">{item.brand}</p>}
        <p className="text-xs text-foreground leading-tight line-clamp-2 h-8" title={item.name}>{item.name}</p>
        <p className="text-sm font-bold text-foreground pt-0.5">{formatCurrency(item.price)}</p>
      </CardContent>
    </Card>
  );
};

export default RecentlyViewedItemCard;
