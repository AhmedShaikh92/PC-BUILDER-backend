import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate AI-powered build suggestions using Gemini
 * @param {Object} buildContext - Current build state
 * @param {Object} buildContext.selectedComponents - Components selected by user
 * @param {number} buildContext.totalPrice - Total build price
 * @param {string} buildContext.useCase - Gaming/Productivity/Office
 * @param {number} buildContext.budget - User's budget
 * @returns {Promise<Array>} Array of AI-generated suggestions
 */
export async function generateAISuggestions(buildContext) {
  try {
    const prompt = buildAIPrompt(buildContext);
    const GEMINI_TIMEOUT = 45000; // 45s

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini timeout")), GEMINI_TIMEOUT),
    );
    const geminiPromise = genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const response = await Promise.race([geminiPromise, timeoutPromise]);
    const text = response.text;
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const suggestions = JSON.parse(cleaned);

    return formatSuggestions(suggestions);
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
}

/**
 * Build a structured prompt for Gemini AI
 */
function buildAIPrompt(buildContext) {
  const {
    selectedComponents = {},
    totalPrice = 0,
    useCase = "General",
    budget = 0,
  } = buildContext;

  // Extract component details
  const components = Object.entries(selectedComponents).map(
    ([category, data]) => ({
      category,
      name: data.component?.name || "Not selected",
      brand: data.component?.brand || "Unknown",
      price: data.selectedPrice || 0,
      specs: data.component?.specs || {},
    }),
  );
  const specsSummary = components.map((c) => ({
    category: c.category,
    name: c.name,
    price: c.price,
    socket: c.specs?.socket,
    tdp: c.specs?.tdp,
    wattage: c.specs?.wattage,
    memoryType: c.specs?.memoryType,
    type: c.specs?.type,
  }));
  const prompt = `You are an expert PC hardware sales consultant helping a customer improve their PC build. Your goal is to guide the user toward better components and upgrades while sounding persuasive and confident, like a knowledgeable salesperson in a high-end PC store.

You should still be technically accurate, but focus on highlighting the benefits of upgrades, better value options, and convincing the user why certain improvements are worth it.

**Build Context:**
- Use Case: ${useCase}
- Budget: ₹${budget.toLocaleString("en-IN")}
- Current Total: ₹${totalPrice.toLocaleString("en-IN")}
- Budget Remaining: ₹${Math.max(0, budget - totalPrice).toLocaleString("en-IN")}

**Selected Components:**
${components.map((c) => `- ${c.category}: ${c.name} (₹${c.price.toLocaleString("en-IN")})`).join("\n")}

**Component Specs:**
${JSON.stringify(specsSummary, null, 2)}

**Your Task:**
Generate 3-5 persuasive suggestions that feel like recommendations from a PC hardware salesperson.

Focus on:
1. **Upselling meaningful upgrades** that improve performance
2. **Highlighting strong value deals** (slightly higher price for much better performance)
3. **Pointing out weak links in the build** that limit performance
4. **Suggesting premium or future-proof options**
5. **Rebalancing the build** (for example: GPU deserves more budget in gaming builds)

Frame suggestions in a persuasive way such as:
- "For just ₹2,000 more..."
- "Spending slightly more here unlocks..."
- "This upgrade will noticeably improve..."
- "Right now your build is bottlenecked by..."

**Important priorities:**
1. Compatibility issues (must be flagged as critical)
2. High-impact upgrades
3. Value improvements
4. Nice-to-have improvements

**Output Format (JSON only, no markdown):**
[
  {
    "type": "incompatible" | "upgrade" | "downgrade" | "warning" | "tip" | "alternative",
    "category": "CPU" | "GPU" | "RAM" | "Storage" | "PSU" | "Motherboard" | "Case" | "CPU Cooler" | "Compatibility" | "Budget",
    "title": "Short compelling title (max 60 chars)",
    "description": "Persuasive explanation with concrete benefits, numbers, and reasoning (2-3 sentences)",
    "priority": "critical" | "high" | "medium" | "low",
    "impact": "performance" | "value" | "reliability" | "compatibility" | "future-proofing",
    "badge": "Optional: short label like 'Best Upgrade', 'Great Value', 'Smart Buy'",
    "priceDifference": 1500,
    "savings": 3000,
    "upgradeReason": "Short one-line sales pitch"
  }
]

**Rules:**
- Output ONLY a valid JSON array (no markdown or explanations)
- Maximum 5 suggestions
- Always prioritize critical issues first
- Use persuasive, confident tone like a salesperson
- Use clear price comparisons (₹1,500 more, save ₹3,000, etc.)
- Focus on Indian PC market pricing and availability
- For ${useCase} builds emphasize the most important performance factors
- If budget allows (>10% remaining), strongly encourage strategic upgrades
- If budget is exceeded, suggest smart downgrades that keep performance strong

Generate suggestions now:`;

return prompt;
}

