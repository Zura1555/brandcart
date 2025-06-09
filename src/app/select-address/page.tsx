
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, PlusCircle, Edit2 } from 'lucide-react';
import type { ShippingAddress } from '@/interfaces';
import { mockShippingAddresses } from '@/lib/mockData';

const HEADER_HEIGHT = 'h-14'; // approx 56px
const FOOTER_BUTTON_HEIGHT = 'h-20'; // approx 80px
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
    // router.push(`/edit-address/${addressId}`); // Placeholder for actual navigation
    alert(`Simulating edit for address ID: ${addressId}. Navigation to edit page not implemented.`);
  };

  const handleAddNewAddress = () => {
    console.log("Simulating navigation to add new address form.");
    // router.push('/add-address'); // Placeholder for actual navigation
    alert("Simulating navigation to add new address page. This feature is not fully implemented.");
  };


  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className={`fixed top-0 left-0 right-0 z-30 bg-card shadow-sm border-b ${HEADER_HEIGHT} flex items-center`}>
        <div className="container mx-auto px-4 flex items-center justify-between h-full">
          <Button variant="ghost" size="icon" onClick={() => router.push('/checkout')} className="text-foreground hover:bg-muted hover:text-foreground">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Select Shipping Address</h1>
          <div className="w-10"> {/* Spacer */}</div>
        </div>
      </header>

      <main className={`flex-grow overflow-y-auto pt-14 pb-${parseInt(FOOTER_BUTTON_HEIGHT.substring(2)) + 4 /* Add some padding from button */ }`}>
        <ScrollArea className="h-full">
          <div className="container mx-auto px-2 sm:px-4 py-3 space-y-3">
            <RadioGroup value={selectedAddressId} onValueChange={handleSelectAddress}>
              {mockShippingAddresses.map((address) => (
                <Card key={address.id} className={`shadow-sm hover:bg-muted/20 ${selectedAddressId === address.id ? 'border-foreground' : ''}`}>
                  <Label htmlFor={address.id} className="block cursor-pointer">
                    <CardContent className="p-4 flex items-start">
                      <RadioGroupItem value={address.id} id={address.id} className="mr-4 mt-1 flex-shrink-0" />
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-foreground">{address.name} | {address.phone}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{address.address}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-foreground hover:text-accent p-1 h-auto -mr-2"
                            onClick={(e) => handleEditAddress(address.id, e)}
                          >
                            <Edit2 className="w-4 h-4 mr-1" /> Edit
                          </Button>
                        </div>
                        {address.isDefault && (
                          <Badge variant="outline" className="mt-2 text-xs px-1.5 py-0.5 border-green-600 text-green-600 bg-green-50">
                            Default
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Label>
                </Card>
              ))}
            </RadioGroup>
          </div>
        </ScrollArea>
      </main>

      <div className={`fixed bottom-0 left-0 right-0 z-30 bg-card border-t p-4 ${FOOTER_BUTTON_HEIGHT} flex items-center justify-center`}>
        <Button 
          size="lg" 
          className="w-full max-w-md bg-foreground hover:bg-foreground/90 text-accent-foreground font-semibold"
          onClick={handleAddNewAddress}
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add New Address
        </Button>
      </div>
    </div>
  );
};

export default SelectAddressPage;
