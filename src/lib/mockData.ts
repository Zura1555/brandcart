
import type { Shop } from '@/interfaces';

export const mockShops: Shop[] = [
  {
    name: 'MLB', // Using the brand name as the shop name
    products: [
      {
        id: 'mlb1',
        name: 'Áo thun unisex tay ngắn Summer Monotive',
        price: 1890000,
        brand: 'MLB',
        imageUrl: 'https://placehold.co/80x80.png',
        dataAiHint: 'tshirt blue',
        variant: 'Light Blue',
        // originalPrice, stock, discountDescription not specified, so omitted
      },
      {
        id: 'mlb2',
        name: 'Quần short ngắn nữ lưng thun Basic Dolphin',
        price: 1690000,
        brand: 'MLB',
        imageUrl: 'https://placehold.co/80x80.png',
        dataAiHint: 'shorts black',
        variant: 'Black',
        // originalPrice, stock, discountDescription not specified, so omitted
      },
    ],
    // isFavorite, promotionText, editLinkText not specified, so omitted
  },
];
