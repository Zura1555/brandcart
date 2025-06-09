import type { Shop } from '@/interfaces';

export const mockShops: Shop[] = [
  {
    name: 'MinKey Shop',
    isFavorite: true,
    promotionText: 'Mua tối thiểu ₫39k để nhận quà',
    editLinkText: 'Sửa',
    products: [
      { id: 'mks1', name: 'Móc khoá Hổ bay cute dây cót bay th...', price: 36000, originalPrice: 50000, brand: 'MinKey Shop', imageUrl: 'https://placehold.co/80x80.png', dataAiHint: 'keychain toy', variant: 'Rồng bay đỏ', stock: 3, discountDescription: 'Giảm 28% so với lúc bỏ vào Giỏ hàng' },
      { id: 'mks2', name: 'Gấu bông hình thú ngộ nghĩnh', price: 150000, brand: 'MinKey Shop', imageUrl: 'https://placehold.co/80x80.png', dataAiHint: 'stuffed animal' },
    ],
  },
  {
    name: 'Topick Global',
    isFavorite: true,
    promotionText: 'Mua thêm 2 sản phẩm để giảm 5%',
    editLinkText: 'Sửa',
    products: [
      { id: 'tg1', name: 'Harry Potter Time Turner Đồng Hồ C...', price: 28600, originalPrice: 31680, brand: 'Topick Global', imageUrl: 'https://placehold.co/80x80.png', dataAiHint: 'necklace jewelry', variant: 'Vàng' },
      { id: 'tg2', name: 'Tai nghe Bluetooth không dây', price: 250000, brand: 'Topick Global', imageUrl: 'https://placehold.co/80x80.png', dataAiHint: 'bluetooth earbuds', stock: 10, discountDescription: 'Giá sốc cuối tuần' },
    ],
  },
  {
    name: 'Lee Fashion',
    promotionText: 'Giảm giá 10% cho tất cả áo khoác',
    editLinkText: 'Sửa',
    products: [
      { id: 'lee1', name: 'Lee Modern Series Straight Fit Jeans', price: 49900, brand: 'Lee Fashion', imageUrl: 'https://placehold.co/80x80.png', dataAiHint: 'denim jeans' },
      { id: 'lee2', name: 'Lee Legendary Denim Jacket', price: 59990, originalPrice: 65000, brand: 'Lee Fashion', imageUrl: 'https://placehold.co/80x80.png', dataAiHint: 'denim jacket' },
    ],
  },
];
