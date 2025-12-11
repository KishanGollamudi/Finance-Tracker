import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

export const analyzeFinances = async (transactions: Transaction[], prompt: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "API Key not configured. Please check your environment variables.";

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare context
    const recentTransactions = transactions.slice(0, 50); // Send last 50 to avoid token limits
    const context = `
      You are a financial advisor for the 'BeigeLedger' app.
      Here is a JSON summary of the user's recent transactions:
      ${JSON.stringify(recentTransactions)}
      
      The user is asking: "${prompt}"
      
      Provide a helpful, professional, and concise answer. Focus on insights, trends, and advice.
      Format the response with simple markdown if needed (bolding key figures).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
    });

    return response.text || "I couldn't generate an analysis at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "An error occurred while communicating with the AI advisor.";
  }
};