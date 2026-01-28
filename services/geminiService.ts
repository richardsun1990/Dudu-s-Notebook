import { Subject, AIAnalysis } from "../types";

export const detectAndAnalyzeQuestions = async (
  base64Images: string[],
  subject: Subject
): Promise<AIAnalysis[]> => {
  
  const systemPrompt = `你是一个资深的小学${subject}教育专家。请分析图中的题目，输出JSON数组结果。`;

  // 🔴 关键点：现在直接请求你自己刚才建的 /api/analyze 接口
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      images: base64Images,
      subject,
      systemPrompt
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'AI 分析请求失败');
  }
  
  const resultText = await response.json();
  return JSON.parse(resultText);
};

// 占位函数防止其他页面报错
export const generateWeakPointAnalysis = async () => ({ summary: '', weakPoints: [], overallLevel: '' });
