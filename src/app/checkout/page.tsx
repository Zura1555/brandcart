
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, MapPin, MessageCircle, ShieldCheck, ShoppingCart, FileText, Ticket, CheckCircle2, CreditCard, Wallet, QrCode } from 'lucide-react';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { CartItem, Shop as MockShopType, ShippingAddress, SelectedVoucherInfo, Product } from '@/interfaces';
import { mockShops } from '@/lib/mockData'; 
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

const HEADER_HEIGHT = 'h-14'; 
const FOOTER_HEIGHT = 'h-36'; 
const CHECKOUT_ITEMS_STORAGE_KEY = 'checkoutItems';
const SELECTED_ADDRESS_STORAGE_KEY = 'selectedShippingAddressId';
const USER_ADDRESSES_STORAGE_KEY = 'userShippingAddresses';
const SELECTED_VOUCHER_COUNT_KEY = 'selectedVoucherUserCount';
const SELECTED_VOUCHERS_DETAILS_KEY = 'selectedVouchersDetails';
const FINAL_ORDER_DETAILS_KEY = 'finalOrderDetailsForPayment';


const AVAILABLE_LOYALTY_POINTS = 200;
const LOYALTY_POINTS_TO_REDEEM = 200;
const LOYALTY_POINTS_DISCOUNT_VALUE = 20000;
const VAT_RATE = 0.08; // 8% VAT


interface DisplayShop {
  name: string;
  isFavorite?: boolean;
  logoUrl?: string;
  logoDataAiHint?: string;
  products: CartItem[];
}

const staticProductPlaceholder: CartItem = {
  cartItemId: 'static-placeholder-001',
  id: 'sp001',
  brand: "Topick Global",
  imageUrl: "https://placehold.co/60x60.png",
  dataAiHint: "beaded bracelet black white",
  name: "Vòng tay mèo đá quý",
  variant: "Đen, Freesize",
  productCode: "SP001",
  price: 20900,
  originalPrice: 27500,
  quantity: 1,
  selected: true,
  stock: 10,
};

const staticShippingMethod = {
  mainLabelKey: 'checkout.shippingMethodStandardDeliveryLabel',
  price: 19000,
  subLabelKey: 'checkout.shippingMethodEstimatedDeliveryTimeLabel',
};

type SelectedPaymentMethod = 'cod' | 'payoo' | 'vnpay' | 'momo' | 'applepay';

