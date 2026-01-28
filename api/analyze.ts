import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 🔴 这里的变量名必须与 Vercel 后台设置的一模一样
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Vercel 环境变量中缺少 VITE_GEMINI_API_KEY' });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // 确保使用 flash 模型以降低延迟
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const { images, systemPrompt } = req.body;
    
    // 增加数据完整性检查
    if (!images || images.length === 0) {
      return res.status(400).json({ error: '未接收到图片数据' });
    }

    const result = await model.generateContent([
      systemPrompt,
      ...images.map((img: string) => ({
        inlineData: { data: img.split(',')[1] || img, mimeType: "image/jpeg" }
      }))
    ]);

    const response = await result.response;
    const text = response.text();
    // 🔴 务必确保返回的是纯文本，前端会负责解析
    res.status(200).json(text);
  } catch (error: any) {
    console.error('Gemini Backend Error:', error);
    res.status(500).json({ error: error.message || 'AI 服务响应超时或配置错误' });
  }
}
