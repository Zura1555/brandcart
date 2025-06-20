
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useToast } from "@/hooks/use-toast";
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { cn } from "@/lib/utils";
import type { SelectedVoucherInfo } from '@/interfaces';

const HEADER_HEIGHT = 'h-14'; 
const FOOTER_HEIGHT = 'h-20';
const SELECTED_VOUCHER_COUNT_KEY = 'selectedVoucherUserCount';
const SELECTED_VOUCHERS_DETAILS_KEY = 'selectedVouchersDetails';


interface Voucher {
  id: string;
  title: string;
  imageUrl?: string;
  imageAiHint?: string;
  expiryInfo: string;
  conditionText?: string;
  restrictionText?: string;
  paymentMethodSwitchText?: string;
  isSelected: boolean;
  isAvailable: boolean;
  unavailableReason?: string;
  discountValue: number;
  discountType: 'fixed' | 'percentage';
}

const mockPageAvailableVouchers: Voucher[] = [
  {
    id: 'pv_birthday_100k',
    title: 'Birthday Voucher ưu đãi 100.000 ₫',
    imageUrl: 'https://placehold.co/40x40/E91E63/FFFFFF.png', 
    imageAiHint: 'birthday gift voucher',
    expiryInfo: '31/08/2024',
    isSelected: false,
    isAvailable: true,
    discountValue: 100000,
    discountType: 'fixed',
  },
  {
    id: 'pv_techcom_50k',
    title: 'Ưu đãi 50.000, đơn từ 1.000.000 ₫',
    imageUrl: 'https://placehold.co/40x40/D32F2F/FFFFFF.png', 
    imageAiHint: 'Techcombank logo',
    expiryInfo: '31/08/2024',
    isSelected: false,
    isAvailable: true,
    discountValue: 50000,
    discountType: 'fixed',
  },
  {
    id: 'pv_zalopay_5percent',
    title: 'Zalo Pay giảm 5% giá trị đơn hàng',
    imageUrl: 'https://placehold.co/40x40/2196F3/FFFFFF.png', 
    imageAiHint: 'ZaloPay logo',
    expiryInfo: '02/09/2024',
    paymentMethodSwitchText: 'Switch your payment method to enjoy this offer',
    isSelected: false,
    isAvailable: true,
    discountValue: 5, // Example, will be treated as fixed for now
    discountType: 'percentage',
  },
  {
    id: 'pv_freeship_15k_page', // Changed from 50k to 15k flat for simplicity
    title: 'Giảm 15.000₫ phí vận chuyển',
    imageUrl: 'https://placehold.co/40x40/4CAF50/FFFFFF.png',
    imageAiHint: 'shipping discount truck',
    expiryInfo: '15/09/2024',
    isSelected: false,
    isAvailable: true,
    discountValue: 15000,
    discountType: 'fixed',
  },
  {
    id: 'pv_adidas_10percent_page',
    title: 'Giảm 10% cho sản phẩm Adidas (Tối đa 50k)',
    imageUrl: 'https://placehold.co/40x40/000000/FFFFFF.png',
    imageAiHint: 'Adidas logo',
    expiryInfo: '30/09/2024',
    restrictionText: 'Chỉ áp dụng cho sản phẩm Adidas',
    isSelected: false,
    isAvailable: true,
    discountValue: 50000, // Max discount fixed
    discountType: 'percentage', // conceptually
  },
  {
    id: 'pv_generic_20k_page',
    title: 'Giảm 20.000₫ cho đơn từ 200.000₫',
    imageUrl: 'https://placehold.co/40x40/FFC107/000000.png',
    imageAiHint: 'generic discount voucher',
    expiryInfo: '31/10/2024',
    isSelected: false,
    isAvailable: true,
    conditionText: 'Đơn tối thiểu 200.000₫',
    discountValue: 20000,
    discountType: 'fixed',
  },
];

