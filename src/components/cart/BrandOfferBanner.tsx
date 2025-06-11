
"use client";

import type React from 'react';
import { Tag, ChevronRight } from 'lucide-react'; // Added ChevronRight
import { Button } from '@/components/ui/button';

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
          variant="outline"
          size="icon" // Changed from "sm"
          onClick={onShopNowClick}
          className="text-green-700 border-green-600 hover:bg-green-100 hover:text-green-800 h-8 w-8 flex-shrink-0" // Adjusted for icon button
          aria-label={shopNowButtonText} // Added aria-label
        >
          {/* shopNowButtonText is removed from visual display */}
          <ChevronRight className="h-4 w-4" /> {/* Removed ml-1 */}
        </Button>
      )}
    </div>
  );
};

export default BrandOfferBanner;

