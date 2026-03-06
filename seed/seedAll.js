import 'dotenv/config';
import mongoose from 'mongoose';
import Component from '../models/Component.js';
import Price from '../models/Price.js';
import { componentsData } from './seedComponents.js';
import { pricesData } from './seedPrices.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Component.deleteMany({});
    await Price.deleteMany({});
    console.log('Cleared existing data');

    // Insert components
    const insertedComponents = await Component.insertMany(componentsData);
    console.log(`Inserted ${insertedComponents.length} components`);

    // Create a map of component names to their IDs (case-sensitive)
    const componentMap = {};
    insertedComponents.forEach(comp => {
      componentMap[comp.name] = comp._id;
    });

    // Create prices with component IDs based on componentName
    const pricesWithComponentIds = [];
    const missingComponents = new Set();
    const matchedComponents = new Set();

    pricesData.forEach(priceItem => {
      const componentId = componentMap[priceItem.componentName];
      
      if (componentId) {
        pricesWithComponentIds.push({
          componentId: componentId,
          vendor: priceItem.vendor,
          price: priceItem.price,
          currency: 'INR',
          productUrl: priceItem.productUrl,
          lastUpdated: new Date(),
          inStock: priceItem.inStock !== undefined ? priceItem.inStock : true
        });
        matchedComponents.add(priceItem.componentName);
      } else {
        missingComponents.add(priceItem.componentName);
      }
    });

    // Insert prices in batches to avoid memory issues
    if (pricesWithComponentIds.length > 0) {
      const batchSize = 100;
      let insertedCount = 0;
      
      for (let i = 0; i < pricesWithComponentIds.length; i += batchSize) {
        const batch = pricesWithComponentIds.slice(i, i + batchSize);
        await Price.insertMany(batch);
        insertedCount += batch.length;
        console.log(`Inserted batch ${i / batchSize + 1}: ${batch.length} prices`);
      }
      
      console.log(`\n✅ Inserted ${insertedCount} prices total`);
    }

    // Verify Case_Fan prices specifically
    const caseFanComponents = insertedComponents.filter(c => c.category === 'Case_Fan');
    const caseFanPrices = pricesWithComponentIds.filter(p => {
      const comp = insertedComponents.find(c => c._id.equals(p.componentId));
      return comp && comp.category === 'Case_Fan';
    });

    console.log('\n=== Verification ===');
    console.log(`Case_Fan components in database: ${caseFanComponents.length}`);
    caseFanComponents.forEach(comp => {
      const priceCount = caseFanPrices.filter(p => 
        p.componentId.equals(comp._id)
      ).length;
      console.log(`  ✓ "${comp.name}" - ${priceCount} prices`);
    });

    // Summary
    console.log('\n=== Summary ===');
    console.log(`✅ Matched ${matchedComponents.size} unique components with prices`);
    
    if (missingComponents.size > 0) {
      console.log(`\n⚠️  Warning: ${missingComponents.size} price entries had no matching component:`);
      Array.from(missingComponents).slice(0, 10).forEach(name => console.log(`   - "${name}"`));
      if (missingComponents.size > 10) {
        console.log(`   ... and ${missingComponents.size - 10} more`);
      }
    }

    // Check if Case_Fan is in matched components
    const caseFanNames = caseFanComponents.map(c => c.name);
    const matchedCaseFans = Array.from(matchedComponents).filter(name => 
      caseFanNames.includes(name)
    );
    
    console.log(`\n✅ Case_Fan components with prices: ${matchedCaseFans.length}/${caseFanComponents.length}`);
    if (matchedCaseFans.length === 0) {
      console.log('\n❌ ERROR: No Case_Fan prices were matched!');
      console.log('Case_Fan component names:');
      caseFanNames.forEach(name => console.log(`   - "${name}"`));
      console.log('\nMake sure these exact names exist in pricesData with "componentName" field');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();