
import { GoogleGenAI, Type } from "@google/genai";
import { Subject, AIAnalysis, MistakeRecord, WeakPointAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const detectAndAnalyzeQuestions = async (
  base64Images: string[], 
  subject: Subject
): Promise<AIAnalysis[]> => {
  const model = 'gemini-3-flash-preview';
  
  const systemPrompt = `你是一个资深的小学${subject}教育专家，正在为三年级学生“嘟嘟”分析题目。
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

  const response = await ai.models.generateContent({
    model,
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
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            questionText: { type: Type.STRING },
            questionType: { type: Type.STRING },
            originalAnswer: { type: Type.STRING },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            sourceImageIndex: { type: Type.NUMBER },
            boundingBox: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
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

  const prompt = `你是一位专门辅导三年级学生“嘟嘟”的资深家庭教育导师。
  
  请基于以下错题数据进行深度复盘：
  ${JSON.stringify(simplifiedData)}
  
  你的目标是：
  1. **总结现状(summary)**：用鼓励性、温暖的语言指出嘟嘟目前的进步和核心挑战。
  2. **定位薄弱点(weakPoints)**：不仅要指出知识点，还要分析“为什么错”（如概念不清、粗心、逻辑断层）。
  3. **提供辅导方案(suggestion)**：给家长的具体建议，例如：
     - “生活化练习”：生活中如何引导？
     - “小游戏”：如何通过游戏化学习？
     - “避坑指南”：下次遇到这类题要注意什么？
  4. **综合等级(overallLevel)**：一个有趣的称号。

  输出为规范的JSON格式。`;

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
