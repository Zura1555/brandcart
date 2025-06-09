"use client";

import { useState, useEffect, useMemo } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import type { CartItem } from '@/interfaces';
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
    return mockShops.map(shop => {
      const productsInShop = cartItems.filter(item => item.brand === shop.name);
      return {
        name: shop.name,
        products: productsInShop,
        isShopSelected: productsInShop.length > 0 && productsInShop.every(item => item.selected),
      };
    });
  }, [cartItems]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-20 bg-background/90 backdrop-blur-md shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 h-16 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-headline font-semibold text-foreground">BrandCart</h1>
          {cartItems.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-header"
                checked={areAllItemsEffectivelySelected}
                onCheckedChange={(checked) => handleToggleSelectAll(Boolean(checked))}
                aria-label="Select all items"
              />
              <label htmlFor="select-all-header" className="text-xs sm:text-sm text-muted-foreground font-body cursor-pointer">
                {areAllItemsEffectivelySelected ? 'Deselect All' : 'Select All'}
              </label>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow pt-16 pb-24 sm:pb-28"> {/* Adjusted padding for fixed header/footer */}
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
                shopName={shopGroup.name}
                items={shopGroup.products}
                isShopSelected={shopGroup.isShopSelected}
                onShopSelectToggle={(checked) => handleToggleShopSelect(shopGroup.name, checked)}
                onItemSelectToggle={handleToggleItemSelect}
                onQuantityChange={handleQuantityChange}
              />
            ))
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-20 bg-background/90 backdrop-blur-md border-t">
        <div className="container mx-auto px-4 py-3 sm:py-4 h-20 sm:h-24 flex justify-between items-center">
          <div className="min-w-0">
            <p className="text-sm sm:text-md font-headline font-semibold text-muted-foreground">Total:</p>
            <p className="text-xl sm:text-2xl font-headline font-bold text-accent truncate" title={`$${totalAmount.toFixed(2)}`}>
              ${totalAmount.toFixed(2)}
            </p>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={!isAnythingSelected}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-headline px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
          >
            Checkout <ShoppingCart className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default BrandCartPage;
