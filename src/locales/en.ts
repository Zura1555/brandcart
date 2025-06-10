
const enTranslations = {
  cart: {
    title: "Shopping Cart",
    totalItems: "({count} items)",
    selectAll: "Select All",
    totalAmountLabel: "Total:",
    checkoutButton: "Checkout ({count})",
    emptyCartTitle: "Your cart is empty.",
    emptyCartMessage: "Add some products to get started!",
    unneededItemsTitle: "Items you might not need",
    removeButton: "Remove",
    dialog: {
      removeUnneededTitle: "Remove Unneeded Items",
      removeUnneededDescription: "Select the items you want to remove from your cart. Click \"Remove Selected\" when you're done.",
      cancelButton: "Cancel",
      removeSelectedButton: "Remove Selected ({count})",
    },
    vouchersAndShipping: {
      voucherLabel: "Voucher up to {amount}₫",
      shippingDiscountLabel: "Save {amount}₫ on shipping for minimum order..."
    }
  },
  toast: {
    noItemsSelectedTitle: "No items selected",
    noItemsSelectedDescription: "Please select at least one item to proceed to checkout.",
    itemsRemovedTitle: "Items Removed",
    itemsRemovedDescription: "{count} item(s) have been removed from your cart.",
    limitReachedTitle: "Limit Reached",
    limitReachedDescription: "Maximum quantity per item is 99.",
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
    shopVoucher: "Shop Voucher",
    shopVoucherPlaceholder: "Select or enter code",
    eInvoice: "E-Invoice",
    eInvoicePlaceholder: "Request",
    messageToShop: "Message to Shop",
    messageToShopPlaceholder: "Leave a message",
    shippingMethod: "Shipping Method",
    viewAll: "View All",
    shippingMethodFree: "Free",
    shippingMethodInspectionAllowed: "Inspection Allowed",
    totalAmountLabelWithCount: "Total Amount ({count} products)",
    yourVoucher: "Your Voucher",
    freeShippingBadge: "Free Shipping",
    shopeeCoinLabel: "Use Points: {count} Points",
    paymentMethod: "Payment Method",
    footer: {
      totalLabel: "Total:",
      savings: "Save {amount}",
      usedPointsSavings: "Used {points} points, save {amount}",
      orderButton: "Place Order",
    },
  },
  addAddress: {
    title: {
      new: "New Address",
      edit: "Edit Address",
    },
    pasteHelper: {
      title: "Paste and fill quickly",
      description: "Paste or enter information, click Auto-fill to enter name, phone number, and address",
    },
    fullNamePlaceholder: "Full Name",
    phonePlaceholder: "Phone Number",
    provincePlaceholder: "Province/City",
    districtPlaceholder: "District",
    wardPlaceholder: "Ward/Commune",
    streetAddressPlaceholder: "Street Name, Building, House Number",
    setDefaultLabel: "Set as default address",
    addressTypeLabel: "Address Type:",
    addressType: {
      office: "Office",
      home: "Home",
    },
    button: {
      complete: "COMPLETE",
      saveChanges: "SAVE CHANGES",
    },
    validation: {
      fullNameRequired: "Please enter your full name.",
      phoneInvalid: "Invalid phone number.",
      provinceRequired: "Please select a Province/City.",
      districtRequired: "Please select a District.",
      wardRequired: "Please select a Ward/Commune.",
      streetAddressRequired: "Please enter the specific address.",
      addressTypeRequired: "Please select an address type.",
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
    inputPlaceholder: "Enter Shopee Voucher Code",
    applyButton: "APPLY",
    usableVouchersTitle: "Usable Vouchers",
    unusableVouchersTitle: "Unusable Vouchers",
    noUsableVouchers: "No usable vouchers available.",
    noUnusableVouchers: "No unusable vouchers.",
    footer: {
      selectedInfo: "1 Voucher selected. Shipping discount applied.",
      notSelectedInfo: "No voucher selected.",
      confirmButton: "CONFIRM",
    },
    voucherCard: {
        bestChoice: "Best Choice",
        typeFreeShipping: "FREE SHIPPING"
    },
  },
  general: {
    back: "Back"
  }
};

export default enTranslations;
