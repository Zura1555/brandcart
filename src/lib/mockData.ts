
import type { Shop, ShippingAddress, SimpleVariant, Product } from '@/interfaces';

export const mockShops: Shop[] = [
  {
    name: 'MLB',
    isFavorite: true,
    logoUrl: 'https://bizweb.dktcdn.net/100/294/644/themes/737628/assets/logo.png?1727591678269',
    logoDataAiHint: 'MLB logo',
    specialOfferText: "Mua 2 sản phẩm MLB, nhận ngay giảm giá 30% cho sản phẩm thứ 3.",
    products: [
      {
        id: 'mlb1',
        name: 'Áo thun unisex tay ngắn Summer Monotive',
        price: 1890000,
        brand: 'MLB',
        imageUrl: 'https://product.hstatic.net/1000284478/product/50whs_3atsx0153_2_07b177648b9b4656a3da12f08dba6dce_large.jpg',
        dataAiHint: 'tshirt lightblue',
        productCode: 'MLB001X',
        variant: 'Light Blue (+2)', // This is the name of the currently selected variant.
        stock: 15, // Base product stock
        availableVariants: [
          { id: 'mlb1-lb-s', name: 'Light Blue, S', stock: 5 },
          { id: 'mlb1-lb-m', name: 'Light Blue, M (+2)', stock: 12 },
          { id: 'mlb1-lb-l', name: 'Light Blue, L (+5)', stock: 0 },
          { id: 'mlb1-bk-m', name: 'Black, M', stock: 20 },
        ],
      },
      {
        id: 'mlb2',
        name: 'Quần short ngắn nữ lưng thun Basic Dolphin',
        price: 1690000,
        brand: 'MLB',
        imageUrl: 'https://product.hstatic.net/200000642007/product/50bks_3fspb0553_8_bcdbcdccae8a4f5ba6fc7c09d4b56140_a8ee276c518c4c198e002da20ad42b5e_master.jpg',
        dataAiHint: 'shorts black',
        productCode: 'MLB002Y',
        variant: 'Black',
        stock: 30,
        availableVariants: [
          { id: 'mlb2-bk-xs', name: 'Black, XS', stock: 8 },
          { id: 'mlb2-bk-s', name: 'Black, S', stock: 15 },
          { id: 'mlb2-bk-m', name: 'Black, M', stock: 3 },
        ],
      },
    ],
  },
  {
    name: 'PUMA',
    logoUrl: 'https://file.hstatic.net/1000284478/collection/puma_125ef36b81284505982470da1add1363.jpg',
    logoDataAiHint: 'PUMA logo',
    specialOfferText: "Ưu đãi đặc biệt: Tặng ngay 1 đôi vớ Puma cao cấp cho đơn hàng Puma từ 1.500.000₫.",
    products: [
      {
        id: 'puma1',
        name: 'Balo unisex phom chữ nhật hiện đại',
        price: 769000,
        brand: 'PUMA',
        imageUrl: 'https://product.hstatic.net/1000284478/product/000_6325874132_1_1794446cd3d64b4dbc8b7f7cc1fd2c4e_large.jpg',
        dataAiHint: 'backpack darkgrey',
        productCode: 'PUMAB01',
        discountDescription: '-30%',
        stock: 25,
        // No specific variants listed, so badge won't show variant options
      },
      {
        id: 'puma2',
        name: 'Giày sneakers nữ cổ thấp Mayze',
        price: 2029000,
        originalPrice: 2899000,
        brand: 'PUMA',
        imageUrl: 'https://product.hstatic.net/1000284478/product/01_380784_1_f2c2ec6dc2e54db1a6bf5c071f476ffc_large.jpg',
        dataAiHint: 'sneakers white',
        productCode: 'PUMAS02',
        variant: 'White/Black',
        discountDescription: '-30%',
        stock: 5,
        availableVariants: [
          { id: 'puma2-wb-36', name: 'White/Black, 36', stock: 2 },
          { id: 'puma2-wb-37', name: 'White/Black, 37', stock: 0 },
          { id: 'puma2-wb-38', name: 'White/Black, 38', stock: 3 },
          { id: 'puma2-pink-37', name: 'Pink, 37', stock: 11 },
        ],
      },
      {
        id: 'puma3',
        name: 'Nón bóng chày unisex Metal Cat',
        price: 299000,
        originalPrice: 599000,
        brand: 'PUMA',
        imageUrl: 'https://product.hstatic.net/1000284478/product/11_021269_1_096b4a3c4511424abd1f10b5bcf1c550_large.jpg',
        dataAiHint: 'cap olivegreen',
        productCode: 'PUMAC03',
        variant: 'Olive Green (+14)',
        discountDescription: '-50%',
        stock: 0,
        availableVariants: [
            {id: 'puma3-og', name: 'Olive Green (+14)', stock: 0},
            {id: 'puma3-bk', name: 'Black', stock: 18},
            {id: 'puma3-wh', name: 'White', stock: 6},
        ]
      },
    ],
  },
  {
    name: 'HAVAIANAS',
    logoUrl: 'https://file.hstatic.net/1000284478/collection/havaianas_c0dd7b3e45914a7daaea88a00c61de01.jpg',
    logoDataAiHint: 'HAVAIANAS logo',
    specialOfferText: "Miễn phí vận chuyển cho tất cả đơn hàng Havaianas.",
    products: [
      {
        id: 'havaianas1',
        name: 'Dép kẹp unisex Top Disney',
        price: 599000,
        brand: 'HAVAIANAS',
        imageUrl: 'https://product.hstatic.net/1000284478/product/1056_4139412_1_ca507b2857b441dd90324dd1f97bc876_large.jpg',
        dataAiHint: 'flipflops white red',
        productCode: 'HAVD001',
        variant: 'Disney print (+12)',
        stock: 30,
        availableVariants: [
            {id: 'havaianas1-disney-38', name: 'Disney print, 38 (+12)', stock: 10},
            {id: 'havaianas1-disney-39', name: 'Disney print, 39 (+12)', stock: 12},
            {id: 'havaianas1-blue-38', name: 'Blue, 38', stock: 0},
        ]
      },
      {
        id: 'havaianas2',
        name: 'Giày sandals nữ đế bệt Flash Urban',
        price: 849000,
        brand: 'HAVAIANAS',
        imageUrl: 'https://product.hstatic.net/1000284478/product/3581_4000039_1_e7f19697d4084ee383384952deed5378_large.jpg',
        dataAiHint: 'sandals darkgrey',
        productCode: 'HAVS002',
        variant: 'Dark Grey (+7)',
        stock: 4,
        // No availableVariants, so badge will only display variant, not open sheet.
      },
    ],
  }
];

