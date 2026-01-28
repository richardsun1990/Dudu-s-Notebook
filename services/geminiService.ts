import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Subject, AIAnalysis, MistakeRecord, WeakPointAnalysis } from "../types";

const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const genModel = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

export const detectAndAnalyzeQuestions = async (
  base64Images: string[], 
  subject: Subject
): Promise<AIAnalysis[]> => {
  // 切换为 Flash 模型以大幅提升识别速度
  const genModel = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const systemPrompt = `你是一个资深的小学${subject}教育专家。
  用户上传了[${base64Images.length}]张作业照片。
  请快速识别并分析图中包含的**所有独立题目**。
  
  关键要求：
  1. 准确提取题目文本、题型、参考答案和精简解析。
  2. 题型(questionType)：如计算题、应用题、选择题等。
  3. 难度(difficulty)：容易、中等、困难。
  4. **精确坐标(boundingBox)**：必须提供题目在原图中的归一化坐标 [ymin, xmin, ymax, xmax] (0-1000)。
  5. sourceImageIndex：记录题目所在图片的索引(0-${base64Images.length - 1})。
  
  输出必须是一个精简的JSON数组。`;

  const imageParts = base64Images.map(base64 => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: base64,
    },
  }));

  const response = await genModel.generateContent({
    contents: {
      parts: [
        ...imageParts,
        { text: "请分析图中的题目，输出JSON格式结果。" }
      ],
    },
    config: {
      systemInstruction: systemPrompt,
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
            tags: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            },
            sourceImageIndex: { type: SchemaType.NUMBER },
            boundingBox: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.NUMBER },
              description: "[ymin, xmin, ymax, xmax]"
            }
          },
          required: ["questionText", "questionType", "correctAnswer", "explanation", "difficulty", "tags", "sourceImageIndex", "boundingBox"]
        }
      }
    }
  });

  const jsonStr = (response.text || '[]').trim();
  return JSON.parse(jsonStr) as AIAnalysis[];
};

export const generateWeakPointAnalysis = async (
  mistakes: MistakeRecord[]
): Promise<WeakPointAnalysis> => {
  const model = 'gemini-3-flash-preview';
  
  const simplifiedData = mistakes.map(m => ({
    subject: m.subject,
    type: m.analysis?.questionType,
    difficulty: m.analysis?.difficulty,
    tags: m.analysis?.tags,
    text: m.analysis?.questionText.substring(0, 50) + '...'
  }));

  const prompt = `分析以下学生的错题记录，指出薄弱环节。
  
  数据：${JSON.stringify(simplifiedData)}
  
  请提供学习现状总结(summary)、具体的薄弱知识点分析(weakPoints)及综合评估(overallLevel)。
  输出为JSON。`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          weakPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topic: { type: Type.STRING },
                description: { type: Type.STRING },
                count: { type: Type.NUMBER },
                suggestion: { type: Type.STRING }
              },
              required: ["topic", "description", "count", "suggestion"]
            }
          },
          overallLevel: { type: Type.STRING }
        },
        required: ["summary", "weakPoints", "overallLevel"]
      }
    }
  });

  const jsonStr = (response.text || '{}').trim();
  return JSON.parse(jsonStr) as WeakPointAnalysis;
};
