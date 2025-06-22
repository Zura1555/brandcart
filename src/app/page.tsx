
// @ts-nocheck
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle as SheetTitleComponent, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ChevronLeft, Gift, Ticket, Truck, Trash2, ChevronRight, XCircle, CheckCircle2, Clock, AlertTriangle, ShoppingBag, PlusCircle } from 'lucide-react';
import type { CartItem, Shop, SimpleVariant, Product, SelectedVoucherInfo, ShippingAddress } from '@/interfaces';
import { mockShops, mockRelevantProducts, newRecentlyViewedProducts } from '@/lib/mockData';
import ShopSection from '@/components/cart/ShopSection';
import RecentlyViewedItemCard from '@/components/cart/RecentlyViewedItemCard';
import { useToast } from "@/hooks/use-toast";
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


const CHECKOUT_ITEMS_STORAGE_KEY = 'checkoutItems';
const SELECTED_VOUCHER_COUNT_KEY = 'selectedVoucherUserCount';
const SELECTED_VOUCHERS_DETAILS_KEY = 'selectedVouchersDetails';
const FINAL_ORDER_DETAILS_KEY = 'finalOrderDetailsForPayment';
const USER_ADDRESSES_STORAGE_KEY = 'userShippingAddresses';
const SELECTED_ADDRESS_STORAGE_KEY = 'selectedShippingAddressId';


interface VoucherInterface {
  id: string;
  title: string;
  imageUrl?: string;
  imageAiHint?: string;
  expiryInfo: string; 
  conditionText?: string; 
  restrictionText?: string; 
  paymentMethodSwitchText?: string; 
  isSelected: boolean; 
  isAvailable: boolean;
  unavailableReason?: string; 
  discountValue: number;
  discountType: 'fixed' | 'percentage';
}

const mockAvailableVouchersSheet: VoucherInterface[] = [
  {
    id: 'v_birthday_100k',
    title: 'Birthday Voucher ưu đãi 100.000 ₫',
    imageUrl: 'https://placehold.co/40x40/E91E63/FFFFFF.png', 
    imageAiHint: 'birthday gift voucher',
    expiryInfo: '31/08/2024',
    isSelected: false, 
    isAvailable: true,
    discountValue: 100000,
    discountType: 'fixed',
  },
  {
    id: 'v_techcom_50k',
    title: 'Ưu đãi 50.000, đơn từ 1.000.000 ₫',
    imageUrl: 'https://placehold.co/40x40/D32F2F/FFFFFF.png', 
    imageAiHint: 'Techcombank logo',
    expiryInfo: '31/08/2024',
    isSelected: false, 
    isAvailable: true,
    discountValue: 50000,
    discountType: 'fixed',
  },
  {
    id: 'v_zalopay_5percent',
    title: 'Zalo Pay giảm 5% giá trị đơn hàng',
    imageUrl: 'https://placehold.co/40x40/2196F3/FFFFFF.png', 
    imageAiHint: 'ZaloPay logo',
    expiryInfo: '02/09/2024',
    paymentMethodSwitchText: 'Switch your payment method to enjoy this offer',
    isSelected: false,
    isAvailable: true,
    discountValue: 50000, // Example fixed value for 5% up to 50k
    discountType: 'percentage', 
  },
  {
    id: 'v_generic_20k_from_200k',
    title: 'Giảm 20.000₫ cho đơn từ 200.000₫',
    imageUrl: 'https://placehold.co/40x40/FF9800/FFFFFF.png',
    imageAiHint: 'generic discount',
    expiryInfo: '30/09/2024',
    isSelected: false,
    isAvailable: true,
    discountValue: 20000,
    discountType: 'fixed',
    conditionText: 'Đơn tối thiểu 200.000₫',
  },
  {
    id: 'v_shipping_15k',
    title: 'Giảm 15.000₫ phí vận chuyển',
    imageUrl: 'https://placehold.co/40x40/4CAF50/FFFFFF.png',
    imageAiHint: 'shipping discount',
    expiryInfo: '31/10/2024',
    isSelected: false,
    isAvailable: true,
    discountValue: 15000,
    discountType: 'fixed',
  },
];