const CheckoutPage = () => {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const [dynamicDisplayShops, setDynamicDisplayShops] = useState<DisplayShop[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<SelectedPaymentMethod>('cod');
  const [currentShippingAddress, setCurrentShippingAddress] = useState<ShippingAddress | null>(null);
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [shopMessage, setShopMessage] = useState<string>('');
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(true);
  const [voucherTriggerText, setVoucherTriggerText] = useState<string>('');
  const [totalVoucherDiscount, setTotalVoucherDiscount] = useState(0);


  const [wantEInvoice, setWantEInvoice] = useState<boolean>(false); 
  const [eInvoiceType, setEInvoiceType] = useState<'personal' | 'company'>('personal');
  const [eInvoiceDetails, setEInvoiceDetails] = useState({
    fullName: '',
    companyName: '',
    idCard: '',
    taxCode: '',
    email: '',
    address: '',
  });
  const [eInvoiceSummary, setEInvoiceSummary] = useState<string | null>(null);


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
    const rawItems = localStorage.getItem(CHECKOUT_ITEMS_STORAGE_KEY);
    let parsedItems: CartItem[] = [];

    if (rawItems) {
      try {
        parsedItems = JSON.parse(rawItems);
        if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
          parsedItems = [staticProductPlaceholder];
        }
      } catch (error) {
        console.error("Error parsing checkout items from localStorage:", error);
        parsedItems = [staticProductPlaceholder];
      }
    } else {
      parsedItems = [staticProductPlaceholder];
    }
    setCheckoutItems(parsedItems);

    const grouped = parsedItems.reduce((acc, item) => {
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
    

    const selectedAddressId = localStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY);
    const userAddressesRaw = localStorage.getItem(USER_ADDRESSES_STORAGE_KEY);
    let userAddresses: ShippingAddress[] = []; 
    if (userAddressesRaw) {
        try {
            const parsed = JSON.parse(userAddressesRaw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                 userAddresses = parsed;
            }
        } catch (e) {
            console.error("Error parsing user addresses from localStorage:", e);
        }
    }

    if (selectedAddressId) {
      const foundAddress = userAddresses.find(addr => addr.id === selectedAddressId);
      setCurrentShippingAddress(foundAddress || userAddresses.find(addr => addr.isDefault) || (userAddresses.length > 0 ? userAddresses[0] : null));
    } else {
      setCurrentShippingAddress(userAddresses.find(addr => addr.isDefault) || (userAddresses.length > 0 ? userAddresses[0] : null));
    }
    setAddressLoaded(true);

    const storedVoucherDetailsRaw = localStorage.getItem(SELECTED_VOUCHERS_DETAILS_KEY);
    let count = 0;
    let discount = 0;
    if (storedVoucherDetailsRaw) {
        try {
            const storedVoucherDetails: SelectedVoucherInfo[] = JSON.parse(storedVoucherDetailsRaw);
            count = storedVoucherDetails.length;
            discount = storedVoucherDetails.reduce((sum, v) => sum + (v.discountValue || 0), 0);
        } catch (e) {
            console.error("Error parsing selected voucher details:", e);
        }
    }
    setTotalVoucherDiscount(discount);

    if (count > 0) {
      setVoucherTriggerText(t('checkout.yourVoucherSelected', { count: count }));
    } else {
      setVoucherTriggerText(t('checkout.yourVoucherAvailable', { count: 5 })); // Assuming 5 available on dedicated page
    }

  }, [parseVariantNameForCheckout, t, router]); 


  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')}₫`;
  };

  const shippingMethod = useMemo(() => {
    // This function now runs only when 't' changes, avoiding direct localStorage access on render.
    return {
      mainLabel: t(staticShippingMethod.mainLabelKey),
      price: staticShippingMethod.price,
      subLabel: t(staticShippingMethod.subLabelKey),
    }
  }, [t]);


  const merchandiseSubtotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [checkoutItems]);

  const loyaltyDiscountValue = useMemo(() => {
    return useLoyaltyPoints ? LOYALTY_POINTS_DISCOUNT_VALUE : 0;
  }, [useLoyaltyPoints]);

  const subtotalForVat = useMemo(() => {
    return merchandiseSubtotal + shippingMethod.price;
  }, [merchandiseSubtotal, shippingMethod.price]);

  const estimatedVatValue = useMemo(() => {
    return subtotalForVat * VAT_RATE;
  }, [subtotalForVat]);

  const displayTotalAmount = useMemo(() => {
    let total = subtotalForVat + estimatedVatValue - loyaltyDiscountValue - totalVoucherDiscount;
    return Math.max(0, total); 
  }, [subtotalForVat, estimatedVatValue, loyaltyDiscountValue, totalVoucherDiscount]);
  
  const displaySavings = useMemo(() => {
    return checkoutItems.reduce((sum, item) => {
        if (item.originalPrice) {
            return sum + (item.originalPrice - item.price) * item.quantity;
        }
        return sum;
    }, 0);
  }, [checkoutItems]);

  const shopsToRender = dynamicDisplayShops.length > 0 ? dynamicDisplayShops : [];

  const paymentMethods = useMemo(() => [
    { id: 'cod', name: t('paymentMethods.cod'), iconUrl: 'https://file.hstatic.net/1000284478/file/cod_icon-47_a8768752c1a445da90d600ca0a94675c.svg', iconAiHint: 'cash on delivery icon', details: null },
    { id: 'payoo', name: t('paymentMethods.payoo'), iconUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-Payoo.png', iconAiHint: 'Payoo logo', details: null },
    { id: 'vnpay', name: t('paymentMethods.vnpay'), iconUrl: 'https://file.hstatic.net/1000284478/file/vnpay-40_5dbcecd2b4eb4245a4527d357a0459fc.svg', iconAiHint: 'VNPay QR logo', details: null },
    { id: 'momo', name: t('paymentMethods.momo'), iconUrl: 'https://file.hstatic.net/1000284478/file/momo-45_eee48d6f0f9e41f1bd2c5f06ab4214a2.svg', iconAiHint: 'Momo logo', details: null },
    { id: 'applepay', name: t('paymentMethods.applepay'), iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg', iconAiHint: 'Apple Pay logo', details: null },
  ].sort((a, b) => {
    if (a.id === 'cod') return -1;
    if (b.id === 'cod') return 1;
    return 0;
  }), [t]);


  const currentAddressNamePhone = currentShippingAddress ? t('checkout.address.namePhone', { name: currentShippingAddress.name, phone: currentShippingAddress.phone }) : '';

  const handlePlaceOrder = () => {
    if (!currentShippingAddress) {
        toast({
            title: t('checkout.address.noAddressSelectedTitle'),
            description: t('checkout.address.noAddressSelectedMessage'),
            variant: 'destructive'
        });
        return;
    }
    const finalOrderDetails = {
      items: checkoutItems,
      merchandiseSubtotal: merchandiseSubtotal,
      shippingCost: shippingMethod.price,
      loyaltyPointsDiscount: loyaltyDiscountValue,
      voucherDiscountTotal: totalVoucherDiscount,
      estimatedVat: estimatedVatValue,
      totalAmount: displayTotalAmount,
    };
    localStorage.setItem(FINAL_ORDER_DETAILS_KEY, JSON.stringify(finalOrderDetails));
    
    router.push('/payment');
  };


  const handleEInvoiceDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEInvoiceDetails(prev => ({ ...prev, [name]: value }));
    const detailsToSave = { ...eInvoiceDetails, [name]: value };
    if (eInvoiceType === 'personal') {
      if (detailsToSave.fullName && detailsToSave.idCard && detailsToSave.email && detailsToSave.address) {
        setEInvoiceSummary(detailsToSave.fullName);
      } else {
        setEInvoiceSummary(null);
      }
    } else if (eInvoiceType === 'company') {
      if (detailsToSave.companyName && detailsToSave.taxCode && detailsToSave.email && detailsToSave.address) {
        setEInvoiceSummary(detailsToSave.companyName);
      } else {
        setEInvoiceSummary(null);
      }
    }
  };
  
  const handleWantEInvoiceChange = (value: string) => {
    const wantsIt = value === 'issue';
    setWantEInvoice(wantsIt);
    if (!wantsIt) {
      setEInvoiceDetails({
        fullName: '',
        companyName: '',
        idCard: '',
        taxCode: '',
        email: '',
        address: '',
      });
      setEInvoiceSummary(null);
      setEInvoiceType('personal'); 
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className={`fixed top-0 left-0 right-0 z-30 bg-card shadow-sm border-b ${HEADER_HEIGHT} flex items-center`}>
        <div className="container mx-auto px-4 flex items-center justify-between h-full">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="text-foreground hover:bg-muted hover:text-foreground">
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

      <main className={`flex-grow overflow-y-auto pt-14 pb-36`}>
        <ScrollArea className="h-full">
          <div className="container mx-auto px-2 sm:px-4 py-3 space-y-3">
            {addressLoaded ? (
                currentShippingAddress ? (
                <Card className="shadow-sm">
                    <CardContent className="p-4 cursor-pointer hover:bg-muted/50" onClick={() => router.push('/select-address')}>
                    <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                        <div className="flex-grow">
                        <p className="text-sm font-medium text-foreground">{currentAddressNamePhone}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{currentShippingAddress.address}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />
                    </div>
                    </CardContent>
                </Card>
                ) : (
                <Card className="shadow-sm border-destructive">
                    <CardContent className="p-4 cursor-pointer hover:bg-destructive/10" onClick={() => router.push('/select-address')}>
                    <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-destructive mr-3 flex-shrink-0" />
                        <div className="flex-grow">
                        <p className="text-sm font-medium text-destructive">{t('checkout.address.noAddressSelectedTitle')}</p>
                        <p className="text-xs text-destructive/80 mt-0.5">{t('checkout.address.noAddressSelectedMessage')}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-destructive/70 ml-2 flex-shrink-0" />
                    </div>
                    </CardContent>
                </Card>
                )
            ) : (
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="animate-pulse flex space-x-4">
                            <div className="rounded-full bg-muted h-5 w-5"></div>
                            <div className="flex-1 space-y-3 py-1">
                                <div className="h-2 bg-muted rounded"></div>
                                <div className="space-y-1">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="h-2 bg-muted rounded col-span-2"></div>
                                    <div className="h-2 bg-muted rounded col-span-1"></div>
                                </div>
                                <div className="h-2 bg-muted rounded"></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}


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
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {shop.products.map(p => {
                    const { color: parsedColor, size: parsedSize } = parseVariantNameForCheckout(p.variant);
                    let displayColor = parsedColor || "N/A";
                    let displaySize = parsedSize;
                    if (!displaySize) displaySize = "M"; 
                    let displayCode = p.productCode || "N/A";
                    
                    const badgeParts = [];
                    if (parsedColor || parsedSize || p.productCode) { 
                         badgeParts.push(displayColor);
                         badgeParts.push(displaySize);
                         badgeParts.push(displayCode);
                    }
                    const badgeText = badgeParts.join(" / ");
                    const showBadge = badgeText.length > 0 && badgeText !== "N/A / M / N/A";


                    return (
                      <div key={p.id} className="p-4 flex items-start space-x-3 border-b last:border-b-0">
                        <div className="relative w-[60px] h-[60px] flex-shrink-0">
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            className="rounded border object-cover"
                            data-ai-hint={p.dataAiHint}
                            sizes="60px"
                          />
                          {p.quantity > 0 && (
                             <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-green-600 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center border-2 border-card z-10">
                              {p.quantity}
                            </span>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm text-foreground leading-snug mb-0.5 line-clamp-2">{p.name}</p>
                          {showBadge && (
                             <Badge className="bg-green-600 hover:bg-green-600 text-white text-xs mt-0.5 px-1.5 py-0.5">
                              {badgeText}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-foreground">{formatCurrency(p.price)}</span>
                          {p.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through ml-1.5 block">{formatCurrency(p.originalPrice)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )) : (
              <Card className="shadow-sm">
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-4 h-4 text-foreground" />
                    {staticProductPlaceholder.brand && (
                        <Image
                            src={staticProductPlaceholder.imageUrl || "https://placehold.co/60x24.png"}
                            alt={`${staticProductPlaceholder.brand} logo`}
                            width={60}
                            height={24}
                            className="object-contain max-h-[24px] mr-1"
                            data-ai-hint={staticProductPlaceholder.dataAiHint || `${staticProductPlaceholder.brand} logo`}
                        />
                    )}
                    <span className="text-sm font-medium text-foreground">{staticProductPlaceholder.brand}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4 flex items-start space-x-3">
                    <div className="relative w-[60px] h-[60px] flex-shrink-0">
                      <Image
                        src={staticProductPlaceholder.imageUrl}
                        alt={staticProductPlaceholder.name}
                        fill
                        className="rounded border object-cover"
                        data-ai-hint={staticProductPlaceholder.dataAiHint}
                        sizes="60px"
                      />
                      {staticProductPlaceholder.quantity > 0 && (
                        <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-green-600 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center border-2 border-card z-10">
                          {staticProductPlaceholder.quantity}
                        </span>
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-foreground leading-snug mb-0.5 line-clamp-2">{staticProductPlaceholder.name}</p>
                      {(() => {
                        const { color: parsedColor, size: parsedSize } = parseVariantNameForCheckout(staticProductPlaceholder.variant);
                        let displayColor = parsedColor || "N/A";
                        let displaySize = parsedSize;
                        if (!displaySize) displaySize = "M"; 
                        let displayCode = staticProductPlaceholder.productCode || "N/A";
                        
                        const badgeParts = [];
                        if (parsedColor || parsedSize || staticProductPlaceholder.productCode) {
                            badgeParts.push(displayColor);
                            badgeParts.push(displaySize);
                            badgeParts.push(displayCode);
                        }
                        const badgeText = badgeParts.join(" / ");
                        const showBadge = badgeText.length > 0 && badgeText !== "N/A / M / N/A";


                        return showBadge && (
                          <Badge className="bg-green-600 hover:bg-green-600 text-white text-xs mt-0.5 px-1.5 py-0.5">
                            {badgeText}
                          </Badge>
                        );
                      })()}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">{formatCurrency(staticProductPlaceholder.price)}</span>
                      {staticProductPlaceholder.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through ml-1.5 block">{formatCurrency(staticProductPlaceholder.originalPrice)}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-sm">
              <CardContent className="p-0 divide-y divide-border">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground">{t('checkout.eInvoice.title')}</span>
                    </div>
                    <RadioGroup
                      value={wantEInvoice ? 'issue' : 'no_issue'}
                      onValueChange={handleWantEInvoiceChange}
                      className="flex items-center space-x-3 sm:space-x-4"
                    >
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="no_issue" id="no-e-invoice" />
                        <Label htmlFor="no-e-invoice" className="font-normal text-xs sm:text-sm cursor-pointer">{t('checkout.eInvoice.option.noInvoice')}</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="issue" id="issue-e-invoice" />
                        <Label htmlFor="issue-e-invoice" className="font-normal text-xs sm:text-sm cursor-pointer">{t('checkout.eInvoice.option.issueInvoice')}</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {wantEInvoice && (
                    <div className="space-y-4 pt-4 mt-4 border-t">
                      <p className="text-xs text-muted-foreground">{t('checkout.eInvoice.vatNote')}</p>
                      <div>
                        <p className="text-sm font-medium mb-2">{t('checkout.eInvoice.invoiceTypeLabel')}</p>
                        <RadioGroup
                          value={eInvoiceType}
                          onValueChange={(value: 'personal' | 'company') => setEInvoiceType(value)}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="personal" id="personal-invoice" />
                            <Label htmlFor="personal-invoice" className="font-normal">{t('checkout.eInvoice.typePersonal')}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="company" id="company-invoice" />
                            <Label htmlFor="company-invoice" className="font-normal">{t('checkout.eInvoice.typeCompany')}</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      {eInvoiceType === 'personal' && (
                        <>
                          <Input placeholder={t('checkout.eInvoice.fullNamePlaceholder')} name="fullName" value={eInvoiceDetails.fullName} onChange={handleEInvoiceDetailChange} />
                          <Input placeholder={t('checkout.eInvoice.idCardPlaceholder')} name="idCard" value={eInvoiceDetails.idCard} onChange={handleEInvoiceDetailChange} />
                        </>
                      )}
                      {eInvoiceType === 'company' && (
                        <>
                          <Input placeholder={t('checkout.eInvoice.companyNamePlaceholder')} name="companyName" value={eInvoiceDetails.companyName} onChange={handleEInvoiceDetailChange} />
                          <Input placeholder={t('checkout.eInvoice.taxCodePlaceholder')} name="taxCode" value={eInvoiceDetails.taxCode} onChange={handleEInvoiceDetailChange} />
                        </>
                      )}
                      <Input type="email" placeholder={t('checkout.eInvoice.emailPlaceholder')} name="email" value={eInvoiceDetails.email} onChange={handleEInvoiceDetailChange} />
                      <Input placeholder={t('checkout.eInvoice.addressPlaceholder')} name="address" value={eInvoiceDetails.address} onChange={handleEInvoiceDetailChange} />
                      
                    </div>
                  )}
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="shop-message">
                    <AccordionTrigger className="p-4 flex items-center justify-between hover:bg-muted/50 hover:no-underline w-full text-sm text-left font-normal data-[state=open]:border-b data-[state=open]:pb-2">
                      <div className="flex items-center w-full justify-between">
                        <div className="flex items-center">
                            <MessageCircle className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                            <span className="text-sm text-foreground">{t('checkout.messageToShop')}</span>
                        </div>
                        <div className="flex items-center">
                            <span className={cn("text-sm mr-1 truncate max-w-[100px] xs:max-w-[150px] sm:max-w-xs", shopMessage ? "text-foreground" : "text-muted-foreground")}>
                              {shopMessage || t('checkout.messageToShopPlaceholder')}
                            </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                      <Textarea
                        placeholder={t('checkout.messageToShopPlaceholder')}
                        value={shopMessage}
                        onChange={(e) => setShopMessage(e.target.value)}
                        className="min-h-[80px] text-sm"
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-foreground">{t('checkout.shippingMethod')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="border border-foreground rounded-md p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50">
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-foreground mr-2">{shippingMethod.mainLabel}</span>
                      <Badge variant="secondary" className="text-foreground bg-muted px-2 py-0.5 text-xs">{formatCurrency(shippingMethod.price)}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{shippingMethod.subLabel}</p>
                  </div>
                  <RadioGroup defaultValue="selected-shipping-method" className="ml-4 flex-shrink-0">
                    <RadioGroupItem value="selected-shipping-method" id="selected-shipping-method-radio" />
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-0"> 
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push('/select-voucher')}
                >
                  <div className="flex items-center">
                    <Ticket className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">
                      {voucherTriggerText}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-1 flex-shrink-0" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">{t('checkout.paymentMethod')}</h3>
                </div>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border">
                {paymentMethods.map(method => {
                  const isSelected = selectedPaymentMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      className={`p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-muted/80' : ''}`}
                      onClick={() => setSelectedPaymentMethod(method.id as SelectedPaymentMethod)}
                    >
                      <div className="flex items-center">
                        {method.iconUrl ? (
                          <Image
                            src={method.iconUrl}
                            alt={`${method.name} logo`}
                            width={34}
                            height={34}
                            className="mr-3 flex-shrink-0 object-contain"
                            data-ai-hint={method.iconAiHint}
                          />
                        ) : (
                          <CreditCard className="w-8 h-8 text-muted-foreground mr-3 flex-shrink-0" />
                        )}
                        <span className="text-sm text-foreground">{method.name}</span>
                        {method.details && <span className="text-xs text-muted-foreground ml-1.5">{method.details}</span>}
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-foreground ml-2 flex-shrink-0" />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="shadow-lg border">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-foreground">{t('checkout.summaryCard.title')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{t('checkout.summaryCard.subtotal')}</span>
                  <span className="text-foreground font-medium">{formatCurrency(merchandiseSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{t('checkout.summaryCard.shippingFee')}</span>
                  <span className="text-foreground font-medium">{formatCurrency(shippingMethod.price)}</span>
                </div>
                {totalVoucherDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t('checkout.summaryCard.voucherDiscount')}</span>
                        <span className="font-medium text-destructive">-{formatCurrency(totalVoucherDiscount)}</span>
                    </div>
                )}
                {loyaltyDiscountValue > 0 && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t('checkout.summaryCard.coinUsed')}</span>
                        <span className="font-medium text-destructive">-{formatCurrency(loyaltyDiscountValue)}</span>
                    </div>
                )}
                {estimatedVatValue > 0 && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t('checkout.summaryCard.estimatedVat', { rate: VAT_RATE * 100 })}</span>
                        <span className="text-foreground font-medium">{formatCurrency(estimatedVatValue)}</span>
                    </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-foreground">{t('checkout.summaryCard.totalLabel')}</span>
                  <span className="text-foreground">{formatCurrency(displayTotalAmount)}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>
      </main>

      <footer className={`fixed bottom-0 left-0 right-0 z-30 bg-card border-t ${FOOTER_HEIGHT}`}>
        <div className="container mx-auto px-4 h-full flex flex-col items-stretch">
          <div className="py-3 border-b border-border flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('checkout.footer.youHavePointsToRedeem', { availablePoints: AVAILABLE_LOYALTY_POINTS })}
              </p>
              <p className="text-xs text-green-600">
                {t('checkout.footer.redeemPointsSavings', { amount: formatCurrency(LOYALTY_POINTS_DISCOUNT_VALUE) })}
              </p>
            </div>
            <Switch
              checked={useLoyaltyPoints}
              onCheckedChange={setUseLoyaltyPoints}
              aria-label={t('checkout.footer.toggleUsePointsAriaLabel')}
            />
          </div>
          
           <div className="flex flex-row items-center justify-between flex-grow gap-3">
            <div className="text-left">
              <p className="text-sm text-muted-foreground">{t('checkout.footer.totalLabel')}</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{formatCurrency(displayTotalAmount)}</p>
              {displaySavings > 0 && (
                <p className="text-xs text-green-600">
                  {t('checkout.footer.savings', { amount: formatCurrency(displaySavings) })}
                </p>
              )}
            </div>
            
            <Button
              size="lg"
              className="bg-foreground hover:bg-foreground/90 text-accent-foreground font-semibold min-w-[120px] sm:min-w-[140px] flex-shrink-0"
              onClick={handlePlaceOrder}
              disabled={!currentShippingAddress}
            >
              {t('checkout.footer.orderButton')}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;