const mockPageUnavailableVouchers: Voucher[] = [
  {
    id: 'pv_techcom_100k_spend',
    title: 'Ưu đãi 100.000, đơn từ 2.000.000 ₫',
    imageUrl: 'https://placehold.co/40x40/D32F2F/FFFFFF.png', 
    imageAiHint: 'Techcombank logo',
    expiryInfo: '31/07/2024 - 3 days left',
    conditionText: 'Spend 500,000 ₫ more to get this voucher',
    isSelected: false,
    isAvailable: false,
    unavailableReason: 'selectVoucher.voucherCard.unavailableReasonMinOrder',
    discountValue: 100000,
    discountType: 'fixed',
  },
  {
    id: 'pv_honda_1m_puma',
    title: 'Honda Voucher ưu đãi 1.000.000 ₫',
    imageUrl: 'https://placehold.co/40x40/F44336/FFFFFF.png', 
    imageAiHint: 'Honda logo',
    expiryInfo: '31/12/2024',
    restrictionText: 'Only Apply for PUMA items',
    isSelected: false,
    isAvailable: false,
    unavailableReason: 'Restricted to specific items.',
    discountValue: 1000000,
    discountType: 'fixed',
  },
];


const SelectVoucherPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [voucherCodeInput, setVoucherCodeInput] = useState('');

  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>(
    mockPageAvailableVouchers.map(v => ({...v, isSelected: false})) 
  );
  const [unavailableVouchers] = useState<Voucher[]>(mockPageUnavailableVouchers);

  useEffect(() => {
    const storedVouchersRaw = localStorage.getItem(SELECTED_VOUCHERS_DETAILS_KEY);
    if (storedVouchersRaw) {
      try {
        const storedSelectedVoucherInfos: SelectedVoucherInfo[] = JSON.parse(storedVouchersRaw);
        setAvailableVouchers(prevPageVouchers =>
          prevPageVouchers.map(pv => ({
            ...pv,
            isSelected: storedSelectedVoucherInfos.some(info => info.id === pv.id)
          }))
        );
      } catch (e) {
        console.error("Error parsing selected vouchers from localStorage on voucher page init:", e);
      }
    }
  }, []);

  const selectedVoucherCount = useMemo(() => {
    return availableVouchers.filter(v => v.isSelected).length;
  }, [availableVouchers]);

  const handleApplyCode = () => {
    if (voucherCodeInput.trim() === '') return;
    toast({
      title: t('toast.voucher.codeApplied', {code: voucherCodeInput})
    });
  };

  const handleConfirmSelection = () => {
    const selectedFullVouchers: SelectedVoucherInfo[] = availableVouchers
        .filter(v => v.isSelected && v.isAvailable)
        .map(v => ({
            id: v.id,
            title: v.title,
            discountValue: v.discountValue,
            discountType: v.discountType,
        }));
    
    localStorage.setItem(SELECTED_VOUCHERS_DETAILS_KEY, JSON.stringify(selectedFullVouchers));
    localStorage.setItem(SELECTED_VOUCHER_COUNT_KEY, selectedFullVouchers.length.toString());
    
    toast({ title: t('selectVoucher.footer.vouchersSelected', { count: selectedFullVouchers.length }) });
    router.push('/checkout');
  };

  const handleToggleVoucher = (voucherId: string) => {
    setAvailableVouchers(prev => 
      prev.map(v => v.id === voucherId ? { ...v, isSelected: !v.isSelected } : v)
    );
  };

  const VoucherCardDisplay = ({ voucher, onToggleSelect }: { voucher: Voucher; onToggleSelect: (id: string) => void; }) => {
    const { t } = useLanguage();
    const canSelect = voucher.isAvailable;

    return (
      <Card 
        className={cn(
          "mb-3 shadow-sm overflow-hidden border",
          !canSelect && "bg-muted/50 opacity-70",
          canSelect && "cursor-pointer hover:bg-muted/20",
          voucher.isSelected && canSelect && "border-2 border-ring"
        )}
        onClick={() => canSelect && onToggleSelect(voucher.id)}
      >
        <CardContent className="p-3">
          <div className="flex items-start space-x-3">
            {voucher.imageUrl && (
              <Image
                src={voucher.imageUrl}
                alt={voucher.imageAiHint || 'voucher logo'}
                width={40}
                height={40}
                className="rounded object-contain flex-shrink-0 mt-0.5 border"
                data-ai-hint={voucher.imageAiHint || "voucher logo"}
              />
            )}
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{voucher.title}</p>
              {voucher.conditionText && <p className="text-xs text-muted-foreground mt-0.5">{voucher.conditionText}</p>}
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                <span>{voucher.expiryInfo}</span>
              </div>
              {voucher.paymentMethodSwitchText && (
                <p className="text-xs text-blue-600 mt-1">{voucher.paymentMethodSwitchText}</p>
              )}
            </div>
            {canSelect && (
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                {voucher.isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-foreground" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                )}
              </div>
            )}
             {!canSelect && voucher.unavailableReason && (
               <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                 <XCircle className="w-5 h-5 text-destructive" />
               </div>
            )}
          </div>
          {voucher.restrictionText && (
            <div className="mt-2 bg-destructive/80 text-destructive-foreground text-xs p-2 rounded flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{voucher.restrictionText}</span>
            </div>
          )}
           {!canSelect && voucher.unavailableReason && (
             <p className="text-xs text-destructive mt-1 px-1">{t(voucher.unavailableReason, {defaultValue: voucher.unavailableReason})}</p>
           )}
        </CardContent>
      </Card>
    );
  };


  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className={`fixed top-0 left-0 right-0 z-30 bg-card shadow-sm border-b ${HEADER_HEIGHT} flex items-center`}>
        <div className="container mx-auto px-4 flex items-center h-full">
          <Button variant="ghost" size="icon" onClick={() => router.push('/checkout')} className="text-foreground hover:bg-muted hover:text-foreground -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex-grow flex justify-center items-center min-w-0 px-2">
             <h1 className="text-lg font-semibold truncate">{t('selectVoucher.titleOffers')}</h1>
          </div>
          <div className="flex items-center w-10"> 
             <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className={`flex-grow overflow-y-auto pt-14 pb-20`}>
        <div className="sticky top-14 bg-card z-20 p-4 border-b space-y-3">
            <div className="flex items-center space-x-2">
                <Label htmlFor="pageVoucherTypeSelect" className="text-sm whitespace-nowrap">{t('selectVoucher.typeOfVoucherLabel')}:</Label>
                <Select defaultValue="all">
                    <SelectTrigger id="pageVoucherTypeSelect" className="h-9 text-sm">
                        <SelectValue placeholder={t('selectVoucher.allVouchersOption')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('selectVoucher.allVouchersOption')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex space-x-2">
            <Input
                type="text"
                placeholder={t('selectVoucher.inputPlaceholder')}
                value={voucherCodeInput}
                onChange={(e) => setVoucherCodeInput(e.target.value)}
                className="flex-grow h-10 text-sm"
            />
            <Button
                onClick={handleApplyCode}
                disabled={voucherCodeInput.trim() === ''}
                className="h-10 text-sm bg-foreground hover:bg-foreground/90 text-accent-foreground"
            >
                {t('selectVoucher.applyButton')}
            </Button>
            </div>
        </div>
        <ScrollArea className="h-full">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <div>
              {availableVouchers.map(voucher => (
                <VoucherCardDisplay
                  key={voucher.id} 
                  voucher={voucher} 
                  onToggleSelect={handleToggleVoucher}
                />
              ))}
              {availableVouchers.length === 0 && <p className="text-xs text-muted-foreground px-1 py-4 text-center">{t('selectVoucher.noUsableVouchers')}</p>}
            </div>

            {unavailableVouchers.length > 0 && (
                <div className="mt-6">
                <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{t('selectVoucher.unusableVouchersTitle')}</h2>
                {unavailableVouchers.map(voucher => (
                    <VoucherCardDisplay
                    key={voucher.id} 
                    voucher={voucher} 
                    onToggleSelect={() => {}} 
                    />
                ))}
                </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <footer className={`fixed bottom-0 left-0 right-0 z-30 bg-card border-t ${FOOTER_HEIGHT} flex items-center justify-between p-3 px-4 w-full`}>
        <p className="text-sm text-foreground font-medium">
            {t('selectVoucher.footer.vouchersSelected', {count: selectedVoucherCount})}
        </p>
        <Button
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold min-w-[140px]"
          onClick={handleConfirmSelection}
        >
          {t('selectVoucher.footer.useVoucherButton')}
        </Button>
      </footer>
    </div>
  );
};

export default SelectVoucherPage;
