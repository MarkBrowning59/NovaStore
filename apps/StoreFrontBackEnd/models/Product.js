// models/Product.js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toHexString(),
    },

    IDs: {
      type: [
        {
          _id: false,
          System: { type: String, required: true },
          ID: { type: String, required: true },
        },
      ],
      default: [],
    },
BaseProductID: { type: String, default: null, trim: true },

Overrides: { type: Schema.Types.Mixed, default: {} },
Extensions: { type: Schema.Types.Mixed, default: {} },
    ProductDefinition: {
      Name: { type: String, required: true },
      ShortDescription: { type: String, default: '', trim: true },
      Description: { type: String, default: '', trim: true },
    },

    CatalogIds: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: 'At least one catalog ID is required.',
      },
    },

    // 🔹 product can reference reusable profiles
    ProductProfileIds: {
      type: [String],
      default: [],
    },

    // 🔹 per-product overrides of profile properties
    LocalOverrides: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // 🔹 NEW: business meaning of the product
    // e.g. STATIC_PRINT vs SIMPLE_VDP, etc.
    productType: {
      type: String,
      enum: [
        'STATIC_PRINT',
        'SIMPLE_VDP',
        'USER_UPLOAD',
        'KIT',
        'DIGITAL_DOWNLOAD',
        'SERVICE',
      ],
      default: 'STATIC_PRINT',
      required: true,
    },

    // 🔹 NEW: how the UI / workflow behaves
    // SIMPLE = options + qty only
    // FORM   = form-based VDP (business card, etc.)
    // UPLOAD = upload-your-own-artwork
    // DESIGNER = online designer
    // KIT = bundles/kits
    interactionType: {
      type: String,
      enum: ['SIMPLE', 'FORM', 'UPLOAD', 'DESIGNER', 'KIT'],
      default: 'SIMPLE',
      required: true,
    },

    // 🔹 NEW: common behavioral flags for the product
    capabilities: {
      isPhysical: { type: Boolean, default: true },
      hasInventory: { type: Boolean, default: true },
      allowsUpload: { type: Boolean, default: false },
      usesVDPTemplate: { type: Boolean, default: false },
    },

    // 🔹 NEW: type-specific configuration
    // For STATIC_PRINT:
    //   { allowedQuantities, basePrice, pricePerUnit, finishes[] }
    // For SIMPLE_VDP:
    //   { allowedQuantities, basePrice, pricePerUnit, vdpTemplateId, fields[] }
    // For others, this can evolve as needed.
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // 🔹 NEW: controls which product page layout is used by the storefront renderer.
    // If null/empty, storefront should fall back to the default ProductTemplate.
    templateKey: { type: String, default: null, trim: true },
  },
  {
    collection: 'products',
    versionKey: false,
  }
);

// 👇 existing hook unchanged
productSchema.pre('validate', function () {
  if (!Array.isArray(this.IDs) || this.IDs.length === 0 || !this.IDs[0]?.ID) {
    this.IDs = [{ System: 'StoreFront', ID: this._id }];
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
