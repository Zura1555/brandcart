
"use client";

import type React from 'react';
import { Tag } from 'lucide-react';

interface BrandOfferBannerProps {
  offerText: string;
}

const BrandOfferBanner: React.FC<BrandOfferBannerProps> = ({ offerText }) => {
  if (!offerText) {
    return null;
  }

  return (
    <div className="bg-green-50 rounded-lg p-3 mb-4 flex items-center gap-x-3">
      <Tag className="h-5 w-5 text-green-800 flex-shrink-0" />
      <p className="text-green-800 font-medium text-sm">{offerText}</p>
    </div>
  );
};

export default BrandOfferBanner;
