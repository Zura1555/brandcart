
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
        imageUrl: 'https://product.hstatic.net/1000284478/product/1_7114173003_1_62e692c5f196408f9eacab84ac1c91fb_medium.jpg',
        dataAiHint: 'tshirt white',
        productCode: 'MLB001X',
        variant: 'Light Blue (+2)', // This is the name of the currently selected variant.
        stock: 15, // Base product stock
        availableVariants: [
          { id: 'mlb1-lb-s', name: 'Light Blue, S', stock: 5, price: 1890000, imageUrl: 'https://product.hstatic.net/1000284478/product/1_7114173003_1_62e692c5f196408f9eacab84ac1c91fb_medium.jpg', dataAiHint: 'tshirt white'},
          { id: 'mlb1-lb-m', name: 'Light Blue, M (+2)', stock: 12, price: 1890000, imageUrl: 'https://product.hstatic.net/1000284478/product/1_7114173003_1_62e692c5f196408f9eacab84ac1c91fb_medium.jpg', dataAiHint: 'tshirt white'},
          { id: 'mlb1-lb-l', name: 'Light Blue, L (+5)', stock: 0, price: 1890000, imageUrl: 'https://product.hstatic.net/1000284478/product/1_7114173003_1_62e692c5f196408f9eacab84ac1c91fb_medium.jpg', dataAiHint: 'tshirt white'},
          { id: 'mlb1-bk-m', name: 'Black, M', stock: 20, price: 1890000, imageUrl: 'https://product.hstatic.net/1000284478/product/1_7114173003_1_62e692c5f196408f9eacab84ac1c91fb_medium.jpg', dataAiHint: 'tshirt black'},
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
          { id: 'mlb2-bk-xs', name: 'Black, XS', stock: 8, price: 1690000 },
          { id: 'mlb2-bk-s', name: 'Black, S', stock: 15, price: 1690000 },
          { id: 'mlb2-bk-m', name: 'Black, M', stock: 3, price: 1690000 },
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
          { id: 'puma2-wb-36', name: 'White/Black, 36', stock: 2, price: 2029000 },
          { id: 'puma2-wb-37', name: 'White/Black, 37', stock: 0, price: 2029000 },
          { id: 'puma2-wb-38', name: 'White/Black, 38', stock: 3, price: 2029000 },
          { id: 'puma2-pink-37', name: 'Pink, 37', stock: 11, price: 2129000, imageUrl: 'https://placehold.co/80x80.png', dataAiHint: 'sneakers pink' },
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
            {id: 'puma3-og', name: 'Olive Green (+14)', stock: 0, price: 299000},
            {id: 'puma3-bk', name: 'Black', stock: 18, price: 299000},
            {id: 'puma3-wh', name: 'White', stock: 6, price: 299000},
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
            {id: 'havaianas1-disney-38', name: 'Disney print, 38 (+12)', stock: 10, price: 599000},
            {id: 'havaianas1-disney-39', name: 'Disney print, 39 (+12)', stock: 12, price: 599000},
            {id: 'havaianas1-blue-38', name: 'Blue, 38', stock: 0, price: 550000},
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
    thumbnailImageUrl: 'https://placehold.co/100x100/000000/FFFFFF.png',
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
    thumbnailImageUrl: 'https://placehold.co/100x100.png',
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
    thumbnailImageUrl: 'https://placehold.co/100x100.png',
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
    thumbnailImageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'water bottle sport',
    productCode: 'REL004',
    stock: 15,
    variant: 'Red',
    availableVariants: [
        {id: 'bottle-red', name: 'Red', stock: 8, price: 320000},
        {id: 'bottle-blue', name: 'Blue', stock: 7, price: 320000},
    ]
  },
   {
    id: 'relevant5',
    name: 'Canvas Tote Bag - Natural',
    price: 390000,
    brand: 'MLB',
    imageUrl: 'https://placehold.co/150x150.png',
    thumbnailImageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'tote bag canvas',
    productCode: 'REL005',
    stock: 12,
     // No specific variants
  },
];

