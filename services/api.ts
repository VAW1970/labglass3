import { AnalysisResult } from '../types';

// Em produção (Vercel), usaremos a variável de ambiente VITE_API_URL ou REACT_APP_API_URL.
// Em desenvolvimento local, fallback para 127.0.0.1:5000.
const BASE_URL = process.env.VITE_API_URL || process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
const API_URL = `${BASE_URL}/predict`;

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    // Timeout curto para detectar offline rapidamente
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
    
    // Tenta bater na raiz do servidor
    const response = await fetch(`${BASE_URL}/`, { 
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(id);
    return response.ok;
  } catch (e) {
    return false;
  }
};

export const analyzeImage = async (file: File): Promise<AnalysisResult> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro no servidor: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data as AnalysisResult;
  } catch (error: any) {
    console.error("Falha ao conectar ao backend Python:", error);
    
    let msg = "Não foi possível conectar ao servidor Flask.";
    
    // Ajuda para debug em produção vs local
    if (BASE_URL.includes("localhost") || BASE_URL.includes("127.0.0.1")) {
         if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            msg += " O servidor está rodando em http://127.0.0.1:5000?";
        }
    } else {
        msg += " Verifique se o backend no Railway/Render está ativo.";
    }

    if (error.message && !msg.includes(error.message)) {
         msg += ` ${error.message}`;
    }
    
    throw new Error(msg);
  }
};