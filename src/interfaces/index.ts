export interface Product {
  id: string;
  name: string;
  price: number;
  brand: string;
  imageUrl: string;
  dataAiHint?: string;
}

export interface Shop {
  name: string;
  products: Product[];
}

export interface CartItem extends Product {
  quantity: number;
  selected: boolean;
}
