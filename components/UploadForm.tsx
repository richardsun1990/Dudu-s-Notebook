
import React, { useState, useRef } from 'react';
import { Camera, X, Loader2, Upload, AlertCircle, CheckCircle2, Circle, ListChecks, Plus, Trash2, BoxSelect, Tag, CheckSquare, Square } from 'lucide-react';
import { Subject, MistakeRecord, DetectedQuestion } from '../types';
import { detectAndAnalyzeQuestions } from '../services/geminiService';

interface UploadFormProps {
  onCancel: () => void;
  onSuccess: (mistakes: MistakeRecord[]) => void;
}

// 辅助组件：选题界面的微型切图预览
const QuestionCropPreview: React.FC<{ 
  imageUrl: string; 
  box?: [number, number, number, number];
}> = ({ imageUrl, box }) => {
  if (!box) return null;
  const [ymin, xmin, ymax, xmax] = box;
  const w = xmax - xmin;
  const h = ymax - ymin;
  const aspectRatio = w / (h || 1);

  return (
    <div 
      className="w-full h-32 relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50 mb-3"
      style={{ aspectRatio: `${aspectRatio}` }}
    >
      <img
        src={imageUrl}
        alt="Question Crop"
        className="absolute max-w-none"
        style={{
          width: `${(1000 / w) * 100}%`,
          height: `${(1000 / h) * 100}%`,
          top: `-${(ymin / h) * 100}%`,
          left: `-${(xmin / w) * 100}%`,
          objectFit: 'fill'
        }}
      />
      <div className="absolute top-1 right-1 bg-indigo-600/80 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
        识别区域
      </div>
    </div>
  );
};

