
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a base64 encoded string.
 */
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const editImageWithGemini = async (imageFile: File, prompt: string): Promise<{imageUrl: string | null; text: string | null}> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          imagePart,
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    let imageUrl: string | null = null;
    let text: string | null = null;

    if(response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                text = part.text;
            } else if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
    }
    
    return { imageUrl, text };

  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    throw new Error("فشل تعديل الصورة. يرجى المحاولة مرة أخرى.");
  }
};

export const getChatResponseFromGemini = async (prompt: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
             config: {
                systemInstruction: "أنت مساعد ذكي وودود. أجب باللغة العربية.",
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error getting chat response from Gemini:", error);
        throw new Error("فشل الحصول على رد. يرجى المحاولة مرة أخرى.");
    }
};
