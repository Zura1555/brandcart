
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const HEADER_HEIGHT = 'h-14'; // approx 56px
const FOOTER_HEIGHT = 'h-20'; // approx 80px

const addressFormSchema = z.object({
  fullName: z.string().min(2, { message: "Họ tên phải có ít nhất 2 ký tự." }),
  phone: z.string().regex(/^(\+84|0)\d{9,10}$/, { message: "Số điện thoại không hợp lệ." }),
  province: z.string().min(1, { message: "Vui lòng chọn Tỉnh/Thành phố." }),
  district: z.string().min(1, { message: "Vui lòng chọn Quận/Huyện." }),
  ward: z.string().min(1, { message: "Vui lòng chọn Phường/Xã." }),
  streetAddress: z.string().min(5, { message: "Địa chỉ cụ thể phải có ít nhất 5 ký tự." }),
  isDefault: z.boolean().default(false),
  addressType: z.enum(['home', 'office'], { required_error: "Vui lòng chọn loại địa chỉ." }),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

// Placeholder data for dropdowns
const provinces = [{ value: 'hcm', label: 'TP. Hồ Chí Minh' }, { value: 'hn', label: 'Hà Nội' }];
const districts = [{ value: 'q1', label: 'Quận 1' }, { value: 'qtb', label: 'Quận Tân Bình' }];
const wards = [{ value: 'pdk', label: 'Phường Đa Kao' }, { value: 'p2', label: 'Phường 2' }];

const AddAddressPage = () => {
  const router = useRouter();
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

  const onSubmit = (data: AddressFormValues) => {
    console.log("New Address Data:", data);
    // Here you would typically save the address (e.g., to mockData, localStorage, or an API)
    // For now, just log and navigate back
    alert('Địa chỉ đã được lưu (kiểm tra console)!');
    router.push('/select-address');
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className={`fixed top-0 left-0 right-0 z-30 bg-card shadow-sm border-b ${HEADER_HEIGHT} flex items-center`}>
        <div className="container mx-auto px-4 flex items-center justify-between h-full">
          <Button variant="ghost" size="icon" onClick={() => router.push('/select-address')} className="text-foreground hover:bg-muted hover:text-foreground">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Thêm Địa Chỉ Mới</h1>
          <div className="w-10"> {/* Spacer */}</div>
        </div>
      </header>

      <main className={`flex-grow overflow-y-auto pt-14 pb-20`}>
        <ScrollArea className="h-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 container mx-auto px-4 py-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn Văn A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="090xxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tỉnh/Thành phố</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quận/Huyện</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn Quận/Huyện" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {districts.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phường/Xã</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn Phường/Xã" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wards.map(w => <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="streetAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ cụ thể</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Số nhà, tên đường, tòa nhà..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Ví dụ: Số 123, Đường ABC, Tòa nhà XYZ
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Loại địa chỉ</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="home" />
                          </FormControl>
                          <FormLabel className="font-normal">Nhà riêng</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="office" />
                          </FormControl>
                          <FormLabel className="font-normal">Văn phòng</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
                    <div className="space-y-0.5">
                      <FormLabel>Đặt làm địa chỉ mặc định</FormLabel>
                      <FormDescription>
                        Địa chỉ này sẽ được chọn tự động cho lần mua hàng tới.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="pb-4"> {/* Padding to ensure space above fixed footer */}
                {/* This div intentionally left for spacing if needed, or can be removed */}
              </div>
            </form>
          </Form>
        </ScrollArea>
      </main>

      <footer className={`fixed bottom-0 left-0 right-0 z-30 bg-card border-t ${FOOTER_HEIGHT} flex items-center justify-center`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <Button type="submit" form="addressForm" size="lg" className="w-full max-w-md bg-foreground hover:bg-foreground/90 text-accent-foreground font-semibold" onClick={form.handleSubmit(onSubmit)}>
            Lưu địa chỉ
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default AddAddressPage;
