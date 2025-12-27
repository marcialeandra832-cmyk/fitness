
import { GoogleGenAI, Type } from "@google/genai";
import { AIWorkoutParams, MuscleGroup } from "../types";

// Inicializando a IA com a API Key de ambiente conforme as regras
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWorkoutPlan = async (params: AIWorkoutParams) => {
  const prompt = `Gere uma ficha de treino semanal profissional.
  Aluno: ${params.name} | Objetivo: ${params.goal} | Nível: ${params.level} | Frequência: ${params.daysPerWeek} dias.

  REGRAS CRÍTICAS:
  1. Use o Google Search para encontrar links do YouTube de alta qualidade (preferência canais oficiais de musculação como Growth TV, Leandro Twin, Renato Cariani).
  2. Cada exercício DEVE ter um campo 'videoUrl' com link direto do YouTube. Isso é essencial para gerar a capa do exercício.
  3. No campo 'imageUrl', deixe vazio ou use uma imagem do Unsplash caso o vídeo não tenha boa miniatura.
  4. Estruture o treino por dias (Treino A, B, C...).
  5. Retorne APENAS o JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            dayName: { type: Type.STRING, description: "Ex: Treino A - Superiores" },
            muscleGroups: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }
            },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  sets: { type: Type.NUMBER },
                  reps: { type: Type.STRING },
                  description: { type: Type.STRING },
                  muscleGroup: { type: Type.STRING },
                  videoUrl: { type: Type.STRING },
                  imageUrl: { type: Type.STRING }
                },
                required: ["id", "name", "sets", "reps", "muscleGroup", "videoUrl"]
              }
            }
          },
          required: ["dayName", "muscleGroups", "exercises"]
        }
      }
    },
  });

  try {
    const text = response.text;
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Erro IA:", error);
    throw error;
  }
};
