// app/api/analyze/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { images, systemPrompt } = await req.json();
    
    // 从环境变量中安全获取 KEY
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Missing API KEY' }, { status: 500 });

    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // 🔴 修复了上一版导致 500 错误的 JSON 格式问题
    const payload = {
      contents: [{
        parts: [
          { text: systemPrompt },
          ...images.map((img: string) => ({
            inlineData: {
              mimeType: "image/jpeg",
              data: img.includes(',') ? img.split(',')[1] : img
            }
          }))
        ]
      }]
      // 注意：暂时移除导致报错的 generationConfig
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Google API Error');

    const resultText = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ text: resultText });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