const mockUnavailableVouchersSheet: VoucherInterface[] = [
  {
    id: 'v_techcom_100k_spend',
    title: 'Ưu đãi 100.000, đơn từ 2.000.000 ₫',
    imageUrl: 'https://placehold.co/40x40/D32F2F/FFFFFF.png', 
    imageAiHint: 'Techcombank logo',
    expiryInfo: '31/07/2024 - 3 days left',
    conditionText: 'Spend 500,000 ₫ more to get this voucher',
    isSelected: false,
    isAvailable: false,
    unavailableReason: 'selectVoucher.voucherCard.unavailableReasonMinOrder',
    discountValue: 100000,
    discountType: 'fixed',
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

  const [isVoucherSheetOpen, setIsVoucherSheetOpen] = useState(false);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');

  const [sheetAvailableVouchers, setSheetAvailableVouchers] = useState<VoucherInterface[]>(
    mockAvailableVouchersSheet.map(v => ({...v})) 
  );
  const [sheetUnavailableVouchers, setSheetUnavailableVouchers] = useState<VoucherInterface[]>(
     mockUnavailableVouchersSheet.map(v => ({...v}))
  );

  const selectedVoucherCountInSheet = useMemo(() => {
    return sheetAvailableVouchers.filter(v => v.isSelected).length;
  }, [sheetAvailableVouchers]);

  const [voucherTriggerText, setVoucherTriggerText] = useState<string>('');

  const [recentlyViewedItems, setRecentlyViewedItems] = useState<Product[]>([]);

  const [itemPendingDeletion, setItemPendingDeletion] = useState<CartItem | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [lastAddedBrand, setLastAddedBrand] = useState<string | null>(null);
  
  const [actualTotalVoucherDiscount, setActualTotalVoucherDiscount] = useState(0);


  useEffect(() => {
    const initialCartItems = mockShops.flatMap(shop =>
      shop.products.map(p => ({ ...p, cartItemId: `${p.id}-${Date.now()}-${Math.random().toString(36).substring(2,7)}`, quantity: 1, selected: false }))
    );
    setCartItems(initialCartItems);
    
    setRecentlyViewedItems(newRecentlyViewedProducts.slice(0, 6));

    if (typeof window !== 'undefined') {
      // Add default address if none exist
      const existingAddressesRaw = localStorage.getItem(USER_ADDRESSES_STORAGE_KEY);
      if (!existingAddressesRaw || JSON.parse(existingAddressesRaw).length === 0) {
        const defaultAddress: ShippingAddress = {
          id: 'default-addr-1',
          name: 'John Doe',
          phone: '0987654321',
          streetAddress: '123 Main Street',
          ward: 'pdk', // Phường Đa Kao
          district: 'q1', // Quận 1
          province: 'hcm', // TP. Hồ Chí Minh
          address: '123 Main Street, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh',
          addressType: 'home',
          isDefault: true,
        };
        localStorage.setItem(USER_ADDRESSES_STORAGE_KEY, JSON.stringify([defaultAddress]));
        localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, defaultAddress.id);
      }

      const storedVouchersRaw = localStorage.getItem(SELECTED_VOUCHERS_DETAILS_KEY);
      if (storedVouchersRaw) {
          try {
              const storedSelectedVoucherInfos: SelectedVoucherInfo[] = JSON.parse(storedVouchersRaw);
              setSheetAvailableVouchers(prevSheetVouchers =>
                  prevSheetVouchers.map(sv => ({
                      ...sv,
                      isSelected: storedSelectedVoucherInfos.some(info => info.id === sv.id)
                  }))
              );
          } catch (e) {
              console.error("Error parsing selected vouchers from localStorage for sheet init:", e);
          }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedVoucherCountRaw = localStorage.getItem(SELECTED_VOUCHER_COUNT_KEY);
      const count = storedVoucherCountRaw ? parseInt(storedVoucherCountRaw, 10) : 0;

      if (count > 0) {
          setVoucherTriggerText(t('selectVoucher.footer.vouchersSelected', { count: count }));
      } else {
          setVoucherTriggerText(t('cart.vouchersAndShipping.availableVouchersText', { count: mockAvailableVouchersSheet.length }));
      }

      let discount = 0;
      const storedVouchersDetailsRaw = localStorage.getItem(SELECTED_VOUCHERS_DETAILS_KEY);
      if (storedVouchersDetailsRaw) {
        try {
          const selectedVouchers: SelectedVoucherInfo[] = JSON.parse(storedVouchersDetailsRaw);
          discount = selectedVouchers.reduce((sum, v) => sum + (v.discountValue || 0), 0);
        } catch (e) {
          console.error("Error parsing selectedVouchersData from localStorage on cart page", e);
        }
      }
      setActualTotalVoucherDiscount(discount);
    }
  }, [isVoucherSheetOpen, t]);


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

    if (newQuantity === 0) {
      setItemPendingDeletion(itemToUpdate);
      setIsConfirmDeleteDialogOpen(true);
      return;
    }

    const currentItemStock = itemToUpdate.stock;
    let effectiveMaxQuantity = 99; 

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

  const confirmDeleteItem = () => {
    if (itemPendingDeletion) {
      handleDeleteItem(itemPendingDeletion.cartItemId);
    }
    setItemPendingDeletion(null);
    setIsConfirmDeleteDialogOpen(false);
  };

  const cancelDeleteItem = () => {
    setItemPendingDeletion(null);
    setIsConfirmDeleteDialogOpen(false);
  };

  const handleVariantChange = (cartItemId: string, newVariantData: SimpleVariant) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.cartItemId === cartItemId) {
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

  const subtotalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      if (item.selected && item.stock !== 0) { 
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);
  }, [cartItems]);

  const finalTotalAmount = useMemo(() => {
    return Math.max(0, subtotalAmount - actualTotalVoucherDiscount);
  }, [subtotalAmount, actualTotalVoucherDiscount]);


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
      if (typeof window !== 'undefined') {
        localStorage.removeItem(FINAL_ORDER_DETAILS_KEY); // Clear previous successful order
        localStorage.setItem(CHECKOUT_ITEMS_STORAGE_KEY, JSON.stringify(selectedCartItems));
      }
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
    const allBrandsInCartSet = new Set(cartItems.map(item => item.brand));
    const shopOrderFromMocks = mockShops.map(s => s.name);

    const allShopDataObjects = Array.from(allBrandsInCartSet).map(brandName => {
        const productsInThisBrand = cartItems.filter(item => item.brand === brandName);
        const mockShopData = mockShops.find(s => s.name === brandName);
        const inStockProductsInShop = productsInThisBrand.filter(item => item.stock !== 0);

        let shopDataForSection: Omit<Shop, 'products'> & { products: CartItem[], isShopSelected: boolean } = {
            name: brandName,
            logoUrl: 'https://placehold.co/60x24.png', 
            logoDataAiHint: `${brandName.toLowerCase()} logo`,
            products: productsInThisBrand,
            isFavorite: false,
            promotionText: undefined,
            specialOfferText: undefined,
            editLinkText: undefined,
            isShopSelected: inStockProductsInShop.length > 0 && inStockProductsInShop.every(item => item.selected),
        };

        if (mockShopData) {
            shopDataForSection = {
                ...mockShopData,
                name: brandName, 
                products: productsInThisBrand, 
                isShopSelected: inStockProductsInShop.length > 0 && inStockProductsInShop.every(item => item.selected),
                logoUrl: mockShopData.logoUrl || shopDataForSection.logoUrl,
                logoDataAiHint: mockShopData.logoDataAiHint || shopDataForSection.logoDataAiHint,
            };
        }
        return shopDataForSection;
    }).filter(shopGroup => shopGroup && shopGroup.products.length > 0) as (Shop & { products: CartItem[], isShopSelected: boolean })[];

    allShopDataObjects.sort((shopA, shopB) => {
       const brandA = shopA.name;
       const brandB = shopB.name;

       if (lastAddedBrand) {
           if (brandA === lastAddedBrand && brandB !== lastAddedBrand) return -1;
           if (brandB === lastAddedBrand && brandA !== lastAddedBrand) return 1;
       }

       const indexA = shopOrderFromMocks.indexOf(brandA);
       const indexB = shopOrderFromMocks.indexOf(brandB);

       if (indexA !== -1 && indexB !== -1) return indexA - indexB;
       if (indexA !== -1) return -1; 
       if (indexB !== -1) return 1;  
       return brandA.localeCompare(brandB); 
    });

    return allShopDataObjects;
  }, [cartItems, lastAddedBrand]);


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
    // Future: Implement actual voucher code validation and application logic
    toast({
      title: t('toast.voucher.codeApplied', {code: voucherCodeInput})
    });
  };

  const handleConfirmVoucherSelectionInSheet = () => {
    const selectedFullVouchers: SelectedVoucherInfo[] = sheetAvailableVouchers
        .filter(v => v.isSelected && v.isAvailable)
        .map(v => ({
            id: v.id,
            title: v.title,
            discountValue: v.discountValue,
            discountType: v.discountType,
        }));

    if (typeof window !== 'undefined') {
      localStorage.setItem(SELECTED_VOUCHERS_DETAILS_KEY, JSON.stringify(selectedFullVouchers));
      localStorage.setItem(SELECTED_VOUCHER_COUNT_KEY, selectedFullVouchers.length.toString());
    }


    if (selectedFullVouchers.length > 0) {
      setVoucherTriggerText(t('selectVoucher.footer.vouchersSelected', { count: selectedFullVouchers.length }));
      toast({ title: t('selectVoucher.footer.vouchersSelected', { count: selectedFullVouchers.length }) });
    } else {
      setVoucherTriggerText(t('cart.vouchersAndShipping.availableVouchersText', { count: mockAvailableVouchersSheet.length }));
      toast({ title: t('selectVoucher.footer.notSelectedInfo') });
    }
    setIsVoucherSheetOpen(false);
  };

  const handleAddToCart = (itemToAdd: Product) => {
    const existingCartItem = cartItems.find(ci => ci.id === itemToAdd.id && ci.variant === itemToAdd.variant);

    if (existingCartItem) {
      handleQuantityChange(existingCartItem.cartItemId, existingCartItem.quantity + 1);
      toast({
        title: t('toast.itemQuantityIncreased.title', { itemName: itemToAdd.name }),
        description: t('toast.itemQuantityIncreased.description')
      });
    } else {
      const newCartItem: CartItem = {
        ...itemToAdd,
        cartItemId: `${itemToAdd.id}-${itemToAdd.variant || 'base'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        quantity: 1,
        selected: false, 
      };

      setCartItems(prevItems => {
        let updatedItems = [...prevItems];
        const brandOfNewItem = newCartItem.brand;
        
        const firstItemIndexOfBrand = prevItems.findIndex(item => item.brand === brandOfNewItem);

        if (firstItemIndexOfBrand !== -1) {
          updatedItems.splice(firstItemIndexOfBrand, 0, newCartItem);
        } else {
          updatedItems.unshift(newCartItem);
        }
        return updatedItems;
      });
      
      setLastAddedBrand(itemToAdd.brand);

      toast({
        title: t('toast.itemAddedToCart.title', { itemName: itemToAdd.name }),
        description: t('toast.itemAddedToCart.description')
      });
    }
  };

  const handleRecentlyViewedItemAddToCart = (itemToAdd: Product) => {
    handleAddToCart(itemToAdd);
    setRecentlyViewedItems(prev =>
      prev.filter(item => {
        // Do not remove the item if either the item in the list or the item being added
        // lacks a productCode, as we can't be sure it's the same product.
        if (!item.productCode || !itemToAdd.productCode) {
          return true;
        }
        // Remove the item from the list only if the product codes match.
        return item.productCode !== itemToAdd.productCode;
      })
    );
  };

  const shippingDiscount = useMemo(() => {
    return calculateShippingVoucherDiscount(subtotalAmount);
  }, [subtotalAmount]);

  const shippingPromotionMessage = useMemo(() => {
    return getShippingVoucherPromotionMessage(subtotalAmount);
  }, [subtotalAmount]);

  const displayShippingMessage = useMemo(() => {
    const promotion = getShippingVoucherPromotionMessage(subtotalAmount);
    if (promotion) {
      return promotion;
    }
    const discount = calculateShippingVoucherDiscount(subtotalAmount);
    if (discount > 0) {
      return t('cart.vouchersAndShipping.shippingDiscountApplied', { amount: formatCurrency(discount) });
    }
    return t('cart.vouchersAndShipping.noPromotionsAvailable');
  }, [subtotalAmount, t, formatCurrency]);

  const truckIconClass = useMemo(() => {
    const promotion = getShippingVoucherPromotionMessage(subtotalAmount);
    const discount = calculateShippingVoucherDiscount(subtotalAmount);
    if (!promotion && discount > 0) { 
      return 'text-green-500';
    }
    return 'text-muted-foreground'; 
  }, [subtotalAmount]);


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

      <main className="flex-grow pt-14 pb-32"> {/* Increased pb for more footer items */}
        <div className="container mx-auto px-0 sm:px-2 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {cartItems.length === 0 ? (
             <div className="text-center py-10 px-4">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-headline text-muted-foreground">{t('cart.emptyCartTitle')}</p>
                <p className="font-body text-muted-foreground">{t('cart.emptyCartMessage')}</p>
            </div>
          ) : (
            <>
              {itemsByShop.map(shopGroup => (
                <ShopSection
                  key={shopGroup.name}
                  shop={shopGroup}
                  items={shopGroup.products}
                  isShopSelected={shopGroup.isShopSelected}
                  onShopSelectToggle={(checked) => handleToggleShopSelect(shopGroup.name, checked)}
                  onItemSelectToggle={handleToggleItemSelect}
                  onQuantityChange={onQuantityChange}
                  onDeleteItem={handleDeleteItem}
                  onVariantChange={handleVariantChange}
                  onAddToCart={handleAddToCart} 
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
                        {voucherTriggerText}
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
                    <div className="w-8"></div> 
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
                              onToggleSelect={() => {}} 
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
                    >
                      {t('selectVoucher.footer.useVoucherButton')}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

             <div className="flex items-center justify-between py-2 cursor-pointer hover:bg-muted/50 -mx-4 px-4">
                <div className="flex items-center min-w-0"> 
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
                    <RecentlyViewedItemCard 
                        key={`recent-${item.id}-${item.variant || 'base'}`} 
                        item={item} 
                        onAddToCart={handleRecentlyViewedItemAddToCart} 
                    />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-20 bg-card border-t h-auto py-2">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                    id="select-all-footer"
                    checked={areAllItemsEffectivelySelected}
                    onCheckedChange={(checked) => handleToggleSelectAll(Boolean(checked))}
                    aria-label="Select all items"
                    disabled={cartItems.filter(item => item.stock !== 0).length === 0} 
                    />
                    <label htmlFor="select-all-footer" className="text-sm text-foreground cursor-pointer">
                    {t('cart.selectAll')}
                    </label>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t('cart.subtotalAmountLabel')}</p>
                    <p className="text-md font-semibold text-foreground">
                        {formatCurrency(subtotalAmount)}
                    </p>
                </div>
            </div>
            
            <div className="flex justify-between items-center">
                <div className="text-left">
                    <p className="text-sm text-muted-foreground">{t('cart.finalTotalAmountLabel')}:</p>
                    <p className="text-lg font-bold text-foreground">
                        {formatCurrency(finalTotalAmount)}
                    </p>
                </div>
                <Button
                onClick={handleCheckout}
                disabled={!isAnythingSelected}
                size="default"
                className="bg-foreground hover:bg-foreground/90 text-accent-foreground font-semibold px-3 text-xs w-auto min-w-[100px] sm:px-4 sm:text-sm sm:min-w-[120px]"
                >
                {t('cart.checkoutButton', { count: selectedItemsCount })}
                </Button>
            </div>
        </div>
      </footer>
      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cart.confirmDelete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('cart.confirmDelete.description', { itemName: itemPendingDeletion?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteItem}>{t('cart.confirmDelete.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">{t('cart.confirmDelete.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BrandCartPage;

    

    

