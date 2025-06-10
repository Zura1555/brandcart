
"use client";

import React, { useState, useEffect } from 'react';
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
import { ChevronLeft, ClipboardPaste } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ShippingAddress } from '@/interfaces';
import { useToast } from "@/hooks/use-toast";

const HEADER_HEIGHT = 'h-14'; // approx 56px
const FOOTER_HEIGHT = 'h-20'; // approx 80px
const USER_ADDRESSES_STORAGE_KEY = 'userShippingAddresses';
const SELECTED_ADDRESS_STORAGE_KEY = 'selectedShippingAddressId';

const addressFormSchema = z.object({
  fullName: z.string().min(1, { message: "Vui lòng nhập họ tên." }),
  phone: z.string().regex(/^(\+84|0)\d{9,10}$/, { message: "Số điện thoại không hợp lệ." }),
  province: z.string().min(1, { message: "Vui lòng chọn Tỉnh/Thành phố." }),
  district: z.string().min(1, { message: "Vui lòng chọn Quận/Huyện." }),
  ward: z.string().min(1, { message: "Vui lòng chọn Phường/Xã." }),
  streetAddress: z.string().min(1, { message: "Vui lòng nhập địa chỉ cụ thể." }),
  isDefault: z.boolean().default(false),
  addressType: z.enum(['home', 'office'], { required_error: "Vui lòng chọn loại địa chỉ." }),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

const provinces = [{ value: 'hcm', label: 'TP. Hồ Chí Minh' }, { value: 'hn', label: 'Hà Nội' }];
const districts = [{ value: 'q1', label: 'Quận 1' }, { value: 'qtb', label: 'Quận Tân Bình' }];
const wards = [{ value: 'pdk', label: 'Phường Đa Kao' }, { value: 'p2', label: 'Phường 2' }];

type AddressTypeOption = 'home' | 'office';

const AddAddressPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('Địa chỉ mới');
  const [submitButtonText, setSubmitButtonText] = useState('HOÀN THÀNH');
  const [selectedAddressType, setSelectedAddressType] = useState<AddressTypeOption>('home');

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      streetAddress: '',
      isDefault: false,
      addressType: 'home',
    },
  });

  useEffect(() => {
    const editId = searchParams.get('editId');
    if (editId) {
      setEditingAddressId(editId);
      setPageTitle('Sửa địa chỉ');
      setSubmitButtonText('LƯU THAY ĐỔI');
      try {
        const existingAddressesRaw = localStorage.getItem(USER_ADDRESSES_STORAGE_KEY);
        if (existingAddressesRaw) {
          const addresses: ShippingAddress[] = JSON.parse(existingAddressesRaw);
          const addressToEdit = addresses.find(addr => addr.id === editId);
          if (addressToEdit) {
            form.reset({
              fullName: addressToEdit.name,
              phone: addressToEdit.phone,
              province: addressToEdit.province,
              district: addressToEdit.district,
              ward: addressToEdit.ward,
              streetAddress: addressToEdit.streetAddress,
              isDefault: addressToEdit.isDefault || false,
              addressType: addressToEdit.addressType,
            });
            setSelectedAddressType(addressToEdit.addressType);
          } else {
            toast({ title: 'Lỗi', description: 'Không tìm thấy địa chỉ để sửa.', variant: 'destructive' });
            router.push('/select-address');
          }
        }
      } catch (error) {
        console.error("Error loading address for editing:", error);
        toast({ title: 'Lỗi', description: 'Không thể tải địa chỉ để sửa.', variant: 'destructive' });
        router.push('/select-address');
      }
    }
  }, [searchParams, form, router, toast]);

  const onSubmit = (data: AddressFormValues) => {
    const provinceLabel = provinces.find(p => p.value === data.province)?.label || data.province;
    const districtLabel = districts.find(d => d.value === data.district)?.label || data.district;
    const wardLabel = wards.find(w => w.value === data.ward)?.label || data.ward;
    const fullAddressString = `${data.streetAddress}, ${wardLabel}, ${districtLabel}, ${provinceLabel}`;

    try {
      const existingAddressesRaw = localStorage.getItem(USER_ADDRESSES_STORAGE_KEY);
      let addresses: ShippingAddress[] = existingAddressesRaw ? JSON.parse(existingAddressesRaw) : [];

      if (editingAddressId) { // Editing existing address
        const addressIndex = addresses.findIndex(addr => addr.id === editingAddressId);
        if (addressIndex === -1) {
          toast({ title: 'Lỗi', description: 'Không tìm thấy địa chỉ để cập nhật.', variant: 'destructive' });
          return;
        }
        
        const oldAddress = addresses[addressIndex];
        const updatedAddress: ShippingAddress = {
          ...oldAddress,
          name: data.fullName,
          phone: data.phone,
          address: fullAddressString,
          streetAddress: data.streetAddress,
          province: data.province,
          district: data.district,
          ward: data.ward,
          addressType: data.addressType,
          isDefault: data.isDefault,
        };

        if (updatedAddress.isDefault) {
          addresses = addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === editingAddressId,
          }));
          localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, editingAddressId);
        } else { // updatedAddress.isDefault is false
          if (oldAddress.isDefault) { // It was default, now being unset.
            updatedAddress.isDefault = false; // Ensure it's false in the object
            if (addresses.length === 1) { // If it's the only address, it must remain default
              updatedAddress.isDefault = true; 
            } else {
              // If it was the selected default, clear selected key. select-address will pick new.
              if (localStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY) === editingAddressId) {
                localStorage.removeItem(SELECTED_ADDRESS_STORAGE_KEY);
              }
            }
          }
        }
        addresses[addressIndex] = updatedAddress;
        toast({ title: 'Địa chỉ đã được cập nhật', description: 'Thông tin địa chỉ của bạn đã được cập nhật.' });

      } else { // Adding new address
        const newAddress: ShippingAddress = {
          id: `addr-${Date.now().toString()}-${Math.random().toString(36).substring(2, 7)}`,
          name: data.fullName,
          phone: data.phone,
          address: fullAddressString,
          streetAddress: data.streetAddress,
          province: data.province,
          district: data.district,
          ward: data.ward,
          addressType: data.addressType,
          isDefault: data.isDefault,
        };

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
        toast({ title: 'Địa chỉ đã được lưu', description: 'Địa chỉ mới của bạn đã được thêm thành công.' });
      }
      
      // If after all operations, no address is default (e.g. unsetting default from last address in edit), make the first one default.
      // This primarily covers the case where an edit results in no default address, which select-address page would also handle, but good to be robust.
      const hasDefault = addresses.some(addr => addr.isDefault);
      if (!hasDefault && addresses.length > 0) {
        addresses[0].isDefault = true;
        localStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, addresses[0].id);
      }
      
      localStorage.setItem(USER_ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
      router.push('/select-address');

    } catch (error) {
      console.error("Error saving address to localStorage:", error);
      toast({ title: 'Lỗi', description: 'Không thể lưu địa chỉ. Vui lòng thử lại.', variant: 'destructive' });
    }
  };

  const handleAddressTypeChange = (type: AddressTypeOption) => {
    setSelectedAddressType(type);
    form.setValue('addressType', type, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className={`fixed top-0 left-0 right-0 z-30 bg-card shadow-sm border-b ${HEADER_HEIGHT} flex items-center`}>
        <div className="container mx-auto px-4 flex items-center h-full">
          <Button variant="ghost" size="icon" onClick={() => router.push('/select-address')} className="text-foreground hover:bg-muted hover:text-foreground -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground text-center flex-grow">{pageTitle}</h1>
          <div className="w-8"> {/* Spacer to balance the back button */}</div>
        </div>
      </header>

      <main className={`flex-grow overflow-y-auto pt-14 pb-20`}>
        <ScrollArea className="h-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 container mx-auto px-4 py-4">
              
              {!editingAddressId && ( // Hide "Dán và nhập nhanh" when editing
                <Card className="bg-muted">
                  <CardContent className="p-3">
                    <div className="flex items-center mb-1">
                      <ClipboardPaste className="w-5 h-5 text-foreground mr-2" />
                      <span className="text-sm font-semibold text-foreground">Dán và nhập nhanh</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dán hoặc nhập thông tin, nhấn chọn Tự động điền để nhập tên, số điện thoại và địa chỉ
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-0">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="border-b border-border">
                        <FormControl>
                          <Input placeholder="Họ và tên" {...field} className="border-0 rounded-none h-12 px-4 focus-visible:ring-0 focus-visible:ring-offset-0" />
                        </FormControl>
                        <FormMessage className="px-4 pb-2 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="border-b border-border">
                        <FormControl>
                          <Input type="tel" placeholder="Số điện thoại" {...field} className="border-0 rounded-none h-12 px-4 focus-visible:ring-0 focus-visible:ring-offset-0" />
                        </FormControl>
                        <FormMessage className="px-4 pb-2 text-xs" />
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem className="border-b border-border">
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-0 rounded-none h-12 px-4 focus:ring-0 focus:ring-offset-0">
                              <SelectValue placeholder="Tỉnh/Thành phố" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {provinces.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage className="px-4 pb-2 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem className="border-b border-border">
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-0 rounded-none h-12 px-4 focus:ring-0 focus:ring-offset-0">
                              <SelectValue placeholder="Quận/Huyện" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {districts.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage className="px-4 pb-2 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ward"
                    render={({ field }) => (
                      <FormItem className="border-b border-border">
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-0 rounded-none h-12 px-4 focus:ring-0 focus:ring-offset-0">
                              <SelectValue placeholder="Phường/Xã" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wards.map(w => <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage className="px-4 pb-2 text-xs" />
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="streetAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea placeholder="Tên đường, Tòa nhà, Số nhà" {...field} className="border-0 rounded-none min-h-[80px] px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0" />
                        </FormControl>
                        <FormMessage className="px-4 pb-2 text-xs" />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border-b border-border">
                        <FormLabel className="text-sm text-foreground">Đặt làm địa chỉ mặc định</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="addressType"
                    render={({ field }) => ( 
                      <FormItem className="flex flex-row items-center justify-between p-4">
                        <FormLabel className="text-sm text-foreground">Loại địa chỉ:</FormLabel>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant={selectedAddressType === 'office' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleAddressTypeChange('office')}
                            className={`${selectedAddressType === 'office' ? 'bg-foreground text-accent-foreground hover:bg-foreground/90' : 'text-foreground border-muted-foreground hover:bg-muted'}`}
                          >
                            Văn Phòng
                          </Button>
                          <Button
                            type="button"
                            variant={selectedAddressType === 'home' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleAddressTypeChange('home')}
                             className={`${selectedAddressType === 'home' ? 'bg-foreground text-accent-foreground hover:bg-foreground/90' : 'text-foreground border-muted-foreground hover:bg-muted'}`}
                          >
                            Nhà Riêng
                          </Button>
                        </div>
                      </FormItem>
                    )}
                  />
                   {form.formState.errors.addressType && (
                    <FormMessage className="px-4 pb-2 text-xs -mt-2">{form.formState.errors.addressType.message}</FormMessage>
                  )}
                </CardContent>
              </Card>
              
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
            {submitButtonText}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default AddAddressPage;
