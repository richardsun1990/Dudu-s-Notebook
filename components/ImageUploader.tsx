import React, { useState } from 'react';
import { detectAndAnalyzeQuestions } from '../services/geminiService';
import { AIAnalysis } from '../types';

interface Props {
  onAnalysisComplete: (results: AIAnalysis[]) => void;
  subject: string;
}

const ImageUploader: React.FC<Props> = ({ onAnalysisComplete, subject }) => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 处理图片选择并转为 Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 核心：调用后端 API 进行扫描
  const handleStartScan = async () => {
    if (images.length === 0) return alert('请先添加照片');
    
    setLoading(true);
    try {
      // 这里的 detectAndAnalyzeQuestions 内部会请求 /api/analyze
      const results = await detectAndAnalyzeQuestions(images, subject);
      onAnalysisComplete(results);
    } catch (error: any) {
      console.error(error);
      alert('扫描失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-2 border-dashed rounded-lg">
      <input 
        type="file" 
        accept="image/*" 
        multiple 
        onChange={handleImageChange}
        className="mb-4"
      />
      
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {images.map((img, i) => (
          <img key={i} src={img} alt="preview" className="w-20 h-20 object-cover rounded" />
        ))}
      </div>

      <button
        onClick={handleStartScan}
        disabled={loading}
        className={`w-full py-3 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
      >
        {loading ? '智能扫描中...' : '开始智能扫描'}
      </button>
    </div>
  );
};

export default ImageUploader;
