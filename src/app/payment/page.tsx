
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import type { CartItem } from '@/interfaces';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { useToast } from '@/hooks/use-toast';

const HEADER_HEIGHT = 'h-14';
const CHECKOUT_ITEMS_STORAGE_KEY = 'checkoutItems';
const STATIC_SHIPPING_COST = 19000; 

interface OrderDetails {
  orderNumber: string;
  date: string;
  items: CartItem[];
  merchandiseSubtotal: number;
  shippingCost: number;
  totalAmount: number;
}

const PaymentSuccessPage = () => {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackTextarea, setShowFeedbackTextarea] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const rawItems = localStorage.getItem(CHECKOUT_ITEMS_STORAGE_KEY);
    if (rawItems) {
      try {
        const items: CartItem[] = JSON.parse(rawItems);
        if (items && items.length > 0) {
          const now = new Date();
          const orderNumber = `ORD-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
          const dateFormatted = now.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          const merchandiseSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const totalAmount = merchandiseSubtotal + STATIC_SHIPPING_COST;

          setOrderDetails({
            orderNumber,
            date: dateFormatted,
            items,
            merchandiseSubtotal,
            shippingCost: STATIC_SHIPPING_COST,
            totalAmount,
          });
          localStorage.removeItem(CHECKOUT_ITEMS_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Error processing order details:", error);
        toast({ title: t('paymentSuccess.toast.errorProcessingOrder.title'), description: t('paymentSuccess.toast.errorProcessingOrder.description'), variant: 'destructive' });
      }
    }
    setIsLoading(false);
  }, [locale, t, toast]);

  useEffect(() => {
    if (!isLoading && !orderDetails) {
      router.replace('/');
    }
  }, [isLoading, orderDetails, router]);


  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')}₫`;
  };

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    if (rating <= 3) {
      setShowFeedbackTextarea(true);
    } else {
      setShowFeedbackTextarea(false);
      setFeedbackText(''); // Clear text if rating is high
    }
    toast({ title: t('paymentSuccess.toast.feedbackReceived.title'), description: t('paymentSuccess.toast.feedbackReceived.description', { rating }) });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className={`fixed top-0 left-0 right-0 z-30 bg-card shadow-sm border-b ${HEADER_HEIGHT} flex items-center`}>
          <div className="container mx-auto px-4 flex items-center h-full">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="text-foreground hover:bg-muted hover:text-foreground -ml-2">
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
        <main className="flex-grow pt-14 flex flex-col items-center justify-center text-center px-4">
          <p>{t('paymentSuccess.loadingOrder')}</p>
        </main>
      </div>
    );
  }
  
  if (!orderDetails) {
    return null; 
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className={`fixed top-0 left-0 right-0 z-30 bg-card shadow-sm border-b ${HEADER_HEIGHT} flex items-center`}>
        <div className="container mx-auto px-4 flex items-center h-full">
           <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="text-foreground hover:bg-muted hover:text-foreground -ml-2">
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

      <main className="flex-grow pt-20 pb-8 flex flex-col items-center justify-start px-4">
        <div className="w-full max-w-2xl text-center">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('paymentSuccess.mainTitle')}</h1>
          <p className="text-muted-foreground mb-8">{t('paymentSuccess.subTitle')}</p>

          <Card className="mb-8 text-left shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{t('paymentSuccess.orderSummary.orderNumberLabel')}: {orderDetails.orderNumber}</span>
                <span>{t('paymentSuccess.orderSummary.dateLabel')}: {orderDetails.date}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <ScrollArea className="max-h-60 pr-3">
                {orderDetails.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                        <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded object-cover border" data-ai-hint={item.dataAiHint || "product image"} />
                        <div>
                            <p className="text-sm font-medium text-foreground">{item.name} (x{item.quantity})</p>
                            {item.variant && <p className="text-xs text-muted-foreground">{item.variant.replace(/\s*\(\+\d+\)\s*$/, '')}</p>}
                        </div>
                    </div>
                    <span className="text-sm text-foreground">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('paymentSuccess.orderSummary.subtotalLabel')}</span>
                <span>{formatCurrency(orderDetails.merchandiseSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('paymentSuccess.orderSummary.shippingLabel')}</span>
                <span>{formatCurrency(orderDetails.shippingCost)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold text-foreground">
                <span>{t('paymentSuccess.orderSummary.totalLabel')}</span>
                <span>{formatCurrency(orderDetails.totalAmount)}</span>
              </div>
            </CardFooter>
          </Card>

          <Card className="mb-8 text-left shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">{t('paymentSuccess.feedback.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-3">
                {[1, 2, 3, 4, 5].map(rating => (
                  <Button
                    key={rating}
                    variant={selectedRating === rating ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => handleRatingSelect(rating)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${selectedRating === rating ? 'bg-foreground text-accent-foreground hover:bg-foreground/90' : 'border-muted-foreground text-muted-foreground hover:bg-muted'}`}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground px-1 mb-4">
                <span>{t('paymentSuccess.feedback.veryDifficult')}</span>
                <span>{t('paymentSuccess.feedback.veryEasy')}</span>
              </div>
              {showFeedbackTextarea && (
                <Textarea
                  placeholder={t('paymentSuccess.feedback.tellUsMorePlaceholder')}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="min-h-[100px]"
                />
              )}
            </CardContent>
          </Card>

          <Button size="lg" className="w-full max-w-xs bg-foreground hover:bg-foreground/90 text-accent-foreground font-semibold" onClick={() => router.push('/')}>
            {t('paymentSuccess.continueShoppingButton')}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccessPage;
    
