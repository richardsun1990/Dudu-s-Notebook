// src/services/geminiService.ts
export const detectAndAnalyzeQuestions = async (base64Images: string[], subject: string) => {
  const systemPrompt = `你是一个资深教育专家。请分析图中的题目，并严格以JSON数组格式输出。`;

  // 🔴 必须指向你刚创建的 Next.js 路由路径
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images: base64Images, systemPrompt })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'AI 分析请求失败');
  }
  
  const data = await response.json();
  // 注意：后端返回的是 { text: "..." }，这里需要解析内部的 JSON 字符串
  return JSON.parse(data.text);
};
