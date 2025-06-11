
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
    recentlyViewedTitle: "Xem Gần Đây",
    addToCartLabel: "Thêm {itemName} vào giỏ",
    dialog: {
      removeUnneededTitle: "Xóa sản phẩm không cần thiết",
      removeUnneededDescription: "Chọn các sản phẩm bạn muốn xóa khỏi giỏ hàng. Nhấn \"Xóa đã chọn\" khi hoàn tất.",
      cancelButton: "Hủy",
      removeSelectedButton: "Xóa đã chọn ({count})",
    },
    vouchersAndShipping: {
      voucherLabel: "Voucher giảm đến {amount}₫",
      shippingDiscountApplied: "Giảm giá vận chuyển: {amount}",
      shippingDiscountInfo: "Tăng giá trị đơn hàng để được giảm giá vận chuyển"
    },
    sheet: {
      productInfoTitle: "Thông tin sản phẩm",
      selectColor: "Màu sắc",
      selectSize: "Chọn Kích thước",
      updateButton: "CẬP NHẬT",
      noVariantsAvailable: "Không có biến thể nào khác cho sản phẩm này.",
      complexVariants: "Sản phẩm này có các tùy chọn khác. Vui lòng chọn một.",
      noOtherVariants: "Đây là phiên bản duy nhất của sản phẩm này.",
      currentSelection: "Lựa chọn hiện tại:",
      stock: {
        inStock: "Còn hàng",
        remaining: "Còn lại: {count}",
        outOfStock: "Hết hàng"
      },
      selectVariantPlaceholder: "Chọn phân loại"
    }
  },
  toast: {
    noItemsSelectedTitle: "Chưa chọn sản phẩm",
    noItemsSelectedDescription: "Vui lòng chọn ít nhất một sản phẩm để tiếp tục thanh toán.",
    itemsRemovedTitle: "Đã xóa sản phẩm",
    itemsRemovedDescription: "Đã xóa {count} sản phẩm khỏi giỏ hàng của bạn.",
    itemRemovedTitleSingle: "Đã xóa {itemName}",
    limitReachedTitle: "Đạt giới hạn",
    limitReachedDescription: "Số lượng tối đa cho mỗi sản phẩm là 99.",
    itemAddedToCart: {
        title: "Đã thêm {itemName}",
        description: "Sản phẩm đã được thêm vào giỏ hàng của bạn."
    },
    itemQuantityIncreased: {
        title: "Đã cập nhật số lượng {itemName}",
        description: "Đã tăng số lượng sản phẩm trong giỏ hàng."
    },
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
    },
    eInvoice: {
      saved: {
        title: "Đã lưu hóa đơn điện tử",
        description: "Thông tin hóa đơn điện tử của bạn đã được lưu."
      },
      cancelled: {
        title: "Đã hủy yêu cầu hóa đơn điện tử",
      },
      validationError: {
        title: "Lỗi xác thực",
        personal: "Vui lòng điền Họ tên, Căn cước công dân, Email, và Địa chỉ cho hóa đơn cá nhân.",
        company: "Vui lòng điền Tên công ty, Mã số thuế, Email, và Địa chỉ cho hóa đơn công ty."
      }
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
    eInvoice: {
      title: "Hóa đơn điện tử",
      status: {
        requestNow: "Nhập thông tin",
        detailsSaved: "{summary}"
      },
      vatNote: "Lưu ý: Hoá đơn đỏ sẽ được xuất bao gồm tổng giá trị đơn hàng (Sản phẩm + Phí vận chuyển)",
      invoiceTypeLabel: "LOẠI HOÁ ĐƠN",
      typePersonal: "Cá nhân",
      typeCompany: "Công ty",
      fullNamePlaceholder: "Nhập họ tên",
      companyNamePlaceholder: "Nhập tên công ty",
      idCardPlaceholder: "Nhập căn cước công dân",
      taxCodePlaceholder: "Nhập mã số thuế",
      emailPlaceholder: "Nhập email",
      addressPlaceholder: "Nhập địa chỉ",
      saveButton: "Lưu",
      doNotIssueButton: "Không xuất hoá đơn",
    },
    item: {
      quantityLabel: "Số lượng: {count}"
    },
    messageToShop: "Lời nhắn cho Shop",
    messageToShopPlaceholder: "Để lại lời nhắn",
    shippingMethod: "Phương thức vận chuyển",
    shippingMethodFree: "Miễn Phí",
    shippingMethodInspectionAllowed: "Được đồng kiểm",
    shippingMethodStandardDeliveryLabel: "Giao hàng tiêu chuẩn (3-5 ngày)",
    shippingMethodEstimatedDeliveryTimeLabel: "Thời gian giao hàng dự kiến: 5-7 ngày làm việc",
    totalAmountLabelWithCount: "Tổng số tiền ({count} sản phẩm)",
    yourVoucherAvailable: "Có {count} voucher",
    paymentMethod: "Phương thức thanh toán",
    footer: {
      totalLabel: "Tổng cộng:",
      savings: "Tiết kiệm {amount}",
      orderButton: "Đặt hàng",
      redeemPointsTitle: "Dùng {pointsToRedeem} / {availablePoints} Điểm",
      redeemPointsSavings: "Bạn sẽ tiết kiệm {amount}",
      toggleUsePointsAriaLabel: "Bật/tắt sử dụng điểm thưởng"
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
    titleOffers: "Ưu đãi",
    typeOfVoucherLabel: "Loại Voucher",
    allVouchersOption: "Tất cả voucher",
    inputPlaceholder: "Nhập mã khuyến mãi hoặc Gift Code",
    applyButton: "ÁP DỤNG",
    usableVouchersTitle: "Voucher có thể dùng", 
    unusableVouchersTitle: "Voucher không thể dùng",
    noUsableVouchers: "Không có voucher nào có thể dùng.",
    noUnusableVouchers: "Không có voucher nào không thể dùng.",
    footer: {
      selectedInfo: "Đã chọn 1 Voucher. Ưu đãi phí vận chuyển đã được áp dụng.", 
      notSelectedInfo: "Chưa chọn voucher nào.",
      vouchersSelected: "Đã chọn {count} Voucher",
      confirmButton: "ĐỒNG Ý", 
      useVoucherButton: "Dùng Voucher",
    },
    voucherCard: {
        bestChoice: "Tốt nhất", 
        typeFreeShipping: "MIỄN PHÍ VẬN CHUYỂN", 
        unavailableReasonMinOrder: "Chưa đạt GTĐH tối thiểu.",
    },
  },
  paymentSuccess: {
    mainTitle: "Cảm Ơn Bạn Đã Mua Hàng!",
    subTitle: "Thanh toán của bạn đã thành công và đơn hàng đã được xử lý.",
    orderSummary: {
      title: "Tóm Tắt Đơn Hàng",
      orderNumberLabel: "Mã Đơn Hàng",
      dateLabel: "Ngày",
      itemHeader: "Sản phẩm",
      priceHeader: "Giá",
      subtotalLabel: "Tổng phụ",
      shippingLabel: "Vận chuyển",
      totalLabel: "Tổng cộng",
    },
    feedback: {
      title: "Trải nghiệm thanh toán của bạn thế nào?",
      veryDifficult: "Rất khó",
      veryEasy: "Rất dễ",
      tellUsMorePlaceholder: "Cho chúng tôi biết thêm về trải nghiệm của bạn...",
      submitButton: "Gửi đánh giá",
      submittedButton: "Đã gửi"
    },
    continueShoppingButton: "Tiếp tục mua sắm",
    loadingOrder: "Đang tải chi tiết đơn hàng...",
    toast: {
        errorProcessingOrder: {
            title: "Lỗi",
            description: "Không thể xử lý chi tiết đơn hàng. Vui lòng thử lại hoặc liên hệ hỗ trợ."
        },
        feedbackReceived: { 
            title: "Đã nhận phản hồi",
            description: "Cảm ơn phản hồi của bạn! Bạn đã đánh giá {rating} trên 5."
        },
        reviewSubmitted: {
            title: "Đã gửi đánh giá",
            description: "Cảm ơn bạn đã phản hồi!"
        },
        selectRating: {
            title: "Chọn đánh giá",
            description: "Vui lòng chọn một mức đánh giá trước khi gửi."
        }
    }
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

