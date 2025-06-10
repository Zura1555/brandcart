
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useToast } from "@/hooks/use-toast";

const HEADER_HEIGHT = 'h-14'; 
const FOOTER_HEIGHT = 'h-20';

interface Voucher {
  id: string;
  typeKey: string; 
  title: string;
  discount: string; 
  minOrder: string; 
  usageInfo?: string; 
  expiryDate?: string; 
  isBestChoice?: boolean;
  isAvailable: boolean;
  unavailableReason?: string;
  quantity?: number; 
  colorClass: string; 
  textColorClass?: string; 
  icon?: React.ElementType;
}



const SelectVoucherPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [voucherCode, setVoucherCode] = useState('');

  const mockAvailableVouchers: Voucher[] = [
    {
      id: 'voucher1',
      typeKey: 'selectVoucher.voucherCard.typeFreeShipping',
      title: 'Miễn Phí Vận Chuyển', // This title could also be a key if it varies
      discount: 'Giảm tối đa 500k₫',
      minOrder: 'Đơn tối thiểu 0₫',
      usageInfo: 'Đã dùng 97% - sắp hết hạn',
      isBestChoice: true,
      isAvailable: true,
      colorClass: 'bg-teal-500',
      textColorClass: 'text-white',
      icon: Truck,
    },
  ];
  
  const mockUnavailableVouchers: Voucher[] = [
    {
      id: 'voucher2',
      typeKey: 'selectVoucher.voucherCard.typeFreeShipping',
      title: 'Miễn Phí Vận Chuyển',
      discount: 'Giảm tối đa 50k₫',
      minOrder: 'Đơn tối thiểu 45k₫',
      expiryDate: 'HSD: 12.06.2025',
      isAvailable: false,
      unavailableReason: 'Chưa đạt GTĐH tối thiểu.', // This should be a translatable key
      quantity: 5,
      colorClass: 'bg-teal-100',
      textColorClass: 'text-teal-600',
      icon: Truck,
    },
  ];

  const [selectedVoucherId, setSelectedVoucherId] = useState<string | undefined>(
    mockAvailableVouchers.length > 0 ? mockAvailableVouchers[0].id : undefined
  );


  const handleApplyCode = () => {
    if (voucherCode.trim() === '') return;
    console.log("Applying voucher code:", voucherCode);
    toast({
      title: t('toast.voucher.codeApplied', {code: voucherCode})
    });
  };

  const handleConfirmSelection = () => {
    console.log("Selected voucher ID:", selectedVoucherId);
    router.push('/checkout');
  };

  const VoucherCard = ({ voucher, isSelected, onSelect }: { voucher: Voucher; isSelected: boolean; onSelect: (id: string) => void; }) => {
    const cardOpacity = voucher.isAvailable ? 'opacity-100' : 'opacity-70';
    
    return (
      <Card className={`mb-3 shadow-sm overflow-hidden ${cardOpacity} ${isSelected && voucher.isAvailable ? 'border-2 border-teal-500' : 'border'}`}>
        <div className="flex">
          <div className={`w-20 ${voucher.colorClass} flex flex-col items-center justify-center p-2 ${voucher.textColorClass || 'text-foreground'}`}>
            {voucher.icon && <voucher.icon className="w-7 h-7 mb-1" />}
            <span className="font-semibold text-xs text-center leading-tight uppercase">{t(voucher.typeKey)}</span>
          </div>
          <div className="flex-grow p-3 pr-2 space-y-1">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-semibold text-foreground">{voucher.title}</h3>
              {voucher.isBestChoice && voucher.isAvailable && (
                <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0.5">{t('selectVoucher.voucherCard.bestChoice')}</Badge>
              )}
              {voucher.quantity && !voucher.isAvailable && (
                <Badge variant="outline" className="text-xs border-muted-foreground text-muted-foreground">x{voucher.quantity}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{voucher.discount}</p>
            <p className="text-xs text-muted-foreground">{voucher.minOrder}</p>
            {voucher.usageInfo && voucher.isAvailable && <p className="text-xs text-orange-600">{voucher.usageInfo}</p>}
            {voucher.expiryDate && <p className="text-xs text-muted-foreground">{voucher.expiryDate}</p>}
            {!voucher.isAvailable && voucher.unavailableReason && (
              <p className="text-xs text-red-600 mt-1">{voucher.unavailableReason}</p> // This should be translated
            )}
          </div>
          <div className="w-12 flex items-center justify-center p-2 shrink-0">
            {voucher.isAvailable ? (
              <RadioGroupItem 
                value={voucher.id} 
                id={`voucher-radio-${voucher.id}`} 
                className={`w-5 h-5 ${isSelected ? 'border-teal-600 text-teal-600' : 'border-muted-foreground'}`}
                onClick={() => onSelect(voucher.id)}
              />
            ) : (
               <XCircle className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
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
          <h1 className="text-lg font-semibold text-foreground text-center flex-grow">{t('selectVoucher.title')}</h1>
          <div className="flex items-center">
             <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className={`flex-grow overflow-y-auto pt-14 pb-20`}>
        <ScrollArea className="h-full">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Card>
              <CardContent className="p-3 flex space-x-2">
                <Input
                  type="text"
                  placeholder={t('selectVoucher.inputPlaceholder')}
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="flex-grow h-10 text-sm"
                />
                <Button
                  onClick={handleApplyCode}
                  disabled={voucherCode.trim() === ''}
                  className="h-10 text-sm bg-foreground hover:bg-foreground/90 text-accent-foreground"
                >
                  {t('selectVoucher.applyButton')}
                </Button>
              </CardContent>
            </Card>

            <RadioGroup value={selectedVoucherId} onValueChange={setSelectedVoucherId}>
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{t('selectVoucher.usableVouchersTitle')}</h2>
                {mockAvailableVouchers.map(voucher => (
                  <VoucherCard 
                    key={voucher.id} 
                    voucher={voucher} 
                    isSelected={selectedVoucherId === voucher.id}
                    onSelect={setSelectedVoucherId}
                  />
                ))}
                {mockAvailableVouchers.length === 0 && <p className="text-xs text-muted-foreground px-1">{t('selectVoucher.noUsableVouchers')}</p>}
              </div>

              <div className="mt-6">
                <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{t('selectVoucher.unusableVouchersTitle')}</h2>
                {mockUnavailableVouchers.map(voucher => (
                   <VoucherCard 
                    key={voucher.id} 
                    voucher={voucher} 
                    isSelected={false} 
                    onSelect={() => {}} 
                  />
                ))}
                {mockUnavailableVouchers.length === 0 && <p className="text-xs text-muted-foreground px-1">{t('selectVoucher.noUnusableVouchers')}</p>}
              </div>
            </RadioGroup>
          </div>
        </ScrollArea>
      </main>

      <footer className={`fixed bottom-0 left-0 right-0 z-30 bg-card border-t ${FOOTER_HEIGHT} flex flex-col items-center justify-center p-3`}>
        <p className="text-xs text-muted-foreground mb-2 text-center">
          {selectedVoucherId ? t('selectVoucher.footer.selectedInfo') : t('selectVoucher.footer.notSelectedInfo')}
        </p>
        <Button
          size="lg"
          className="w-full max-w-md bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          onClick={handleConfirmSelection}
        >
          {t('selectVoucher.footer.confirmButton')}
        </Button>
      </footer>
    </div>
  );
};

export default SelectVoucherPage;
