export interface Product {
  id: string;
  name: string;
  price: number; // Expecting whole numbers like 36000
  originalPrice?: number; // Expecting whole numbers like 50000
  brand: string;
  imageUrl: string;
  dataAiHint?: string;
  variant?: string;
  stock?: number;
  discountDescription?: string;
}

export interface Shop {
  name: string;
  isFavorite?: boolean;
  logoUrl?: string;
  logoDataAiHint?: string;
  promotionText?: string;
  editLinkText?: string; // e.g., "Sửa"
  products: Product[];
}

export interface CartItem extends Product {
  quantity: number;
  selected: boolean;
}

export interface ShippingAddress {
  id: string;
  name: string;
  phone: string;
  address: string; // Full concatenated address for display
  streetAddress: string; // Street, building number part
  ward: string; // Value for select, e.g., 'pdk'
  district: string; // Value for select, e.g., 'q1'
  province: string; // Value for select, e.g., 'hcm'
  addressType: 'home' | 'office';
  isDefault?: boolean;
}
