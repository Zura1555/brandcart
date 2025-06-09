import type { Shop } from '@/interfaces';

export const mockShops: Shop[] = [
  {
    name: 'MLB',
    products: [
      { id: 'mlb1', name: 'Dodgers Authentic Collection Cap', price: 35.99, brand: 'MLB', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'baseball cap' },
      { id: 'mlb2', name: 'Yankees Aaron Judge Jersey', price: 120.00, brand: 'MLB', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'sports jersey' },
      { id: 'mlb3', name: 'Red Sox Team Hoodie', price: 75.50, brand: 'MLB', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'team hoodie' },
    ],
  },
  {
    name: 'Fila',
    products: [
      { id: 'fila1', name: 'Fila Disruptor II Sneakers', price: 65.00, brand: 'Fila', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'sneakers shoes' },
      { id: 'fila2', name: 'Fila Classic Logo T-Shirt', price: 25.00, brand: 'Fila', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'logo t-shirt' },
      { id: 'fila3', name: 'Fila Velour Track Jacket', price: 80.00, brand: 'Fila', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'track jacket' },
    ],
  },
  {
    name: 'Lee',
    products: [
      { id: 'lee1', name: 'Lee Modern Series Straight Fit Jeans', price: 49.90, brand: 'Lee', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'denim jeans' },
      { id: 'lee2', name: 'Lee Legendary Denim Jacket', price: 59.99, brand: 'Lee', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'denim jacket' },
      { id: 'lee3', name: 'Lee Casual Plaid Shirt', price: 34.50, brand: 'Lee', imageUrl: 'https://placehold.co/300x300.png', dataAiHint: 'plaid shirt' },
    ],
  },
];
