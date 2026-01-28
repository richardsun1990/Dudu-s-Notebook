
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Printer, Eye, EyeOff, CheckCircle2, Award, BookOpen, ImageIcon, Image as LucideImage, X, ZoomIn, Move, Check, Crop } from 'lucide-react';
import { MistakeRecord, AIAnalysis } from '../types';

interface TestPaperProps {
  items: MistakeRecord[];
  onBack: () => void;
  onUpdateMistake?: (updated: MistakeRecord) => void;
}

// 区域调整对话框
const RegionAdjuster: React.FC<{ 
  item: MistakeRecord; 
  onClose: () => void; 
  onSave: (newBox: [number, number, number, number]) => void;
}> = ({ item, onClose, onSave }) => {
  const [box, setBox] = useState<[number, number, number, number]>(
    item.analysis?.boundingBox || [200, 200, 800, 800]
  );
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState<'move' | 'br' | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0, boxStart: [...box] });

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, type: 'move' | 'br') => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(type);
    setStartPos({ x: clientX, y: clientY, boxStart: [...box] });
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !imageRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const rect = imageRef.current.getBoundingClientRect();
    const dx = ((clientX - startPos.x) / rect.width) * 1000;
    const dy = ((clientY - startPos.y) / rect.height) * 1000;

    let [ymin, xmin, ymax, xmax] = startPos.boxStart;

    if (isDragging === 'move') {
      const w = xmax - xmin;
      const h = ymax - ymin;
      xmin = Math.max(0, Math.min(1000 - w, xmin + dx));
      ymin = Math.max(0, Math.min(1000 - h, ymin + dy));
      xmax = xmin + w;
      ymax = ymin + h;
    } else if (isDragging === 'br') {
      xmax = Math.max(xmin + 50, Math.min(1000, xmax + dx));
      ymax = Math.max(ymin + 50, Math.min(1000, ymax + dy));
    }

    setBox([ymin, xmin, ymax, xmax]);
  };

  const handleMouseUp = () => setIsDragging(null);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex flex-col p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6 text-white max-w-4xl mx-auto w-full">
        <div className="text-left">
          <h3 className="text-xl font-bold">精细调整题目区域</h3>
          <p className="text-xs text-white/60">拖拽选框移动位置，拖拽右下角缩放区域</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <div className="relative inline-block shadow-2xl border border-white/10 select-none">
          <img 
            ref={imageRef}
            src={item.imageUrl} 
            alt="Adjust" 
            className="max-w-full max-h-[70vh] object-contain block pointer-events-none"
            onDragStart={(e) => e.preventDefault()}
          />
          
          {/* Interactive Overlay - Sized exactly to the image content */}
          <div 
            className="absolute border-2 border-indigo-400 bg-indigo-500/20 cursor-move group"
            style={{
              top: `${box[0] / 10}%`,
              left: `${box[1] / 10}%`,
              width: `${(box[3] - box[1]) / 10}%`,
              height: `${(box[2] - box[0]) / 10}%`,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
            onTouchStart={(e) => handleMouseDown(e, 'move')}
          >
            {/* Corner Handle */}
            <div 
              className="absolute -bottom-4 -right-4 w-10 h-10 bg-indigo-500 border-4 border-white rounded-full cursor-nwse-resize shadow-xl flex items-center justify-center text-white z-20"
              onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'br'); }}
              onTouchStart={(e) => { e.stopPropagation(); handleMouseDown(e, 'br'); }}
            >
              <Crop size={18} />
            </div>
            
            <div className="absolute top-2 left-2 bg-indigo-600 text-[10px] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider opacity-100 shadow-sm">
              提取区域
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4 max-w-md mx-auto w-full">
        <button 
          onClick={onClose}
          className="flex-1 py-4 px-6 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all"
        >
          取消
        </button>
        <button 
          onClick={() => onSave(box)}
          className="flex-1 py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Check size={20} />
          保存修改
        </button>
      </div>
    </div>
  );
};

