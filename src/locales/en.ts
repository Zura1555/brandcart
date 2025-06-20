
const enTranslations = {
  cart: {
    title: "Shopping Cart",
    totalItems: "({count} items)",
    selectAll: "Select All",
    totalAmountLabel: "Total:",
    checkoutButton: "Checkout ({count})",
    emptyCartTitle: "Your cart is empty.",
    emptyCartMessage: "Add some products to get started!",
    recentlyViewedTitle: "Recently Viewed",
    addToCartLabel: "Add {itemName} to cart",
    brandOffer: {
      shopNowButton: "Shop Now"
    },
    vouchersAndShipping: {
      voucherLabel: "Voucher up to {amount}₫",
      shippingDiscountApplied: "Shipping discount: {amount}",
      noPromotionsAvailable: "No shipping promotions currently available."
    },
    sheet: {
      productInfoTitle: "Product Information",
      selectColor: "Color",
      selectSize: "Select Size",
      updateButton: "UPDATE",
      noVariantsAvailable: "No other variants available for this item.",
      complexVariants: "This product has other options. Please select one.",
      noOtherVariants: "This is the only version of this product available.",
      currentSelection: "Current selection:",
      stock: {
        inStock: "In stock",
        remaining: "Remaining stock: {count}",
        outOfStock: "Out of stock"
      },
      selectVariantPlaceholder: "Select variant"
    },
    completeLook: {
      bannerText: "COMPLETE YOUR LOOK",
      dialogTitle: "Pairs well with {productName}",
      addToCartButton: "Add to Cart",
      noSuggestions: "No specific suggestions right now.",
      relevantItemLabel: "Relevant Item"
    },
    confirmDelete: {
      title: "Confirm Deletion",
      description: "Are you sure you want to remove {itemName} from your cart?",
      confirm: "Remove",
      cancel: "Cancel"
    }
  },
  toast: {
    noItemsSelectedTitle: "No items selected",
    noItemsSelectedDescription: "Please select at least one item to proceed to checkout.",
    itemRemovedTitleSingle: "{itemName} removed",
    limitReachedTitle: "Limit Reached",
    limitReachedDescription: "Maximum quantity per item is 99.",
    itemAddedToCart: {
        title: "{itemName} added",
        description: "Item successfully added to your cart."
    },
    itemQuantityIncreased: {
        title: "{itemName} quantity updated",
        description: "Item quantity increased in your cart."
    },
    address: {
        saved: {
            title: "Address Saved",
            description: "Your new address has been added successfully."
        },
        updated: {
            title: "Address Updated",
            description: "Your address information has been updated."
        },
        error: {
            title: "Error",
            description: "Could not save address. Please try again."
        },
        editNotImplemented: "Edit address function (ID: {id}) is not yet implemented."
    },
    voucher: {
        codeApplied: "Code {code} has been applied (simulated)."
    },
    eInvoice: {
      saved: {
        title: "E-Invoice Saved",
        description: "Your e-invoice details have been saved."
      },
      cancelled: {
        title: "E-Invoice Cancelled",
      },
      validationError: {
        title: "Validation Error",
        personal: "Please fill in Full Name, ID Card, Email, and Address for personal invoice.",
        company: "Please fill in Company Name, Tax Code, Email, and Address for company invoice."
      }
    },
    navigateToBrand: {
      title: "Shop {brandName}",
      description: "Feature coming soon!"
    },
    stockLimitReached: {
      title: "Stock Limit Reached for {itemName}",
      description: "Only {stock} unit(s) available. Quantity adjusted."
    },
    itemOutOfStock: {
      title: "{itemName} is Out of Stock",
      description: "This item cannot be added or quantity increased."
    }
  },
  checkout: {
    title: "Checkout",
    address: {
      namePhone: "{name} | {phone}",
      loading: "Loading address...",
      noAddressSelectedTitle: "No Shipping Address",
      noAddressSelectedMessage: "Please add or select a shipping address to proceed.",
    },
    eInvoice: {
      title: "E-Invoice",
      requestLabel: "E-invoice Request",
      option: {
        noInvoice: "No Invoice",
        issueInvoice: "Issue E-invoice"
      },
      status: {
        requestNow: "Enter Details",
        detailsSaved: "{summary}",
        enterDetails: "Enter Details"
      },
      vatNote: "Note: Red invoice will be issued including total order value (Products + Shipping fee)",
      invoiceTypeLabel: "INVOICE TYPE",
      typePersonal: "Personal",
      typeCompany: "Company",
      fullNamePlaceholder: "Enter full name",
      companyNamePlaceholder: "Enter company name",
      idCardPlaceholder: "Enter ID card number",
      taxCodePlaceholder: "Enter tax code",
      emailPlaceholder: "Enter email",
      addressPlaceholder: "Enter address",
      doNotIssueButton: "Don't issue invoice",
    },
    item: {
      quantityLabel: "Quantity: {count}"
    },
    messageToShop: "Note",
    messageToShopPlaceholder: "Leave a message",
    shippingMethod: "Shipping Method",
    shippingMethodFree: "Free",
    shippingMethodInspectionAllowed: "Inspection Allowed",
    shippingMethodStandardDeliveryLabel: "Standard Delivery (3-5 days)",
    shippingMethodEstimatedDeliveryTimeLabel: "Estimated delivery time: 5-7 working days",
    totalAmountLabelWithCount: "Total Amount ({count} products)",
    yourVoucherAvailable: "{count} Vouchers available",
    paymentMethod: "Payment Method",
    footer: {
      totalLabel: "Total:",
      savings: "Save {amount}",
      orderButton: "Place Order",
      youHavePointsToRedeem: "You have {availablePoints} available to redeem",
      redeemPointsSavings: "You'll save {amount}",
      toggleUsePointsAriaLabel: "Toggle to use loyalty points"
    },
  },
  addAddress: {
    title: {
      new: "New Address",
      edit: "Edit Address",
    },
    firstNameLabel: "FIRST NAME",
    firstNamePlaceholder: "First Name",
    lastNameLabel: "LAST NAME",
    lastNamePlaceholder: "Last Name",
    phoneLabel: "PHONE NUMBER",
    phonePlaceholder: "Phone Number",
    provinceLabel: "PROVINCE/CITY",
    provincePlaceholder: "Select Province/City",
    districtLabel: "DISTRICT",
    districtPlaceholder: "Select District",
    wardLabel: "WARD/COMMUNE",
    wardPlaceholder: "Select Ward/Commune",
    streetAddressLabel: "ADDRESS",
    streetAddressPlaceholder: "Street Name, Building, House Number",
    setDefaultLabel: "Set as default address",
    button: {
      saveAddress: "SAVE ADDRESS",
      saveChanges: "SAVE CHANGES",
    },
    validation: {
      firstNameRequired: "Please enter your first name.",
      lastNameRequired: "Please enter your last name.",
      phoneInvalid: "Invalid phone number.",
      provinceRequired: "Please select a Province/City.",
      districtRequired: "Please select a District.",
      wardRequired: "Please select a Ward/Commune.",
      streetAddressRequired: "Please enter the specific address.",
    },
  },
  selectAddress: {
    title: "Select Shipping Address",
    addressesLabel: "Addresses",
    editButton: "Edit",
    defaultBadge: "Default",
    noAddressesFound: {
      line1: "No addresses found.",
      line2: "Please add a new address.",
    },
    addNewButton: "Add New Address",
  },
  selectVoucher: {
    title: "Select Shopee Voucher",
    titleOffers: "Offers",
    typeOfVoucherLabel: "Type of Voucher",
    allVouchersOption: "All vouchers",
    inputPlaceholder: "Enter promo or Gift Code here",
    applyButton: "APPLY",
    usableVouchersTitle: "Usable Vouchers",
    unusableVouchersTitle: "Unusable Vouchers",
    noUsableVouchers: "No usable vouchers available.",
    noUnusableVouchers: "No unusable vouchers.",
    footer: {
      selectedInfo: "1 Voucher selected. Shipping discount applied.",
      notSelectedInfo: "No voucher selected.",
      vouchersSelected: "{count} Vouchers Selected",
      confirmButton: "CONFIRM",
      useVoucherButton: "Use Voucher",
    },
    voucherCard: {
        bestChoice: "Best Choice",
        typeFreeShipping: "FREE SHIPPING",
        unavailableReasonMinOrder: "Minimum order value not met.",
    },
  },
  paymentSuccess: {
    mainTitle: "Thank You For Your Purchase!",
    subTitle: "Your payment was successful and your order has been processed.",
    orderSummary: {
      title: "Order Summary",
      orderNumberLabel: "Order Number",
      dateLabel: "Date",
      itemHeader: "Item",
      priceHeader: "Price",
      subtotalLabel: "Subtotal",
      shippingLabel: "Shipping",
      totalLabel: "Total",
    },
    feedback: {
      title: "How easy was it to checkout?",
      veryDifficult: "Very difficult",
      veryEasy: "Very easy",
      tellUsMorePlaceholder: "Tell us more about your experience...",
      submitButton: "Submit Review",
      submittedButton: "Submitted"
    },
    continueShoppingButton: "Continue Shopping",
    loadingOrder: "Loading order details...",
    toast: {
        errorProcessingOrder: {
            title: "Error",
            description: "Could not process order details. Please try again or contact support."
        },
        feedbackReceived: {
            title: "Feedback Received",
            description: "Thanks for your feedback! You rated {rating} out of 5."
        },
        reviewSubmitted: {
            title: "Review Submitted",
            description: "Thank you for your feedback!"
        },
        selectRating: {
            title: "Select Rating",
            description: "Please select a rating before submitting."
        }
    }
  },
  general: {
    back: "Back"
  },
  breadcrumbs: {
    cart: "Cart ({count} items)",
    cartSimple: "Cart",
    checkout: "Checkout",
    selectAddress: "Select Address",
    addAddress: "Add Address",
    editAddress: "Edit Address",
    selectVoucher: "Select Voucher",
    payment: "Payment"
  }
};

export default enTranslations;

