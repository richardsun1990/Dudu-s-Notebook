// api/analyze.ts
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: '仅支持 POST' });

  // 1. 密钥锁在服务器环境变量中，前端永远拿不到
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: '服务器未配置 API KEY' });

  const { images, systemPrompt } = req.body;

  // 2. 强制使用最稳定的 v1 正式接口，跳过不稳定的 v1beta 路径
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const googleResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await googleResponse.json();
    if (!googleResponse.ok) throw new Error(data.error?.message || 'Google 接口报错');

    // 返回 AI 识别结果
    res.status(200).json(data.candidates[0].content.parts[0].text);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
