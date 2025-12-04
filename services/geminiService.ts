import { GoogleGenAI } from "@google/genai";
import { LABELS_PT } from "../constants";

const apiKey = process.env.API_KEY || ''; // Certifique-se de que isso está configurado no seu ambiente
const ai = new GoogleGenAI({ apiKey });

export const getGlasswareExplanation = async (itemLabel: string): Promise<string> => {
  try {
    if (!apiKey) {
        return "Chave de API não configurada. Não é possível obter a explicação.";
    }

    // Tenta usar o nome em português para o prompt, se disponível
    const ptLabel = LABELS_PT[itemLabel] || itemLabel;
    
    const modelId = "gemini-2.5-flash";
    const prompt = `Explique a função e os casos de uso típicos de um(a) "${ptLabel}" de laboratório em química. Mantenha a resposta concisa (máximo de 2 frases), educativa e em Português.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Nenhuma explicação disponível.";
  } catch (error) {
    console.error("Erro na API Gemini:", error);
    return "Não foi possível recuperar informações no momento.";
  }
};