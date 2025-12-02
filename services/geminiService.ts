import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateMovieMetadata = async (filename: string, userNotes: string, type: 'movie' | 'series' = 'movie') => {
  const ai = getAiClient();
  
  const contextType = type === 'series' ? 'uma Série de TV' : 'um Filme';

  const prompt = `
    Eu tenho um arquivo (ou arquivos) de vídeo original com nome base: "${filename}". 
    Notas do usuário sobre o conteúdo: "${userNotes}".
    
    Este conteúdo deve ser categorizado como: ${contextType}.
    
    Por favor, gere:
    1. Um título criativo (Se for série, apenas o nome da série).
    2. Uma sinopse curta e envolvente.
    3. Um gênero.
    4. Uma pontuação de relevância (matchScore) de 0-100.
    
    Seja criativo, como um redator de Hollywood.
    IMPORTANTE: Responda estritamente em Português do Brasil.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            genre: { type: Type.STRING },
            matchScore: { type: Type.INTEGER }
          },
          required: ["title", "description", "genre", "matchScore"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Metadata Error:", error);
    // Fallback if API fails
    return {
      title: filename,
      description: userNotes || "Nenhuma descrição fornecida.",
      genre: "Upload do Usuário",
      matchScore: 80
    };
  }
};

export const chatWithAi = async (message: string, currentContext?: string) => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `Você é o Jeff, o assistente de IA do Jefflix. Você é espirituoso, conhecedor de cinema e prestativo.
  Você deve responder sempre em Português do Brasil.
  ${currentContext ? `O usuário está atualmente assistindo ou vendo: ${currentContext}` : ''}
  Mantenha as respostas concisas (menos de 50 palavras), a menos que seja solicitada uma análise detalhada.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: message,
      config: {
        systemInstruction,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Desculpe, estou com problemas para conectar ao servidor Jefflix agora.";
  }
};