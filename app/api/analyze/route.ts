import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { images, subject } = await req.json();
    const apiKey = process.env.VITE_GEMINI_API_KEY; // 确保 Vercel 已配置此变量

    // 关键：将 v1 改为 v1beta 以支持最新模型
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [
          { text: `你是一个资深小学${subject}老师，请识别图片中的错题并以JSON格式返回内容、解析和答案。` },
          ...images.map((img: string) => ({
            inlineData: { mimeType: "image/jpeg", data: img.includes(',') ? img.split(',')[1] : img }
          }))
        ]
      }]
    };

    const response = await fetch(apiUrl, { method: 'POST', body: JSON.stringify(payload) });
    const data = await response.json();
    return NextResponse.json({ text: data.candidates[0].content.parts[0].text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
