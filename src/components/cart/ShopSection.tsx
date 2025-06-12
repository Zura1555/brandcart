
// @ts-nocheck
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CartItem, Shop, SimpleVariant, Product } from '@/interfaces';
import ProductItem from './ProductItem';
import BrandOfferBanner from './BrandOfferBanner'; 
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronRight, Gift, PlusCircle, MinusCircle, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { mockRelevantProducts } from '@/lib/mockData'; 

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

  const [showCylFlags, setShowCylFlags] = useState<boolean[]>([]);

  useEffect(() => {
    setShowCylFlags(items.map(() => Math.random() < 0.33)); 
  }, [items]);


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
          {items.map((item, index) => (
            <div key={item.cartItemId} className="group/shop-item-wrapper">
              <ProductItem
                item={item}
                onSelectToggle={onItemSelectToggle}
                onQuantityChange={onQuantityChange}
                onDeleteItem={onDeleteItem}
                onVariantChange={onVariantChange}
              />
              {showCylFlags[index] && (
                <Accordion type="single" collapsible className="w-full bg-stone-100">
                  <AccordionItem value={`cyl-${item.cartItemId}`} className="border-t border-border">
                    <AccordionTrigger className="!py-2 !px-3 hover:no-underline bg-black text-white hover:bg-neutral-800 group [&>.lucide-chevron-down]:hidden">
                      <div className="flex justify-between items-center w-full">
                        <span className="uppercase font-semibold text-xs tracking-wider">{t('cart.completeLook.bannerText')}</span>
                        <PlusCircle className="w-5 h-5 text-white group-data-[state=closed]:block group-data-[state=open]:hidden" />
                        <MinusCircle className="w-5 h-5 text-white group-data-[state=open]:block group-data-[state=closed]:hidden" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-3 bg-white border-t border-border">
                       <p className="text-sm text-muted-foreground mb-3">
                         {t('cart.completeLook.dialogTitle', { productName: item.name })}
                       </p>
                       {mockRelevantProducts && mockRelevantProducts.length > 0 ? (
                         <div className="space-y-3">
                           {mockRelevantProducts
                            .filter(relevantItem => relevantItem.id !== item.id) 
                            .slice(0, 3) 
                            .map(relevantItem => (
                            <div key={relevantItem.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                              <Image
                                src={relevantItem.imageUrl}
                                alt={relevantItem.name}
                                width={60}
                                height={60}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded object-cover border"
                                data-ai-hint={relevantItem.dataAiHint || "product image"}
                              />
                              <div className="flex-grow">
                                <p className="text-sm font-medium text-foreground line-clamp-2">{relevantItem.name}</p>
                                <p className="text-sm text-foreground font-semibold">{formatCurrency(relevantItem.price)}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-foreground hover:bg-primary hover:text-primary-foreground border-foreground/50 hover:border-primary"
                                onClick={() => onAddToCart(relevantItem)}
                              >
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                {t('cart.completeLook.addToCartButton')}
                              </Button>
                            </div>
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopSection;

