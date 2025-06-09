
import type { Shop } from '@/interfaces';

export const mockShops: Shop[] = [
  {
    name: 'MLB',
    isFavorite: true, // Added to test "Yêu thích" badge dynamically
    logoUrl: 'https://file.hstatic.net/1000356698/file/mlb_1a7168aa098e46afacfd2251bf3d2429.jpg',
    logoDataAiHint: 'MLB logo',
    products: [
      {
        id: 'mlb1',
        name: 'Áo thun unisex tay ngắn Summer Monotive',
        price: 1890000,
        brand: 'MLB',
        imageUrl: 'https://placehold.co/80x80.png',
        dataAiHint: 'tshirt lightblue',
        variant: 'Light Blue (+2)',
      },
      {
        id: 'mlb2',
        name: 'Quần short ngắn nữ lưng thun Basic Dolphin',
        price: 1690000,
        brand: 'MLB',
        imageUrl: 'https://placehold.co/80x80.png',
        dataAiHint: 'shorts black',
        variant: 'Black',
      },
    ],
  },
  {
    name: 'PUMA',
    logoUrl: 'https://file.hstatic.net/1000356698/file/pum.jpg',
    logoDataAiHint: 'PUMA logo',
    products: [
      {
        id: 'puma1',
        name: 'Balo unisex phom chữ nhật hiện đại',
        price: 769000,
        brand: 'PUMA',
        imageUrl: 'https://placehold.co/80x80.png',
        dataAiHint: 'backpack darkgrey',
        discountDescription: '-30%',
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
        variant: 'Olive Green (+14)',
        discountDescription: '-50%',
      },
    ],
  },
  {
    name: 'HAVAIANAS',
    logoUrl: 'https://file.hstatic.net/1000356698/file/hav.jpg',
    logoDataAiHint: 'HAVAIANAS logo',
    products: [
      {
        id: 'havaianas1',
        name: 'Dép kẹp unisex Top Disney',
        price: 599000,
        brand: 'HAVAIANAS',
        imageUrl: 'https://placehold.co/80x80.png',
        dataAiHint: 'flipflops white red',
        variant: 'Disney print (+12)',
      },
      {
        id: 'havaianas2',
        name: 'Giày sandals nữ đế bệt Flash Urban',
        price: 849000,
        brand: 'HAVAIANAS',
        imageUrl: 'https://placehold.co/80x80.png',
        dataAiHint: 'sandals darkgrey',
        variant: 'Dark Grey (+7)',
      },
    ],
  }
];
