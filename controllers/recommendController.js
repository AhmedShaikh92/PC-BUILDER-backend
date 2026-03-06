import Component from '../models/Component.js';
import Price from '../models/Price.js';
import { isCPUMotherboardCompatible, isGPUFitsInCase, isMotherboardFitsInCase, validateBuildCompatibility } from '../utils/compatibility.js';
import { calculateSystemPower, getPSUWattageRecommendation, isPSUSufficient } from '../utils/powerCalc.js';

// Categorize budget into tiers
const getBudgetTier = (budget) => {
  if (budget < 40000) return 'Entry';
  if (budget < 90000) return 'Mid';
  return 'High';
};

// Get average price for a component
const getAveragePrice = async (componentId) => {
  const prices = await Price.find({ componentId });
  if (prices.length === 0) return null;
  const sum = prices.reduce((acc, p) => acc + p.price, 0);
  return sum / prices.length;
};

// Score components based on benchmark score and price
const scoreComponent = async (component) => {
  const avgPrice = await getAveragePrice(component._id);
  if (!avgPrice) return 0;
  const benchmarkScore = component.benchmarkScore || 1;
  return benchmarkScore / avgPrice;
};

// Select CPU based on use case and budget - WITH RELAXED BUDGET
const selectCPU = async (budget, budgetTier, useCase, preference, socketType = null) => {
  // Adjust CPU budget allocation based on use case
  let cpuBudgetMultiplier = useCase === 'Gaming' ? 0.25 : useCase === 'Productivity' ? 0.35 : 0.15;
  let cpuBudget = budget * cpuBudgetMultiplier;

  let query = { category: 'CPU' };
  if (preference !== 'Any') {
    const brandMap = { AMD: 'AMD', Intel: 'Intel' };
    query.brand = brandMap[preference];
  }

  let cpus = await Component.find(query).sort({ benchmarkScore: 1 }); // Sort by score ascending for budget builds
  let best = null;
  let bestScore = -1;

  // First pass: Try within budget
  for (const cpu of cpus) {
    const avgPrice = await getAveragePrice(cpu._id);
    if (!avgPrice || avgPrice > cpuBudget) continue;

    const score = await scoreComponent(cpu);
    if (score > bestScore) {
      best = cpu;
      bestScore = score;
    }
  }

  // FALLBACK 1: If no CPU found, increase budget by 50%
  if (!best) {
    console.log(`No CPU found within budget ₹${cpuBudget}, trying ₹${cpuBudget * 1.5}`);
    cpuBudget *= 1.5;
    
    for (const cpu of cpus) {
      const avgPrice = await getAveragePrice(cpu._id);
      if (!avgPrice || avgPrice > cpuBudget) continue;

      const score = await scoreComponent(cpu);
      if (score > bestScore) {
        best = cpu;
        bestScore = score;
      }
    }
  }

  // FALLBACK 2: If still no CPU, ignore brand preference
  if (!best && preference !== 'Any') {
    console.log(`No CPU found with ${preference} preference, trying Any`);
    cpus = await Component.find({ category: 'CPU' }).sort({ benchmarkScore: 1 });
    
    for (const cpu of cpus) {
      const avgPrice = await getAveragePrice(cpu._id);
      if (!avgPrice || avgPrice > cpuBudget) continue;

      const score = await scoreComponent(cpu);
      if (score > bestScore) {
        best = cpu;
        bestScore = score;
      }
    }
  }

  // FALLBACK 3: Just get the cheapest CPU available
  if (!best) {
    console.log(`Still no CPU found, selecting cheapest available`);
    for (const cpu of cpus) {
      const avgPrice = await getAveragePrice(cpu._id);
      if (!avgPrice) continue;
      
      if (!best) {
        best = cpu;
      } else {
        const bestPrice = await getAveragePrice(best._id);
        if (avgPrice < bestPrice) {
          best = cpu;
        }
      }
    }
  }

  return best;
};

