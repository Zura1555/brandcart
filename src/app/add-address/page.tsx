
"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ShippingAddress } from '@/interfaces';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

const HEADER_HEIGHT = 'h-14'; 
const FOOTER_HEIGHT = 'h-20'; 
const USER_ADDRESSES_STORAGE_KEY = 'userShippingAddresses';
const SELECTED_ADDRESS_STORAGE_KEY = 'selectedShippingAddressId';

const getAddressFormSchema = (t: (key: string, params?: Record<string, string | number>) => string) => z.object({
  id: z.string().optional(), 
  firstName: z.string().min(1, { message: t("addAddress.validation.firstNameRequired") }),
  lastName: z.string().min(1, { message: t("addAddress.validation.lastNameRequired") }),
  phone: z.string().regex(/^(\+84|0)\d{9,10}$/, { message: t("addAddress.validation.phoneInvalid") }),
  province: z.string().min(1, { message: t("addAddress.validation.provinceRequired") }),
  district: z.string().min(1, { message: t("addAddress.validation.districtRequired") }),
  ward: z.string().min(1, { message: t("addAddress.validation.wardRequired") }),
  streetAddress: z.string().min(1, { message: t("addAddress.validation.streetAddressRequired") }),
  isDefault: z.boolean().default(false),
});

type AddressFormValues = z.infer<ReturnType<typeof getAddressFormSchema>>;

const provinces = [{ value: 'hcm', label: 'TP. Hồ Chí Minh' }, { value: 'hn', label: 'Hà Nội' }];
const districts = [{ value: 'q1', label: 'Quận 1' }, { value: 'qtb', label: 'Quận Tân Bình' }];
const wards = [{ value: 'pdk', label: 'Phường Đa Kao' }, { value: 'p2', label: 'Phường 2' }];

const AddAddressFormInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useLanguage();

  const editId = searchParams.get('editId');
  const isEditMode = Boolean(editId);
  
  const addressFormSchema = useMemo(() => getAddressFormSchema(t), [t]);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      id: undefined,
      firstName: '',
      lastName: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      streetAddress: '',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (isEditMode && editId) {
      const existingAddressesRaw = localStorage.getItem(USER_ADDRESSES_STORAGE_KEY);
      if (existingAddressesRaw) {
        const addresses: ShippingAddress[] = JSON.parse(existingAddressesRaw);
        const addressToEdit = addresses.find(addr => addr.id === editId);
        if (addressToEdit) {
          const nameParts = addressToEdit.name.split(' ');
          const lastName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : ''; // Assuming last word is first name
          const firstName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : '';
          
          form.reset({
            id: addressToEdit.id,
            firstName: firstName,
            lastName: lastName,
            phone: addressToEdit.phone,
            province: addressToEdit.province || '',
            district: addressToEdit.district || '',
            ward: addressToEdit.ward || '',
            streetAddress: addressToEdit.streetAddress || '',
            isDefault: addressToEdit.isDefault || false,
          });
        } else {
          router.push('/select-address'); 
        }
      }
    }
  }, [isEditMode, editId, form, router, t]);


  const onSubmit = (data: AddressFormValues) => {
    const provinceLabel = provinces.find(p => p.value === data.province)?.label || data.province;
    const districtLabel = districts.find(d => d.value === data.district)?.label || data.district;
    const wardLabel = wards.find(w => w.value === data.ward)?.label || data.ward;
    const fullAddressString = `${data.streetAddress}, ${wardLabel}, ${districtLabel}, ${provinceLabel}`;
    const fullName = `${data.lastName} ${data.firstName}`.trim();

    const addressData: Omit<ShippingAddress, 'id' | 'addressType'> & { id?: string } = {
      id: isEditMode && data.id ? data.id : `addr-${Date.now().toString()}-${Math.random().toString(36).substring(2, 7)}`,
      name: fullName,
      phone: data.phone,
      address: fullAddressString,
      isDefault: data.isDefault,
      province: data.province,
      district: data.district,
      ward: data.ward,
      streetAddress: data.streetAddress,
      // addressType removed
    };

    try {
      const existingAddressesRaw = localStorage.getItem(USER_ADDRESSES_STORAGE_KEY);
      let addresses: ShippingAddress[] = existingAddressesRaw ? JSON.parse(existingAddressesRaw) : [];
      const selectedAddressIdRaw = localStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY);

      if (isEditMode && addressData.id) { 
        let oldDefaultId: string | null = null;
        addresses = addresses.map(addr => {
            if (addr.isDefault && addr.id !== addressData.id) oldDefaultId = addr.id;
            // Ensure addressType is preserved if it exists on old addresses, or set to 'home'
            const existingAddrType = (addr as any).addressType || 'home';
            const updatedAddr = { ...addr, ...addressData, addressType: existingAddrType } as ShippingAddress;
            if(addr.id === addressData.id) return updatedAddr;
            return addr;
        });
        

        if (addressData.isDefault) {
            addresses = addresses.map(addr => 
                addr.id === addressData.id ? addr : { ...addr, isDefault: false }
            );
            localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, addressData.id);
        } else { 
            const currentlyEditedAddressWasDefault = addresses.find(a => a.id === addressData.id)?.isDefault === false && selectedAddressIdRaw === addressData.id;
            if(currentlyEditedAddressWasDefault){
                 if (addresses.length === 1) { 
                    addresses[0].isDefault = true;
                    localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, addresses[0].id);
                 } else if (oldDefaultId) { 
                    localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, oldDefaultId);
                 }
                 else { 
                    const firstAddress = addresses.length > 0 ? addresses[0] : null;
                    if (firstAddress) {
                        firstAddress.isDefault = true; 
                        localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, firstAddress.id);
                        addresses = addresses.map(a => a.id === firstAddress.id ? firstAddress : a);
                    } else {
                        localStorage.removeItem(SELECTED_ADDRESS_STORAGE_KEY);
                    }
                 }
            }
        }
        toast({
          title: t('toast.address.updated.title'),
          description: t('toast.address.updated.description'),
        });

      } else { 
        // For new addresses, default addressType to 'home' as it's removed from form
        const newAddress = { ...addressData, addressType: 'home' } as ShippingAddress;
        if (newAddress.isDefault) {
          addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
          localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, newAddress.id);
        } else {
          if (addresses.length === 0) {
            newAddress.isDefault = true;
            localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, newAddress.id);
          }
        }
        addresses.push(newAddress);
        toast({
          title: t('toast.address.saved.title'),
          description: t('toast.address.saved.description'),
        });
      }
      
      if (addresses.length > 0 && !addresses.some(addr => addr.isDefault)) {
        addresses[0].isDefault = true;
        localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, addresses[0].id);
      }

      localStorage.setItem(USER_ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
      router.push('/select-address');

    } catch (error) {
      console.error("Error saving address to localStorage:", error);
      toast({
        title: t('toast.address.error.title'),
        description: t('toast.address.error.description'),
        variant: 'destructive',
      });
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className={`fixed top-0 left-0 right-0 z-30 bg-card shadow-sm border-b ${HEADER_HEIGHT} flex items-center`}>
        <div className="container mx-auto px-4 flex items-center h-full">
          <Button variant="ghost" size="icon" onClick={() => router.push('/select-address')} className="text-foreground hover:bg-muted hover:text-foreground -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex-grow flex justify-center items-center min-w-0 px-2">
             <Breadcrumbs />
          </div>
          {/* LanguageSwitcher removed */}
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </header>

      <main className={`flex-grow overflow-y-auto pt-14 pb-20`}>
        <ScrollArea className="h-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 container mx-auto px-4 py-4">
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="bg-card p-3 rounded-lg shadow-sm">
                    <FormLabel className="text-xs text-muted-foreground">{t('addAddress.lastNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('addAddress.lastNamePlaceholder')} {...field} className="mt-1" />
                    </FormControl>
                    <FormMessage className="pt-1 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="bg-card p-3 rounded-lg shadow-sm">
                    <FormLabel className="text-xs text-muted-foreground">{t('addAddress.firstNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('addAddress.firstNamePlaceholder')} {...field} className="mt-1" />
                    </FormControl>
                    <FormMessage className="pt-1 text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="bg-card p-3 rounded-lg shadow-sm">
                    <FormLabel className="text-xs text-muted-foreground">{t('addAddress.phoneLabel')}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder={t('addAddress.phonePlaceholder')} {...field} className="mt-1" />
                    </FormControl>
                    <FormMessage className="pt-1 text-xs" />
                  </FormItem>
                )}
              />
            
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem className="bg-card p-3 rounded-lg shadow-sm">
                    <FormLabel className="text-xs text-muted-foreground">{t('addAddress.provinceLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={t('addAddress.provincePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage className="pt-1 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem className="bg-card p-3 rounded-lg shadow-sm">
                    <FormLabel className="text-xs text-muted-foreground">{t('addAddress.districtLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={t('addAddress.districtPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {districts.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage className="pt-1 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ward"
                render={({ field }) => (
                  <FormItem className="bg-card p-3 rounded-lg shadow-sm">
                     <FormLabel className="text-xs text-muted-foreground">{t('addAddress.wardLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={t('addAddress.wardPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wards.map(w => <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage className="pt-1 text-xs" />
                  </FormItem>
                )}
              />
            
              <FormField
                control={form.control}
                name="streetAddress"
                render={({ field }) => (
                  <FormItem className="bg-card p-3 rounded-lg shadow-sm">
                    <FormLabel className="text-xs text-muted-foreground">{t('addAddress.streetAddressLabel')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('addAddress.streetAddressPlaceholder')} {...field} className="mt-1 min-h-[60px]" />
                    </FormControl>
                    <FormMessage className="pt-1 text-xs" />
                  </FormItem>
                )}
              />
              
              <div className="pt-2"> {/* Spacer before default switch */}
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-4 bg-card rounded-lg shadow-sm">
                      <FormLabel className="text-sm text-foreground">{t('addAddress.setDefaultLabel')}</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pb-4">
              </div>
            </form>
          </Form>
        </ScrollArea>
      </main>

      <footer className={`fixed bottom-0 left-0 right-0 z-30 bg-card border-t ${FOOTER_HEIGHT} flex items-center justify-center`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <Button 
            type="submit" 
            size="lg" 
            className="w-full max-w-md bg-foreground hover:bg-foreground/90 text-accent-foreground font-semibold" 
            onClick={form.handleSubmit(onSubmit)}
          >
            {isEditMode ? t('addAddress.button.saveChanges') : t('addAddress.button.saveAddress')}
          </Button>
        </div>
      </footer>
    </div>
  );
};

const AddAddressPage = () => {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-muted/40">
        <header className={`fixed top-0 left-0 right-0 z-30 bg-card shadow-sm border-b ${HEADER_HEIGHT} flex items-center`}>
          <div className="container mx-auto px-4 flex items-center h-full">
            <div className="w-10"></div> 
            <div className="flex-grow flex justify-center items-center min-w-0 px-2">
                <div className="h-5 w-36 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="w-10"></div> {/* Adjusted for balance */}
          </div>
        </header>
        <main className={`flex-grow overflow-y-auto pt-14 pb-20 flex items-center justify-center`}>
          <p>Loading address form...</p>
        </main>
        <footer className={`fixed bottom-0 left-0 right-0 z-30 bg-card border-t ${FOOTER_HEIGHT} flex items-center justify-center`}>
          <div className="container mx-auto px-4 h-full flex items-center justify-center">
            <Button size="lg" className="w-full max-w-md bg-foreground hover:bg-foreground/90 text-accent-foreground font-semibold" disabled>
              Loading...
            </Button>
          </div>
        </footer>
      </div>
    }>
      <AddAddressFormInner />
    </Suspense>
  );
};

export default AddAddressPage;
