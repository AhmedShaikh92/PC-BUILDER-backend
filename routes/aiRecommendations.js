import express from "express";
const router = express.Router();
import {
  generateAISuggestions,
  generateFallbackSuggestions,
} from "../services/aiRecommendations.js";

/**
 * POST /api/ai/suggestions
 * Generate AI-powered build suggestions
 *
 * Body:
 * {
 *   selectedComponents: { CPU: {...}, GPU: {...}, ... },
 *   totalPrice: 75000,
 *   useCase: "Gaming",
 *   budget: 80000
 * }
 */
router.post("/suggestions", async (req, res) => {
  try {
    const { selectedComponents, totalPrice, useCase, budget } = req.body;

    // Validate input
    if (!selectedComponents || typeof totalPrice !== "number") {
      return res.status(400).json({
        success: false,
        message: "Invalid request. Required: selectedComponents, totalPrice",
      });
    }

    const buildContext = {
      selectedComponents,
      totalPrice,
      useCase: useCase || "General",
      budget: budget || totalPrice,
    };

    // Try AI-powered suggestions first
    let suggestions = [];

    try {
      suggestions = await generateAISuggestions(buildContext);
    } catch (aiError) {
      console.error("AI generation failed, using fallback:", aiError.message);
      // Fallback to rule-based suggestions if AI fails
      suggestions = generateFallbackSuggestions(buildContext);
    }

    res.json({
      success: true,
      suggestions,
      generatedBy: suggestions.length > 0 ? "ai" : "fallback",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate suggestions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /api/ai/health
 * Check if AI service is available
 */
router.get("/health", async (req, res) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;

  res.json({
    success: true,
    aiAvailable: hasApiKey,
    message: hasApiKey
      ? "AI service is configured and ready"
      : "AI service requires GEMINI_API_KEY in environment",
  });
});
export default router;
