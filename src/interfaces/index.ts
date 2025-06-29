
export interface SimpleVariant {
  id: string; // e.g., "variant_red_m"
  name: string; // e.g., "Color: Red, Size: M"
  price?: number; // Optional: if variant price differs from base product price
  originalPrice?: number; // Optional
  imageUrl?: string; // Optional: if variant has a different image
  stock?: number; // Optional: specific stock for this variant
  dataAiHint?: string; // Optional
}

export interface Product {
  id: string;
  name: string;
  price: number; // Expecting whole numbers like 36000
  originalPrice?: number; // Expecting whole numbers like 50000
  brand: string;
  imageUrl: string; // Main image for product details, cart list
  thumbnailImageUrl?: string; // Optional smaller/different image for cards like "Recently Viewed"
  dataAiHint?: string;
  productCode?: string;
  variant?: string; // Name of the currently selected variant for display
  stock?: number;
  discountDescription?: string;
  availableVariants?: SimpleVariant[]; // List of available variants for this product
}

export interface Shop {
  name: string;
  isFavorite?: boolean;
  logoUrl?: string;
  logoDataAiHint?: string;
  promotionText?: string;
  specialOfferText?: string; // New field for special offer banner
  editLinkText?: string; // e.g., "Sửa"
  products: Product[];
}

export interface CartItem extends Product {
  cartItemId: string; // Unique ID for this item *in the cart* (e.g., product.id + (selected_variant_id || 'base'))
  quantity: number;
  selected: boolean;
  // The 'variant' field from Product will represent the selected variant's name for display.
  // The 'price', 'originalPrice', 'imageUrl', 'stock', 'dataAiHint' can be from the base product
  // or overridden by a selected variant if that level of detail is implemented later.
}

export interface ShippingAddress {
  id: string;
  name: string; // This will store the full name (e.g., "Last First")
  phone: string;
  address: string; // Full concatenated address for display
  streetAddress: string; // Street, building number part
  ward: string; // Value for select, e.g., 'pdk'
  district: string; // Value for select, e.g., 'q1'
  province: string; // Value for select, e.g., 'hcm'
  addressType: 'home' | 'office'; // Kept for data integrity if old data exists, but not used in new form
  isDefault?: boolean;
}

export interface SelectedVoucherInfo {
  id: string;
  title: string;
  discountValue: number;
  discountType: 'fixed' | 'percentage'; // For now, we'll primarily use 'fixed'
}

