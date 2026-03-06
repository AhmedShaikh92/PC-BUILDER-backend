import Price from '../models/Price.js';
import Component from '../models/Component.js';

// Get all prices for a component (sorted by price ascending)
export const getPricesByComponentId = async (req, res) => {
  try {
    const { componentId } = req.params;
    console.log(componentId);
    
    const prices = await Price.find({ componentId }).sort({ price: 1 });

    if (prices.length === 0) {
      return res.status(404).json({ message: 'No prices found for this component' });
    }

    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create or update a price entry
export const createOrUpdatePrice = async (req, res) => {
  try {
    const { componentId, vendor, price, productUrl } = req.body;

    if (!componentId || !vendor || price === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify component exists
    const component = await Component.findById(componentId);
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }

    // Check if price entry already exists
    let priceEntry = await Price.findOne({ componentId, vendor });

    if (priceEntry) {
      priceEntry.price = price;
      priceEntry.productUrl = productUrl;
      priceEntry.lastUpdated = new Date();
    } else {
      priceEntry = new Price({
        componentId,
        vendor,
        price,
        productUrl,
      });
    }

    await priceEntry.save();
    res.status(201).json(priceEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seed prices (admin only)
export const seedPrices = async (req, res) => {
  try {
    const prices = req.body;

    if (!Array.isArray(prices)) {
      return res.status(400).json({ message: 'Body must be an array of prices' });
    }

    // Clear existing prices
    await Price.deleteMany({});

    const inserted = await Price.insertMany(prices);
    res.status(201).json({ message: `${inserted.length} prices seeded`, prices: inserted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get price for a component from specific vendor
export const getPriceByComponentAndVendor = async (req, res) => {
  try {
    const { componentId, vendor } = req.params;

    const price = await Price.findOne({ componentId, vendor });

    if (!price) {
      return res.status(404).json({ message: 'Price not found' });
    }

    res.json(price);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete price entry
export const deletePrice = async (req, res) => {
  try {
    const { priceId } = req.params;

    const price = await Price.findByIdAndDelete(priceId);

    if (!price) {
      return res.status(404).json({ message: 'Price not found' });
    }

    res.json({ message: 'Price deleted', price });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
