// @ts-nocheck
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingCart, ChevronLeft, MessageCircle, Gift, Ticket, Truck, Trash2, ChevronRight } from 'lucide-react';
import type { CartItem, Shop } from '@/interfaces';
import { mockShops } from '@/lib/mockData';
import ShopSection from '@/components/cart/ShopSection';
import { useToast } from "@/hooks/use-toast";

const BrandCartPage: NextPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    mockShops.flatMap(shop =>
      shop.products.map(p => ({ ...p, quantity: 1, selected: false }))
    )
  );
  const router = useRouter();
  const { toast } = useToast();

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
    if (isAnythingSelected) {
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
        ...shopData, // Pass full shop data including new fields
        products: productsInShop,
        isShopSelected: productsInShop.length > 0 && productsInShop.every(item => item.selected),
      };
    });
  }, [cartItems, mockShops]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-20 bg-card shadow-sm border-b h-14">
        <div className="container mx-auto px-4 py-3 h-full flex justify-between items-center">
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            Giỏ hàng ({totalCartProductTypesCount})
          </h1>
          <div className="flex items-center space-x-3">
            <Button variant="link" className="text-sm text-foreground p-0 h-auto hover:text-accent">Sửa</Button>
            <Button variant="ghost" size="icon" className="text-foreground relative hover:bg-muted">
              <MessageCircle className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full px-1.5 py-0.5 leading-none flex items-center justify-center">12</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-14 pb-20"> {/* Adjusted padding for fixed header/footer */}
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {cartItems.length === 0 ? (
             <div className="text-center py-10">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-headline text-muted-foreground">Your cart is empty.</p>
                <p className="font-body text-muted-foreground">Add some products to get started!</p>
            </div>
          ) : (
            itemsByShop.map(shopGroup => (
              <ShopSection
                key={shopGroup.name}
                shop={shopGroup} // Pass the whole shop object
                items={shopGroup.products}
                isShopSelected={shopGroup.isShopSelected}
                onShopSelectToggle={(checked) => handleToggleShopSelect(shopGroup.name, checked)}
                onItemSelectToggle={handleToggleItemSelect}
                onQuantityChange={handleQuantityChange}
              />
            ))
          )}

          {/* Voucher Section */}
          <Card className="bg-card p-4 rounded-lg shadow">
            <div className="flex items-center justify-between py-2 border-b cursor-pointer hover:bg-muted/50 -mx-4 px-4">
              <div className="flex items-center">
                <Ticket className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
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

          {/* Cleanup Section */}
          <Card className="bg-card p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Trash2 className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                <span className="text-sm text-foreground">Các sản phẩm bạn có thể chưa cần</span>
              </div>
              <Button variant="outline" size="sm" className="text-orange-500 border-orange-500 hover:bg-orange-50 hover:text-orange-600">
                Xóa bớt
              </Button>
            </div>
          </Card>
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
              className="border-primary data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            <label htmlFor="select-all-footer" className="text-sm text-foreground cursor-pointer">
              Tất cả
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tổng cộng:</p>
              <p className="text-lg font-bold text-accent">
                ₫{totalAmount.toLocaleString('de-DE')}
              </p>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={!isAnythingSelected}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-4 py-2 text-sm min-w-[120px]"
            >
              Mua hàng ({selectedItemsCount})
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BrandCartPage;
