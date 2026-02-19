// models/ProductBase.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// A BaseProduct is a "template/class" for derived Products.
// NOTE: No CatalogIds here (bases are not placed in catalogs).
const productBaseSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      trim: true,
    },

    Name: {
      type: String,
      required: true,
      trim: true,
    },

    // Inherited defaults (base "class" properties)
    Defaults: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },

    // Optional metadata for UI/editor (allowed extensions, groups, etc.)
    SchemaHints: {
      type: Schema.Types.Mixed,
      default: {},
    },

    StatusID: {
      type: Number,
      default: 1, // 1=Active, 0=Inactive, 3=Archived
    },

    DisplayOrder: {
      type: Number,
      default: 0,
    },

    Audit: {
      CreatedAt: { type: Date, default: Date.now },
      UpdatedAt: { type: Date, default: Date.now },
    },
  },
  {
    collection: 'productBases',
    versionKey: false,
  }
);

productBaseSchema.pre('save', function () {
  if (!this.Audit) this.Audit = {};
  this.Audit.UpdatedAt = new Date();
  if (!this.Audit.CreatedAt) this.Audit.CreatedAt = new Date();
});

const ProductBase = mongoose.model('ProductBase', productBaseSchema);
module.exports = ProductBase;
