import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Subject, AIAnalysis, MistakeRecord, WeakPointAnalysis } from "../types";

// 1. 统一初始化客户端
const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

/**
 * 拍照识别逻辑
 */
export const detectAndAnalyzeQuestions = async (
  base64Images: string[],
  subject: Subject
): Promise<AIAnalysis[]> => {
  // A. 先定义 Prompt
  const systemPrompt = `你是一个资深的小学${subject}教育专家。
请快速识别并分析图中包含的**所有独立题目**。
精确坐标(boundingBox)必须提供归一化坐标 [ymin, xmin, ymax, xmax] (0-1000)。
输出必须是一个精简的JSON数组。`;

  // B. 在函数内部初始化模型，确保 systemInstruction 引用正确
  const genModel = ai.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt 
  });

  const imageParts = base64Images.map(base64 => ({
    inlineData: { mimeType: "image/jpeg", data: base64 },
  }));

  // C. 统一使用官方最新的 generateContent 语法
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
            originalAnswer: { type: SchemaType.STRING },
            correctAnswer: { type: SchemaType.STRING },
            explanation: { type: SchemaType.STRING },
            difficulty: { type: SchemaType.STRING },
            tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            sourceImageIndex: { type: SchemaType.NUMBER },
            boundingBox: { type: SchemaType.ARRAY, items: { type: SchemaType.NUMBER } }
          },
          required: ["questionText", "questionType", "correctAnswer", "sourceImageIndex", "boundingBox"]
        }
      }
    }
  });

  const text = result.response.text();
  return JSON.parse(text) as AIAnalysis[];
};

/**
 * 错题薄弱点分析逻辑
 */
export const generateWeakPointAnalysis = async (
  mistakes: MistakeRecord[]
): Promise<WeakPointAnalysis> => {
  // 统一使用已初始化的 genModel，注意这里模型换成 flash 提高响应速度
  const analysisModel = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const simplifiedData = mistakes.map(m => ({
    subject: m.subject,
    type: m.analysis?.questionType,
    tags: m.analysis?.tags,
    text: m.analysis?.questionText.substring(0, 50)
  }));

  const prompt = `分析以下学生的错题记录，指出薄弱环节。数据：${JSON.stringify(simplifiedData)}`;

  const result = await analysisModel.generateContent({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          summary: { type: SchemaType.STRING },
          weakPoints: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                topic: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                count: { type: SchemaType.NUMBER },
                suggestion: { type: SchemaType.STRING }
              },
              required: ["topic", "description", "count", "suggestion"]
            }
          },
          overallLevel: { type: SchemaType.STRING }
        },
        required: ["summary", "weakPoints", "overallLevel"]
      }
    }
  });

  const text = result.response.text();
  return JSON.parse(text) as WeakPointAnalysis;
};
