
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
        imageUrl: 'https://product.hstatic.net/1000284478/product/50whs_3atsx0153_2_07b177648b9b4656a3da12f08dba6dce_large.jpg',
        dataAiHint: 'tshirt lightblue',
        variant: 'Light Blue (+2)',
      },
      {
        id: 'mlb2',
        name: 'Quần short ngắn nữ lưng thun Basic Dolphin',
        price: 1690000,
        brand: 'MLB',
        imageUrl: 'https://product.hstatic.net/200000642007/product/50bks_3fspb0553_8_bcdbcdccae8a4f5ba6fc7c09d4b56140_a8ee276c518c4c198e002da20ad42b5e_master.jpg',
        dataAiHint: 'shorts black',
        variant: 'Black',
      },
    ],
  },
  {
    name: 'PUMA',
    logoUrl: 'https://file.hstatic.net/1000284478/collection/puma_125ef36b81284505982470da1add1363.jpg',
    logoDataAiHint: 'PUMA logo',
    products: [
      {
        id: 'puma1',
        name: 'Balo unisex phom chữ nhật hiện đại',
        price: 769000,
        brand: 'PUMA',
        imageUrl: 'https://product.hstatic.net/1000284478/product/000_6325874132_1_1794446cd3d64b4dbc8b7f7cc1fd2c4e_large.jpg',
        dataAiHint: 'backpack darkgrey',
        discountDescription: '-30%',
      },
      {
        id: 'puma2',
        name: 'Giày sneakers nữ cổ thấp Mayze',
        price: 2029000,
        originalPrice: 2899000,
        brand: 'PUMA',
        imageUrl: 'https://product.hstatic.net/1000284478/product/01_380784_1_f2c2ec6dc2e54db1a6bf5c071f476ffc_large.jpg',
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
        imageUrl: 'https://product.hstatic.net/1000284478/product/11_021269_1_096b4a3c4511424abd1f10b5bcf1c550_large.jpg',
        dataAiHint: 'cap olivegreen',
        variant: 'Olive Green (+14)',
        discountDescription: '-50%',
      },
    ],
  },
  {
    name: 'HAVAIANAS',
    logoUrl: 'https://file.hstatic.net/1000284478/collection/havaianas_c0dd7b3e45914a7daaea88a00c61de01.jpg',
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

