
import { GoogleGenAI } from "@google/genai";
import { User } from "../types";

export class GeminiService {
  async getMatchingReason(me: User, buddy: User): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I have two users for a fitness app. 
          User 1 (Me): ${JSON.stringify(me)}
          User 2 (Buddy): ${JSON.stringify(buddy)}
          
          Give a 2-sentence highly encouraging reason why they should workout together. 
          Focus on common activities, skill levels, and distance. 
          Keep it friendly and conversational.`,
      });
      return response.text || "You both share a passion for fitness and are located nearby!";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Looks like a great match for your fitness goals!";
    }
  }

  async getIcebreaker(buddy: User): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a short, fun icebreaker message to send to ${buddy.name} who likes ${buddy.activities.join(', ')}. 
        They are ${buddy.skillLevel} level. The message should be 1 sentence.`,
      });
      return response.text || `Hey ${buddy.name}, I see you're into ${buddy.activities[0]} too! Want to catch up?`;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Hey! Want to grab a workout together sometime?";
    }
  }

  async searchNearbyPlaces(query: string, lat: number, lng: number): Promise<{ text: string, links: { title: string, uri: string }[] }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      // Maps grounding is only supported in Gemini 2.5 series models.
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find ${query} near these coordinates: lat ${lat}, lng ${lng}.`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng
              }
            }
          }
        },
      });

      const links: { title: string, uri: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      chunks.forEach((chunk: any) => {
        if (chunk.maps) {
          links.push({
            title: chunk.maps.title || "View on Maps",
            uri: chunk.maps.uri
          });
        }
      });

      return {
        text: response.text || "Here are some places I found nearby:",
        links: links.slice(0, 5)
      };
    } catch (error) {
      console.error("Maps Search Error:", error);
      return { text: "I couldn't find any specific places right now. Try checking your local area on Google Maps.", links: [] };
    }
  }
}

export const geminiService = new GeminiService();
