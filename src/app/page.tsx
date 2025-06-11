
// @ts-nocheck
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle as SheetTitleComponent, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ChevronLeft, Gift, Ticket, Truck, Trash2, ChevronRight, XCircle, CheckCircle2, Clock, AlertTriangle, ShoppingBag } from 'lucide-react';
import type { CartItem, Shop, SimpleVariant, Product } from '@/interfaces';
import { mockShops } from '@/lib/mockData';
import ShopSection from '@/components/cart/ShopSection';
import RecentlyViewedItemCard from '@/components/cart/RecentlyViewedItemCard';
import { useToast } from "@/hooks/use-toast";
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { cn } from "@/lib/utils";

const CHECKOUT_ITEMS_STORAGE_KEY = 'checkoutItems';

interface VoucherInterface {
  id: string;
  title: string;
  imageUrl?: string;
  imageAiHint?: string;
  expiryInfo: string; // e.g., "31/08/2024" or "31/07/2024 - 3 days left"
  conditionText?: string; // e.g., "Spend 500,000 ₫ more to get this voucher"
  restrictionText?: string; // e.g., "Only Apply for PUMA items"
  paymentMethodSwitchText?: string; // e.g., "Switch your payment method to enjoy this offer"
  isSelected: boolean; // For managing selection in the sheet
  isAvailable: boolean;
  unavailableReason?: string; // If !isAvailable
}

const mockAvailableVouchersSheet: VoucherInterface[] = [
  {
    id: 'v_birthday_100k',
    title: 'Birthday Voucher ưu đãi 100.000 ₫',
    imageUrl: 'https://placehold.co/40x40/E91E63/FFFFFF.png', // Pinkish placeholder
    imageAiHint: 'birthday gift voucher',
    expiryInfo: '31/08/2024',
    isSelected: true, // Initially selected for demo
    isAvailable: true,
  },
  {
    id: 'v_techcom_50k',
    title: 'Ưu đãi 50.000, đơn từ 1.000.000 ₫',
    imageUrl: 'https://placehold.co/40x40/D32F2F/FFFFFF.png', // Red placeholder
    imageAiHint: 'Techcombank logo',
    expiryInfo: '31/08/2024',
    isSelected: true, // Initially selected for demo
    isAvailable: true,
  },
  {
    id: 'v_zalopay_5percent',
    title: 'Zalo Pay giảm 5% giá trị đơn hàng',
    imageUrl: 'https://placehold.co/40x40/2196F3/FFFFFF.png', // Blue placeholder
    imageAiHint: 'ZaloPay logo',
    expiryInfo: '02/09/2024',
    paymentMethodSwitchText: 'Switch your payment method to enjoy this offer',
    isSelected: false,
    isAvailable: true,
  },
];

const mockUnavailableVouchersSheet: VoucherInterface[] = [
  {
    id: 'v_techcom_100k_spend',
    title: 'Ưu đãi 100.000, đơn từ 2.000.000 ₫',
    imageUrl: 'https://placehold.co/40x40/D32F2F/FFFFFF.png', // Red placeholder
    imageAiHint: 'Techcombank logo',
    expiryInfo: '31/07/2024 - 3 days left',
    conditionText: 'Spend 500,000 ₫ more to get this voucher',
    isSelected: false,
    isAvailable: false,
    unavailableReason: 'selectVoucher.voucherCard.unavailableReasonMinOrder',
  },
  {
    id: 'v_honda_1m_puma',
    title: 'Honda Voucher ưu đãi 1.000.000 ₫',
    imageUrl: 'https://placehold.co/40x40/F44336/FFFFFF.png', // Another red placeholder
    imageAiHint: 'Honda logo',
    expiryInfo: '31/12/2024',
    restrictionText: 'Only Apply for PUMA items',
    isSelected: false,
    isAvailable: false, // Assuming unavailable for this demo list
    unavailableReason: 'Restricted to specific items.',
  },
];

