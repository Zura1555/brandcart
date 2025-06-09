
// @ts-nocheck
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, ChevronLeft, MessageCircle, Gift, Ticket, Truck, Trash2, ChevronRight } from 'lucide-react';
import type { CartItem, Shop } from '@/interfaces';
import { mockShops } from '@/lib/mockData';
import ShopSection from '@/components/cart/ShopSection';
import { useToast } from "@/hooks/use-toast";
import React from 'react';

const CHECKOUT_ITEMS_STORAGE_KEY = 'checkoutItems';

const BrandCartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    mockShops.flatMap(shop =>
      shop.products.map(p => ({ ...p, quantity: 1, selected: false }))
    )
  );
  const router = useRouter();
  const { toast } = useToast();

  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  const [itemsSelectedForCleanup, setItemsSelectedForCleanup] = useState<Set<string>>(new Set());

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
        title: "Limit Reached",
        description: "Maximum quantity per item is 99.",
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
        title: "No items selected",
        description: "Please select at least one item to proceed to checkout.",
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
        title: "Items Removed",
        description: `${itemsToRemoveCount} item(s) have been removed from your cart.`,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-20 bg-card shadow-sm border-b h-14">
        <div className="container mx-auto px-4 py-3 h-full flex justify-between items-center">
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted hover:text-foreground">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            Giỏ hàng ({totalCartProductTypesCount})
          </h1>
          <div className="flex items-center space-x-3">
            {/* Message icon button removed here */}
          </div>
        </div>
      </header>

      <main className="flex-grow pt-14 pb-20">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {cartItems.length === 0 ? (
             <div className="text-center py-10">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-headline text-muted-foreground">Your cart is empty.</p>
                <p className="font-body text-muted-foreground">Add some products to get started!</p>
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
                />
              )}

              {cartItems.length > 0 && (
                <Card className="bg-card p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Trash2 className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                      <span className="text-sm text-foreground">Các sản phẩm bạn có thể chưa cần</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-foreground border-foreground hover:bg-muted hover:text-foreground"
                      onClick={openCleanupDialog}
                      disabled={cartItems.length === 0}
                    >
                      Xóa bớt
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
                />
              ))}
            </>
          )}

          {cartItems.length > 0 && (
            <Card className="bg-card p-4 rounded-lg shadow">
              <div className="flex items-center justify-between py-2 border-b cursor-pointer hover:bg-muted/50 -mx-4 px-4">
                <div className="flex items-center">
                  <Ticket className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                  <span className="text-sm text-foreground">Voucher giảm đến ₫5k</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between py-2 cursor-pointer hover:bg-muted/50 -mx-4 px-4">
                <div className="flex items-center">
                  <Truck className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">Giảm ₫700.000 phí vận chuyển đơn tối thiểu...</span>
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
              Tất cả
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tổng cộng:</p>
              <p className="text-lg font-bold text-foreground">
                ₫{totalAmount.toLocaleString('de-DE')}
              </p>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={!isAnythingSelected}
              size="lg"
              className="bg-foreground hover:bg-foreground/90 text-accent-foreground font-semibold px-4 py-2 text-sm min-w-[120px]"
            >
              Mua hàng ({selectedItemsCount})
            </Button>
          </div>
        </div>
      </footer>

      <Dialog open={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Remove Unneeded Items</DialogTitle>
            <DialogDescription>
              Select the items you want to remove from your cart. Click "Remove Selected" when you're done.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-1">
            <div className="space-y-3 py-4">
              {cartItems.length > 0 ? cartItems.map(item => (
                <div key={`cleanup-${item.id}`} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 border border-transparent has-[:checked]:border-destructive/50 has-[:checked]:bg-destructive/5">
                  <Checkbox
                    id={`cleanup-cb-${item.id}`}
                    checked={itemsSelectedForCleanup.has(item.id)}
                    onCheckedChange={() => toggleItemForCleanup(item.id)}
                    className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                  />
                  <label htmlFor={`cleanup-cb-${item.id}`} className="flex-grow flex items-center space-x-3 cursor-pointer">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      width={48} 
                      height={48} 
                      className="rounded-md object-cover w-12 h-12 shrink-0 border"
                      data-ai-hint={item.dataAiHint}
                    />
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium leading-none truncate" title={item.name}>
                        {item.name}
                      </p>
                      {item.variant && <p className="text-xs text-muted-foreground mt-0.5">{item.variant}</p>}
                       <p className="text-sm font-semibold text-foreground mt-0.5">₫{item.price.toLocaleString('de-DE')}</p>
                    </div>
                  </label>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">Your cart is currently empty.</p>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={closeCleanupDialog}>Cancel</Button>
            <Button 
              onClick={confirmCleanup} 
              disabled={itemsSelectedForCleanup.size === 0 || cartItems.length === 0}
              variant="destructive"
            >
              Remove Selected ({itemsSelectedForCleanup.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default BrandCartPage;
