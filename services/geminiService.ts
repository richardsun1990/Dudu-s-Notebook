// services/geminiService.ts

/**
 * 核心分析函数：将图片发送至 Next.js 后端 API 进行识别
 * 此处不再直接引用 API KEY，确保前端安全
 */
export const detectAndAnalyzeQuestions = async (base64Images: string[], subject: string) => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: base64Images,
        systemPrompt: `你是一个资深的小学${subject}老师。请识别图片中的错题，并严格以JSON格式输出题目内容、解析和正确答案。`
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'AI 分析请求失败');
    }

    // 后端返回的是 { text: "..." }，这里解析 AI 返回的字符串
    return JSON.parse(data.text);
  } catch (error: any) {
    console.error('Gemini Service Error:', error);
    throw error;
  }
};

/**
 * 兼容性占位函数：防止 LearningReport 等旧组件因找不到导出项而导致编译失败
 * 建议在部署成功后，逐步删除不再使用的旧组件
 */
export const generateWeakPointAnalysis = async () => {
  return {
    summary: '暂无分析数据',
    weakPoints: [],
    overallLevel: '待评定'
  };
};

export default {
  detectAndAnalyzeQuestions,
  generateWeakPointAnalysis
};
