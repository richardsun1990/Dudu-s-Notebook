export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: '仅支持 POST' });

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: '缺少 API KEY' });

  const { images, systemPrompt } = req.body;

  // 🔴 关键点：手动构造 Google 官方标准 REST 接口地址，不再让 SDK 乱猜
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
    }],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  try {
    const googleResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      throw new Error(data.error?.message || 'Google API 响应错误');
    }

    // 提取 AI 返回的文本
    const aiText = data.candidates[0].content.parts[0].text;
    res.status(200).json(aiText);
  } catch (error: any) {
    console.error('REST API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
