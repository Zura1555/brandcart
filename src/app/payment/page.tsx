
"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import type { CartItem } from '@/interfaces';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { useToast } from '@/hooks/use-toast';

const HEADER_HEIGHT = 'h-14';
const CHECKOUT_ITEMS_STORAGE_KEY = 'checkoutItems'; // To be cleared
const SELECTED_VOUCHERS_DETAILS_KEY = 'selectedVouchersDetails'; // To be cleared
const FINAL_ORDER_DETAILS_KEY = 'finalOrderDetailsForPayment'; // To be read and cleared


interface OrderDetails {
  orderNumber: string;
  date: string;
  items: CartItem[];
  merchandiseSubtotal: number;
  shippingCost: number;
  loyaltyPointsDiscount?: number;
  voucherDiscountTotal?: number;
  totalAmount: number; // This should be the final, paid amount
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
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);

  const cleanVariantNameForCheckout = useCallback((name: string | undefined): string => {
    if (!name) return '';
    return name.replace(/\s*\(\+\d+\)\s*$/, ''); 
  }, []);

  const parseVariantNameForCheckout = useCallback((name: string | undefined): { color: string | null, size: string | null } => {
    if (!name) return { color: null, size: null };
    const cleanedName = cleanVariantNameForCheckout(name);
    const parts = cleanedName.split(',').map(p => p.trim());
    
    let color: string | null = null;
    let size: string | null = null;

    if (parts.length === 1) { 
        const part = parts[0];
        const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', 'Freesize'];
        if (commonSizes.some(s => part.toUpperCase() === s.toUpperCase())) {
            size = part;
        } else {
            color = part;
        }
    } else if (parts.length >= 2) { 
        color = parts[0] || null;
        size = parts[1] || null;
    }
    
    return { color, size };
  }, [cleanVariantNameForCheckout]);


  useEffect(() => {
    if (orderDetails) { // Prevent re-processing if orderDetails are already set
      setIsLoading(false);
      return;
    }

    const finalOrderDetailsRaw = localStorage.getItem(FINAL_ORDER_DETAILS_KEY);
    if (finalOrderDetailsRaw) {
      try {
        const parsedDetails: Omit<OrderDetails, 'orderNumber' | 'date'> & { totalAmount: number } = JSON.parse(finalOrderDetailsRaw);
        
        if (parsedDetails && parsedDetails.items && parsedDetails.items.length > 0) {
          const now = new Date();
          const orderNumber = `ORD-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
          const dateFormatted = now.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          setOrderDetails({
            ...parsedDetails,
            orderNumber,
            date: dateFormatted,
          });
          
          localStorage.removeItem(FINAL_ORDER_DETAILS_KEY);
          localStorage.removeItem(CHECKOUT_ITEMS_STORAGE_KEY);
          localStorage.removeItem(SELECTED_VOUCHERS_DETAILS_KEY);

        } else {
          throw new Error("Parsed order details are invalid or items are missing.");
        }
      } catch (error) {
        console.error("Error processing final order details:", error);
        toast({ title: t('paymentSuccess.toast.errorProcessingOrder.title'), description: t('paymentSuccess.toast.errorProcessingOrder.description'), variant: 'destructive' });
        if (router.pathname === '/payment') router.replace('/'); 
      }
    } else {
      console.warn("No final order details found in localStorage.");
      toast({ title: t('paymentSuccess.toast.errorProcessingOrder.title'), description: t('paymentSuccess.toast.missingOrderData.description'), variant: 'destructive' });
      if (router.pathname === '/payment') router.replace('/');
    }
    setIsLoading(false);
  }, [orderDetails, locale, t, toast, router]); // Added orderDetails to dependency array

  useEffect(() => {
    if (!isLoading && !orderDetails) {
      // This condition implies that useEffect either didn't find data or failed parsing,
      // and router.replace('/') should have already been called by the first effect.
      // This is a safeguard.
      if (router.pathname === '/payment') { 
          // router.replace('/'); // Redirection is handled in the first effect.
      }
    }
  }, [isLoading, orderDetails, router]);


  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')}₫`;
  };

  const handleRatingSelect = (rating: number) => {
    if (isReviewSubmitted) return;
    setSelectedRating(rating);
    if (rating <= 3) {
      setShowFeedbackTextarea(true);
    } else {
      setShowFeedbackTextarea(false);
      setFeedbackText(''); 
    }
  };

  const handleSubmitReview = () => {
    if (selectedRating === null) {
      toast({
        title: t('paymentSuccess.toast.selectRating.title'),
        description: t('paymentSuccess.toast.selectRating.description'),
        variant: 'destructive'
      });
      return;
    }
    console.log('Rating:', selectedRating, 'Feedback:', feedbackText);
    toast({
      title: t('paymentSuccess.toast.reviewSubmitted.title'),
      description: t('paymentSuccess.toast.reviewSubmitted.description'),
    });
    setIsReviewSubmitted(true);
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
    // This state should ideally be brief as the useEffect handles redirection.
    // If redirection hasn't happened, it implies an issue caught by the second useEffect,
    // or the first one is about to redirect.
    return (
        <div className="flex flex-col min-h-screen bg-background justify-center items-center">
            <p>{t('paymentSuccess.loadingOrder')}</p> 
        </div>
    ); 
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
                {orderDetails.items.map(item => {
                    const { color: parsedColor, size: parsedSize } = parseVariantNameForCheckout(item.variant);
                    let displayColor = parsedColor || "N/A";
                    let displaySize = parsedSize;
                    if (!displaySize) displaySize = "M"; 
                    let displayCode = item.productCode || "N/A";
                    
                    const badgeParts = [];
                    if (parsedColor || parsedSize || item.productCode) { 
                         badgeParts.push(displayColor);
                         badgeParts.push(displaySize);
                         badgeParts.push(displayCode);
                    }
                    const badgeText = badgeParts.join(" / ");
                    const showBadge = badgeText.length > 0 && badgeText !== "N/A / M / N/A";

                  return (
                    <div key={item.cartItemId || item.id} className="flex justify-between items-start py-3 border-b last:border-b-0">
                      <div className="flex items-start space-x-3">
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <Image 
                              src={item.imageUrl} 
                              alt={item.name} 
                              fill 
                              className="rounded object-cover border" 
                              data-ai-hint={item.dataAiHint || "product image"}
                              sizes="40px" 
                            />
                            {item.quantity > 0 && (
                              <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-green-600 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center border-2 border-card z-10">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                          <div className="flex-grow">
                              <p className="text-sm font-medium text-foreground line-clamp-2">{item.name}</p>
                              {showBadge && (
                                <Badge className="bg-green-600 hover:bg-green-600 text-white text-xs mt-0.5 px-1.5 py-0.5">
                                  {badgeText}
                                </Badge>
                              )}
                          </div>
                      </div>
                      <span className="text-sm text-foreground font-medium ml-2 flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  );
                })}
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
               {orderDetails.loyaltyPointsDiscount && orderDetails.loyaltyPointsDiscount > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t('paymentSuccess.orderSummary.loyaltyPointsDiscountLabel')}</span>
                    <span className="text-destructive">{formatCurrency(orderDetails.loyaltyPointsDiscount)}</span>
                </div>
              )}
              {orderDetails.voucherDiscountTotal && orderDetails.voucherDiscountTotal > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t('paymentSuccess.orderSummary.voucherDiscountLabel')}</span>
                  <span className="text-destructive">-{formatCurrency(orderDetails.voucherDiscountTotal)}</span>
                </div>
              )}
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
                    disabled={isReviewSubmitted}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${selectedRating === rating ? 'bg-foreground text-accent-foreground hover:bg-foreground/90' : 'border-muted-foreground text-muted-foreground hover:bg-muted'} ${isReviewSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  disabled={isReviewSubmitted}
                  className={`min-h-[100px] ${isReviewSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              )}
              <Button
                onClick={handleSubmitReview}
                disabled={selectedRating === null || isReviewSubmitted}
                className="mt-4 w-full bg-foreground hover:bg-foreground/90 text-accent-foreground"
              >
                {isReviewSubmitted ? t('paymentSuccess.feedback.submittedButton') : t('paymentSuccess.feedback.submitButton')}
              </Button>
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
