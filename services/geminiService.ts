import { GoogleGenAI, Type } from "@google/genai";
import type { Team, AIMatchResult } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd show a friendly message in the UI
  // For this context, we'll use a console error and allow the fallback to run.
  console.error("API_KEY environment variable is not set. The app will run in offline mode.");
}

const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

const matchResultSchema = {
  type: Type.OBJECT,
  properties: {
    homeScore: { type: Type.INTEGER, description: "Total runs scored by the home team." },
    awayScore: { type: Type.INTEGER, description: "Total runs scored by the away team." },
    homeWickets: { type: Type.INTEGER, description: "Wickets lost by the home team." },
    awayWickets: { type: Type.INTEGER, description: "Wickets lost by the away team." },
    commentary: { type: Type.STRING, description: "A brief, exciting 1-2 sentence summary of the match." }
  },
  required: ['homeScore', 'awayScore', 'homeWickets', 'awayWickets', 'commentary']
};

// Helper for random numbers
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateFallbackResult = (homeTeam: Team, awayTeam: Team): AIMatchResult => {
    console.warn("Gemini API not available or failed. Using fallback simulation.");
    const homeScore = randomInt(80, 220);
    const awayScore = randomInt(80, 220);
    const winner = homeScore > awayScore ? homeTeam.name : awayTeam.name;
    const margin = Math.abs(homeScore - awayScore);

    return {
        homeScore,
        awayScore,
        homeWickets: randomInt(3, 10),
        awayWickets: randomInt(3, 10),
        commentary: `A hard-fought match! ${winner} clinched the victory by ${margin} runs in a thrilling encounter.`
    };
};

export const simulateAIMatch = async (homeTeam: Team, awayTeam: Team): Promise<AIMatchResult> => {
    if (!ai) {
      return generateFallbackResult(homeTeam, awayTeam);
    }
    
    const prompt = `
    Simulate a full T20 cricket match between two teams: ${homeTeam.name} (Home) vs ${awayTeam.name} (Away).
    - ${homeTeam.name} has players like ${homeTeam.batters[0].name} and ${homeTeam.bowlers[0].name}.
    - ${awayTeam.name} has players like ${awayTeam.batters[0].name} and ${awayTeam.bowlers[0].name}.
    
    Generate a plausible final score for both teams, including runs and wickets.
    Also, provide a brief, dramatic 1-2 sentence commentary summarizing the match result.
    The score should be typical for a T20 match (e.g., between 80 and 220 runs). Wickets should be between 0 and 10.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: matchResultSchema,
        temperature: 1, // Higher temperature for more varied and creative outcomes
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    // Basic validation
    if (result && typeof result.homeScore === 'number' && typeof result.commentary === 'string') {
        return result as AIMatchResult;
    } else {
        console.error("Invalid JSON structure from API:", result);
        return generateFallbackResult(homeTeam, awayTeam);
    }

  } catch (error) {
    console.error("Error simulating match with Gemini:", error);
    return generateFallbackResult(homeTeam, awayTeam);
  }
};
