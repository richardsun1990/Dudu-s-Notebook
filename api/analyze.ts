import { Subject, AIAnalysis } from "../types";

export const detectAndAnalyzeQuestions = async (
  base64Images: string[],
  subject: Subject
): Promise<AIAnalysis[]> => {
  
  const systemPrompt = `你是一个教育专家。请分析图中的题目并返回JSON数组。`;

  // 请求本地 api 路径
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images: base64Images, systemPrompt })
  });

  if (!response.ok) throw new Error('AI 分析失败');
  const resultText = await response.json();
  return JSON.parse(resultText);
};

export const generateWeakPointAnalysis = async () => ({ summary: '', weakPoints: [], overallLevel: '' });