const calculateShippingVoucherDiscount = (checkoutTotal: number): number => {
  if (checkoutTotal < 1000000) {
    return 0;
  } else if (checkoutTotal >= 1000000 && checkoutTotal < 2000000) {
    return 100000;
  } else if (checkoutTotal >= 2000000 && checkoutTotal < 5000000) {
    return 150000;
  } else if (checkoutTotal >= 5000000 && checkoutTotal < 8000000) {
    return 300000;
  } else if (checkoutTotal >= 8000000) {
    return 450000;
  }
  return 0;
};

const formatVndNumber = (amount: number): string => {
  return amount.toLocaleString('vi-VN');
};

const getShippingVoucherPromotionMessage = (currentCheckoutTotal: number): string => {
  const formatVnd = formatVndNumber;
  const tiers = [
    { min: 0, nextMinOrder: 1000000, nextDiscountAmount: 100000 },
    { min: 1000000, nextMinOrder: 2000000, nextDiscountAmount: 150000 },
    { min: 2000000, nextMinOrder: 5000000, nextDiscountAmount: 300000 },
    { min: 5000000, nextMinOrder: 8000000, nextDiscountAmount: 450000 },
    { min: 8000000, nextMinOrder: Infinity, nextDiscountAmount: 0 }, // Max tier
  ];

  for (const tier of tiers) {
    if (currentCheckoutTotal < tier.nextMinOrder && currentCheckoutTotal >= tier.min) {
      if (tier.nextDiscountAmount > 0) {
        return `Giảm ${formatVnd(tier.nextDiscountAmount)}đ phí vận chuyển cho đơn tối thiểu ${formatVnd(tier.nextMinOrder)}đ`;
      }
      break; 
    }
  }
  return "";
};


const BrandCartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  const [itemsSelectedForCleanup, setItemsSelectedForCleanup] = useState<Set<string>>(new Set());

  const [isVoucherSheetOpen, setIsVoucherSheetOpen] = useState(false);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  
  const [sheetAvailableVouchers, setSheetAvailableVouchers] = useState<VoucherInterface[]>(
    mockAvailableVouchersSheet.map(v => ({...v})) // Create copies to allow local modification
  );
  const [sheetUnavailableVouchers, setSheetUnavailableVouchers] = useState<VoucherInterface[]>(
     mockUnavailableVouchersSheet.map(v => ({...v}))
  );

  const selectedVoucherCountInSheet = useMemo(() => {
    return sheetAvailableVouchers.filter(v => v.isSelected).length;
  }, [sheetAvailableVouchers]);

  const [finalAppliedVoucherSummary, setFinalAppliedVoucherSummary] = useState<string | null>(null);

  const [recentlyViewedItems, setRecentlyViewedItems] = useState<Product[]>([]);

  useEffect(() => {
    // Client-side only initialization for cartItems
    const initialCartItems = mockShops.flatMap(shop =>
      shop.products.map(p => ({ ...p, cartItemId: `${p.id}-${Date.now()}-${Math.random().toString(36).substring(2,7)}`, quantity: 1, selected: false }))
    );
    setCartItems(initialCartItems);

    // Simulate fetching recently viewed items.
    const allProducts = mockShops.flatMap(shop => shop.products);
    const sampleRecentItems: Product[] = [
      allProducts.find(p => p.id === 'puma1'), // Balo
      allProducts.find(p => p.id === 'havaianas2'), // Sandals
      allProducts.find(p => p.id === 'mlb1'), // Shirt
      allProducts.find(p => p.id === 'puma3'), // Cap
      allProducts.find(p => p.id === 'havaianas1'), // Flipflops
      allProducts.find(p => p.id === 'mlb2'), // Shorts
    ].filter(Boolean) as Product[]; 

    setRecentlyViewedItems(sampleRecentItems.slice(0, 6));
  }, []);


  useEffect(() => {
    const count = sheetAvailableVouchers.filter(v => v.isSelected).length;
    if (count > 0) {
      setFinalAppliedVoucherSummary(t('selectVoucher.footer.vouchersSelected', { count }));
    } else {
      setFinalAppliedVoucherSummary(null);
    }
  }, [sheetAvailableVouchers, t]);


  const handleToggleSelectAll = (checked: boolean) => {
    setCartItems(prevItems => prevItems.map(item => item.stock !== 0 ? { ...item, selected: checked } : item));
  };

  const handleToggleShopSelect = (shopName: string, checked: boolean) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        (item.brand === shopName && item.stock !== 0) ? { ...item, selected: checked } : item
      )
    );
  };

  const handleToggleItemSelect = (cartItemId: string, checked: boolean) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        (item.cartItemId === cartItemId && item.stock !== 0) ? { ...item, selected: checked } : item
      )
    );
  };

  const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
    const itemToUpdate = cartItems.find(item => item.cartItemId === cartItemId);
    if (!itemToUpdate) return;

    if (newQuantity < 1) return;

    const currentItemStock = itemToUpdate.stock;
    let effectiveMaxQuantity = 99; // Default application-wide max

    if (currentItemStock !== undefined && currentItemStock < effectiveMaxQuantity) {
      effectiveMaxQuantity = currentItemStock;
    }
    
    if (effectiveMaxQuantity === 0 && newQuantity > 0) { 
      toast({
        title: t('toast.itemOutOfStock.title', { itemName: itemToUpdate.name }),
        description: t('toast.itemOutOfStock.description'),
        variant: "destructive",
      });
      return; 
    }

    if (newQuantity > effectiveMaxQuantity) {
      if (currentItemStock !== undefined && newQuantity > currentItemStock) {
        toast({
          title: t('toast.stockLimitReached.title', { itemName: itemToUpdate.name }),
          description: t('toast.stockLimitReached.description', { stock: currentItemStock }),
          variant: "destructive",
        });
      } else { 
         toast({
          title: t('toast.limitReachedTitle'),
          description: t('toast.limitReachedDescription'),
          variant: "destructive",
        });
      }
      newQuantity = effectiveMaxQuantity; 
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleDeleteItem = (cartItemId: string) => {
    const itemToRemove = cartItems.find(item => item.cartItemId === cartItemId);
    setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
    if (itemToRemove) {
      toast({
        title: t('toast.itemRemovedTitleSingle', { itemName: itemToRemove.name }),
      });
    }
  };
  
  const handleVariantChange = (cartItemId: string, newVariantData: SimpleVariant) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.cartItemId === cartItemId) {
          // If the new variant is out of stock, deselect the item
          const newSelectedState = newVariantData.stock === 0 ? false : item.selected;
          const newQuantity = (newVariantData.stock !== undefined && item.quantity > newVariantData.stock) ? Math.max(1, newVariantData.stock) : item.quantity;


          return {
            ...item,
            variant: newVariantData.name,
            price: newVariantData.price !== undefined ? newVariantData.price : item.price,
            originalPrice: newVariantData.originalPrice !== undefined ? newVariantData.originalPrice : item.originalPrice,
            imageUrl: newVariantData.imageUrl !== undefined ? newVariantData.imageUrl : item.imageUrl,
            stock: newVariantData.stock !== undefined ? newVariantData.stock : item.stock,
            dataAiHint: newVariantData.dataAiHint !== undefined ? newVariantData.dataAiHint : item.dataAiHint,
            selected: newSelectedState,
            quantity: newQuantity,
          };
        }
        return item;
      })
    );
  };

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      if (item.selected && item.stock !== 0) { // Only include selected and in-stock items
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);
  }, [cartItems]);

  const isAnythingSelected = useMemo(() => cartItems.some(item => item.selected && item.stock !== 0), [cartItems]);
  
  const areAllItemsEffectivelySelected = useMemo(() => {
    const inStockItems = cartItems.filter(item => item.stock !== 0);
    if (inStockItems.length === 0) return false;
    return inStockItems.every(item => item.selected);
  }, [cartItems]);

  const selectedItemsCount = useMemo(() => {
    return cartItems.filter(item => item.selected && item.stock !== 0).length;
  }, [cartItems]);


  const handleCheckout = () => {
    const selectedCartItems = cartItems.filter(item => item.selected && item.stock !== 0);
    if (selectedCartItems.length > 0) {
      localStorage.setItem(CHECKOUT_ITEMS_STORAGE_KEY, JSON.stringify(selectedCartItems));
      router.push('/checkout');
    } else {
       toast({
        title: t('toast.noItemsSelectedTitle'),
        description: t('toast.noItemsSelectedDescription'),
        variant: "destructive",
      });
    }
  };

  const itemsByShop = useMemo(() => {
    return mockShops.map(shopData => {
      const productsInShop = cartItems.filter(item => item.brand === shopData.name);
      const inStockProductsInShop = productsInShop.filter(item => item.stock !== 0);
      return {
        ...shopData,
        products: productsInShop,
        isShopSelected: inStockProductsInShop.length > 0 && inStockProductsInShop.every(item => item.selected),
      };
    }).filter(shopGroup => shopGroup.products.length > 0); 
  }, [cartItems]);

  const openCleanupDialog = () => {
    setItemsSelectedForCleanup(new Set()); 
    setIsCleanupDialogOpen(true);
  };

  const closeCleanupDialog = () => {
    setIsCleanupDialogOpen(false);
    setItemsSelectedForCleanup(new Set());
  };

  const toggleItemForCleanup = (cartItemId: string) => {
    setItemsSelectedForCleanup(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cartItemId)) {
        newSet.delete(cartItemId);
      } else {
        newSet.add(cartItemId);
      }
      return newSet;
    });
  };

  const confirmCleanup = () => {
    const itemsToRemoveCount = itemsSelectedForCleanup.size;
    setCartItems(prevItems => prevItems.filter(item => !itemsSelectedForCleanup.has(item.cartItemId)));
    closeCleanupDialog();
    if (itemsToRemoveCount > 0) {
      toast({
        title: t('toast.itemsRemovedTitle'),
        description: t('toast.itemsRemovedDescription', { count: itemsToRemoveCount }),
      });
    }
  };
  
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')}₫`;
  };

  const VoucherCardDisplay = ({ voucher, onToggleSelect }: { voucher: VoucherInterface; onToggleSelect: (id: string) => void; }) => {
    const { t } = useLanguage();
    const canSelect = voucher.isAvailable;

    return (
      <Card 
        className={cn(
          "mb-3 shadow-sm overflow-hidden border",
          !canSelect && "bg-muted/50 opacity-70",
          canSelect && "cursor-pointer hover:bg-muted/20",
          voucher.isSelected && canSelect && "border-2 border-ring"
        )}
        onClick={() => canSelect && onToggleSelect(voucher.id)}
      >
        <CardContent className="p-3">
          <div className="flex items-start space-x-3">
            {voucher.imageUrl && (
              <Image
                src={voucher.imageUrl}
                alt={voucher.imageAiHint || 'voucher logo'}
                width={40}
                height={40}
                className="rounded object-contain flex-shrink-0 mt-0.5 border"
                data-ai-hint={voucher.imageAiHint || "voucher logo"}
              />
            )}
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{voucher.title}</p>
              {voucher.conditionText && <p className="text-xs text-muted-foreground mt-0.5">{voucher.conditionText}</p>}
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                <span>{voucher.expiryInfo}</span>
              </div>
              {voucher.paymentMethodSwitchText && (
                <p className="text-xs text-blue-600 mt-1">{voucher.paymentMethodSwitchText}</p>
              )}
            </div>
            {canSelect && (
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                {voucher.isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-foreground" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                )}
              </div>
            )}
            {!canSelect && voucher.unavailableReason && (
               <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                 <XCircle className="w-5 h-5 text-destructive" />
               </div>
            )}
          </div>
          {voucher.restrictionText && (
            <div className="mt-2 bg-destructive/80 text-destructive-foreground text-xs p-2 rounded flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{voucher.restrictionText}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const handleToggleVoucherInSheet = (voucherId: string) => {
    setSheetAvailableVouchers(prev => 
      prev.map(v => v.id === voucherId ? { ...v, isSelected: !v.isSelected } : v)
    );
  };

  const handleApplyVoucherInSheet = () => {
    if (voucherCodeInput.trim() === '') return;
    toast({
      title: t('toast.voucher.codeApplied', {code: voucherCodeInput})
    });
  };

  const handleConfirmVoucherSelectionInSheet = () => {
    const selectedCount = sheetAvailableVouchers.filter(v => v.isSelected).length;
    if (selectedCount > 0) {
      setFinalAppliedVoucherSummary(t('selectVoucher.footer.vouchersSelected', { count: selectedCount }));
      toast({ title: t('selectVoucher.footer.vouchersSelected', { count: selectedCount }) });
    } else {
      setFinalAppliedVoucherSummary(null);
      toast({ title: t('selectVoucher.footer.notSelectedInfo') });
    }
    setIsVoucherSheetOpen(false);
  };

  const handleAddToCartRecentlyViewed = (itemToAdd: Product) => {
    const existingCartItem = cartItems.find(ci => ci.id === itemToAdd.id);

    if (existingCartItem) {
      handleQuantityChange(existingCartItem.cartItemId, existingCartItem.quantity + 1);
      toast({
        title: t('toast.itemQuantityIncreased.title', { itemName: itemToAdd.name }),
        description: t('toast.itemQuantityIncreased.description')
      });
    } else {
      const newCartItem: CartItem = {
        ...itemToAdd,
        cartItemId: `${itemToAdd.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        quantity: 1,
        selected: false, 
      };
      setCartItems(prevItems => [...prevItems, newCartItem]);
      toast({
        title: t('toast.itemAddedToCart.title', { itemName: itemToAdd.name }),
        description: t('toast.itemAddedToCart.description')
      });
    }
  };

  const shippingDiscount = useMemo(() => {
    return calculateShippingVoucherDiscount(totalAmount);
  }, [totalAmount]);

  const shippingPromotionMessage = useMemo(() => {
    return getShippingVoucherPromotionMessage(totalAmount);
  }, [totalAmount]);
  
  const displayShippingMessage = useMemo(() => {
    const promotion = getShippingVoucherPromotionMessage(totalAmount);
    if (promotion) {
      return promotion;
    }
    const discount = calculateShippingVoucherDiscount(totalAmount);
    if (discount > 0) {
      return t('cart.vouchersAndShipping.shippingDiscountApplied', { amount: formatCurrency(discount) });
    }
    return t('cart.vouchersAndShipping.noPromotionsAvailable');
  }, [totalAmount, t]);

  const truckIconClass = useMemo(() => {
    const promotion = getShippingVoucherPromotionMessage(totalAmount);
    const discount = calculateShippingVoucherDiscount(totalAmount);
    if (!promotion && discount > 0) { // Max tier reached AND discount applied
      return 'text-green-500';
    }
    return 'text-muted-foreground'; // Incentive or no promotion
  }, [totalAmount]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-20 bg-card shadow-sm border-b h-14">
        <div className="container mx-auto px-4 py-3 h-full flex justify-between items-center">
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted hover:text-foreground">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex-grow flex justify-center items-center min-w-0 px-2">
            <Breadcrumbs />
          </div>
          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-grow pt-14 pb-20">
        <div className="container mx-auto px-0 sm:px-2 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {cartItems.length === 0 ? (
             <div className="text-center py-10 px-4">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-headline text-muted-foreground">{t('cart.emptyCartTitle')}</p>
                <p className="font-body text-muted-foreground">{t('cart.emptyCartMessage')}</p>
            </div>
          ) : (
            <>
              {itemsByShop.length > 0 && itemsByShop[0] && (
                <ShopSection
                  key={itemsByShop[0].name}
                  shop={itemsByShop[0]}
                  items={itemsByShop[0].products}
                  isShopSelected={itemsByShop[0].isShopSelected}
                  onShopSelectToggle={(checked) => handleToggleShopSelect(itemsByShop[0].name, checked)}
                  onItemSelectToggle={handleToggleItemSelect}
                  onQuantityChange={handleQuantityChange}
                  onDeleteItem={handleDeleteItem}
                  onVariantChange={handleVariantChange}
                />
              )}

              {cartItems.length > 0 && (
                <Card className="bg-card p-4 rounded-lg shadow mx-2 sm:mx-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Trash2 className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                      <span className="text-sm text-foreground">{t('cart.unneededItemsTitle')}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-foreground border-foreground hover:bg-muted hover:text-foreground"
                      onClick={openCleanupDialog}
                      disabled={cartItems.length === 0}
                    >
                      {t('cart.removeButton')}
                    </Button>
                  </div>
                </Card>
              )}

              {itemsByShop.slice(1).map(shopGroup => (
                <ShopSection
                  key={shopGroup.name}
                  shop={shopGroup}
                  items={shopGroup.products}
                  isShopSelected={shopGroup.isShopSelected}
                  onShopSelectToggle={(checked) => handleToggleShopSelect(shopGroup.name, checked)}
                  onItemSelectToggle={handleToggleItemSelect}
                  onQuantityChange={handleQuantityChange}
                  onDeleteItem={handleDeleteItem}
                  onVariantChange={handleVariantChange}
                />
              ))}
            </>
          )}

          {cartItems.length > 0 && (
            <Card className="bg-card px-4 rounded-lg shadow mx-2 sm:mx-0">
              <Sheet open={isVoucherSheetOpen} onOpenChange={setIsVoucherSheetOpen}>
                <SheetTrigger asChild>
                  <div className="flex items-center justify-between py-2 border-b cursor-pointer hover:bg-muted/50 -mx-4 px-4">
                    <div className="flex items-center">
                      <Ticket className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                      <span className="text-sm text-foreground">
                        {finalAppliedVoucherSummary 
                          ? finalAppliedVoucherSummary 
                          : t('cart.vouchersAndShipping.voucherLabel', { amount: "5k" }) // Fallback
                        }
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85vh] flex flex-col p-0 rounded-t-lg">
                  <SheetHeader className="p-4 border-b sticky top-0 bg-card z-10 flex flex-row items-center justify-between">
                     <Button variant="ghost" size="icon" onClick={() => setIsVoucherSheetOpen(false)} className="-ml-2">
                        <ChevronLeft className="w-5 h-5" />
                     </Button>
                    <SheetTitleComponent className="text-lg text-center font-semibold flex-grow">{t('selectVoucher.titleOffers')}</SheetTitleComponent>
                    <div className="w-8"></div> {/* Spacer to balance the back button */}
                  </SheetHeader>
                  
                  <div className="p-4 border-b bg-card z-10 space-y-3">
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="voucherTypeSelect" className="text-sm whitespace-nowrap">{t('selectVoucher.typeOfVoucherLabel')}:</Label>
                        <Select defaultValue="all">
                            <SelectTrigger id="voucherTypeSelect" className="h-9 text-sm">
                                <SelectValue placeholder={t('selectVoucher.allVouchersOption')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('selectVoucher.allVouchersOption')}</SelectItem>
                                {/* Add other filter options here later */}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        placeholder={t('selectVoucher.inputPlaceholder')}
                        value={voucherCodeInput}
                        onChange={(e) => setVoucherCodeInput(e.target.value)}
                        className="flex-grow h-10 text-sm"
                      />
                      <Button
                        onClick={handleApplyVoucherInSheet}
                        disabled={voucherCodeInput.trim() === ''}
                        className="h-10 text-sm bg-foreground hover:bg-foreground/90 text-accent-foreground"
                      >
                        {t('selectVoucher.applyButton')}
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="flex-grow p-4">
                      <div>
                        {/* Usable Vouchers Title is part of general list now */}
                        {sheetAvailableVouchers.map(voucher => (
                          <VoucherCardDisplay
                            key={voucher.id} 
                            voucher={voucher} 
                            onToggleSelect={handleToggleVoucherInSheet}
                          />
                        ))}
                        {sheetAvailableVouchers.length === 0 && <p className="text-xs text-muted-foreground px-1 py-4 text-center">{t('selectVoucher.noUsableVouchers')}</p>}
                      </div>

                      {sheetUnavailableVouchers.length > 0 && (
                        <div className="mt-6">
                          <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{t('selectVoucher.unusableVouchersTitle')}</h2>
                          {sheetUnavailableVouchers.map(voucher => (
                            <VoucherCardDisplay
                              key={voucher.id} 
                              voucher={voucher} 
                              onToggleSelect={() => {}} // Non-selectable
                            />
                          ))}
                        </div>
                      )}
                  </ScrollArea>
                  
                  <SheetFooter className="p-3 border-t sticky bottom-0 bg-card z-10 flex flex-row items-center justify-between w-full">
                    <p className="text-sm text-foreground font-medium">
                      {t('selectVoucher.footer.vouchersSelected', {count: selectedVoucherCountInSheet })}
                    </p>
                    <Button
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold min-w-[120px]"
                      onClick={handleConfirmVoucherSelectionInSheet}
                      disabled={selectedVoucherCountInSheet === 0 && voucherCodeInput.trim() === ''} // Allow confirm if code entered
                    >
                      {t('selectVoucher.footer.useVoucherButton')}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

             <div className="flex items-center justify-between py-2 cursor-pointer hover:bg-muted/50 -mx-4 px-4">
                <div className="flex items-center">
                  <Truck className={`w-5 h-5 mr-3 flex-shrink-0 ${truckIconClass}`} />
                  <span className={cn("text-sm truncate", truckIconClass === 'text-green-500' ? 'text-green-600' : 'text-muted-foreground')}>
                    {displayShippingMessage}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
          )}

          {recentlyViewedItems.length > 0 && (
            <div className="pt-2">
              <h2 className="text-lg font-semibold text-foreground mb-3">{t('cart.recentlyViewedTitle')}</h2>
              <ScrollArea className="w-full whitespace-nowrap" orientation="horizontal">
                <div className="flex space-x-3 sm:space-x-4 pb-3">
                  {recentlyViewedItems.map(item => (
                    <RecentlyViewedItemCard key={`recent-${item.id}`} item={item} onAddToCart={handleAddToCartRecentlyViewed} />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-20 bg-card border-t h-20">
        <div className="container mx-auto px-4 py-3 h-full flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all-footer"
              checked={areAllItemsEffectivelySelected}
              onCheckedChange={(checked) => handleToggleSelectAll(Boolean(checked))}
              aria-label="Select all items"
              disabled={cartItems.filter(item => item.stock !== 0).length === 0} // Disable if all in-stock items are 0
            />
            <label htmlFor="select-all-footer" className="text-sm text-foreground cursor-pointer">
              {t('cart.selectAll')}
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{t('cart.totalAmountLabel')}</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={!isAnythingSelected}
              size="lg"
              className="bg-foreground hover:bg-foreground/90 text-accent-foreground font-semibold px-4 py-2 text-sm min-w-[120px]"
            >
              {t('cart.checkoutButton', { count: selectedItemsCount })}
            </Button>
          </div>
        </div>
      </footer>

      <Dialog open={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('cart.dialog.removeUnneededTitle')}</DialogTitle>
            <DialogDescription>
              {t('cart.dialog.removeUnneededDescription')}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-4">
              {cartItems.length > 0 ? cartItems.map(item => (
                <div key={`cleanup-${item.cartItemId}`} className="flex flex-col items-center p-2 rounded-md hover:bg-muted/50 border border-transparent has-[:checked]:border-destructive/50 has-[:checked]:bg-destructive/5">
                  <Checkbox
                    id={`cleanup-cb-${item.cartItemId}`}
                    checked={itemsSelectedForCleanup.has(item.cartItemId)}
                    onCheckedChange={() => toggleItemForCleanup(item.cartItemId)}
                    className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive self-end mb-1"
                  />
                  <label htmlFor={`cleanup-cb-${item.cartItemId}`} className="flex flex-col items-center space-y-1 cursor-pointer w-full">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      width={64} 
                      height={64} 
                      className="rounded-md object-cover w-16 h-16 shrink-0 border"
                      data-ai-hint={item.dataAiHint}
                    />
                    <div className="text-center w-full">
                      <p className="text-xs font-medium leading-tight truncate" title={item.name}>
                        {item.name}
                      </p>
                      {item.variant && <p className="text-xxs text-muted-foreground mt-0.5 truncate">{item.variant.replace(/\s*\(\+\d+\)\s*$/, '')}</p>}
                       <p className="text-xs font-semibold text-foreground mt-0.5">{formatCurrency(item.price)}</p>
                    </div>
                  </label>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t('cart.emptyCartTitle')}</p>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={closeCleanupDialog}>{t('cart.dialog.cancelButton')}</Button>
            <Button 
              onClick={confirmCleanup} 
              disabled={itemsSelectedForCleanup.size === 0 || cartItems.length === 0}
              variant="destructive"
            >
              {t('cart.dialog.removeSelectedButton', { count: itemsSelectedForCleanup.size })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default BrandCartPage;

