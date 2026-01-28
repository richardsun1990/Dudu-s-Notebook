import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API KEY' });

  // 🔴 关键修复：强制初始化时指定 apiVersion
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    const { images, systemPrompt } = req.body;

    // 手动拼接模型路径，避开 SDK 的版本拼接 Bug
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash"
    }, { apiVersion: 'v1beta' }); // 显式声明版本

    const result = await model.generateContent([
      { text: systemPrompt },
      ...images.map((img: string) => ({
        inlineData: { 
          // 处理 base64，去掉可能存在的 data:image/jpeg;base64, 前缀
          data: img.includes(',') ? img.split(',')[1] : img, 
          mimeType: "image/jpeg" 
        }
      }))
    ]);

    const response = await result.response;
    const text = response.text();
    
    // 返回给前端
    res.status(200).json(text);
  } catch (error: any) {
    console.error('Backend Detail:', error);
    res.status(500).json({ error: error.message });
  }
}
