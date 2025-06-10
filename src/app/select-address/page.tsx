
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
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useToast } from "@/hooks/use-toast";


const HEADER_HEIGHT = 'h-14';
const USER_ADDRESSES_STORAGE_KEY = 'userShippingAddresses';
const SELECTED_ADDRESS_STORAGE_KEY = 'selectedShippingAddressId';

const SelectAddressPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let addressesFromStorage: ShippingAddress[] = [];
    const storedAddressesRaw = localStorage.getItem(USER_ADDRESSES_STORAGE_KEY);

    if (storedAddressesRaw) {
      try {
        const parsedAddresses = JSON.parse(storedAddressesRaw);
        // Ensure it's an array of valid address objects
        if (Array.isArray(parsedAddresses) && parsedAddresses.every(addr => typeof addr === 'object' && addr !== null && 'id' in addr)) {
          addressesFromStorage = parsedAddresses;
        } else {
          // Malformed data or not an array of valid addresses, initialize as empty and clear storage
          addressesFromStorage = [];
          localStorage.setItem(USER_ADDRESSES_STORAGE_KEY, JSON.stringify([]));
        }
      } catch (e) {
        console.error("Failed to parse addresses from localStorage, initializing as empty.", e);
        addressesFromStorage = [];
        localStorage.setItem(USER_ADDRESSES_STORAGE_KEY, JSON.stringify([]));
      }
    } else {
      // No addresses in localStorage, initialize as empty
      addressesFromStorage = [];
      localStorage.setItem(USER_ADDRESSES_STORAGE_KEY, JSON.stringify([]));
    }

    // Ensure a default address exists if there are addresses
    if (addressesFromStorage.length > 0 && !addressesFromStorage.some(addr => addr.isDefault)) {
      addressesFromStorage[0].isDefault = true;
      // Re-save to localStorage if we had to set a default
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
    let newSelectedId: string | undefined = undefined;

    if (storedSelectedId && sortedAddresses.find(addr => addr.id === storedSelectedId)) {
      newSelectedId = storedSelectedId;
    } else if (defaultAddress) { // Check defaultAddress from the potentially updated list
      newSelectedId = defaultAddress.id;
    } else if (sortedAddresses.length > 0) {
      // If still no default (should not happen if logic above works), select the first
      newSelectedId = sortedAddresses[0].id;
    }

    setSelectedAddressId(newSelectedId);
    if (newSelectedId) {
      localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, newSelectedId);
    } else {
      localStorage.removeItem(SELECTED_ADDRESS_STORAGE_KEY); 
    }
  }, []); // Run once on mount

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
          <h1 className="text-lg font-semibold text-foreground">{t('selectAddress.title')}</h1>
          <div className="flex items-center">
             <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className={`flex-grow overflow-y-auto pt-14 pb-4`}>
        <ScrollArea className="h-full">
          <div className="container mx-auto px-2 sm:px-4 py-3">
            <div className="py-2 px-0 sm:px-2 text-sm text-muted-foreground">{t('selectAddress.addressesLabel')}</div>
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
                            <span className="mt-1.5 inline-block text-xs text-green-600 border border-green-600 rounded px-1.5 py-0.5">{t('selectAddress.defaultBadge')}</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleEditAddress(address.id, e)}
                          className="text-sm text-muted-foreground hover:text-foreground cursor-pointer ml-auto shrink-0 p-0 h-auto"
                        >
                          {t('selectAddress.editButton')}
                        </button>
                      </CardContent>
                    </Label>
                  </Card>
                ))}
              </RadioGroup>
            ) : (
              <Card className="bg-card rounded-md shadow-sm">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>{t('selectAddress.noAddressesFound.line1')}</p>
                  <p>{t('selectAddress.noAddressesFound.line2')}</p>
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
                <span>{t('selectAddress.addNewButton')}</span>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default SelectAddressPage;
