
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
// mockShippingAddresses is now empty, so it won't be used for initial population unless localStorage is also empty.
import { mockShippingAddresses } from '@/lib/mockData'; 

const HEADER_HEIGHT = 'h-14';
const USER_ADDRESSES_STORAGE_KEY = 'userShippingAddresses';
const SELECTED_ADDRESS_STORAGE_KEY = 'selectedShippingAddressId';

const SelectAddressPage = () => {
  const router = useRouter();
  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let addressesFromStorage: ShippingAddress[] = [];
    const storedAddressesRaw = localStorage.getItem(USER_ADDRESSES_STORAGE_KEY);

    if (storedAddressesRaw) {
      try {
        const parsedAddresses = JSON.parse(storedAddressesRaw);
        // We accept an empty array from storage, meaning user has no addresses yet or cleared them.
        if (Array.isArray(parsedAddresses)) { 
          addressesFromStorage = parsedAddresses;
        } else { // Should not happen if storage is well-managed, but as a fallback:
          addressesFromStorage = []; // Start fresh if format is incorrect
          localStorage.setItem(USER_ADDRESSES_STORAGE_KEY, JSON.stringify(addressesFromStorage));
        }
      } catch (e) {
        console.error("Failed to parse addresses from localStorage, starting fresh.", e);
        addressesFromStorage = [];
        localStorage.setItem(USER_ADDRESSES_STORAGE_KEY, JSON.stringify(addressesFromStorage));
      }
    } else {
      // If nothing in storage (e.g. first visit), initialize with an empty array.
      addressesFromStorage = []; 
      localStorage.setItem(USER_ADDRESSES_STORAGE_KEY, JSON.stringify(addressesFromStorage));
    }

    const defaultAddress = addressesFromStorage.find(addr => addr.isDefault);
    let sortedAddresses = [...addressesFromStorage];
    if (defaultAddress) {
      sortedAddresses = sortedAddresses.filter(addr => addr.id !== defaultAddress.id);
      sortedAddresses.unshift(defaultAddress);
    }
    setShippingAddresses(sortedAddresses);

    const storedSelectedId = localStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY);
    const currentSelectedIsValid = storedSelectedId && sortedAddresses.find(addr => addr.id === storedSelectedId);

    if (currentSelectedIsValid) {
      setSelectedAddressId(storedSelectedId);
    } else {
      const currentDefaultAddress = sortedAddresses.find(addr => addr.isDefault);
      if (currentDefaultAddress) {
        setSelectedAddressId(currentDefaultAddress.id);
        localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, currentDefaultAddress.id);
      } else if (sortedAddresses.length > 0) {
        setSelectedAddressId(sortedAddresses[0].id);
        localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, sortedAddresses[0].id);
      } else {
        setSelectedAddressId(undefined);
        localStorage.removeItem(SELECTED_ADDRESS_STORAGE_KEY); 
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
    router.push(`/add-address?editId=${addressId}`);
  };

  const handleAddNewAddress = () => {
    router.push('/add-address');
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
            {shippingAddresses.length > 0 ? (
              <RadioGroup value={selectedAddressId} onValueChange={handleSelectAddress} className="space-y-0 bg-card rounded-md shadow-sm">
                {shippingAddresses.map((address) => (
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
            ) : (
              <Card className="bg-card rounded-md shadow-sm">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>Không tìm thấy địa chỉ nào.</p>
                  <p>Vui lòng thêm địa chỉ mới để tiếp tục.</p>
                </CardContent>
              </Card>
            )}
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
