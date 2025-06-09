
"use client";

import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, ChevronRight, MapPin, MessageCircle, ShieldCheck, ShoppingCart, Tag, FileText, Ticket, CircleDollarSign, Wallet, CreditCard, Clock, CheckCircle2, QrCode } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import type { CartItem, Shop as MockShopType } from '@/interfaces';
import { mockShops } from '@/lib/mockData';

const HEADER_HEIGHT = 'h-14'; // approx 56px
const FOOTER_HEIGHT = 'h-24'; // approx 96px
const CHECKOUT_ITEMS_STORAGE_KEY = 'checkoutItems';
const SHOPEE_COIN_VALUE = 200; // Monetary value of coins
const SHOPEE_COIN_AMOUNT_TO_USE = 200; // Number of coins

interface DisplayShop {
  name: string;
  isFavorite?: boolean;
  logoUrl?: string;
  logoDataAiHint?: string;
  products: CartItem[];
}

const staticDeliveryAddress = {
  name: "Trần Thượng Tuấn",
  phone: "(+84) 523 762 477",
  address: "Sarina, Sala, A00.11, Đường B2, Phường An Lợi Đông, Thành Phố Thủ Đức, TP. Hồ Chí Minh",
};

const staticProductPlaceholder = { // Renamed to avoid conflict if no dynamic items
  seller: "Topick Global",
  isFavoriteSeller: true,
  logoUrl: "https://placehold.co/60x24.png",
  logoAiHint: "company logo",
  imageUrl: "https://placehold.co/60x60.png",
  imageAiHint: "beaded bracelet black white",
  name: "Vòng tay quyền rũ mèo đá quý hợp thời trang ...",
  variation: "Vòng tay Mèo đen",
  price: 20900,
  originalPrice: 27500,
  quantity: 1,
};

const staticShippingMethod = {
  name: "Quốc tế Nhanh - Express International",
  originalCost: 17000,
  currentCost: 0, // Free
  deliveryEstimate: "Đảm bảo nhận hàng vào 13 Tháng 6",
  inspectionAllowed: true,
};

const staticTotals = {
  totalAmount: 20900,
  savings: 23600,
};


