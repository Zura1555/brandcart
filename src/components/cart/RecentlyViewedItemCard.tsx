
"use client";

import Image from 'next/image';
import type React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '@/interfaces';
import { useLanguage } from '@/contexts/LanguageContext';

interface RecentlyViewedItemCardProps {
  item: Product;
  onAddToCart: (item: Product) => void;
}

const RecentlyViewedItemCard: React.FC<RecentlyViewedItemCardProps> = ({ item, onAddToCart }) => {
  const { t } = useLanguage();

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')}₫`;
  };

  return (
    <Card className="w-[150px] sm:w-[170px] flex-shrink-0 shadow-sm rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow">
      <div className="relative aspect-[3/4] w-full bg-muted/20 group">
        <Image
          src={item.thumbnailImageUrl || item.imageUrl}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          data-ai-hint={item.dataAiHint || 'product image'}
          sizes="(max-width: 640px) 150px, 170px"
        />
        <Button
          variant="outline"
          size="icon"
          className="absolute top-2 right-2 h-9 w-9 bg-background/70 backdrop-blur-sm hover:bg-background border-muted-foreground/30 hover:border-foreground text-foreground rounded-full shadow"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click if any
            onAddToCart(item);
          }}
          aria-label={t('cart.addToCartLabel', { itemName: item.name })}
        >
          <ShoppingBag className="h-5 w-5" />
        </Button>
      </div>
      <CardContent className="p-2.5 space-y-1">
        {item.brand && <p className="text-[11px] font-semibold text-foreground uppercase truncate">{item.brand}</p>}
        <p className="text-xs text-foreground leading-tight line-clamp-2 h-8" title={item.name}>{item.name}</p>
        <p className="text-sm font-bold text-foreground pt-0.5">{formatCurrency(item.price)}</p>
      </CardContent>
    </Card>
  );
};

export default RecentlyViewedItemCard;

