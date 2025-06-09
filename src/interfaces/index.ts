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
  address: string;
  isDefault?: boolean;
}
