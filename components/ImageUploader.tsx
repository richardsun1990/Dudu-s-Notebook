'use client';
import React, { useState } from 'react';

export default function ImageUploader({ onResult, subject }: any) {
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
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: previews, systemPrompt: `请识别小学${subject}题目` })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onResult(data.text);
      alert('分析完成！请查看控制台。');
    } catch (err: any) {
      alert("错误: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <input type="file" multiple accept="image/*" onChange={handleUpload} />
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {previews.map((src, i) => <img key={i} src={src} style={{ width: '80px', height: '80px', borderRadius: '8px' }} />)}
      </div>
      <button 
        onClick={startScan} 
        disabled={loading || previews.length === 0}
        style={{ padding: '12px', backgroundColor: loading ? '#ccc' : '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        {loading ? 'AI 正在努力分析...' : '开始智能扫描'}
      </button>
    </div>
  );
}