export const newRecentlyViewedProducts: Product[] = [
  {
    id: 'maxco1',
    name: 'Áo thun nữ cổ tròn tay ngắn Sanmauro',
    price: 4590000,
    brand: 'MAX&Co.',
    imageUrl: 'https://placehold.co/250x250/EFEFEF/333333.png', // Main image for cart/details
    thumbnailImageUrl: 'https://placehold.co/150x200/EFEFEF/333333.png', // Thumbnail for recently viewed card
    dataAiHint: 'tshirt white',
    productCode: 'MAXCO001',
    variant: 'White, M',
    stock: 15,
    availableVariants: [
      { id: 'maxco1-wh-s', name: 'White, S', stock: 10, price: 4590000, imageUrl: 'https://placehold.co/250x250/EFEFEF/333333.png', dataAiHint: 'tshirt white' },
      { id: 'maxco1-wh-m', name: 'White, M', stock: 15, price: 4590000, imageUrl: 'https://placehold.co/250x250/EFEFEF/333333.png', dataAiHint: 'tshirt white' },
      { id: 'maxco1-bk-m', name: 'Black, M', stock: 5, price: 4590000, imageUrl: 'https://placehold.co/250x250/333333/EFEFEF.png', dataAiHint: 'tshirt black' },
    ],
    discountDescription: 'New Arrival',
  },
  {
    id: 'fila1',
    name: 'Áo polo unisex tay ngắn Origin',
    price: 1495000,
    brand: 'FILA',
    imageUrl: 'https://placehold.co/250x250/DDEEFF/333333.png', // Main image
    thumbnailImageUrl: 'https://placehold.co/150x200/DDEEFF/333333.png', // Thumbnail
    dataAiHint: 'polo shirt blue',
    productCode: 'FILA001',
    variant: 'Blue, L',
    stock: 20,
    availableVariants: [
      { id: 'fila1-bl-l', name: 'Blue, L', stock: 10, price: 1495000, imageUrl: 'https://placehold.co/250x250/DDEEFF/333333.png', dataAiHint: 'polo shirt blue' },
      { id: 'fila1-bl-xl', name: 'Blue, XL', stock: 10, price: 1495000, imageUrl: 'https://placehold.co/250x250/DDEEFF/333333.png', dataAiHint: 'polo shirt blue' },
      { id: 'fila1-rd-l', name: 'Red, L', stock: 10, price: 1495000, imageUrl: 'https://placehold.co/250x250/FFDDDD/333333.png', dataAiHint: 'polo shirt red' },
    ],
  },
  {
    id: 'dsquared1',
    name: 'Giày sandals cao gót nữ Lock Yourself',
    price: 29000000,
    brand: 'DSQUARED2',
    imageUrl: 'https://placehold.co/250x250/FFD700/333333.png', // Main image
    thumbnailImageUrl: 'https://placehold.co/150x150/FFD700/333333.png', // Thumbnail
    dataAiHint: 'heels gold',
    productCode: 'DSQ001',
    variant: 'Gold, 38',
    stock: 3,
    availableVariants: [
      { id: 'dsquared1-gd-37', name: 'Gold, 37', stock: 2, price: 29000000, imageUrl: 'https://placehold.co/250x250/FFD700/333333.png', dataAiHint: 'heels gold' },
      { id: 'dsquared1-gd-38', name: 'Gold, 38', stock: 3, price: 29000000, imageUrl: 'https://placehold.co/250x250/FFD700/333333.png', dataAiHint: 'heels gold' },
      { id: 'dsquared1-sl-38', name: 'Silver, 38', stock: 0, price: 29000000, imageUrl: 'https://placehold.co/250x250/C0C0C0/333333.png', dataAiHint: 'heels silver' },
    ],
    discountDescription: 'Limited Edition',
  },
  {
    id: 'lesilla1',
    name: 'Túi xách nữ thời trang Borsa Gilda',
    price: 25700000,
    brand: 'LE SILLA',
    imageUrl: 'https://placehold.co/250x250/FFC0CB/333333.png', // Main image
    thumbnailImageUrl: 'https://placehold.co/150x150/FFC0CB/333333.png', // Thumbnail
    dataAiHint: 'handbag pink',
    productCode: 'LESI001',
    variant: 'Pink',
    stock: 5,
    availableVariants: [
      { id: 'lesilla1-pk', name: 'Pink', stock: 5, price: 25700000, imageUrl: 'https://placehold.co/250x250/FFC0CB/333333.png', dataAiHint: 'handbag pink' },
      { id: 'lesilla1-bk', name: 'Black', stock: 3, price: 25700000, imageUrl: 'https://placehold.co/250x250/333333/EFEFEF.png', dataAiHint: 'handbag black' },
    ],
  },
  {
    id: 'recent_extra1',
    name: 'Classic Watch Silver',
    price: 7800000,
    brand: 'TIMEPIECE Co.',
    imageUrl: 'https://placehold.co/250x250/C0C0C0/333333.png', // Main image
    thumbnailImageUrl: 'https://placehold.co/150x150/C0C0C0/333333.png', // Thumbnail
    dataAiHint: 'watch classic silver',
    productCode: 'TW001',
    variant: 'Silver Mesh',
    stock: 10,
    availableVariants: [
        { id: 'tw001-sm', name: 'Silver Mesh', stock: 5, price: 7800000, imageUrl: 'https://placehold.co/250x250/C0C0C0/333333.png', dataAiHint: 'watch silver'},
        { id: 'tw001-gl', name: 'Gold Leather', stock: 5, price: 8200000, imageUrl: 'https://placehold.co/250x250/FFD700/333333.png', dataAiHint: 'watch gold'},
    ]
  },
  {
    id: 'recent_extra2',
    name: 'Silk Scarf Floral',
    price: 1200000,
    brand: 'LUXURY SILKS',
    imageUrl: 'https://placehold.co/250x250/E6E6FA/333333.png', // Main image
    thumbnailImageUrl: 'https://placehold.co/150x150/E6E6FA/333333.png', // Thumbnail
    dataAiHint: 'scarf silk floral',
    productCode: 'LS001',
    variant: 'Floral Print',
    stock: 15,
    availableVariants: [
      { id: 'ls001-floral', name: 'Floral Print', stock: 10, price: 1200000, imageUrl: 'https://placehold.co/250x250/E6E6FA/333333.png', dataAiHint: 'scarf floral'},
      { id: 'ls001-plain', name: 'Plain Red', stock: 5, price: 1100000, imageUrl: 'https://placehold.co/250x250/FFDDDD/333333.png', dataAiHint: 'scarf red'},
    ]
  },
];

