import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Subject, AIAnalysis, MistakeRecord, WeakPointAnalysis } from "../types";

// 初始化客户端
const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const detectAndAnalyzeQuestions = async (
  base64Images: string[],
  subject: Subject
): Promise<AIAnalysis[]> => {
  
  const systemPrompt = `你是一个资深的小学${subject}教育专家。请识别题目并输出JSON。`;

  // ⚠️ 补丁：手动补全 models/ 前缀，防止 SDK 拼接错误
  const genModel = ai.getGenerativeModel({ 
    model: "models/gemini-1.5-flash", 
    systemInstruction: systemPrompt 
  });

  const imageParts = base64Images.map(base64 => ({
    inlineData: { mimeType: "image/jpeg", data: base64 },
  }));

  const result = await genModel.generateContent({
    contents: [{ parts: [...imageParts, { text: "请分析图中的题目，输出JSON格式结果。" }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            questionText: { type: SchemaType.STRING },
            questionType: { type: SchemaType.STRING },
            correctAnswer: { type: SchemaType.STRING },
            sourceImageIndex: { type: SchemaType.NUMBER },
            boundingBox: { type: SchemaType.ARRAY, items: { type: SchemaType.NUMBER } }
          },
          required: ["questionText", "questionType"]
        }
      }
    }
  });

  const response = await result.response;
  return JSON.parse(response.text());
};

// 占位函数确保不报错
export const generateWeakPointAnalysis = async (m: any): Promise<any> => { return {}; };
