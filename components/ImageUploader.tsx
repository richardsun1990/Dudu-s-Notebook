'use client'; // Next.js 客户端组件标识
import React, { useState } from 'react';

export default function ImageUploader({ onResult }: { onResult: (data: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const base64s = await Promise.all(files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }));
    setPreviews(base64s);
  };

  const startScan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', { // 请求刚才创建的路由
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: previews, systemPrompt: "请识别题目并转为JSON" })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onResult(JSON.parse(data.text));
    } catch (err: any) {
      alert("识别失败: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input type="file" multiple accept="image/*" onChange={handleUpload} className="block w-full text-sm" />
      <div className="flex gap-2 flex-wrap">
        {previews.map((src, i) => <img key={i} src={src} className="w-20 h-20 object-cover rounded" />)}
      </div>
      <button 
        onClick={startScan} 
        disabled={loading || previews.length === 0}
        className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:bg-gray-400"
      >
        {loading ? 'AI 正在分析中...' : '开始智能扫描'}
      </button>
    </div>
  );
}
