
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Generates a neurocasual insight or philosophical reflection based on player performance using the Gemini API.
 * @param score The player's final score.
 * @param accuracy The player's click accuracy percentage.
 * @param averageClickSpeed The player's average click speed in milliseconds, or null if not applicable.
 * @param ruleShiftsApplied The number of rule shifts applied during the game.
 * @returns A promise that resolves to a string containing the generated insight.
 */
export async function getNeuroCasualInsight(
  score: number,
  accuracy: number,
  averageClickSpeed: number | null,
  ruleShiftsApplied: number
): Promise<string> {
  // CRITICAL: Create a new GoogleGenAI instance right before making an API call
  // to ensure it always uses the most up-to-date API key from the dialog.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze the following player performance from a neurocasual game and provide a concise, philosophical insight or reflection (2-3 sentences max).
    Player Stats:
    - Score: ${score}
    - Accuracy: ${accuracy.toFixed(2)}%
    - Average Click Speed: ${averageClickSpeed ? averageClickSpeed.toFixed(2) + ' ms' : 'N/A'}
    - Rule Shifts Encountered: ${ruleShiftsApplied}

    Focus on the interplay between their actions, the game's adaptation, and the transient nature of rules.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a contemplative AI that provides philosophical observations on player interaction within a dynamic game system. Your insights are brief, thought-provoking, and reflect the adaptive nature of reality.",
        temperature: 0.7,
        maxOutputTokens: 100, // Keep responses concise
      },
    });
    return response.text?.trim() || "No insight generated. The system remains silent, observing...";
  } catch (error) {
    console.error("Error generating neurocasual insight:", error);
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      // Handle API key selection error if applicable, as per Veo guidelines.
      // Although not directly for Veo, it's good practice for general API errors.
      // For this app, we'll just return a specific error message.
      return "An API error occurred. Please ensure your Gemini API key is correctly configured and has access to the model. The universe is withholding its secrets...";
    }
    return "Failed to retrieve a neurocasual insight. Perhaps the system itself is pondering its own existence...";
  }
}
