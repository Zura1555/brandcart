
"use client";

import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, MapPin, MessageCircle, ShieldCheck, ShoppingCart, Tag, FileText } from 'lucide-react';
import React from 'react';

const HEADER_HEIGHT = 'h-14'; // approx 56px
const FOOTER_HEIGHT = 'h-24'; // approx 96px

const CheckoutPage: NextPage = () => {
  const router = useRouter();

  // Placeholder data based on the mockup
  const deliveryAddress = {
    name: "Trần Thượng Tuấn",
    phone: "(+84) 523 762 477",
    address: "Sarina, Sala, A00.11, Đường B2, Phường An Lợi Đông, Thành Phố Thủ Đức, TP. Hồ Chí Minh",
  };

  const product = {
    seller: "Topick Global",
    isFavoriteSeller: true,
    imageUrl: "https://placehold.co/60x60.png",
    imageAiHint: "beaded bracelet black white",
    name: "Vòng tay quyền rũ mèo đá quý hợp thời trang ...",
    variation: "Vòng tay Mèo đen",
    price: 20900,
    originalPrice: 27500,
    quantity: 1,
  };

  const shippingMethod = {
    name: "Quốc tế Nhanh - Express International",
    originalCost: 17000,
    currentCost: 0, // Free
    deliveryEstimate: "Đảm bảo nhận hàng vào 13 Tháng 6",
    inspectionAllowed: true,
  };

  const totals = {
    totalAmount: 20900,
    savings: 23600,
  };

  const formatCurrency = (amount: number) => {
    return `₫${amount.toLocaleString('vi-VN')}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-30 bg-card shadow-sm border-b ${HEADER_HEIGHT} flex items-center`}>
        <div className="container mx-auto px-4 flex items-center justify-between h-full">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-foreground">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Thanh toán</h1>
          <div className="w-10"> {/* Spacer to balance the back button */}</div>
        </div>
      </header>

      {/* Body */}
      <main className={`flex-grow overflow-y-auto pt-14 pb-24`}>
        <ScrollArea className="h-full">
          <div className="container mx-auto px-2 sm:px-4 py-3 space-y-3">
            {/* Section 1: Delivery Address */}
            <Card className="shadow-sm">
              <CardContent className="p-4 cursor-pointer hover:bg-muted/50">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-accent mr-3 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-foreground">{deliveryAddress.name} | {deliveryAddress.phone}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{deliveryAddress.address}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Product Summary */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-medium text-foreground">{product.seller}</span>
                  {product.isFavoriteSeller && (
                    <Badge variant="outline" className="text-red-500 border-red-300 bg-red-50 text-xs px-1.5 py-0.5">Yêu thích</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 flex items-start space-x-3">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={60}
                    height={60}
                    className="rounded border object-cover"
                    data-ai-hint={product.imageAiHint}
                  />
                  <div className="flex-grow">
                    <p className="text-sm text-foreground leading-snug mb-0.5 line-clamp-2">{product.name}</p>
                    {product.variation && (
                      <p className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm inline-block">{product.variation}</p>
                    )}
                    <div className="mt-1">
                      <span className="text-sm font-semibold text-foreground">{formatCurrency(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through ml-1.5">{formatCurrency(product.originalPrice)}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">x{product.quantity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Vouchers and Options */}
            <Card className="shadow-sm">
              <CardContent className="p-0 divide-y divide-border">
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center">
                    <Tag className="w-5 h-5 text-accent mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">Voucher của Shop</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">Chọn hoặc nhập mã</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center">
                     <FileText className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">Hóa đơn điện tử</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">Yêu cầu</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">Lời nhắn cho Shop</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">Để lại lời nhắn</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Shipping Method */}
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Phương thức vận chuyển</h3>
                  <Button variant="link" className="text-xs text-accent p-0 h-auto">Xem tất cả</Button>
                </div>
                <div className="border border-accent/50 rounded-md p-3 bg-accent/5">
                  <p className="text-sm font-medium text-accent">{shippingMethod.name}</p>
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
          </div>
        </ScrollArea>
      </main>

      {/* Footer */}
      <footer className={`fixed bottom-0 left-0 right-0 z-30 bg-card border-t ${FOOTER_HEIGHT}`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Tổng cộng:</p>
            <p className="text-xl font-bold text-accent">{formatCurrency(totals.totalAmount)}</p>
            {totals.savings > 0 && (
              <p className="text-xs text-green-600">Tiết kiệm {formatCurrency(totals.savings)}</p>
            )}
          </div>
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold min-w-[140px]"
            onClick={() => router.push('/payment')} // Navigate to payment page
          >
            Đặt hàng
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;

    