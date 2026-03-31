import mongoose from 'mongoose';

const productPriceSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    vendor: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    productUrl: String,
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { collection: 'product_prices', timestamps: true }
);

// Prevent duplicate vendor price entries per product
productPriceSchema.index({ productId: 1, vendor: 1 }, { unique: true });

export default mongoose.model('ProductPrice', productPriceSchema);