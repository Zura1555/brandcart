
const viTranslations = {
  cart: {
    title: "Giỏ hàng",
    totalItems: "({count} sản phẩm)",
    selectAll: "Tất cả",
    totalAmountLabel: "Tổng cộng:",
    checkoutButton: "Mua hàng ({count})",
    emptyCartTitle: "Giỏ hàng của bạn trống.",
    emptyCartMessage: "Thêm sản phẩm để bắt đầu mua sắm!",
    unneededItemsTitle: "Các sản phẩm bạn có thể chưa cần",
    removeButton: "Xóa bớt",
    dialog: {
      removeUnneededTitle: "Xóa sản phẩm không cần thiết",
      removeUnneededDescription: "Chọn các sản phẩm bạn muốn xóa khỏi giỏ hàng. Nhấn \"Xóa đã chọn\" khi hoàn tất.",
      cancelButton: "Hủy",
      removeSelectedButton: "Xóa đã chọn ({count})",
    },
    vouchersAndShipping: {
      voucherLabel: "Voucher giảm đến {amount}₫",
      shippingDiscountLabel: "Giảm {amount}₫ phí vận chuyển đơn tối thiểu..."
    }
  },
  toast: {
    noItemsSelectedTitle: "Chưa chọn sản phẩm",
    noItemsSelectedDescription: "Vui lòng chọn ít nhất một sản phẩm để tiếp tục thanh toán.",
    itemsRemovedTitle: "Đã xóa sản phẩm",
    itemsRemovedDescription: "Đã xóa {count} sản phẩm khỏi giỏ hàng của bạn.",
    limitReachedTitle: "Đạt giới hạn",
    limitReachedDescription: "Số lượng tối đa cho mỗi sản phẩm là 99.",
    address: {
        saved: {
            title: "Địa chỉ đã được lưu",
            description: "Địa chỉ mới của bạn đã được thêm thành công."
        },
        updated: {
            title: "Địa chỉ đã được cập nhật",
            description: "Thông tin địa chỉ của bạn đã được cập nhật."
        },
        error: {
            title: "Lỗi",
            description: "Không thể lưu địa chỉ. Vui lòng thử lại."
        },
        editNotImplemented: "Chức năng sửa địa chỉ (ID: {id}) chưa được cài đặt."
    },
    voucher: {
        codeApplied: "Mã {code} đã được áp dụng ( giả lập )."
    }
  },
  checkout: {
    title: "Thanh toán",
    address: {
      namePhone: "{name} | {phone}",
      loading: "Đang tải địa chỉ...",
      noAddressSelectedTitle: "Chưa có địa chỉ giao hàng",
      noAddressSelectedMessage: "Vui lòng thêm hoặc chọn địa chỉ giao hàng để tiếp tục.",
    },
    eInvoice: "Hóa đơn điện tử",
    eInvoicePlaceholder: "Yêu cầu",
    messageToShop: "Lời nhắn cho Shop",
    messageToShopPlaceholder: "Để lại lời nhắn",
    shippingMethod: "Phương thức vận chuyển",
    viewAll: "Xem tất cả",
    shippingMethodFree: "Miễn Phí",
    shippingMethodInspectionAllowed: "Được đồng kiểm",
    totalAmountLabelWithCount: "Tổng số tiền ({count} sản phẩm)",
    yourVoucher: "Voucher của bạn",
    freeShippingBadge: "Miễn Phí Vận Chuyển",
    shopeeCoinLabel: "Đổi điểm thưởng: {count} Points",
    paymentMethod: "Phương thức thanh toán",
    footer: {
      totalLabel: "Tổng cộng:",
      savings: "Tiết kiệm {amount}",
      usedPointsSavings: "Đã dùng {points} điểm, tiết kiệm {amount}",
      orderButton: "Đặt hàng",
    },
  },
  addAddress: {
    title: {
      new: "Địa chỉ mới",
      edit: "Sửa địa chỉ",
    },
    pasteHelper: {
      title: "Dán và nhập nhanh",
      description: "Dán hoặc nhập thông tin, nhấn chọn Tự động điền để nhập tên, số điện thoại và địa chỉ",
    },
    fullNamePlaceholder: "Họ và tên",
    phonePlaceholder: "Số điện thoại",
    provincePlaceholder: "Tỉnh/Thành phố",
    districtPlaceholder: "Quận/Huyện",
    wardPlaceholder: "Phường/Xã",
    streetAddressPlaceholder: "Tên đường, Tòa nhà, Số nhà",
    setDefaultLabel: "Đặt làm địa chỉ mặc định",
    addressTypeLabel: "Loại địa chỉ:",
    addressType: {
      office: "Văn Phòng",
      home: "Nhà Riêng",
    },
    button: {
      complete: "HOÀN THÀNH",
      saveChanges: "LƯU THAY ĐỔI",
    },
    validation: {
      fullNameRequired: "Vui lòng nhập họ tên.",
      phoneInvalid: "Số điện thoại không hợp lệ.",
      provinceRequired: "Vui lòng chọn Tỉnh/Thành phố.",
      districtRequired: "Vui lòng chọn Quận/Huyện.",
      wardRequired: "Vui lòng chọn Phường/Xã.",
      streetAddressRequired: "Vui lòng nhập địa chỉ cụ thể.",
      addressTypeRequired: "Vui lòng chọn loại địa chỉ.",
    },
  },
  selectAddress: {
    title: "Chọn địa chỉ nhận hàng",
    addressesLabel: "Địa chỉ",
    editButton: "Sửa",
    defaultBadge: "Mặc định",
    noAddressesFound: {
      line1: "Không tìm thấy địa chỉ nào.",
      line2: "Vui lòng thêm địa chỉ mới.",
    },
    addNewButton: "Thêm Địa Chỉ Mới",
  },
  selectVoucher: {
    title: "Chọn Shopee Voucher",
    inputPlaceholder: "Nhập mã Shopee Voucher",
    applyButton: "ÁP DỤNG",
    usableVouchersTitle: "Voucher có thể dùng",
    unusableVouchersTitle: "Voucher không thể dùng",
    noUsableVouchers: "Không có voucher nào có thể dùng.",
    noUnusableVouchers: "Không có voucher nào không thể dùng.",
    footer: {
      selectedInfo: "Đã chọn 1 Voucher. Ưu đãi phí vận chuyển đã được áp dụng.",
      notSelectedInfo: "Chưa chọn voucher nào.",
      confirmButton: "ĐỒNG Ý",
    },
    voucherCard: {
        bestChoice: "Tốt nhất",
        typeFreeShipping: "MIỄN PHÍ VẬN CHUYỂN",
        unavailableReasonMinOrder: "Chưa đạt GTĐH tối thiểu.",
    },
  },
  general: {
    back: "Trở lại"
  },
  breadcrumbs: {
    cart: "Giỏ hàng ({count} SP)",
    cartSimple: "Giỏ hàng",
    checkout: "Thanh toán",
    selectAddress: "Chọn địa chỉ",
    addAddress: "Thêm địa chỉ",
    editAddress: "Sửa địa chỉ",
    selectVoucher: "Chọn Voucher",
    payment: "Hoàn tất"
  }
};

export default viTranslations;