// Select motherboard compatible with CPU - WITH RELAXED BUDGET
const selectMotherboard = async (cpu, budget, budgetTier) => {
  const moboQuery = {
    category: 'Motherboard',
    'specs.socket': cpu.specs.socket,
  };

  let motherboards = await Component.find(moboQuery).sort({ benchmarkScore: 1 });
  let best = null;
  let bestScore = -1;

  let moboBudget = budget * 0.1;

  // First pass: Within budget
  for (const mobo of motherboards) {
    const avgPrice = await getAveragePrice(mobo._id);
    if (!avgPrice || avgPrice > moboBudget) continue;

    const score = await scoreComponent(mobo);
    if (score > bestScore) {
      best = mobo;
      bestScore = score;
    }
  }

  // FALLBACK 1: Increase budget by 50%
  if (!best) {
    console.log(`No motherboard found within budget ₹${moboBudget}, trying ₹${moboBudget * 1.5}`);
    moboBudget *= 1.5;
    
    for (const mobo of motherboards) {
      const avgPrice = await getAveragePrice(mobo._id);
      if (!avgPrice || avgPrice > moboBudget) continue;

      const score = await scoreComponent(mobo);
      if (score > bestScore) {
        best = mobo;
        bestScore = score;
      }
    }
  }

  // FALLBACK 2: Just get cheapest compatible motherboard
  if (!best) {
    console.log(`Still no motherboard found, selecting cheapest compatible with ${cpu.specs.socket}`);
    for (const mobo of motherboards) {
      const avgPrice = await getAveragePrice(mobo._id);
      if (!avgPrice) continue;
      
      if (!best) {
        best = mobo;
      } else {
        const bestPrice = await getAveragePrice(best._id);
        if (avgPrice < bestPrice) {
          best = mobo;
        }
      }
    }
  }

  return best;
};

// Select GPU based on use case and budget - WITH RELAXED BUDGET
const selectGPU = async (budget, budgetTier, useCase) => {
  // For office builds or very low budgets, skip GPU
  if (useCase === 'Office' || budget < 35000) {
    console.log('Skipping GPU for office build or low budget');
    return null;
  }

  let gpuBudget = useCase === 'Gaming' ? budget * 0.35 : budget * 0.12; // Reduced from 0.4 to 0.35 for gaming

  const gpus = await Component.find({ category: 'GPU' }).sort({ benchmarkScore: 1 });
  let best = null;
  let bestScore = -1;

  for (const gpu of gpus) {
    const avgPrice = await getAveragePrice(gpu._id);
    if (!avgPrice || avgPrice > gpuBudget) continue;

    const score = await scoreComponent(gpu);
    if (score > bestScore) {
      best = gpu;
      bestScore = score;
    }
  }

  // FALLBACK: If no GPU found and it's a gaming build, just skip it
  if (!best && useCase === 'Gaming') {
    console.log('No GPU found within budget for gaming build, will use integrated graphics');
  }

  return best;
};

// Select RAM based on budget tier and use case - WITH RELAXED REQUIREMENTS
const selectRAM = async (budget, budgetTier, useCase) => {
  // Adjust RAM requirements based on budget
  let ramCapacity = 8; // Default to 8GB
  
  if (budget >= 40000) {
    ramCapacity = useCase === 'Gaming' ? 16 : useCase === 'Productivity' ? 16 : 8;
  }
  if (budget >= 90000) {
    ramCapacity = useCase === 'Productivity' ? 32 : 16;
  }

  let ramBudget = budget * 0.08;

  let query = { category: 'RAM' };
  let rams = await Component.find(query).sort({ 'specs.sizeGB': 1 });

  let best = null;
  let bestScore = -1;

  // First try: Find RAM with desired capacity
  for (const ram of rams) {
    if (ram.specs.sizeGB < ramCapacity) continue;

    const avgPrice = await getAveragePrice(ram._id);
    if (!avgPrice || avgPrice > ramBudget) continue;

    const score = await scoreComponent(ram);
    if (score > bestScore) {
      best = ram;
      bestScore = score;
    }
  }

  // FALLBACK: Accept any RAM, even lower capacity
  if (!best) {
    console.log(`No ${ramCapacity}GB RAM found, trying lower capacity`);
    for (const ram of rams) {
      const avgPrice = await getAveragePrice(ram._id);
      if (!avgPrice || avgPrice > ramBudget * 1.5) continue;

      const score = await scoreComponent(ram);
      if (score > bestScore) {
        best = ram;
        bestScore = score;
      }
    }
  }

  return best;
};

// Select storage based on budget tier - WITH RELAXED BUDGET
const selectStorage = async (budget, budgetTier) => {
  let storageBudget = budgetTier === 'Entry' ? budget * 0.12 : budget * 0.1;

  let storages = await Component.find({ category: 'Storage' }).sort({ 'specs.capacityGB': 1 });

  let best = null;
  let bestScore = -1;

  for (const storage of storages) {
    const avgPrice = await getAveragePrice(storage._id);
    if (!avgPrice || avgPrice > storageBudget) continue;

    const score = await scoreComponent(storage);
    if (score > bestScore) {
      best = storage;
      bestScore = score;
    }
  }

  // FALLBACK: Increase budget
  if (!best) {
    console.log(`No storage found within ₹${storageBudget}, trying ₹${storageBudget * 1.5}`);
    storageBudget *= 1.5;
    
    for (const storage of storages) {
      const avgPrice = await getAveragePrice(storage._id);
      if (!avgPrice || avgPrice > storageBudget) continue;

      const score = await scoreComponent(storage);
      if (score > bestScore) {
        best = storage;
        bestScore = score;
      }
    }
  }

  return best;
};