const UploadForm: React.FC<UploadFormProps> = ({ onCancel, onSuccess }) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'selecting'>('upload');
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subject.Math);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [detectedQuestions, setDetectedQuestions] = useState<DetectedQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartAnalysis = async () => {
    if (imagePreviews.length === 0) return;
    
    setStep('analyzing');
    setError(null);

    try {
      const base64List = imagePreviews.map(img => img.split(',')[1]);
      const results = await detectAndAnalyzeQuestions(base64List, selectedSubject);
      
      const questionsWithSelection = results.map((r, i) => ({
        ...r,
        tempId: `q-${i}-${Date.now()}`,
        selected: true 
      }));
      
      setDetectedQuestions(questionsWithSelection);
      setStep('selecting');
    } catch (err) {
      console.error(err);
      setError('AI 识别失败。请确保图片清晰。');
      setStep('upload');
    }
  };

  const toggleQuestionSelection = (id: string) => {
    setDetectedQuestions(prev => prev.map(q => 
      q.tempId === id ? { ...q, selected: !q.selected } : q
    ));
  };

  const toggleAll = () => {
    const allSelected = detectedQuestions.every(q => q.selected);
    setDetectedQuestions(prev => prev.map(q => ({ ...q, selected: !allSelected })));
  };

  const handleConfirmSave = () => {
    const selected = detectedQuestions.filter(q => q.selected);
    if (selected.length === 0) {
      setError('请至少勾选一道错题');
      return;
    }

    const newRecords: MistakeRecord[] = selected.map(q => {
      const sourceImg = imagePreviews[q.sourceImageIndex ?? 0] || imagePreviews[0];
      
      return {
        id: `${q.tempId}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        subject: selectedSubject,
        imageUrl: sourceImg,
        isReviewed: false,
        analysis: {
          questionText: q.questionText,
          questionType: q.questionType,
          originalAnswer: q.originalAnswer,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          tags: q.tags,
          boundingBox: q.boundingBox
        }
      };
    });

    onSuccess(newRecords);
  };

  if (step === 'analyzing') {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <div className="w-32 h-32 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="text-indigo-600 animate-pulse" size={40} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">AI 智能识别中...</h2>
        <p className="text-slate-500 max-w-xs text-center">使用 Flash 极速模式，请稍候</p>
      </div>
    );
  }

  if (step === 'selecting') {
    const selectedCount = detectedQuestions.filter(q => q.selected).length;
    const allSelected = detectedQuestions.length > 0 && detectedQuestions.every(q => q.selected);
    
    return (
      <div className="min-h-full bg-slate-50 flex flex-col pb-32 text-left">
        <div className="bg-white px-4 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <button onClick={() => setStep('upload')} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full">
            <X size={24} />
          </button>
          <h2 className="text-lg font-bold text-slate-900">核对并选择题目</h2>
          <button 
            onClick={toggleAll}
            className="flex items-center gap-1.5 text-indigo-600 font-bold text-sm px-3 py-1.5 hover:bg-indigo-50 rounded-xl transition-all"
          >
            {allSelected ? <CheckSquare size={18} /> : <Square size={18} />}
            {allSelected ? '取消全选' : '全选'}
          </button>
        </div>

        <div className="max-w-2xl mx-auto w-full p-4 space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-2 flex items-center gap-3">
             <div className="bg-indigo-600 text-white p-2 rounded-xl">
               <ListChecks size={20} />
             </div>
             <div>
               <p className="text-sm text-indigo-900 font-bold">智能识别完成</p>
               <p className="text-xs text-indigo-700/70">请确认题目文本和切图范围是否准确</p>
             </div>
          </div>

          <div className="space-y-4">
            {detectedQuestions.map((q) => (
              <div 
                key={q.tempId}
                onClick={() => toggleQuestionSelection(q.tempId)}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer bg-white flex gap-4 items-start ${
                  q.selected ? 'border-indigo-500 shadow-md ring-4 ring-indigo-50' : 'border-slate-100 opacity-80 hover:border-slate-300'
                }`}
              >
                <div className={`mt-1 flex-shrink-0 transition-colors ${q.selected ? 'text-indigo-600' : 'text-slate-300'}`}>
                  {q.selected ? <CheckCircle2 size={24} fill="currentColor" className="text-white fill-indigo-600" /> : <Circle size={24} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  {/* 显示题目切图预览 */}
                  <QuestionCropPreview 
                    imageUrl={imagePreviews[q.sourceImageIndex ?? 0]} 
                    box={q.boundingBox} 
                  />
                  
                  <p className="text-slate-800 text-sm font-bold leading-relaxed line-clamp-3 mb-3">
                    {q.questionText}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                     <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold">
                       {q.questionType}
                     </span>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                       q.difficulty === '容易' ? 'bg-green-50 text-green-600' : 
                       q.difficulty === '中等' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                     }`}>
                       {q.difficulty}
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 悬浮确定按钮 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-50 flex justify-center shadow-[0_-8px_24px_rgba(0,0,0,0.05)]">
          <button
            onClick={handleConfirmSave}
            disabled={selectedCount === 0}
            className={`w-full max-w-md py-4 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
              selectedCount > 0 
                ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <CheckCircle2 size={22} />
            确认放入错题本 ({selectedCount})
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 flex flex-col pb-24 text-left">
      <div className="bg-white px-4 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button onClick={onCancel} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full">
          <X size={24} />
        </button>
        <h2 className="text-lg font-bold text-slate-900">拍照录入</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
        <section>
          <label className="block text-sm font-bold text-slate-700 mb-3">选择学科</label>
          <div className="grid grid-cols-3 gap-3">
            {[Subject.Math, Subject.Chinese, Subject.English].map(s => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`py-3 rounded-2xl text-sm font-bold border-2 transition-all ${
                  selectedSubject === s 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-slate-700">题目照片 (支持多张、特写)</label>
            <span className="text-xs text-slate-400">{imagePreviews.length}/5</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {imagePreviews.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
                <img src={img} className="w-full h-full object-cover" alt={`Upload ${idx}`} />
                <button 
                  onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                  className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            
            {imagePreviews.length < 5 && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all bg-white"
              >
                <Plus size={32} />
                <span className="text-[10px] font-bold mt-1">添加照片</span>
              </button>
            )}
          </div>

          {imagePreviews.length === 0 && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-3xl bg-white p-12 text-center cursor-pointer hover:border-indigo-300 transition-colors shadow-sm"
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera size={32} />
              </div>
              <p className="text-slate-600 font-bold">点击拍摄题目</p>
              <p className="text-slate-400 text-xs mt-2">支持连拍多道题目，AI会自动切分</p>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={handleFileChange} 
          />
        </section>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-50 flex justify-center shadow-[0_-8px_24px_rgba(0,0,0,0.05)]">
        <button
          disabled={imagePreviews.length === 0}
          onClick={handleStartAnalysis}
          className={`w-full max-w-md py-4 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 ${
            imagePreviews.length > 0 
              ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          开始智能扫描
        </button>
      </div>
    </div>
  );
};

export default UploadForm;
