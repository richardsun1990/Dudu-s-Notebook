// src/services/geminiService.ts
import { Subject, AIAnalysis } from "../types";

export const detectAndAnalyzeQuestions = async (
  base64Images: string[],
  subject: Subject
): Promise<AIAnalysis[]> => {
  
  const systemPrompt = `你是一个资深的小学${subject}教育专家。请分析图中的题目，输出JSON数组。`;

  // 🔴 关键：请求自己项目的 API，而不是 Google，确保 KEY 不泄露
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images: base64Images, systemPrompt })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'AI 分析失败');
  }
  
  const resultText = await response.json();
  return JSON.parse(resultText);
};

// 占位函数防止报错
export const generateWeakPointAnalysis = async () => ({ summary: '', weakPoints: [], overallLevel: '' });
