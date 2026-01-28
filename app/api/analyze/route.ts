import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { images, systemPrompt } = await req.json();
    const apiKey = process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: 'Missing API KEY' }, { status: 500 });

    // 注意这里改成了 v1beta，解决之前的 404 模型找不到问题
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [
          { text: systemPrompt },
          ...images.map((img: string) => ({
            inlineData: { mimeType: "image/jpeg", data: img.includes(',') ? img.split(',')[1] : img }
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
    if (!response.ok) throw new Error(data.error?.message || 'AI 响应错误');

    return NextResponse.json({ text: data.candidates[0].content.parts[0].text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
