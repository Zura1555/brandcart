
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
import { ChevronLeft, ChevronRight, MapPin, MessageCircle, ShieldCheck, ShoppingCart, FileText, Ticket, CheckCircle2, CreditCard, Wallet, QrCode } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import type { CartItem, Shop as MockShopType, ShippingAddress } from '@/interfaces';
import { mockShops } from '@/lib/mockData'; 
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { useToast } from '@/hooks/use-toast';

const HEADER_HEIGHT = 'h-14'; 
const FOOTER_HEIGHT = 'h-24'; 
const CHECKOUT_ITEMS_STORAGE_KEY = 'checkoutItems';
const SELECTED_ADDRESS_STORAGE_KEY = 'selectedShippingAddressId';
const USER_ADDRESSES_STORAGE_KEY = 'userShippingAddresses';

interface DisplayShop {
  name: string;
  isFavorite?: boolean;
  logoUrl?: string;
  logoDataAiHint?: string;
  products: CartItem[];
}

const staticProductPlaceholder = {
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
  mainLabelKey: 'checkout.shippingMethodStandardDeliveryLabel',
  price: 19000,
  subLabelKey: 'checkout.shippingMethodEstimatedDeliveryTimeLabel',
};

const CheckoutPage = () => {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const [dynamicDisplayShops, setDynamicDisplayShops] = useState<DisplayShop[]>([]);
  const [initialTotalAmount, setInitialTotalAmount] = useState<number>(0);
  const [initialSavings, setInitialSavings] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'payoo' | 'vnpay' | 'momo' | 'applepay'>('payoo');
  const [currentShippingAddress, setCurrentShippingAddress] = useState<ShippingAddress | null>(null);
  const [addressLoaded, setAddressLoaded] = useState(false);

  // E-Invoice state
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


  useEffect(() => {
    const rawItems = localStorage.getItem(CHECKOUT_ITEMS_STORAGE_KEY);
    let itemsTotal = 0;
    let itemsSavings = 0;

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

          items.forEach(item => {
            itemsTotal += item.price * item.quantity;
            if (item.originalPrice) {
              itemsSavings += (item.originalPrice - item.price) * item.quantity;
            }
          });
        } else {
          itemsTotal = staticProductPlaceholder.price * staticProductPlaceholder.quantity;
          if (staticProductPlaceholder.originalPrice) {
            itemsSavings = (staticProductPlaceholder.originalPrice - staticProductPlaceholder.price) * staticProductPlaceholder.quantity;
          }
        }
      } catch (error) {
        console.error("Error parsing checkout items from localStorage:", error);
        itemsTotal = staticProductPlaceholder.price * staticProductPlaceholder.quantity;
        if (staticProductPlaceholder.originalPrice) {
            itemsSavings = (staticProductPlaceholder.originalPrice - staticProductPlaceholder.price) * staticProductPlaceholder.quantity;
        }
      }
    } else {
        itemsTotal = staticProductPlaceholder.price * staticProductPlaceholder.quantity;
        if (staticProductPlaceholder.originalPrice) {
            itemsSavings = (staticProductPlaceholder.originalPrice - staticProductPlaceholder.price) * staticProductPlaceholder.quantity;
        }
    }
    
    setInitialTotalAmount(itemsTotal + staticShippingMethod.price);
    setInitialSavings(itemsSavings);


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
  }, []);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')}₫`;
  };

  const shippingMethod = useMemo(() => ({
    mainLabel: t(staticShippingMethod.mainLabelKey),
    price: staticShippingMethod.price,
    subLabel: t(staticShippingMethod.subLabelKey),
  }), [t]);


  const numberOfProductTypes = useMemo(() => {
    if (dynamicDisplayShops.length > 0) {
        return dynamicDisplayShops.reduce((sum, shop) => sum + shop.products.length, 0);
    }
    return 1;
  }, [dynamicDisplayShops]);

  const displayTotalAmount = useMemo(() => {
    let currentTotal = initialTotalAmount;
    return Math.max(0, currentTotal);
  }, [initialTotalAmount]);

  const displaySavings = initialSavings;

  const shopsToRender = dynamicDisplayShops.length > 0 ? dynamicDisplayShops : [];

  const paymentMethods = [
    { id: 'payoo', name: 'Payoo', iconUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-Payoo.png', iconAiHint: 'Payoo logo', details: null },
    { id: 'vnpay', name: 'VNPay', iconUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png', iconAiHint: 'VNPay QR logo', details: null },
    { id: 'momo', name: 'Momo', iconUrl: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png', iconAiHint: 'Momo logo', details: null },
    { id: 'applepay', name: 'Apple Pay', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg', iconAiHint: 'Apple Pay logo', details: null },
  ];

  const currentAddressNamePhone = currentShippingAddress ? t('checkout.address.namePhone', { name: currentShippingAddress.name, phone: currentShippingAddress.phone }) : '';

  const merchandiseSubtotal = useMemo(() => {
    if (dynamicDisplayShops.length > 0) {
        return dynamicDisplayShops.reduce((shopSum, shop) => 
            shopSum + shop.products.reduce((productSum, p) => productSum + p.price * p.quantity, 0), 
        0);
    }
    return staticProductPlaceholder.price * staticProductPlaceholder.quantity;
  }, [dynamicDisplayShops]);

  const handleEInvoiceDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEInvoiceDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEInvoice = () => {
    if (eInvoiceType === 'personal' && (!eInvoiceDetails.fullName || !eInvoiceDetails.idCard || !eInvoiceDetails.email || !eInvoiceDetails.address)) {
      toast({ title: t('toast.eInvoice.validationError.title'), description: t('toast.eInvoice.validationError.personal'), variant: "destructive"});
      return;
    }
    if (eInvoiceType === 'company' && (!eInvoiceDetails.companyName || !eInvoiceDetails.taxCode || !eInvoiceDetails.email || !eInvoiceDetails.address)) {
      toast({ title: t('toast.eInvoice.validationError.title'), description: t('toast.eInvoice.validationError.company'), variant: "destructive"});
      return;
    }
    console.log("E-Invoice Details Saved:", eInvoiceDetails);
    setEInvoiceSummary(eInvoiceType === 'personal' ? eInvoiceDetails.fullName : eInvoiceDetails.companyName);
    toast({ title: t('toast.eInvoice.saved.title'), description: t('toast.eInvoice.saved.description')});
  };

  const handleCancelEInvoice = () => {
    setEInvoiceDetails({ fullName: '', companyName: '', idCard: '', taxCode: '', email: '', address: '' });
    setEInvoiceSummary(null);
    toast({ title: t('toast.eInvoice.cancelled.title') });
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

      <main className={`flex-grow overflow-y-auto pt-14 pb-24`}>
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
                           <Badge className="bg-green-600 hover:bg-green-600 text-white text-xs mt-0.5 px-1.5 py-0.5">
                            {p.variant.replace(/\s*\(\+\d+\)\s*$/, '')}
                          </Badge>
                        )}
                        <p className="text-sm font-semibold text-foreground mt-1">{t('checkout.item.quantityLabel', { count: p.quantity })}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(p.price)}</span>
                        {p.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through ml-1.5 block">{formatCurrency(p.originalPrice)}</span>
                        )}
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
                        <Badge className="bg-green-600 hover:bg-green-600 text-white text-xs mt-0.5 px-1.5 py-0.5">
                          {staticProductPlaceholder.variation}
                        </Badge>
                      )}
                      <p className="text-sm font-semibold text-foreground mt-1">{t('checkout.item.quantityLabel', { count: staticProductPlaceholder.quantity })}</p>
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
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="e-invoice">
                    <AccordionTrigger className="p-4 flex items-center justify-between hover:bg-muted/50 hover:no-underline w-full text-sm data-[state=open]:border-b">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                        <span className="text-sm text-foreground">{t('checkout.eInvoice.title')}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground mr-1">
                          {eInvoiceSummary || ''}
                        </span>
                        {/* Chevron is part of AccordionTrigger */}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4">
                      <div className="space-y-4">
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
                        
                        <div className="flex space-x-3 pt-2">
                          <Button onClick={handleSaveEInvoice} className="flex-1 bg-foreground hover:bg-foreground/90 text-accent-foreground">
                            {t('checkout.eInvoice.saveButton')}
                          </Button>
                          <Button variant="outline" onClick={handleCancelEInvoice} className="flex-1 border-muted-foreground text-muted-foreground hover:bg-muted">
                            {t('checkout.eInvoice.doNotIssueButton')}
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 text-foreground mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">{t('checkout.messageToShop')}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">{t('checkout.messageToShopPlaceholder')}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />
                  </div>
                </div>
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
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">
                    {t('checkout.totalAmountLabelWithCount', { count: numberOfProductTypes })}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(merchandiseSubtotal)}</span>
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
                      {t('checkout.yourVoucherAvailable', { count: 3 })} 
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
                      onClick={() => setSelectedPaymentMethod(method.id as any)}
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

          </div>
        </ScrollArea>
      </main>

      <footer className={`fixed bottom-0 left-0 right-0 z-30 bg-card border-t ${FOOTER_HEIGHT}`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t('checkout.footer.totalLabel')}</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(displayTotalAmount)}</p>
            {displaySavings > 0 && (
              <p className="text-xs text-green-600">{t('checkout.footer.savings', { amount: formatCurrency(displaySavings) })}</p>
            )}
          </div>
          <Button
            size="lg"
            className="bg-foreground hover:bg-foreground/90 text-accent-foreground font-semibold min-w-[140px]"
            onClick={() => router.push('/payment')}
            disabled={!currentShippingAddress}
          >
            {t('checkout.footer.orderButton')}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;


    

    