export const mockShippingAddresses: ShippingAddress[] = [];

export const mockRelevantProducts: Product[] = [
  {
    id: 'relevant1',
    name: 'Stylish Sunglasses',
    price: 450000,
    brand: 'PUMA', // Example brand
    imageUrl: 'https://placehold.co/150x150/000000/FFFFFF.png', // Black sunglasses placeholder
    dataAiHint: 'sunglasses fashion black',
    productCode: 'SG001',
    variant: 'Black Frame', // Default display variant
    stock: 10,
    availableVariants: [
      { id: 'sg-black', name: 'Black Frame', stock: 5, price: 450000, imageUrl: 'https://placehold.co/150x150/000000/FFFFFF.png', dataAiHint: 'sunglasses black' },
      { id: 'sg-tortoise', name: 'Tortoise Shell', stock: 3, price: 470000, imageUrl: 'https://placehold.co/150x150/A52A2A/FFFFFF.png', dataAiHint: 'sunglasses tortoise' },
      { id: 'sg-blue', name: 'Blue Frame', stock: 0, price: 450000, imageUrl: 'https://placehold.co/150x150/0000FF/FFFFFF.png', dataAiHint: 'sunglasses blue' },
      { id: 'sg-clear-m', name: 'Clear, M', stock: 7, price: 460000, imageUrl: 'https://placehold.co/150x150/FFFFFF/000000.png', dataAiHint: 'sunglasses clear' },
    ]
  },
  {
    id: 'relevant2',
    name: 'Leather Belt - Classic Black',
    price: 750000,
    brand: 'MLB',
    imageUrl: 'https://placehold.co/150x150.png',
    dataAiHint: 'leather belt',
    productCode: 'REL002',
    stock: 5,
    variant: 'Size M',
    availableVariants: [
        { id: 'belt-m', name: 'Size M', stock: 3, price: 750000},
        { id: 'belt-l', name: 'Size L', stock: 2, price: 750000},
    ]
  },
  {
    id: 'relevant3',
    name: 'Cotton Socks (3-pack) - Assorted',
    price: 250000,
    brand: 'HAVAIANAS',
    imageUrl: 'https://placehold.co/150x150.png',
    dataAiHint: 'socks pack',
    productCode: 'REL003',
    stock: 20,
    // No specific variants, will just show name
  },
  {
    id: 'relevant4',
    name: 'Sporty Water Bottle - 750ml',
    price: 320000,
    brand: 'PUMA',
    imageUrl: 'https://placehold.co/150x150.png',
    dataAiHint: 'water bottle sport',
    productCode: 'REL004',
    stock: 15,
    variant: 'Red',
    availableVariants: [
        {id: 'bottle-red', name: 'Red', stock: 8},
        {id: 'bottle-blue', name: 'Blue', stock: 7},
    ]
  },
   {
    id: 'relevant5',
    name: 'Canvas Tote Bag - Natural',
    price: 390000,
    brand: 'MLB',
    imageUrl: 'https://placehold.co/150x150.png',
    dataAiHint: 'tote bag canvas',
    productCode: 'REL005',
    stock: 12,
     // No specific variants
  },
];
