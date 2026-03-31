import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from '../models/Product.js';
import ProductPrice from '../models/ProductPrice.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdbname';

// ─── Load JSON files ──────────────────────────────────────────────────────────

const productsData = JSON.parse(
  readFileSync(join(__dirname, './product.json'), 'utf-8')
);

const pricesData = JSON.parse(
  readFileSync(join(__dirname, './productPrices.json'), 'utf-8')
);

// ─── Seed ─────────────────────────────────────────────────────────────────────

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Clear existing data ──────────────────────────────────────────────────
    await Product.deleteMany({});
    await ProductPrice.deleteMany({});
    console.log('🗑️  Cleared existing products and product prices');

    // ── Insert products ──────────────────────────────────────────────────────
    const insertedProducts = await Product.insertMany(productsData);
    console.log(`📦 Inserted ${insertedProducts.length} products`);

    // Build a name → _id map for linking prices
    const productMap = {};
    for (const product of insertedProducts) {
      productMap[product.name] = product._id;
    }

    // ── Insert prices ────────────────────────────────────────────────────────
    const priceDocuments = [];

    for (const entry of pricesData) {
      const productId = productMap[entry.productName];

      if (!productId) {
        console.warn(`⚠️  No product found for "${entry.productName}" — skipping prices`);
        continue;
      }

      for (const p of entry.prices) {
        priceDocuments.push({
          productId,
          vendor: p.vendor,
          price: p.price,
          inStock: p.inStock ?? true,
          productUrl: p.productUrl || null,
          currency: 'INR',
          lastUpdated: new Date(),
        });
      }
    }

    await ProductPrice.insertMany(priceDocuments);
    console.log(`💰 Inserted ${priceDocuments.length} price entries`);

    console.log('\n🎉 Seeding complete!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seed();