const CheckoutPage: NextPage = () => {
  const router = useRouter();
  const [dynamicDisplayShops, setDynamicDisplayShops] = useState<DisplayShop[]>([]);
  const [initialTotalAmount, setInitialTotalAmount] = useState<number>(0);
  const [initialSavings, setInitialSavings] = useState<number>(0);
  const [useShopeeCoins, setUseShopeeCoins] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'payoo' | 'vnpay' | 'momo' | 'applepay'>('payoo');

  useEffect(() => {
    const rawItems = localStorage.getItem(CHECKOUT_ITEMS_STORAGE_KEY);
    if (rawItems) {
      try {
        const items: CartItem[] = JSON.parse(rawItems);
        if (items && items.length > 0) {
          const grouped = items.reduce((acc, item) => {
            const shopName = item.brand;
            const shopDataFromMock = mockShops.find(s => s.name === shopName);

            if (!acc[shopName]) {
              acc[shopName] = {
                name: shopName,
                isFavorite: shopDataFromMock?.isFavorite || false,
                logoUrl: shopDataFromMock?.logoUrl,
                logoDataAiHint: shopDataFromMock?.logoDataAiHint,
                products: [],
              };
            }
            acc[shopName].products.push(item);
            return acc;
          }, {} as Record<string, DisplayShop>);

          setDynamicDisplayShops(Object.values(grouped));

          let currentTotal = 0;
          let currentSavings = 0;
          items.forEach(item => {
            currentTotal += item.price * item.quantity;
            if (item.originalPrice) {
              currentSavings += (item.originalPrice - item.price) * item.quantity;
            }
          });
          // Add shipping savings if applicable
          if (staticShippingMethod.currentCost < staticShippingMethod.originalCost) {
            currentSavings += staticShippingMethod.originalCost - staticShippingMethod.currentCost;
          }

          setInitialTotalAmount(currentTotal);
          setInitialSavings(currentSavings);
        } else {
          // Fallback to static if no items
          setInitialTotalAmount(staticTotals.totalAmount);
          setInitialSavings(staticTotals.savings);
        }
      } catch (error) {
        console.error("Error parsing checkout items from localStorage:", error);
        setInitialTotalAmount(staticTotals.totalAmount);
        setInitialSavings(staticTotals.savings);
      }
    } else {
        setInitialTotalAmount(staticTotals.totalAmount);
        setInitialSavings(staticTotals.savings);
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return `₫${amount.toLocaleString('vi-VN')}`;
  };

  const deliveryAddress = staticDeliveryAddress;
  const shippingMethod = staticShippingMethod;
  
  const numberOfProductTypes = useMemo(() => {
    if (dynamicDisplayShops.length > 0) {
        return dynamicDisplayShops.reduce((sum, shop) => sum + shop.products.length, 0);
    }
    return 1; // For static placeholder
  }, [dynamicDisplayShops]);

  const displayTotalAmount = useMemo(() => {
    let currentTotal = initialTotalAmount;
    if (useShopeeCoins) {
      currentTotal -= SHOPEE_COIN_VALUE;
    }
    return Math.max(0, currentTotal); // Ensure total doesn't go below zero
  }, [initialTotalAmount, useShopeeCoins]);

  const displaySavings = initialSavings; // Shopee coins affect total, not savings in this model

  const shopsToRender = dynamicDisplayShops.length > 0 ? dynamicDisplayShops : [];

  const paymentMethods = [
    { id: 'payoo', name: 'Payoo', iconUrl: 'https://placehold.co/24x24.png', iconAiHint: 'payment logo', details: null },
    { id: 'vnpay', name: 'VNPay', iconUrl: 'https://placehold.co/24x24.png', iconAiHint: 'payment logo', details: null },
    { id: 'momo', name: 'Momo', iconUrl: 'https://placehold.co/24x24.png', iconAiHint: 'payment logo', details: null },
    { id: 'applepay', name: 'Apple Pay', iconUrl: 'https://placehold.co/24x24.png', iconAiHint: 'payment logo', details: null },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className={`fixed top-0 left-0 right-0 z-30 bg-card shadow-sm border-b ${HEADER_HEIGHT} flex items-center`}>
        <div className="container mx-auto px-4 flex items-center justify-between h-full">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-foreground hover:bg-muted hover:text-foreground">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Thanh toán</h1>
          <div className="w-10"> {/* Spacer */}</div>
        </div>
      </header>

      <main className={`flex-grow overflow-y-auto pt-14 pb-24`}>
        <ScrollArea className="h-full">
          <div className="container mx-auto px-2 sm:px-4 py-3 space-y-3">
            <Card className="shadow-sm">
              <CardContent className="p-4 cursor-pointer hover:bg-muted/50">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-foreground">{deliveryAddress.name} | {deliveryAddress.phone}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{deliveryAddress.address}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>

            {shopsToRender.length > 0 ? shopsToRender.map(shop => (
              <Card key={shop.name} className="shadow-sm">
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-4 h-4 text-foreground" />
                     {shop.logoUrl && (
                        <Image
                            src={shop.logoUrl}
                            alt={`${shop.name} logo`}
                            width={60}
                            height={24}
                            className="object-contain max-h-[24px] mr-1"
                            data-ai-hint={shop.logoDataAiHint || `${shop.name} logo`}
                        />
                    )}
                    <span className="text-sm font-medium text-foreground">{shop.name}</span>
                    {shop.isFavorite && (
                      <Badge variant="outline" className="text-foreground border-foreground bg-transparent text-xs px-1.5 py-0.5">Yêu thích</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {shop.products.map(p => (
                    <div key={p.id} className="p-4 flex items-start space-x-3 border-b last:border-b-0">
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        width={60}
                        height={60}
                        className="rounded border object-cover"
                        data-ai-hint={p.dataAiHint}
                      />
                      <div className="flex-grow">
                        <p className="text-sm text-foreground leading-snug mb-0.5 line-clamp-2">{p.name}</p>
                        {p.variant && (
                          <p className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm inline-block">{p.variant}</p>
                        )}
                        <div className="mt-1">
                          <span className="text-sm font-semibold text-foreground">{formatCurrency(p.price)}</span>
                          {p.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through ml-1.5">{formatCurrency(p.originalPrice)}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">x{p.quantity}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )) : (
              <Card className="shadow-sm">
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-4 h-4 text-foreground" />
                    {staticProductPlaceholder.logoUrl && (
                        <Image
                            src={staticProductPlaceholder.logoUrl}
                            alt={`${staticProductPlaceholder.seller} logo`}
                            width={60}
                            height={24}
                            className="object-contain max-h-[24px] mr-1"
                            data-ai-hint={staticProductPlaceholder.logoAiHint}
                        />
                    )}
                    <span className="text-sm font-medium text-foreground">{staticProductPlaceholder.seller}</span>
                    {staticProductPlaceholder.isFavoriteSeller && (
                      <Badge variant="outline" className="text-foreground border-foreground bg-transparent text-xs px-1.5 py-0.5">Yêu thích</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4 flex items-start space-x-3">
                    <Image
                      src={staticProductPlaceholder.imageUrl}
                      alt={staticProductPlaceholder.name}
                      width={60}
                      height={60}
                      className="rounded border object-cover"
                      data-ai-hint={staticProductPlaceholder.imageAiHint}
                    />
                    <div className="flex-grow">
                      <p className="text-sm text-foreground leading-snug mb-0.5 line-clamp-2">{staticProductPlaceholder.name}</p>
                      {staticProductPlaceholder.variation && (
                        <p className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm inline-block">{staticProductPlaceholder.variation}</p>
                      )}
                      <div className="mt-1">
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(staticProductPlaceholder.price)}</span>
                        {staticProductPlaceholder.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through ml-1.5">{formatCurrency(staticProductPlaceholder.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">x{staticProductPlaceholder.quantity}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-sm">
              <CardContent className="p-0 divide-y divide-border">
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center">
                    <Tag className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">Voucher của Shop</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">Chọn hoặc nhập mã</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />
                  </div>
                </div>
                 <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center">
                     <FileText className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">Hóa đơn điện tử</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">Yêu cầu</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">Lời nhắn cho Shop</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">Để lại lời nhắn</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Phương thức vận chuyển</h3>
                  <Button variant="link" className="text-xs text-foreground p-0 h-auto hover:text-foreground/80">Xem tất cả</Button>
                </div>
                <div className="border border-foreground/30 rounded-md p-3 bg-foreground/5">
                  <p className="text-sm font-medium text-foreground">{shippingMethod.name}</p>
                  <div className="flex items-baseline mt-0.5">
                    <span className="text-sm text-green-600 font-semibold">
                      {shippingMethod.currentCost === 0 ? "Miễn Phí" : formatCurrency(shippingMethod.currentCost)}
                    </span>
                    {shippingMethod.originalCost > 0 && shippingMethod.currentCost < shippingMethod.originalCost && (
                       <span className="text-xs text-muted-foreground line-through ml-1.5">{formatCurrency(shippingMethod.originalCost)}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{shippingMethod.deliveryEstimate}</p>
                  {shippingMethod.inspectionAllowed && (
                    <div className="flex items-center text-xs text-blue-600 mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                      <span>Được đồng kiểm</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Subtotal Section */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">
                    Tổng số tiền ({numberOfProductTypes} sản phẩm)
                  </span>
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(initialTotalAmount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Platform Vouchers & Coins Section */}
            <Card className="shadow-sm">
              <CardContent className="p-0 divide-y divide-border">
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center">
                    <Ticket className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">Shopee Voucher</span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 text-xs px-1.5 py-0.5 mr-2">Miễn Phí Vận Chuyển</Badge>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-1 flex-shrink-0" />
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <CircleDollarSign className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">Dùng {SHOPEE_COIN_AMOUNT_TO_USE} Shopee Xu</span>
                  </div>
                  <Switch
                    checked={useShopeeCoins}
                    onCheckedChange={setUseShopeeCoins}
                    aria-label="Use Shopee Coins"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Section */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Phương thức thanh toán</h3>
                  <Button variant="link" className="text-xs text-foreground p-0 h-auto hover:text-foreground/80">Xem tất cả</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border">
                {paymentMethods.map(method => {
                  const isSelected = selectedPaymentMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      className={`p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-muted/80' : ''}`}
                      onClick={() => setSelectedPaymentMethod(method.id as any)}
                    >
                      <div className="flex items-center">
                        <Image
                          src={method.iconUrl}
                          alt={`${method.name} logo`}
                          width={24}
                          height={24}
                          className="mr-3 flex-shrink-0 object-contain"
                          data-ai-hint={method.iconAiHint}
                        />
                        <span className="text-sm text-foreground">{method.name}</span>
                        {method.details && <span className="text-xs text-muted-foreground ml-1.5">{method.details}</span>}
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-foreground ml-2 flex-shrink-0" />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

          </div>
        </ScrollArea>
      </main>

      <footer className={`fixed bottom-0 left-0 right-0 z-30 bg-card border-t ${FOOTER_HEIGHT}`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Tổng cộng:</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(displayTotalAmount)}</p>
            {displaySavings > 0 && !useShopeeCoins && ( // Only show original savings if coins not applied, or adjust logic as needed
              <p className="text-xs text-green-600">Tiết kiệm {formatCurrency(displaySavings)}</p>
            )}
             {useShopeeCoins && (
              <p className="text-xs text-green-600">Đã dùng {SHOPEE_COIN_AMOUNT_TO_USE} xu, tiết kiệm thêm {formatCurrency(SHOPEE_COIN_VALUE)}</p>
            )}
          </div>
          <Button
            size="lg"
            className="bg-foreground hover:bg-foreground/90 text-accent-foreground font-semibold min-w-[140px]"
            onClick={() => router.push('/payment')} // Assuming '/payment' is the next page
          >
            Đặt hàng
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;
