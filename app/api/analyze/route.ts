// app/api/analyze/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { images, systemPrompt } = await req.json();
    const apiKey = process.env.VITE_GEMINI_API_KEY; // 从服务器环境读取

    if (!apiKey) return NextResponse.json({ error: '服务器未配置 API KEY' }, { status: 500 });

    // 使用正式版 v1 接口，避开不稳定的 v1beta
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [
          { text: systemPrompt },
          ...images.map((img: string) => ({
            inlineData: {
              mimeType: "image/jpeg",
              data: img.includes(',') ? img.split(',')[1] : img // 过滤 base64 前缀
            }
          }))
        ]
      }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Google API 响应错误');

    // 返回 AI 识别的文本内容
    return NextResponse.json({ text: data.candidates[0].content.parts[0].text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
