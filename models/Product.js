import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["PreBuiltPC", "Laptop"],
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },

    // Use case tags e.g. ['Gaming', 'Office', 'Productivity']
    useCases: {
      type: [String],
      enum: [
        "Gaming",
        "Office",
        "Productivity",
        "Streaming",
        "Content Creation",
        "Programming",
        "Editing",
        "Student",
        "Any",
      ],
      default: ["Any"],
    },

    specs: {
      cpu: { type: String }, // e.g. "Intel Core i7-13700H"
      gpu: { type: String }, // e.g. "NVIDIA RTX 4060" — null/omit if integrated
      ramGB: { type: Number }, // e.g. 16
      storageGB: { type: Number }, // e.g. 512
      storageType: {
        // e.g. "SSD" or "HDD"
        type: String,
        enum: ["SSD", "HDD", "SSD+HDD"],
      },

      // Laptop-specific
      displayInches: { type: Number }, // e.g. 15.6
      batteryWh: { type: Number }, // e.g. 72
      weightKg: { type: Number }, // e.g. 2.1
      os: { type: String }, // e.g. "Windows 11 Home"

      // Pre-built PC specific
      formFactor: {
        // e.g. "ATX", "Mini-ITX"
        type: String,
        enum: ["ATX", "Micro-ATX", "Mini-ITX", null],
      },
      psuWattage: { type: Number }, // e.g. 650
    },

    imageUrl: {
      type: String,
      default: null, // e.g. "https://cdn.example.com/products/asus-rog-g16.jpg"
    },

    benchmarkScore: {
      type: Number,
      default: 0,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "products" },
);

productSchema.index({ name: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ useCases: 1 });

export default mongoose.model("Product", productSchema);
