
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { ChevronLeft, PlusCircle } from 'lucide-react';
import type { ShippingAddress } from '@/interfaces';
import { mockShippingAddresses } from '@/lib/mockData';

const HEADER_HEIGHT = 'h-14';
const SELECTED_ADDRESS_STORAGE_KEY = 'selectedShippingAddressId';

const SelectAddressPage = () => {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const storedAddressId = localStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY);
    if (storedAddressId) {
      setSelectedAddressId(storedAddressId);
    } else {
      const defaultAddress = mockShippingAddresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (mockShippingAddresses.length > 0) {
        setSelectedAddressId(mockShippingAddresses[0].id);
      }
    }
  }, []);

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, addressId);
    router.push('/checkout');
  };

  const handleEditAddress = (addressId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log("Simulating navigation to edit address:", addressId);
    alert(`Simulating edit for address ID: ${addressId}. Navigation to edit page not implemented.`);
  };

  const handleAddNewAddress = () => {
    console.log("Simulating navigation to add new address form.");
    alert("Simulating navigation to add new address page. This feature is not fully implemented.");
  };


  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className={`fixed top-0 left-0 right-0 z-30 bg-card shadow-sm border-b ${HEADER_HEIGHT} flex items-center`}>
        <div className="container mx-auto px-4 flex items-center justify-between h-full">
          <Button variant="ghost" size="icon" onClick={() => router.push('/checkout')} className="text-foreground hover:bg-muted hover:text-foreground">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Chọn địa chỉ nhận hàng</h1>
          <div className="w-10"> {/* Spacer */}</div>
        </div>
      </header>

      <main className={`flex-grow overflow-y-auto pt-14 pb-4`}>
        <ScrollArea className="h-full">
          <div className="container mx-auto px-2 sm:px-4 py-3">
            <div className="py-2 px-0 sm:px-2 text-sm text-muted-foreground">Địa chỉ</div>
            <RadioGroup value={selectedAddressId} onValueChange={handleSelectAddress} className="space-y-0 bg-card rounded-md shadow-sm">
              {mockShippingAddresses.map((address) => (
                <Card key={address.id} className={`shadow-none border-b rounded-none last:border-b-0 hover:bg-muted/20 ${selectedAddressId === address.id ? 'bg-muted/10' : ''}`}>
                  <Label htmlFor={address.id} className="block cursor-pointer w-full">
                    <CardContent className="p-4 flex items-start space-x-3">
                      <RadioGroupItem value={address.id} id={address.id} className="mt-1 flex-shrink-0" />
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-medium text-foreground">{address.name} | {address.phone}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{address.address}</p>
                        {address.isDefault && (
                          <span className="mt-1.5 inline-block text-xs text-green-600 border border-green-600 rounded px-1.5 py-0.5">Mặc định</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleEditAddress(address.id, e)}
                        className="text-sm text-muted-foreground hover:text-foreground cursor-pointer ml-auto shrink-0 p-0 h-auto"
                      >
                        Sửa
                      </button>
                    </CardContent>
                  </Label>
                </Card>
              ))}
            </RadioGroup>
            <div className="pt-4 text-center">
              <Button
                size="lg"
                className="w-auto bg-foreground hover:bg-foreground/90 text-accent-foreground font-semibold flex items-center justify-center space-x-2 mx-auto"
                onClick={handleAddNewAddress}
              >
                <PlusCircle className="w-5 h-5 text-accent-foreground" />
                <span>Thêm Địa Chỉ Mới</span>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default SelectAddressPage;

