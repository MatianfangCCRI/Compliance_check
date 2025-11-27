import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeCompliance = async (
  file: File,
  focusArea: string = ""
): Promise<AnalysisResult> => {
  try {
    const base64Data = await fileToBase64(file);
    
    // Determine mimeType (GoogleGenAI expects standard MIME types)
    const mimeType = file.type;

    const prompt = `
      You are a strict and meticulous Legal Compliance Auditor. 
      
      Your task is to analyze the provided screenshot image for inconsistencies with current regulations and laws.
      
      ${focusArea ? `FOCUS AREA: The user is specifically concerned about regulations regarding: "${focusArea}".` : ""}

      Please follow these steps:
      1. **Visual & Text Extraction**: Describe clearly what is visible in the image (text, objects, layout).
      2. **Regulation Search**: Use Google Search to find the most *current* and *relevant* laws, regulations, or industry standards applicable to the content found in the image. Cite specific article numbers or clause names if possible.
      3. **Compliance Check**: Compare the image content against the found regulations. Identify any violations, potential risks, or ambiguities.
      4. **Verdict**: specific conclusion (Compliant, Non-Compliant, or Needs Review).

      Format your response using clear Markdown with headers (##), bullet points, and bold text for emphasis. 
      Start with a summary section.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType cannot be JSON when using googleSearch
        systemInstruction: "You are an expert legal compliance AI. You verify visual content against real-world laws and regulations.",
      },
    });

    const text = response.text || "No analysis generated.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      text,
      groundingChunks: groundingChunks as AnalysisResult['groundingChunks'],
    };

  } catch (error) {
    console.error("Error checking compliance:", error);
    throw error;
  }
};
