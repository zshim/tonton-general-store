import { GoogleGenAI } from "@google/genai";
import { Order, Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to check if API key is present
const isApiKeyAvailable = () => !!process.env.API_KEY;

export const generateProductDescription = async (name: string, category: string): Promise<string> => {
  if (!isApiKeyAvailable()) return "Description unavailable (API Key missing).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, appetizing, and sales-focused product description (max 2 sentences) for a grocery item named "${name}" in the category "${category}".`,
    });
    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate description.";
  }
};

export const analyzeSalesTrends = async (orders: Order[]): Promise<string> => {
  if (!isApiKeyAvailable()) return "Analytics unavailable (API Key missing).";

  // Summarize data for the model to save tokens
  const summary = orders.map(o => ({
    date: o.date.split('T')[0],
    total: o.total,
    items: o.items.map(i => i.name).join(', ')
  })).slice(0, 50); // Limit to last 50 orders

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze this grocery store sales data: ${JSON.stringify(summary)}. 
      Provide a brief 3-bullet point summary of trends, popular items, and a recommendation for the store manager.`,
    });
    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not analyze data.";
  }
};

export const suggestRecipes = async (cartItems: Product[]): Promise<string> => {
  if (!isApiKeyAvailable()) return "Recipe suggestions unavailable (API Key missing).";
  if (cartItems.length === 0) return "Add items to your cart to get recipe suggestions!";

  const itemNames = cartItems.map(i => i.name).join(', ');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on these grocery items: ${itemNames}, suggest 2 simple recipes I can make. 
      Format as: **Recipe Name**: Brief instructions.`,
    });
    return response.text || "No recipes found.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not suggest recipes.";
  }
};