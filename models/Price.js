import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema(
  {
    componentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Component',
      required: true,
      index: true,
    },
    vendor: {
      type: String,
      required: true,
      enum: ['Amazon', 'Flipkart', 'MDComputers', 'Vedant', 'PrimeABGB'],
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    productUrl: String,
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { collection: 'prices', timestamps: true }
);

// Prevent duplicate vendor price entries
priceSchema.index({ componentId: 1, vendor: 1 }, { unique: true });

export default mongoose.model('Price', priceSchema);