// 智能裁剪组件
const CroppedQuestionImage: React.FC<{ 
  imageUrl: string; 
  box?: [number, number, number, number]; 
  onZoom: (url: string) => void;
  onAdjust?: () => void;
}> = ({ imageUrl, box, onZoom, onAdjust }) => {
  if (!box || box.length !== 4) {
    return (
      <div className="relative group">
        <img 
          src={imageUrl} 
          alt="Question" 
          className="w-full rounded-2xl border border-slate-200 shadow-sm"
        />
        {onAdjust && (
          <button 
            onClick={onAdjust}
            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity no-print"
          >
            <Move size={18} />
          </button>
        )}
      </div>
    );
  }

  const [ymin, xmin, ymax, xmax] = box;
  const w = xmax - xmin;
  const h = ymax - ymin;
  const aspectRatio = w / h;

  return (
    <div className="relative group/crop max-w-2xl no-print">
      <div 
        className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 shadow-sm transition-colors hover:border-indigo-300"
        style={{ width: '100%', aspectRatio: `${aspectRatio}` }}
      >
        <img
          src={imageUrl}
          alt="Cropped Question"
          className="absolute max-w-none"
          style={{
            width: `${(1000 / w) * 100}%`,
            height: `${(1000 / h) * 100}%`,
            top: `-${(ymin / h) * 100}%`,
            left: `-${(xmin / w) * 100}%`,
            objectFit: 'fill' // Force mapping between source percentages and target percentages
          }}
        />
        
        {/* 悬浮工具栏 */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/crop:opacity-100 transition-opacity no-print">
          {onAdjust && (
            <button 
              onClick={onAdjust}
              className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
              title="调整裁剪区域"
            >
              <Move size={16} />
            </button>
          )}
          <button 
            onClick={() => onZoom(imageUrl)}
            className="p-1.5 bg-black/50 backdrop-blur-md text-white rounded-lg hover:bg-black/70 transition-colors"
            title="查看完整原图"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-slate-400 font-medium italic no-print text-right">可点击蓝色图标手动微调裁剪区域</p>
    </div>
  );
};

const TestPaper: React.FC<TestPaperProps> = ({ items, onBack, onUpdateMistake }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [showImages, setShowImages] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<MistakeRecord | null>(null);

  const handleSaveBox = (newBox: [number, number, number, number]) => {
    if (adjustingItem && onUpdateMistake) {
      const updatedAnalysis: AIAnalysis = {
        ...adjustingItem.analysis!,
        boundingBox: newBox
      };
      onUpdateMistake({
        ...adjustingItem,
        analysis: updatedAnalysis
      });
    }
    setAdjustingItem(null);
  };

  return (
    <div className="min-h-full bg-white flex flex-col pb-32">
      {/* Paper Header */}
      <div className="bg-white px-4 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-30 no-print shadow-sm">
        <button onClick={onBack} className="text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900 text-center">个性化错题练习卷</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">共 {items.length} 道题</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="text-indigo-600 p-2 hover:bg-indigo-50 rounded-full transition-colors"
          title="打印试卷"
        >
          <Printer size={22} />
        </button>
      </div>

      {/* Control Panel */}
      <div className="max-w-3xl mx-auto w-full px-6 pt-6 no-print">
        <div className="bg-slate-50 rounded-2xl p-2 flex gap-2">
          <button 
            onClick={() => setShowImages(!showImages)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-sm transition-all ${
              showImages ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ImageIcon size={18} />
            {showImages ? '显示定位图示' : '纯净文字模式'}
          </button>
          <button 
            onClick={() => setShowAnswers(!showAnswers)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-sm transition-all ${
              showAnswers ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {showAnswers ? <EyeOff size={18} /> : <Eye size={18} />}
            {showAnswers ? '隐藏答案' : '显示答案'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full p-6 space-y-12 print:p-0">
        {/* Student Info Box */}
        <div className="border-2 border-slate-100 rounded-2xl p-6 flex flex-wrap gap-8 text-sm font-medium text-slate-500 print:rounded-none print:border-slate-200">
          <div className="flex gap-2"><span>姓名:</span> <div className="w-24 border-b border-slate-300"></div></div>
          <div className="flex gap-2"><span>日期:</span> <div className="w-32 border-b border-slate-300"></div></div>
          <div className="flex gap-2"><span>得分:</span> <div className="w-16 border-b border-slate-300"></div></div>
        </div>

        {/* Questions List */}
        <div className="space-y-16">
          {items.map((item, index) => (
            <div key={item.id} className="relative group text-left">
              <div className="flex gap-4 items-start mb-6">
                <span className="w-8 h-8 flex-shrink-0 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </span>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-2 no-print">
                     <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">
                       {item.subject}
                     </span>
                  </div>
                  <p className="text-xl text-slate-800 leading-relaxed font-medium whitespace-pre-wrap text-left">
                    {item.analysis?.questionText.replace('[包含图示]', '').trim()}
                  </p>
                </div>
              </div>

              {/* 智能裁剪图示区域 */}
              {showImages && item.imageUrl && (
                <div className="ml-12 mb-8">
                  <CroppedQuestionImage 
                    imageUrl={item.imageUrl} 
                    box={item.analysis?.boundingBox} 
                    onZoom={setPreviewImage}
                    onAdjust={() => setAdjustingItem(item)}
                  />
                </div>
              )}

              {/* 答题区 */}
              <div className="ml-12 h-32 border-2 border-dashed border-slate-100 rounded-3xl mb-4 flex items-center justify-center text-slate-300 text-sm italic print:border-slate-200">
                答题区域
              </div>

              {/* 答案区 */}
              {showAnswers && item.analysis && (
                <div className="ml-12 mt-4 bg-indigo-50 border border-indigo-100 rounded-3xl p-6 animate-in fade-in slide-in-from-top-2 duration-300 print:bg-white print:border-slate-200 print:shadow-none text-left">
                  <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold">
                    <CheckCircle2 size={18} />
                    <span>正确答案:</span>
                  </div>
                  <p className="text-indigo-900 font-bold text-lg mb-4 text-left">{item.analysis.correctAnswer}</p>
                  
                  <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold">
                    <BookOpen size={18} />
                    <span>解析:</span>
                  </div>
                  <p className="text-indigo-800/80 text-sm leading-relaxed text-left">{item.analysis.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Closing Decoration */}
        <div className="pt-20 pb-10 flex flex-col items-center justify-center text-slate-200 print:pt-10">
          <Award size={48} className="mb-4" />
          <p className="text-sm font-bold tracking-widest text-center">好好学习 · 天天向上</p>
        </div>
      </div>

      {/* Image Preview Overlay */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 no-print"
          onClick={() => setPreviewImage(null)}
        >
          <button className="absolute top-6 right-6 text-white p-2 bg-white/10 rounded-full hover:bg-white/20">
            <X size={24} />
          </button>
          <img 
            src={previewImage} 
            alt="Full Preview" 
            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
          />
        </div>
      )}

      {/* Manual Region Adjuster */}
      {adjustingItem && (
        <RegionAdjuster 
          item={adjustingItem}
          onClose={() => setAdjustingItem(null)}
          onSave={handleSaveBox}
        />
      )}

      <style>{`
        @media print {
          .no-print, button, nav, .fixed { display: none !important; }
          body { background: white; margin: 0; padding: 0; }
          .max-w-3xl { max-width: 100% !important; margin: 0 !important; width: 100% !important; padding: 20px !important; }
          .border-dashed { border-style: solid !important; border-width: 1px !important; }
          .bg-indigo-50 { background-color: white !important; }
          .shadow-sm, .shadow-md, .shadow-2xl { box-shadow: none !important; }
          .rounded-2xl { border-radius: 8px !important; }
          img { break-inside: avoid; }
          .relative { position: relative !important; }
          .text-left { text-align: left !important; }
        }
      `}</style>
    </div>
  );
};

export default TestPaper;
