import Product from "../models/Product.js";
import ProductPrice from "../models/ProductPrice.js";

// ─── Budget Tier ────────────────────────────────────────────────────────────

const getBudgetTier = (budget) => {
  if (budget < 40000) return "Entry";
  if (budget < 90000) return "Mid";
  return "High";
};

// ─── Price Cache ─────────────────────────────────────────────────────────────

const buildPriceCache = async (productIds) => {
  const prices = await ProductPrice.find({
    productId: { $in: productIds },
    inStock: true,
  });

  const grouped = {};
  for (const p of prices) {
    const key = p.productId.toString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p.price);
  }

  const averages = {};
  for (const [id, list] of Object.entries(grouped)) {
    averages[id] = list.reduce((a, b) => a + b, 0) / list.length;
  }

  return averages;
};

const getAvgPrice = (productId, priceCache) =>
  priceCache[productId.toString()] ?? null;

// ─── Scoring ──────────────────────────────────────────────────────────────────

const scoreProduct = (product, budget, priceCache) => {
  const price = getAvgPrice(product._id, priceCache);
  if (!price) return -1;
  const benchmark = product.benchmarkScore || 1;
  const budgetUtilization = Math.min(price / budget, 1);
  return (benchmark / 100) * 0.7 + budgetUtilization * 0.3;
};

// ─── Core Recommender ────────────────────────────────────────────────────────

const pickTopN = (pool, maxBudget, priceCache, n = 3) => {
  const scored = [];
  for (const product of pool) {
    const avgPrice = getAvgPrice(product._id, priceCache);
    if (!avgPrice || avgPrice > maxBudget) continue;
    const benchmark = product.benchmarkScore || 1;
    const budgetUtilization = Math.min(avgPrice / maxBudget, 1);
    const score = (benchmark / 100) * 0.7 + budgetUtilization * 0.3;
    scored.push({ product, avgPrice, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, n);
};

const findBestProducts = (pool, budget, brand, priceCache, n = 3) => {
  const brandPool =
    brand && brand !== "Any"
      ? pool.filter((p) => p.brand.toLowerCase() === brand.toLowerCase())
      : pool;

  let results = pickTopN(brandPool, budget, priceCache, n);
  if (results.length) return { results, usedFallback: false };

  results = pickTopN(brandPool, budget * 1.5, priceCache, n);
  if (results.length) return { results, usedFallback: true };

  results = pickTopN(pool, budget, priceCache, n);
  if (results.length) return { results, usedFallback: false };

  results = pickTopN(pool, budget * 1.5, priceCache, n);
  return { results, usedFallback: results.length > 0 };
};

// ─── Route Handler: POST /recommend/product ──────────────────────────────────

export const getProductRecommendation = async (req, res) => {
  try {
    const { budget, useCase, brand, type } = req.body;

    if (!budget || !useCase) {
      return res.status(400).json({ message: "budget and useCase are required." });
    }

    if (budget < 20000) {
      return res.status(400).json({
        message: "Budget too low. Minimum recommended budget is ₹20,000.",
      });
    }

    const budgetTier = getBudgetTier(budget);
    const typeFilter = type && ["Laptop", "PreBuiltPC"].includes(type) ? { type } : {};
    const useCaseFilter = { useCases: { $in: [useCase, "Any"] } };
    const allProducts = await Product.find({ ...typeFilter, ...useCaseFilter });

    if (!allProducts.length) {
      return res.status(404).json({
        message: `No products found for use case "${useCase}". Try "Gaming", "Office", or "Productivity".`,
      });
    }

    const ids = allProducts.map((p) => p._id);
    const priceCache = await buildPriceCache(ids);

    const laptops = allProducts.filter((p) => p.type === "Laptop");
    const prebuiltPCs = allProducts.filter((p) => p.type === "PreBuiltPC");
    const suggestions = [];
    const results = {};

    const processPool = (pool, label) => {
      if (!pool.length) return null;
      const found = findBestProducts(pool, budget, brand, priceCache, 3);
      if (!found.results.length) return null;
      const { results, usedFallback } = found;
      if (usedFallback) {
        const topPrice = results[0].avgPrice;
        suggestions.push(
          `Best ${label} (${results[0].product.name}) exceeds budget by ₹${Math.round(topPrice - budget)}. Consider increasing your budget.`,
        );
      }
      return results.map(({ product, avgPrice }) => ({
        product,
        estimatedPrice: Math.round(avgPrice),
        withinBudget: avgPrice <= budget,
      }));
    };

    if (!type || type === "Laptop") {
      const laptopResults = processPool(laptops, "Laptop");
      if (laptopResults) results.laptop = laptopResults;
    }
    if (!type || type === "PreBuiltPC") {
      const pcResults = processPool(prebuiltPCs, "Pre-Built PC");
      if (pcResults) results.preBuiltPC = pcResults;
    }

    if (!Object.keys(results).length) {
      return res.status(404).json({
        message: "No suitable products found within budget. Please increase your budget or change preferences.",
      });
    }

    return res.json({
      budgetTier,
      useCase,
      brand: brand || "Any",
      results,
      suggestions: suggestions.length ? suggestions : undefined,
    });
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── Route Handler: POST /recommend/price ────────────────────────────────────

export const getProductPrice = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || !productIds.length) {
      return res.status(400).json({ message: "productIds must be a non-empty array." });
    }

    const buildResult = { products: [], totalLowestPrice: 0 };

    for (const productId of productIds) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${productId} not found.` });
      }

      // Fetch ALL in-stock prices sorted cheapest first
      const prices = await ProductPrice.find({ productId, inStock: true }).sort({ price: 1 });

      if (prices.length) {
        const lowest = prices[0];

        buildResult.products.push({
          productId,
          name: product.name,
          type: product.type,
          brand: product.brand,
          // All vendor entries — frontend uses this to show every option
          prices: prices.map((p) => ({
            vendor: p.vendor,
            price: p.price,
            productUrl: p.productUrl,
            inStock: p.inStock,
          })),
          // Kept for backwards compatibility
          lowest: {
            vendor: lowest.vendor,
            price: lowest.price,
            productUrl: lowest.productUrl,
          },
        });

        buildResult.totalLowestPrice += lowest.price;
      }
    }

    buildResult.totalLowestPrice = Math.round(buildResult.totalLowestPrice);
    return res.json(buildResult);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};