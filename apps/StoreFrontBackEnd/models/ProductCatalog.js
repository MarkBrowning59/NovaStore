// models/ProductCatalog.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productCatalogSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toHexString(),
    },

    // Basic info
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },

    // Display & status
    DisplayOrder: { type: Number, default: 1 },
    StatusID: { type: Number, default: 1 }, // 1=Active,0=Inactive,3=Archived etc.
    ProductGroupType: { type: Number, default: 1 },

    // Optional image
    ImageName: { type: String, default: '', trim: true },

    // Hierarchy
    parentId: { type: String, default: null },
    children: { type: [String], default: [] },

    // Products assigned to this catalog
    products: {
      type: [
        {
          _id: { type: String, required: true }, // Product _id
          DisplayOrder: { type: Number },
        },
      ],
      default: [],
    },
  },
  {
    collection: 'productcatalogs', // actual Mongo collection name
    versionKey: false,
  }
);

const ProductCatalog = mongoose.model('ProductCatalog', productCatalogSchema);

module.exports = ProductCatalog;
