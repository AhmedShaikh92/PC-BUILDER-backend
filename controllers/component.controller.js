import Component from '../models/Component.js';

// Get all components with optional filters
export const getComponents = async (req, res) => {
  try {
    const { category, brand, minScore, maxScore } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (minScore || maxScore) {
      filter.benchmarkScore = {};
      if (minScore) filter.benchmarkScore.$gte = parseInt(minScore);
      if (maxScore) filter.benchmarkScore.$lte = parseInt(maxScore);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const components = await Component.find(filter).skip(skip).limit(limit);
    const total = await Component.countDocuments(filter);

    res.json({
      components,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single component by ID
export const getComponentById = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }
    res.json(component);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create single component (admin only)
export const createComponent = async (req, res) => {
  try {
    const { name, category, brand, specs, benchmarkScore } = req.body;

    if (!name || !category || !specs) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const component = new Component({
      name,
      category,
      brand,
      specs,
      benchmarkScore,
    });

    await component.save();
    res.status(201).json(component);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seed components (admin only)
export const seedComponents = async (req, res) => {
  try {
    const components = req.body;

    if (!Array.isArray(components)) {
      return res.status(400).json({ message: 'Body must be an array of components' });
    }

    // Clear existing components
    await Component.deleteMany({});

    const inserted = await Component.insertMany(components);
    res.status(201).json({ message: `${inserted.length} components seeded`, components: inserted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update component (admin only)
export const updateComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const component = await Component.findByIdAndUpdate(id, updates, { new: true });

    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }

    res.json(component);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete component (admin only)
export const deleteComponent = async (req, res) => {
  try {
    const component = await Component.findByIdAndDelete(req.params.id);

    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }

    res.json({ message: 'Component deleted', component });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
