
"use client";

import type React from 'react';
import { Tag } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Added Button import

interface BrandOfferBannerProps {
  offerText: string;
  shopNowButtonText?: string;
  onShopNowClick?: () => void;
}

const BrandOfferBanner: React.FC<BrandOfferBannerProps> = ({ offerText, shopNowButtonText, onShopNowClick }) => {
  if (!offerText) {
    return null;
  }

  return (
    <div className="bg-green-50 rounded-lg p-3 mb-4 flex justify-between items-center gap-x-3">
      <div className="flex items-center gap-x-2">
        <Tag className="h-5 w-5 text-green-800 flex-shrink-0" />
        <p className="text-green-800 font-medium text-sm">{offerText}</p>
      </div>
      {shopNowButtonText && onShopNowClick && (
        <Button
          variant="link"
          size="sm"
          onClick={onShopNowClick}
          className="text-green-700 hover:text-green-800 hover:underline px-2 h-auto py-1 flex-shrink-0"
        >
          {shopNowButtonText}
        </Button>
      )}
    </div>
  );
};

export default BrandOfferBanner;
