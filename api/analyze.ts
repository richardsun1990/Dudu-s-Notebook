import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 从环境变量读取 KEY，这在服务器端是安全的，前端不可见
  const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const { images, systemPrompt } = req.body;
    
    // 这里的请求发生在 Vercel 服务器和 Google 之间，避开了浏览器兼容性问题
    const result = await model.generateContent([
      systemPrompt,
      ...images.map((img: string) => ({
        inlineData: { data: img, mimeType: "image/jpeg" }
      }))
    ]);

    const response = await result.response;
    res.status(200).json(response.text());
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
