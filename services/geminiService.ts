import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION_REWRITE, SYSTEM_INSTRUCTION_CONVERT, SYSTEM_INSTRUCTION_EDIT } from '../constants';

const apiKey =
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.VITE_API_KEY ||
  process.env.GEMINI_API_KEY ||
  '';
const ai = new GoogleGenAI({ apiKey });

// Use a fast model for text manipulation
const MODEL_NAME = 'gemini-3-flash-preview';

export const rewriteContent = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_REWRITE,
        temperature: 0.3, // Low temperature for consistent academic output
      }
    });
    return response.text || text;
  } catch (error) {
    console.error("Rewrite error:", error);
    throw error;
  }
};

export const convertToLatex = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_CONVERT,
        temperature: 0.2,
      }
    });
    return response.text || text;
  } catch (error) {
    console.error("Convert error:", error);
    throw error;
  }
};

export const editContent = async (currentLatex: string, instruction: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `CURRENT CODE:\n${currentLatex}\n\nUSER INSTRUCTION:\n${instruction}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_EDIT,
        temperature: 0.4,
      }
    });
    return response.text || currentLatex;
  } catch (error) {
    console.error("Edit error:", error);
    throw error;
  }
};
