
// @ts-nocheck
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CartItem, Shop, SimpleVariant, Product } from '@/interfaces';
import ProductItem from './ProductItem';
import BrandOfferBanner from './BrandOfferBanner'; 
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, Gift, PlusCircle, MinusCircle, ShoppingBag, ChevronDown, Minus, Plus as PlusIcon, X, Check, Ruler } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { mockRelevantProducts } from '@/lib/mockData'; 
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


interface RelevantProductCardProps {
  item: Product;
  onAddToCartParent: (item: Product) => void;
  parentShopBrand: string; 
}

const RelevantProductCard: React.FC<RelevantProductCardProps> = ({ item, onAddToCartParent, parentShopBrand }) => {
  const { t } = useLanguage();
  const formatCurrency = (amount: number) => `${amount.toLocaleString('vi-VN')}₫`;
  
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
    if (parts.length === 2) return { color: parts[0] || null, size: parts[1] || null };
    const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', 'Freesize'];
    if (parts[0] && commonSizes.some(s => parts[0].toUpperCase() === s.toUpperCase())) return { color: null, size: parts[0]};
    return { color: parts[0] || null, size: null };
  }, [cleanVariantName]);

  const [selectedCylVariantDetails, setSelectedCylVariantDetails] = useState<Partial<Product>>({
    ...item, 
    name: item.name, 
    variant: item.variant,
    price: item.price,
    originalPrice: item.originalPrice,
    imageUrl: item.imageUrl,
    dataAiHint: item.dataAiHint,
    stock: item.stock,
  });

  const [tempSelectedColorName, setTempSelectedColorName] = useState<string | null>(parseVariantName(item.variant).color);
  const [tempSelectedSizeValue, setTempSelectedSizeValue] = useState<string | null>(parseVariantName(item.variant).size);

  useEffect(() => {
    if (isVariantSheetOpen) {
      const currentParsed = parseVariantName(selectedCylVariantDetails.variant);
      setTempSelectedColorName(currentParsed.color);
      setTempSelectedSizeValue(currentParsed.size);
    } else {
       // When sheet closes, update the main card display based on final selection
      const variantToDisplay = item.availableVariants?.find(v => v.name === selectedCylVariantDetails.variant) || item;
      setSelectedCylVariantDetails(prev => ({...prev, ...variantToDisplay}));
    }
  }, [isVariantSheetOpen, selectedCylVariantDetails.variant, parseVariantName, item]);

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
        try { const aNum = parseInt(a); const bNum = parseInt(b); if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum; } catch (e) {}
        return a.localeCompare(b);
    });
  }, [item.availableVariants, parseVariantName]);

  const getVariantFromSelection = useCallback((color: string | null, size: string | null): SimpleVariant | undefined => {
    if (!item.availableVariants) return undefined;
    return item.availableVariants.find(v => {
      const parsedV = parseVariantName(v.name);
      const colorMatch = (uniqueColors.length === 0 || !color) || parsedV.color === color;
      const sizeMatch = (allPossibleSizes.length === 0 || !size) || parsedV.size === size;
      if (uniqueColors.length > 0 && allPossibleSizes.length > 0) return parsedV.color === color && parsedV.size === size;
      else if (uniqueColors.length > 0) return parsedV.color === color;
      else if (allPossibleSizes.length > 0) return parsedV.size === size;
      if (uniqueColors.length === 0 && allPossibleSizes.length === 0 && item.availableVariants?.length === 1) return true;
      return false;
    });
  }, [item.availableVariants, parseVariantName, uniqueColors.length, allPossibleSizes.length]);

  const selectedVariantInSheet = useMemo(() => getVariantFromSelection(tempSelectedColorName, tempSelectedSizeValue), [tempSelectedColorName, tempSelectedSizeValue, getVariantFromSelection]);

  const currentDisplayDetailsInSheet = useMemo(() => ({
    price: selectedVariantInSheet?.price ?? selectedCylVariantDetails.price,
    imageUrl: selectedVariantInSheet?.imageUrl ?? selectedCylVariantDetails.imageUrl,
    stock: selectedVariantInSheet?.stock,
    originalPrice: selectedVariantInSheet?.originalPrice ?? selectedCylVariantDetails.originalPrice,
    dataAiHint: selectedVariantInSheet?.dataAiHint ?? selectedCylVariantDetails.dataAiHint,
  }), [selectedVariantInSheet, selectedCylVariantDetails]);
  
  const allImageUrlsInSheet = useMemo(() => {
    if (!item.availableVariants || item.availableVariants.length === 0) {
        return [currentDisplayDetailsInSheet.imageUrl].filter(Boolean) as string[];
    }
    const urls = new Set<string>();
    if (currentDisplayDetailsInSheet.imageUrl) urls.add(currentDisplayDetailsInSheet.imageUrl);
    item.availableVariants.forEach(v => { if (v.imageUrl) urls.add(v.imageUrl); });
    return Array.from(urls);
  }, [item.availableVariants, currentDisplayDetailsInSheet.imageUrl]);

  const availableSizesForSelectedColor = useMemo(() => {
    if (!item.availableVariants) return new Set<string>();
    if (uniqueColors.length === 0 || !tempSelectedColorName) {
      const sizes = new Set<string>(); item.availableVariants.forEach(v => { const parsed = parseVariantName(v.name); if (parsed.size) sizes.add(parsed.size); }); return sizes;
    }
    const sizes = new Set<string>();
    item.availableVariants.forEach(v => { const parsed = parseVariantName(v.name); if (parsed.color === tempSelectedColorName && parsed.size) sizes.add(parsed.size); });
    return sizes;
  }, [tempSelectedColorName, item.availableVariants, parseVariantName, uniqueColors.length]);

  const handleConfirmCylVariant = () => {
    if (selectedVariantInSheet) {
      setSelectedCylVariantDetails(prev => ({
        ...prev, 
        ...selectedVariantInSheet, 
        name: item.name, 
        variant: selectedVariantInSheet.name, 
      }));
    }
    setIsVariantSheetOpen(false);
  };

  const { color: parsedColorFromItem, size: parsedSizeFromItem } = parseVariantName(selectedCylVariantDetails.variant);
  let displayColor = parsedColorFromItem || "N/A";
  let displaySize = parsedSizeFromItem;
  if (!displaySize && allPossibleSizes.length > 0) displaySize = allPossibleSizes[0]; 
  else if (!displaySize) displaySize = "M"; 
  
  const cylBadgeDisplayString = [displayColor, displaySize, selectedCylVariantDetails.productCode || "N/A"]
    .filter(part => part !== "N/A" || (displayColor !== "N/A" || displaySize !== "M" || (selectedCylVariantDetails.productCode && selectedCylVariantDetails.productCode !== "N/A")))
    .join(" / ");
  
  const hasCylVariants = item.availableVariants && item.availableVariants.length > 0;
  const isCylItemOutOfStock = selectedCylVariantDetails.stock === 0;
  const showCylSelectVariantPlaceholder = hasCylVariants && !parsedColorFromItem && !parsedSizeFromItem && !selectedCylVariantDetails.productCode;
  const canConfirmCylSelection = !!selectedVariantInSheet && (selectedVariantInSheet.stock === undefined || selectedVariantInSheet.stock > 0);

  let stockStatusTextInSheet = '';
  let stockStatusClassesInSheet = 'text-xs font-medium ';
  if (currentDisplayDetailsInSheet.stock !== undefined) {
    if (currentDisplayDetailsInSheet.stock > 10) { stockStatusTextInSheet = t('cart.sheet.stock.inStock'); stockStatusClassesInSheet += 'text-green-600'; }
    else if (currentDisplayDetailsInSheet.stock > 0) { stockStatusTextInSheet = t('cart.sheet.stock.remaining', { count: currentDisplayDetailsInSheet.stock }); stockStatusClassesInSheet += 'text-orange-600'; }
    else { stockStatusTextInSheet = t('cart.sheet.stock.outOfStock'); stockStatusClassesInSheet += 'text-destructive'; }
  }

  const handleRelevantItemAddToCart = () => {
    const itemToAdd: Product = {
      id: selectedCylVariantDetails.id || item.id, 
      name: selectedCylVariantDetails.name || item.name, 
      price: selectedCylVariantDetails.price || item.price,
      originalPrice: selectedCylVariantDetails.originalPrice, 
      brand: parentShopBrand, // Use parentShopBrand here
      imageUrl: selectedCylVariantDetails.imageUrl || item.imageUrl,
      dataAiHint: selectedCylVariantDetails.dataAiHint || item.dataAiHint,
      productCode: selectedCylVariantDetails.productCode || item.productCode,
      variant: selectedCylVariantDetails.variant, 
      stock: selectedCylVariantDetails.stock, 
      availableVariants: item.availableVariants, 
      discountDescription: item.discountDescription, 
    };
    onAddToCartParent(itemToAdd);
  };

  return (
    <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted">
      <Image
        src={selectedCylVariantDetails.imageUrl || item.imageUrl}
        alt={selectedCylVariantDetails.name || item.name}
        width={60}
        height={60}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded object-cover border"
        data-ai-hint={selectedCylVariantDetails.dataAiHint || item.dataAiHint || "product image"}
      />
      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-2">{selectedCylVariantDetails.name || item.name}</p>
        
        {hasCylVariants ? (
          <Sheet open={isVariantSheetOpen} onOpenChange={setIsVariantSheetOpen}>
            <SheetTrigger asChild disabled={isCylItemOutOfStock}>
              <button
                type="button"
                className={cn(
                  "text-left block focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring rounded-sm mt-1",
                  (isCylItemOutOfStock) && "cursor-not-allowed opacity-70"
                )}
                disabled={isCylItemOutOfStock}
              >
                <Badge
                  className={cn(
                    "text-xs px-1.5 py-0.5 inline-flex items-center bg-black text-white hover:bg-neutral-800",
                    (isCylItemOutOfStock) ? "cursor-not-allowed" : "cursor-pointer"
                  )}
                >
                  {showCylSelectVariantPlaceholder ? (
                     <span className="italic text-white/80 truncate">{t('cart.sheet.selectVariantPlaceholder')}</span>
                  ) : (
                     cylBadgeDisplayString && <span className="truncate">{cylBadgeDisplayString}</span>
                  )}
                  <ChevronDown className="w-3 h-3 ml-1 text-white/80 flex-shrink-0" />
                </Badge>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-lg p-0 flex flex-col max-h-[85vh] sm:max-h-[80vh]">
              <SheetHeader className="p-4 border-b sticky top-0 bg-card z-10">
                <SheetTitle className="text-lg text-center font-semibold">{t('cart.sheet.productInfoTitle')}</SheetTitle>
                 <SheetClose className="absolute right-2 top-1/2 -translate-y-1/2 p-2">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                </SheetClose>
              </SheetHeader>
              <ScrollArea className="flex-grow">
                <div className="p-4 space-y-5">
                    <div>
                        <Carousel className="w-full max-w-sm mx-auto" opts={{ loop: allImageUrlsInSheet.length > 1 }}>
                            <CarouselContent>
                                {allImageUrlsInSheet.map((url, index) => (
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
                            {allImageUrlsInSheet.length > 1 && (
                            <>
                                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 text-white bg-black/30 hover:bg-black/50 hover:text-white border-none" />
                                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-white bg-black/30 hover:bg-black/50 hover:text-white border-none" />
                            </>
                            )}
                        </Carousel>
                        <div className="mt-4">
                            <div className="flex items-baseline justify-between">
                                <p className="text-xl font-bold text-foreground">{formatCurrency(currentDisplayDetailsInSheet.price || 0)}</p>
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
                      <div className="space-y-2">
                        {uniqueColors.map(color => {
                          const variantForColor = item.availableVariants?.find(v => parseVariantName(v.name).color === color);
                          const isSelected = tempSelectedColorName === color;
                          return (
                            <button
                                key={color}
                                type="button"
                                onClick={() => { setTempSelectedColorName(color); if (allPossibleSizes.length > 0) setTempSelectedSizeValue(null); }}
                                className={cn(
                                    "w-full flex items-center gap-3 text-left p-2 rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background",
                                    isSelected ? "bg-muted border-foreground" : "bg-card border-input hover:bg-muted/50"
                                )}
                                aria-label={color}
                            >
                                <Image src={ variantForColor?.imageUrl || `https://placehold.co/40x40.png`} alt={color} width={40} height={40} className="rounded-md object-cover border" data-ai-hint={color.toLowerCase()} />
                                <span className="flex-grow text-sm font-medium">{color}</span>
                                {isSelected && <Check className="w-5 h-5 text-foreground" />}
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
                      <div className="space-y-2">
                        {allPossibleSizes.map(size => {
                          const variantForThisSize = getVariantFromSelection(tempSelectedColorName, size);
                          const isSizeAvailableForColor = availableSizesForSelectedColor.has(size);
                          const isSizeInStock = variantForThisSize ? (variantForThisSize.stock === undefined || variantForThisSize.stock > 0) : true;
                          const isSizeDisabled = !isSizeAvailableForColor || !isSizeInStock;
                          return (
                            <Button key={size} type="button" variant={tempSelectedSizeValue === size && !isSizeDisabled ? "default" : "outline"} size="sm" onClick={() => { if (!isSizeDisabled) setTempSelectedSizeValue(size); }} disabled={isSizeDisabled}
                                className={cn("w-full justify-start text-left py-2 h-auto text-sm rounded-md", tempSelectedSizeValue === size && !isSizeDisabled ? "bg-foreground text-accent-foreground hover:bg-foreground/90" : "border-input text-foreground hover:bg-muted", isSizeDisabled && "bg-muted/50 text-muted-foreground opacity-70 cursor-not-allowed hover:bg-muted/50")}
                            >{size}</Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {(!item.availableVariants || item.availableVariants.length === 0 || (item.availableVariants.length === 1 && !uniqueColors.length && !allPossibleSizes.length)) && (<p className="text-sm text-muted-foreground">{t('cart.sheet.noOtherVariants')}</p>)}
                </div>
              </ScrollArea>
              <SheetFooter className="p-4 border-t sticky bottom-0 bg-card z-10">
                <Button onClick={handleConfirmCylVariant} className="w-full bg-foreground hover:bg-foreground/90 text-accent-foreground text-base py-3 h-auto" disabled={!canConfirmCylSelection}>{t('cart.sheet.updateButton')}</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ) : (
          selectedCylVariantDetails.variant && <Badge className="bg-black text-white text-xs mt-1 px-1.5 py-0.5 inline-flex items-center"><span className="truncate">{selectedCylVariantDetails.variant}</span></Badge>
        )}

        <p className="text-sm text-foreground font-semibold mt-0.5">{formatCurrency(selectedCylVariantDetails.price || item.price)}</p>
      </div>
      <Button
        size="icon"
        variant="outline"
        className="text-foreground hover:bg-primary hover:text-primary-foreground border-foreground/50 hover:border-primary ml-auto flex-shrink-0 w-9 h-9"
        onClick={handleRelevantItemAddToCart}
        disabled={isCylItemOutOfStock}
        aria-label={t('cart.addToCartLabel', { itemName: selectedCylVariantDetails.name || item.name })}
      >
        <ShoppingBag className="w-4 h-4" />
      </Button>
    </div>
  );
};


interface ShopSectionProps {
  shop: Shop; 
  items: CartItem[];
  isShopSelected: boolean;
  onShopSelectToggle: (checked: boolean) => void;
  onItemSelectToggle: (itemId: string, checked: boolean) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onDeleteItem: (itemId: string) => void;
  onVariantChange: (itemId: string, newVariantData: SimpleVariant) => void;
  onAddToCart: (itemToAdd: Product) => void; 
}

const ShopSection: React.FC<ShopSectionProps> = ({ shop, items, isShopSelected, onShopSelectToggle, onItemSelectToggle, onQuantityChange, onDeleteItem, onVariantChange, onAddToCart }) => {
  if (items.length === 0) return null;
  const { t } = useLanguage();
  const { toast } = useToast();

  const [displayedRelevantProducts, setDisplayedRelevantProducts] = useState(() => mockRelevantProducts);

  const handleShopNowClick = () => {
    toast({
      title: t('toast.navigateToBrand.title', { brandName: shop.name }),
      description: t('toast.navigateToBrand.description'),
    });
    console.log(`Navigate to ${shop.name} brand page. URL (if available): ${shop.brandPageUrl || 'Not specified'}`);
  };
  
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')}₫`;
  };

  const handleCompleteLookItemAddToCart = (itemAdded: Product) => {
    onAddToCart(itemAdded); 
    setDisplayedRelevantProducts(prev => prev.filter(p => !(p.id === itemAdded.id && p.variant === itemAdded.variant)));
  };

  return (
    <Card className="shadow-md rounded-lg overflow-hidden bg-card">
      <CardHeader className="border-b bg-card py-3 px-4 sm:px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 min-w-0">
            <Checkbox
              id={`select-all-${shop.name.replace(/\s+/g, '-')}`}
              checked={isShopSelected}
              onCheckedChange={(checked) => onShopSelectToggle(Boolean(checked))}
              aria-label={`Select all items from ${shop.name}`}
            />
            
            <CardTitle className="font-semibold text-base text-foreground flex items-center cursor-pointer min-w-0">
              {shop.logoUrl && (
                <div className="mr-2 flex-shrink-0">
                  <Image
                    src={shop.logoUrl}
                    alt={`${shop.name} logo`}
                    width={60} 
                    height={24} 
                    className="object-contain max-h-[24px]" 
                    data-ai-hint={shop.logoDataAiHint}
                    priority={false} 
                  />
                </div>
              )}
              <span className="truncate">{shop.name}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-1 flex-shrink-0" />
            </CardTitle>
          </div>
          {shop.editLinkText && (
            <Button variant="link" className="text-sm text-muted-foreground p-0 h-auto hover:text-accent flex-shrink-0">
              {shop.editLinkText}
            </Button>
          )}
        </div>
        {shop.promotionText && (
          <div className="mt-2 flex items-center text-xs text-foreground bg-muted/50 p-2 rounded-md cursor-pointer">
            <Gift className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="flex-grow min-w-0 truncate">{shop.promotionText}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0" />
          </div>
        )}
      </CardHeader>

      {shop.specialOfferText && (
        <div className="px-4 sm:px-6 pt-3">
          <BrandOfferBanner 
            offerText={shop.specialOfferText}
            shopNowButtonText={t('cart.brandOffer.shopNowButton')}
            onShopNowClick={handleShopNowClick}
          />
        </div>
      )}

      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {items.map((item) => {
            const showCylAccordion = item.id === 'mlb1' && item.brand === 'MLB';

            return (
              <div key={item.cartItemId} className="group/shop-item-wrapper">
                <ProductItem
                  item={item}
                  onSelectToggle={onItemSelectToggle}
                  onQuantityChange={onQuantityChange}
                  onDeleteItem={onDeleteItem}
                  onVariantChange={onVariantChange}
                />
                {showCylAccordion && (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`cyl-${item.cartItemId}`} className="border-t border-border">
                      <AccordionTrigger className={cn(
                        "!py-2 !px-3 hover:no-underline group", 
                        "bg-black text-white hover:bg-neutral-800",
                        "[&>.lucide-chevron-down]:hidden" 
                      )}>
                        <div className="flex justify-between items-center w-full">
                          <span className="uppercase font-semibold text-xs tracking-wider">{t('cart.completeLook.bannerText')}</span>
                          <PlusCircle className="w-5 h-5 text-white group-data-[state=closed]:block group-data-[state=open]:hidden" />
                          <MinusCircle className="w-5 h-5 text-white group-data-[state=open]:block group-data-[state=closed]:hidden" />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-muted/50 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-3">
                          {t('cart.completeLook.dialogTitle', { productName: item.name })}
                        </p>
                        {displayedRelevantProducts && displayedRelevantProducts.length > 0 ? (
                          <div className="space-y-3">
                            {displayedRelevantProducts
                              .filter(relevantItem => relevantItem.id !== item.id) 
                              .slice(0, 3) 
                              .map(relevantItem => (
                                <RelevantProductCard 
                                  key={`${relevantItem.id}-${relevantItem.variant || 'defaultRelevant'}`} 
                                  item={relevantItem} 
                                  onAddToCartParent={handleCompleteLookItemAddToCart}
                                  parentShopBrand={shop.name} 
                                />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">{t('cart.completeLook.noSuggestions')}</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopSection;
