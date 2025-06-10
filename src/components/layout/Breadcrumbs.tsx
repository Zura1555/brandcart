
"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItemDef {
  href: string;
  labelKey: string;
  dynamicLabelParams?: (pathname: string, searchParams: URLSearchParams, totalCartItems?: number) => Record<string, string | number> | undefined;
}

interface BreadcrumbsMainProps {
  totalCartItems?: number; 
}

const BreadcrumbsInner: React.FC<BreadcrumbsMainProps> = ({ totalCartItems }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const getBreadcrumbItems = (): BreadcrumbItemDef[] => {
    const items: BreadcrumbItemDef[] = [];

    // Logic for the Cart breadcrumb item
    // Always use 'breadcrumbs.cartSimple' for the cart link/title, which does not include item count.
    items.push({
      href: '/',
      labelKey: 'breadcrumbs.cartSimple',
      // dynamicLabelParams is no longer needed for count here, as 'cartSimple' doesn't use it.
    });

    if (pathname.startsWith('/checkout') || pathname.startsWith('/select-address') || pathname.startsWith('/add-address') || pathname.startsWith('/select-voucher') || pathname.startsWith('/payment')) {
      items.push({ href: '/checkout', labelKey: 'breadcrumbs.checkout' });
    }

    if (pathname.startsWith('/select-address') || pathname.startsWith('/add-address')) {
      items.push({ href: '/select-address', labelKey: 'breadcrumbs.selectAddress' });
    }
    if (pathname.startsWith('/add-address')) {
      const isEdit = !!searchParams.get('editId');
      items.push({ href: pathname, labelKey: isEdit ? 'breadcrumbs.editAddress' : 'breadcrumbs.addAddress' });
    }

    if (pathname.startsWith('/select-voucher')) {
      items.push({ href: '/select-voucher', labelKey: 'breadcrumbs.selectVoucher' });
    }
    
    if (pathname.startsWith('/payment')) { 
        items.push({ href: '/payment', labelKey: 'breadcrumbs.payment' });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm overflow-x-auto whitespace-nowrap py-1">
      {breadcrumbItems.map((item, index) => {
        // Determine if the current breadcrumb item represents the current page.
        const isCurrentPage = item.href === pathname || (pathname.startsWith(item.href) && (item.href === '/add-address' || item.href === '/payment'));


        let label = t(item.labelKey);
        if (item.dynamicLabelParams) {
          // Pass the current page's pathname and searchParams, and totalCartItems
          const params = item.dynamicLabelParams(pathname, searchParams, totalCartItems);
          if (params) {
            label = t(item.labelKey, params);
          }
        }
        
        return (
          <React.Fragment key={item.href + index}>
            {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-1 flex-shrink-0" />}
            {isCurrentPage ? (
              <span className="font-semibold text-foreground">
                {label}
              </span>
            ) : (
              <Link href={item.href} className="text-muted-foreground hover:text-foreground">
                {label}
              </Link>
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

