
// @ts-nocheck
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'; // CardContent needed if VoucherCardSheet uses it
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle as SheetTitlePrimitive, SheetFooter as SheetFooterPrimitive } from '@/components/ui/sheet'; // Renamed to avoid conflict if local SheetTitle/Footer are defined
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ChevronLeft, Gift, Ticket, Truck, Trash2, ChevronRight, XCircle, CheckCircle2 } from 'lucide-react';
import type { CartItem, Shop, SimpleVariant } from '@/interfaces';
import { mockShops } from '@/lib/mockData';
import ShopSection from '@/components/cart/ShopSection';
import { useToast } from "@/hooks/use-toast";
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

const CHECKOUT_ITEMS_STORAGE_KEY = 'checkoutItems';

// Define Voucher interface and mock data directly in this component for the sheet
interface VoucherInterface {
  id: string;
  typeKey: string;
  title: string;
  discount: string;
  minOrder: string;
  usageInfo?: string;
  expiryDate?: string;
  isBestChoice?: boolean;
  isAvailable: boolean;
  unavailableReason?: string;
  quantity?: number;
  colorClass: string;
  textColorClass?: string;
  icon?: React.ElementType;
}

const mockAvailableVouchersSheet: VoucherInterface[] = [
  {
    id: 'voucher1sheet',
    typeKey: 'selectVoucher.voucherCard.typeFreeShipping',
    title: 'Miễn Phí Vận Chuyển',
    discount: 'Giảm tối đa 500k₫',
    minOrder: 'Đơn tối thiểu 0₫',
    usageInfo: 'Đã dùng 97% - sắp hết hạn',
    isBestChoice: true,
    isAvailable: true,
    colorClass: 'bg-teal-500',
    textColorClass: 'text-white',
    icon: Truck,
  },
];

const mockUnavailableVouchersSheet: VoucherInterface[] = [
  {
    id: 'voucher2sheet',
    typeKey: 'selectVoucher.voucherCard.typeFreeShipping',
    title: 'Miễn Phí Vận Chuyển',
    discount: 'Giảm tối đa 50k₫',
    minOrder: 'Đơn tối thiểu 45k₫',
    expiryDate: 'HSD: 12.06.2025',
    isAvailable: false,
    unavailableReason: 'selectVoucher.voucherCard.unavailableReasonMinOrder',
    quantity: 5,
    colorClass: 'bg-teal-100',
    textColorClass: 'text-teal-600',
    icon: Truck,
  },
];


const BrandCartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    mockShops.flatMap(shop =>
      shop.products.map(p => ({ ...p, quantity: 1, selected: false }))
    )
  );
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  const [itemsSelectedForCleanup, setItemsSelectedForCleanup] = useState<Set<string>>(new Set());

  // State for Voucher Sheet
  const [isVoucherSheetOpen, setIsVoucherSheetOpen] = useState(false);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [selectedVoucherIdInSheet, setSelectedVoucherIdInSheet] = useState<string | undefined>(
    mockAvailableVouchersSheet.length > 0 ? mockAvailableVouchersSheet[0].id : undefined
  );
  const [finalAppliedVoucherInfo, setFinalAppliedVoucherInfo] = useState<{ id: string; title: string } | null>(null);


  const handleToggleSelectAll = (checked: boolean) => {
    setCartItems(prevItems => prevItems.map(item => ({ ...item, selected: checked })));
  };

  const handleToggleShopSelect = (shopName: string, checked: boolean) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.brand === shopName ? { ...item, selected: checked } : item
      )
    );
  };

  const handleToggleItemSelect = (itemId: string, checked: boolean) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, selected: checked } : item
      )
    );
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > 99) {
      toast({
        title: t('toast.limitReachedTitle'),
        description: t('toast.limitReachedDescription'),
        variant: "destructive",
      })
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleDeleteItem = (itemId: string) => {
    const itemToRemove = cartItems.find(item => item.id === itemId);
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    if (itemToRemove) {
      toast({
        title: t('toast.itemRemovedTitleSingle', { itemName: itemToRemove.name }),
      });
    }
  };
  
  const handleVariantChange = (itemId: string, newVariantData: SimpleVariant) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            variant: newVariantData.name,
            price: newVariantData.price !== undefined ? newVariantData.price : item.price,
            originalPrice: newVariantData.originalPrice !== undefined ? newVariantData.originalPrice : item.originalPrice,
            imageUrl: newVariantData.imageUrl !== undefined ? newVariantData.imageUrl : item.imageUrl,
            stock: newVariantData.stock !== undefined ? newVariantData.stock : item.stock,
            dataAiHint: newVariantData.dataAiHint !== undefined ? newVariantData.dataAiHint : item.dataAiHint,
          };
        }
        return item;
      })
    );
  };

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      if (item.selected) {
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);
  }, [cartItems]);

  const isAnythingSelected = useMemo(() => cartItems.some(item => item.selected), [cartItems]);
  
  const areAllItemsEffectivelySelected = useMemo(() => {
    if (cartItems.length === 0) return false;
    return cartItems.every(item => item.selected);
  }, [cartItems]);

  const selectedItemsCount = useMemo(() => {
    return cartItems.filter(item => item.selected).length;
  }, [cartItems]);

  const totalCartProductTypesCount = cartItems.length;

  const handleCheckout = () => {
    const selectedCartItems = cartItems.filter(item => item.selected);
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
      return {
        ...shopData,
        products: productsInShop,
        isShopSelected: productsInShop.length > 0 && productsInShop.every(item => item.selected),
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

  const toggleItemForCleanup = (itemId: string) => {
    setItemsSelectedForCleanup(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const confirmCleanup = () => {
    const itemsToRemoveCount = itemsSelectedForCleanup.size;
    setCartItems(prevItems => prevItems.filter(item => !itemsSelectedForCleanup.has(item.id)));
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

  // Voucher Sheet Logic
  const VoucherCardSheet = ({ voucher, isSelected, onSelect }: { voucher: VoucherInterface; isSelected: boolean; onSelect: (id: string) => void; }) => {
    const cardOpacity = voucher.isAvailable ? 'opacity-100' : 'opacity-70';
    const { t } = useLanguage();
    
    return (
      <Card className={`mb-3 shadow-sm overflow-hidden ${cardOpacity} ${isSelected && voucher.isAvailable ? 'border-2 border-teal-500' : 'border'}`}>
        <div className="flex">
          <div className={`w-20 ${voucher.colorClass} flex flex-col items-center justify-center p-2 ${voucher.textColorClass || 'text-foreground'}`}>
            {voucher.icon && <voucher.icon className="w-7 h-7 mb-1" />}
            <span className="font-semibold text-xs text-center leading-tight uppercase">{t(voucher.typeKey)}</span>
          </div>
          <div className="flex-grow p-3 pr-2 space-y-1">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-semibold text-foreground">{voucher.title}</h3>
              {voucher.isBestChoice && voucher.isAvailable && (
                <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0.5">{t('selectVoucher.voucherCard.bestChoice')}</Badge>
              )}
              {voucher.quantity && !voucher.isAvailable && (
                <Badge variant="outline" className="text-xs border-muted-foreground text-muted-foreground">x{voucher.quantity}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{voucher.discount}</p>
            <p className="text-xs text-muted-foreground">{voucher.minOrder}</p>
            {voucher.usageInfo && voucher.isAvailable && <p className="text-xs text-orange-600">{voucher.usageInfo}</p>}
            {voucher.expiryDate && <p className="text-xs text-muted-foreground">{voucher.expiryDate}</p>}
            {!voucher.isAvailable && voucher.unavailableReason && (
              <p className="text-xs text-red-600 mt-1">{t(voucher.unavailableReason)}</p> 
            )}
          </div>
          <div className="w-12 flex items-center justify-center p-2 shrink-0">
            {voucher.isAvailable ? (
              <RadioGroupItem 
                value={voucher.id} 
                id={`voucher-sheet-radio-${voucher.id}`} 
                className={`w-5 h-5 ${isSelected ? 'border-teal-600 text-teal-600' : 'border-muted-foreground'}`}
                onClick={() => onSelect(voucher.id)}
              />
            ) : (
               <XCircle className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </Card>
    );
  };

  const handleApplyVoucherInSheet = () => {
    if (voucherCodeInput.trim() === '') return;
    toast({
      title: t('toast.voucher.codeApplied', {code: voucherCodeInput})
    });
    // In a real app, you'd validate the code here
  };

  const handleConfirmVoucherSelectionInSheet = () => {
    const selected = mockAvailableVouchersSheet.find(v => v.id === selectedVoucherIdInSheet);
    if (selected) {
      setFinalAppliedVoucherInfo({ id: selected.id, title: selected.title });
      toast({ title: `Voucher "${selected.title}" selected (simulated)` });
    } else {
      setFinalAppliedVoucherInfo(null);
      toast({ title: "No voucher selected or selection cleared (simulated)" });
    }
    setIsVoucherSheetOpen(false);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-20 bg-card shadow-sm border-b h-14">
        <div className="container mx-auto px-4 py-3 h-full flex justify-between items-center">
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted hover:text-foreground">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex-grow flex justify-center items-center min-w-0 px-2">
            <Breadcrumbs totalCartItems={totalCartProductTypesCount} />
          </div>
          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-grow pt-14 pb-20">
        <div className="container mx-auto px-0 sm:px-2 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {cartItems.length === 0 ? (
             <div className="text-center py-10">
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
            <Card className="bg-card p-4 rounded-lg shadow mx-2 sm:mx-0">
              <Sheet open={isVoucherSheetOpen} onOpenChange={setIsVoucherSheetOpen}>
                <SheetTrigger asChild>
                  <div className="flex items-center justify-between py-2 border-b cursor-pointer hover:bg-muted/50 -mx-4 px-4">
                    <div className="flex items-center">
                      <Ticket className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                      <span className="text-sm text-foreground">
                        {finalAppliedVoucherInfo 
                          ? `Đã chọn: ${finalAppliedVoucherInfo.title.substring(0,15)}...` 
                          : t('cart.vouchersAndShipping.voucherLabel', { amount: "5k" })
                        }
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85vh] flex flex-col p-0 rounded-t-lg">
                  <SheetHeader className="p-4 border-b sticky top-0 bg-card z-10"> {/* Corrected usage */}
                    <SheetTitlePrimitive className="text-lg text-center font-semibold">{t('selectVoucher.title')}</SheetTitlePrimitive>
                  </SheetHeader>
                  
                  <div className="p-4 border-b sticky top-[calc(3.5rem)] bg-card z-10"> {/* Adjust top based on header height */}
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
                    <RadioGroup value={selectedVoucherIdInSheet} onValueChange={setSelectedVoucherIdInSheet}>
                      <div>
                        <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{t('selectVoucher.usableVouchersTitle')}</h2>
                        {mockAvailableVouchersSheet.map(voucher => (
                          <VoucherCardSheet 
                            key={voucher.id} 
                            voucher={voucher} 
                            isSelected={selectedVoucherIdInSheet === voucher.id}
                            onSelect={setSelectedVoucherIdInSheet}
                          />
                        ))}
                        {mockAvailableVouchersSheet.length === 0 && <p className="text-xs text-muted-foreground px-1">{t('selectVoucher.noUsableVouchers')}</p>}
                      </div>

                      <div className="mt-6">
                        <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{t('selectVoucher.unusableVouchersTitle')}</h2>
                        {mockUnavailableVouchersSheet.map(voucher => (
                          <VoucherCardSheet 
                            key={voucher.id} 
                            voucher={voucher} 
                            isSelected={false} 
                            onSelect={() => {}} 
                          />
                        ))}
                        {mockUnavailableVouchersSheet.length === 0 && <p className="text-xs text-muted-foreground px-1">{t('selectVoucher.noUnusableVouchers')}</p>}
                      </div>
                    </RadioGroup>
                  </ScrollArea>
                  
                  <SheetFooterPrimitive className="p-3 border-t sticky bottom-0 bg-card z-10 flex flex-col items-center justify-center">
                    <p className="text-xs text-muted-foreground mb-2 text-center">
                      {selectedVoucherIdInSheet ? t('selectVoucher.footer.selectedInfo') : t('selectVoucher.footer.notSelectedInfo')}
                    </p>
                    <Button
                      size="lg"
                      className="w-full max-w-md bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                      onClick={handleConfirmVoucherSelectionInSheet}
                    >
                      {t('selectVoucher.footer.confirmButton')}
                    </Button>
                  </SheetFooterPrimitive>
                </SheetContent>
              </Sheet>

              <div className="flex items-center justify-between py-2 cursor-pointer hover:bg-muted/50 -mx-4 px-4">
                <div className="flex items-center">
                  <Truck className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{t('cart.vouchersAndShipping.shippingDiscountLabel', { amount: "700.000" })}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
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
                <div key={`cleanup-${item.id}`} className="flex flex-col items-center p-2 rounded-md hover:bg-muted/50 border border-transparent has-[:checked]:border-destructive/50 has-[:checked]:bg-destructive/5">
                  <Checkbox
                    id={`cleanup-cb-${item.id}`}
                    checked={itemsSelectedForCleanup.has(item.id)}
                    onCheckedChange={() => toggleItemForCleanup(item.id)}
                    className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive self-end mb-1"
                  />
                  <label htmlFor={`cleanup-cb-${item.id}`} className="flex flex-col items-center space-y-1 cursor-pointer w-full">
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
