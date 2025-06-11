
"use client";

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronRight } from 'lucide-react';

// Define the stages for the progress indicator
const STAGES_CONFIG = [
  { key: 'cart', labelKey: 'breadcrumbs.cartSimple', paths: ['/'] },
  { key: 'checkout', labelKey: 'breadcrumbs.checkout', paths: ['/checkout', '/select-address', '/add-address', '/select-voucher'] },
  { key: 'complete', labelKey: 'breadcrumbs.payment', paths: ['/payment'] },
];

interface BreadcrumbsMainProps {
  // totalCartItems prop is no longer needed for this fixed-stage design
}

const BreadcrumbsInner: React.FC<BreadcrumbsMainProps> = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const determineActiveStageKey = (): string => {
    for (const stage of STAGES_CONFIG) {
      if (stage.key === 'cart' && pathname === '/') {
        return stage.key;
      }
      if (stage.paths.some(p => p !== '/' && pathname.startsWith(p))) {
        return stage.key;
      }
    }
    // Default to 'cart' if no specific match, though with current routes, one should always match.
    if (pathname === '/') return 'cart'; 
    return 'cart'; // Fallback, should ideally not be reached if paths are comprehensive
  };

  const activeStageKey = determineActiveStageKey();

  return (
    <nav aria-label="Progress" className="flex items-center text-sm overflow-x-auto whitespace-nowrap py-1">
      {STAGES_CONFIG.map((stage, index) => {
        const isActive = stage.key === activeStageKey;
        const label = t(stage.labelKey);

        return (
          <React.Fragment key={stage.key}>
            <span className={isActive ? "font-semibold text-foreground" : "text-muted-foreground"}>
              {label}
            </span>
            {index < STAGES_CONFIG.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground mx-1 flex-shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

const Breadcrumbs: React.FC<BreadcrumbsMainProps> = (props) => {
  return (
    <Suspense fallback={<div className="h-5 w-36 bg-muted rounded animate-pulse mx-auto"></div>}>
      <BreadcrumbsInner {...props} />
    </Suspense>
  );
};

export default Breadcrumbs;