// Select PSU based on system power requirement - WITH RELAXED BUDGET
const selectPSU = async (requiredWattage, budget) => {
  let psuBudget = budget * 0.1; // Increased from 0.08 to 0.1
  const psus = await Component.find({ category: 'PSU' }).sort({ 'specs.wattage': 1 });

  let best = null;

  for (const psu of psus) {
    if (!isPSUSufficient(psu, requiredWattage)) continue;

    const avgPrice = await getAveragePrice(psu._id);
    if (!avgPrice || avgPrice > psuBudget) continue;

    if (!best) {
      best = psu;
    } else if (psu.specs.wattage < best.specs.wattage) {
      best = psu;
    }
  }

  // FALLBACK: Increase budget and try again
  if (!best) {
    console.log(`No PSU found within ₹${psuBudget}, trying ₹${psuBudget * 1.5}`);
    psuBudget *= 1.5;
    
    for (const psu of psus) {
      if (!isPSUSufficient(psu, requiredWattage)) continue;

      const avgPrice = await getAveragePrice(psu._id);
      if (!avgPrice || avgPrice > psuBudget) continue;

      if (!best) {
        best = psu;
      }
    }
  }

  return best;
};

// Select CPU cooler if needed - OPTIONAL
const selectCPUCooler = async (cpu, budget) => {
  const stockCoolerThreshold = 95;
  if (!cpu || cpu.specs.tdp <= stockCoolerThreshold) return null;

  const coolerBudget = budget * 0.06; // Increased from 0.05
  const coolers = await Component.find({
    category: 'CPU_Cooler',
    'specs.tdpRating': { $gte: cpu.specs.tdp },
  }).sort({ benchmarkScore: 1 });

  let best = null;
  let bestScore = -1;

  for (const cooler of coolers) {
    const avgPrice = await getAveragePrice(cooler._id);
    if (!avgPrice || avgPrice > coolerBudget) continue;

    const score = await scoreComponent(cooler);
    if (score > bestScore) {
      best = cooler;
      bestScore = score;
    }
  }

  // If no cooler found, it's okay - CPU can use stock cooler
  return best;
};

// Select case - WITH RELAXED BUDGET
const selectCase = async (budget, motherboard) => {
  let caseBudget = budget * 0.12; // Increased from 0.1
  let query = { category: 'Case' };

  if (motherboard) {
    query['specs.formFactorsSupported'] = motherboard.specs.formFactor;
  }

  let cases = await Component.find(query).sort({ benchmarkScore: 1 });

  let best = null;
  let bestScore = -1;

  for (const pcCase of cases) {
    const avgPrice = await getAveragePrice(pcCase._id);
    if (!avgPrice || avgPrice > caseBudget) continue;

    const score = await scoreComponent(pcCase);
    if (score > bestScore) {
      best = pcCase;
      bestScore = score;
    }
  }

  // FALLBACK: Ignore form factor requirement
  if (!best) {
    console.log('No case found with form factor match, trying any case');
    cases = await Component.find({ category: 'Case' }).sort({ benchmarkScore: 1 });
    
    for (const pcCase of cases) {
      const avgPrice = await getAveragePrice(pcCase._id);
      if (!avgPrice || avgPrice > caseBudget * 1.5) continue;

      const score = await scoreComponent(pcCase);
      if (score > bestScore) {
        best = pcCase;
        bestScore = score;
      }
    }
  }

  return best;
};