/**
 * Format and validate AI-generated suggestions
 */
function formatSuggestions(rawSuggestions) {
  if (!Array.isArray(rawSuggestions)) {
    console.warn("AI returned non-array response");
    return [];
  }

  // Validate and clean each suggestion
  return rawSuggestions
    .filter((s) => s.type && s.title && s.description)
    .map((s) => ({
      type: s.type || "tip",
      category: s.category || "General",
      title: s.title.substring(0, 80), // Truncate if too long
      description: s.description,
      priority: s.priority || "medium",
      impact: s.impact || "value",
      badge: s.badge || undefined,
      priceDifference:
        typeof s.priceDifference === "number" ? s.priceDifference : undefined,
      savings: typeof s.savings === "number" ? s.savings : undefined,
      upgradeReason: s.upgradeReason || undefined,
    }))
    .slice(0, 5); // Max 5 suggestions
}

/**
 * Fallback: Generate basic rule-based suggestions if AI fails
 */
export function generateFallbackSuggestions(buildContext) {
  const suggestions = [];
  const { selectedComponents = {}, totalPrice = 0, budget = 0 } = buildContext;

  // Check if over budget
  if (totalPrice > budget) {
    suggestions.push({
      type: "warning",
      category: "Budget",
      title: "Build Exceeds Budget",
      description: `Current total (₹${totalPrice.toLocaleString("en-IN")}) is ₹${(totalPrice - budget).toLocaleString("en-IN")} over your ₹${budget.toLocaleString("en-IN")} budget. Consider downgrading some components.`,
      priority: "high",
      impact: "value",
      badge: "OVER BUDGET",
    });
  }

  // Check for missing GPU in gaming builds
  if (!selectedComponents.GPU && budget > 40000) {
    suggestions.push({
      type: "warning",
      category: "GPU",
      title: "No GPU Selected",
      description:
        "A dedicated graphics card is essential for gaming and significantly improves performance for creative work.",
      priority: "high",
      impact: "performance",
    });
  }

  // Check PSU wattage
  const cpu = selectedComponents.CPU;
  const gpu = selectedComponents.GPU;
  const psu = selectedComponents.PSU;

  if (psu && (cpu || gpu)) {
    const psuWattage = psu.component?.specs?.wattage || 0;
    const cpuTdp = cpu?.component?.specs?.tdp || 65;
    const gpuTdp = gpu?.component?.specs?.tdp || 150;
    const estimated = cpuTdp + gpuTdp + 100;
    const recommended = Math.ceil(estimated * 1.3);

    if (psuWattage < recommended) {
      suggestions.push({
        type: "warning",
        category: "PSU",
        title: "PSU May Be Underpowered",
        description: `Your ${psuWattage}W PSU may struggle with this build. Estimated power draw is ${estimated}W. We recommend at least ${recommended}W for stability.`,
        priority: "high",
        impact: "reliability",
        badge: "RISKY",
      });
    }
  }

  return suggestions.slice(0, 5);
}
