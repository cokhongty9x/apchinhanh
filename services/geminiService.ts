import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API client
// Note: API key is expected to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Edits an image based on a text prompt using Gemini 2.5 Flash Image.
 * 
 * @param base64ImageData The raw base64 string of the image (without data prefix).
 * @param mimeType The MIME type of the image (e.g., 'image/png').
 * @param prompt The text description of the edit.
 * @returns The base64 data URL of the generated image.
 */
export const generateImageEdit = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash-image';

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
        ],
      },
      // Note: responseMimeType and responseSchema are NOT supported for nano banana series (gemini-2.5-flash-image)
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("Không có nội dung nào được tạo ra từ mô hình.");
    }

    let generatedImageUrl = '';
    
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const base64String = part.inlineData.data;
        // Construct the Data URL. Assuming PNG return or matching input, 
        // but typically Gemini returns PNG or JPEG. 
        // The inlineData usually doesn't strictly specify returned mimeType in the object 
        // in the same way, but usually it's compatible. 
        // We will default to image/png for the output display if not specified, 
        // or check if the API returns a mimeType in inlineData.
        const returnedMimeType = part.inlineData.mimeType || 'image/png';
        generatedImageUrl = `data:${returnedMimeType};base64,${base64String}`;
        break; // Found the image, stop looking.
      }
    }

    if (!generatedImageUrl) {
      // Fallback: If no image found, check if there is text explaining why
      const textPart = parts.find(p => p.text);
      if (textPart && textPart.text) {
        throw new Error(`Mô hình trả về văn bản thay vì hình ảnh: "${textPart.text}"`);
      }
      throw new Error("Mô hình không trả về hình ảnh hợp lệ.");
    }

    return generatedImageUrl;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Không thể tạo bản sửa ảnh.");
  }
};