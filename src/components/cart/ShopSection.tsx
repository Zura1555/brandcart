
// @ts-nocheck
"use client";

import type React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CartItem, Shop, SimpleVariant } from '@/interfaces';
import ProductItem from './ProductItem';
import BrandOfferBanner from './BrandOfferBanner'; 
import { ChevronRight, Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface ShopSectionProps {
  shop: Shop; 
  items: CartItem[];
  isShopSelected: boolean;
  onShopSelectToggle: (checked: boolean) => void;
  onItemSelectToggle: (itemId: string, checked: boolean) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onDeleteItem: (itemId: string) => void;
  onVariantChange: (itemId: string, newVariantData: SimpleVariant) => void;
}

const ShopSection: React.FC<ShopSectionProps> = ({ shop, items, isShopSelected, onShopSelectToggle, onItemSelectToggle, onQuantityChange, onDeleteItem, onVariantChange }) => {
  if (items.length === 0) return null;
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleShopNowClick = () => {
    toast({
      title: t('toast.navigateToBrand.title', { brandName: shop.name }),
      description: t('toast.navigateToBrand.description'),
    });
    // Placeholder for actual navigation:
    // if (shop.brandPageUrl) router.push(shop.brandPageUrl);
    console.log(`Navigate to ${shop.name} brand page. URL (if available): ${shop.brandPageUrl || 'Not specified'}`);
  };

  return (
    <Card className="shadow-md rounded-lg overflow-hidden bg-card">
      <CardHeader className="border-b bg-card py-3 px-4 sm:px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 min-w-0"> {/* Added min-w-0 for flex child truncation */}
            <Checkbox
              id={`select-all-${shop.name.replace(/\s+/g, '-')}`}
              checked={isShopSelected}
              onCheckedChange={(checked) => onShopSelectToggle(Boolean(checked))}
              aria-label={`Select all items from ${shop.name}`}
            />
            
            <CardTitle className="font-semibold text-base text-foreground flex items-center cursor-pointer min-w-0"> {/* Added min-w-0 */}
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
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-1 flex-shrink-0" /> {/* Added flex-shrink-0 */}
            </CardTitle>
          </div>
          {shop.editLinkText && (
            <Button variant="link" className="text-sm text-muted-foreground p-0 h-auto hover:text-accent flex-shrink-0"> {/* Added flex-shrink-0 */}
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
          {items.map(item => (
            <ProductItem
              key={item.cartItemId} // Changed from item.id to item.cartItemId for unique key
              item={item}
              onSelectToggle={onItemSelectToggle}
              onQuantityChange={onQuantityChange}
              onDeleteItem={onDeleteItem}
              onVariantChange={onVariantChange}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopSection;