// Main recommendation engine
export const getBuildRecommendation = async (req, res) => {
  try {
    const { budget, useCase, preference, includeGPU } = req.body;

    if (!budget || !useCase) {
      return res.status(400).json({ message: 'Budget and useCase are required' });
    }

    // Minimum budget check
    if (budget < 25000) {
      return res.status(400).json({ 
        message: 'Budget too low. Minimum recommended budget is ₹25,000 for a basic build. Please increase your budget.' 
      });
    }

    const budgetTier = getBudgetTier(budget);
    const suggestions = [];

    // Step 1: Select CPU
    const cpu = await selectCPU(budget, budgetTier, useCase, preference || 'Any');
    if (!cpu) {
      return res.status(400).json({ 
        message: 'No suitable CPU found within budget. Try increasing your budget to at least ₹30,000 or select "Any" for CPU preference.' 
      });
    }

    // Step 2: Select Motherboard
    const motherboard = await selectMotherboard(cpu, budget, budgetTier);
    if (!motherboard) {
      return res.status(400).json({ 
        message: `No compatible motherboard found for ${cpu.name} (${cpu.specs.socket} socket). This is likely a database issue. Please contact support or try a different CPU preference.` 
      });
    }

    // Step 3: Select GPU (optional)
    let gpu = null;
    if (includeGPU !== false && useCase !== 'Office') {
      gpu = await selectGPU(budget, budgetTier, useCase);
      if (!gpu && useCase === 'Gaming') {
        suggestions.push('No dedicated GPU found within budget. Build will rely on integrated graphics (if available). Consider increasing budget for better gaming performance.');
      }
    }

    // Step 4: Select RAM
    const ram = await selectRAM(budget, budgetTier, useCase);
    if (!ram) {
      return res.status(400).json({ 
        message: 'No suitable RAM found. Please increase your budget.' 
      });
    }

    // Step 5: Select Storage
    const storage = await selectStorage(budget, budgetTier);
    if (!storage) {
      return res.status(400).json({ 
        message: 'No suitable storage found. Please increase your budget.' 
      });
    }

    // Step 6: Calculate power requirement
    const components = [cpu, motherboard, ram, storage];
    if (gpu) components.push(gpu);

    const requiredWattage = calculateSystemPower(components);

    // Step 7: Select PSU
    const psu = await selectPSU(requiredWattage, budget);
    if (!psu) {
      return res.status(400).json({ 
        message: `No suitable PSU found for ${requiredWattage}W requirement. Please increase your budget.` 
      });
    }

    // Step 8: Select CPU Cooler if needed (optional)
    const cooler = await selectCPUCooler(cpu, budget);
    if (!cooler && cpu.specs.tdp > 95) {
      suggestions.push('No aftermarket CPU cooler found within budget. Using stock cooler (if included with CPU).');
    }

    // Step 9: Select Case
    const pcCase = await selectCase(budget, motherboard);
    if (!pcCase) {
      return res.status(400).json({ 
        message: 'No suitable case found. Please increase your budget.' 
      });
    }

    // Build final recommendation
    const recommendation = {
      budgetTier,
      requiredWattage,
      components: [
        { category: 'CPU', component: cpu },
        { category: 'Motherboard', component: motherboard },
        { category: 'RAM', component: ram },
        { category: 'Storage', component: storage },
        ...(gpu ? [{ category: 'GPU', component: gpu }] : []),
        { category: 'PSU', component: psu },
        ...(cooler ? [{ category: 'CPU_Cooler', component: cooler }] : []),
        { category: 'Case', component: pcCase },
      ],
    };

    // Calculate total estimated price
    let totalPrice = 0;
    for (const item of recommendation.components) {
      if (item.component) {
        const avgPrice = await getAveragePrice(item.component._id);
        if (avgPrice) {
          totalPrice += avgPrice;
        }
      }
    }

    // Check compatibility
    const compatibilityErrors = validateBuildCompatibility(recommendation.components.map((c) => c.component));

    // Add suggestions for over-budget builds
    if (totalPrice > budget) {
      const overAmount = totalPrice - budget;
      suggestions.push(`Build exceeds budget by ₹${Math.round(overAmount)}. Consider increasing budget or selecting office/productivity use case for lower requirements.`);
    }

    // Add suggestions for missing components
    if (!gpu && useCase === 'Gaming') {
      suggestions.push('Consider adding a dedicated GPU for better gaming performance when budget allows.');
    }

    res.json({
      ...recommendation,
      totalEstimatedPrice: Math.round(totalPrice),
      withinBudget: totalPrice <= budget,
      compatibilityErrors,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Calculate build total price
export const getBuildPrice = async (req, res) => {
  try {
    const { componentIds } = req.body;

    if (!Array.isArray(componentIds) || componentIds.length === 0) {
      return res.status(400).json({ message: 'componentIds must be a non-empty array' });
    }

    const components = [];
    const buildResult = { components: [], totalLowestPrice: 0 };

    for (const componentId of componentIds) {
      const component = await Component.findById(componentId);
      if (!component) {
        return res.status(404).json({ message: `Component ${componentId} not found` });
      }

      const prices = await Price.find({ componentId }).sort({ price: 1 });
      const lowestPrice = prices[0];

      if (lowestPrice) {
        buildResult.components.push({
          componentId,
          name: component.name,
          category: component.category,
          lowest: {
            vendor: lowestPrice.vendor,
            price: lowestPrice.price,
            productUrl: lowestPrice.productUrl,
          },
        });

        buildResult.totalLowestPrice += lowestPrice.price;
      }
    }

    res.json(buildResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};