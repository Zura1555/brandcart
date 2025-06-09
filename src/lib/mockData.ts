
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
        dataAiHint: 'tshirt lightblue',
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
  {
    name: 'PUMA',
    products: [
      {
        id: 'puma1',
        name: 'Balo unisex phom chữ nhật hiện đại',
        price: 769000,
        brand: 'PUMA',
        imageUrl: 'https://placehold.co/80x80.png',
        dataAiHint: 'backpack darkgrey',
        variant: 'Dark Grey',
        discountDescription: '-30%',
        // originalPrice not specified
      },
      {
        id: 'puma2',
        name: 'Giày sneakers nữ cổ thấp Mayze',
        price: 2029000,
        originalPrice: 2899000,
        brand: 'PUMA',
        imageUrl: 'https://placehold.co/80x80.png',
        dataAiHint: 'sneakers white',
        variant: 'White/Black',
        discountDescription: '-30%',
      },
      {
        id: 'puma3',
        name: 'Nón bóng chày unisex Metal Cat',
        price: 299000,
        originalPrice: 599000,
        brand: 'PUMA',
        imageUrl: 'https://placehold.co/80x80.png',
        dataAiHint: 'cap olivegreen',
        variant: 'Olive Green',
        discountDescription: '-50%',
      },
    ],
    // isFavorite, promotionText, editLinkText not specified for PUMA
  }
];
