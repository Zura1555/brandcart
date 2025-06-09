
import type { Shop, ShippingAddress } from '@/interfaces';

export const mockShops: Shop[] = [
  {
    name: 'MLB',
    isFavorite: true, 
    logoUrl: 'https://bizweb.dktcdn.net/100/294/644/themes/737628/assets/logo.png?1727591678269',
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
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Puma_SE_logo.svg',
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
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Havaianas_brand_logo.png',
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

export const mockShippingAddresses: ShippingAddress[] = [
  {
    id: 'addr1',
    name: "Trần Thượng Tuấn",
    phone: "(+84) 523 762 477",
    address: "Sarina, Sala, A00.11, Đường B2, Phường An Lợi Đông, Thành Phố Thủ Đức, TP. Hồ Chí Minh",
    isDefault: true,
  },
  {
    id: 'addr2',
    name: "Trần Thượng Tuấn",
    phone: "(+84) 523 762 477",
    address: "Số 539, Huỳnh Văn Bánh, Phường 13, Quận Phú Nhuận, TP. Hồ Chí Minh",
  },
  {
    id: 'addr3',
    name: "Nguyễn Văn An",
    phone: "(+84) 123 456 789",
    address: "123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh",
  },
];
