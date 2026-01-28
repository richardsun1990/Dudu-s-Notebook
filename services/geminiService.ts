// src/services/geminiService.ts
import { Subject, AIAnalysis } from "../types";

export const detectAndAnalyzeQuestions = async (
  base64Images: string[],
  subject: Subject
): Promise<AIAnalysis[]> => {
  
  const systemPrompt = `你是一个资深教育专家。请分析图中的题目，并严格以JSON数组格式输出分析结果。`;

  // 🔴 关键：请求你刚刚创建的 Next.js API 路由
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images: base64Images, systemPrompt })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '后端请求失败');
  }
  
  const data = await response.json();
  // 此时 data.text 就是 AI 返回的原始字符串
  return JSON.parse(data.text);
};
