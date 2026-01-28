
import React, { useState, useRef, useEffect } from 'react';
import { MistakeRecord, Subject } from '../types';
import { CheckCircle2, Circle, Clock, ImageOff, Check, BoxSelect, Star, Sparkles, Trash2 } from 'lucide-react';

interface MistakeCardProps {
  mistake: MistakeRecord;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onClick: () => void;
  onToggleReview: () => void;
  onDelete?: () => void;
}

const MistakeCard: React.FC<MistakeCardProps> = ({ 
  mistake, 
  isSelectionMode = false, 
  isSelected = false, 
  onClick, 
  onToggleReview,
  onDelete
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgAspectRatio, setImgAspectRatio] = useState<number | null>(null);

  const formatDate = (ts: number) => {
    const date = new Date(ts);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getSubjectStyles = (subject: Subject) => {
    switch (subject) {
      case Subject.Math: return 'text-blue-600 bg-blue-50';
      case Subject.Chinese: return 'text-rose-600 bg-rose-50';
      case Subject.English: return 'text-emerald-600 bg-emerald-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case '容易': return 'text-green-500';
      case '中等': return 'text-amber-500';
      case '困难': return 'text-rose-500';
      default: return 'text-slate-400';
    }
  };

  const box = mistake.analysis?.boundingBox;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgAspectRatio(img.naturalWidth / img.naturalHeight);
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mistake.isReviewed) {
      onDelete?.();
    } else {
      onToggleReview();
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`group bg-white rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer relative ${
        isSelected 
          ? 'border-indigo-500 ring-4 ring-indigo-100 shadow-lg' 
          : isSelectionMode ? 'border-slate-200 opacity-80' : 'border-slate-200 hover:shadow-2xl hover:border-indigo-200'
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 flex items-center justify-center">
        {!imgError ? (
          <div 
            className="relative transition-transform duration-700 w-full h-full"
            style={imgAspectRatio ? { width: imgAspectRatio > 4/3 ? '100%' : `${(imgAspectRatio / (4/3)) * 100}%`, height: imgAspectRatio > 4/3 ? `${((4/3) / imgAspectRatio) * 100}%` : '100%' } : { width: '100%', height: '100%' }}
          >
            <img 
              src={mistake.imageUrl} 
              alt="Mistake preview" 
              onLoad={handleImageLoad}
              onError={() => setImgError(true)}
              className="w-full h-full object-fill bg-slate-50"
            />
            
            {/* Bounding Box Highlight Overlay */}
            {box && !isSelectionMode && (
              <div 
                className="absolute border-2 border-indigo-500 bg-indigo-500/10 rounded-sm pointer-events-none z-10 opacity-40 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  top: `${box[0] / 10}%`,
                  left: `${box[1] / 10}%`,
                  width: `${(box[3] - box[1]) / 10}%`,
                  height: `${(box[2] - box[0]) / 10}%`,
                }}
              />
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
            <ImageOff size={40} />
            <span className="text-xs font-medium">图片无法加载</span>
          </div>
        )}
        
        {/* Quick Action Overlay (Only visible on hover in non-selection mode) */}
        {!isSelectionMode && (
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30 pointer-events-none">
             <button 
               onClick={handleAction}
               className={`pointer-events-auto p-3 rounded-full shadow-xl transition-transform active:scale-90 ${
                 mistake.isReviewed 
                   ? 'bg-rose-500 text-white hover:bg-rose-600' 
                   : 'bg-green-500 text-white hover:bg-green-600'
               }`}
             >
               {mistake.isReviewed ? <Trash2 size={24} /> : <Check size={24} />}
             </button>
          </div>
        )}

        {/* Status Badge */}
        {!isSelectionMode && (
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black z-20 flex items-center gap-1 shadow-sm border ${
            mistake.isReviewed 
              ? 'bg-green-500 border-green-400 text-white' 
              : 'bg-white border-indigo-100 text-indigo-600'
          }`}>
            {mistake.isReviewed ? <Check size={12} /> : <Sparkles size={12} />}
            {mistake.isReviewed ? '已掌握' : '攻克中'}
          </div>
        )}

        {/* Selection Checkbox Overlay */}
        {isSelectionMode && (
          <div className={`absolute inset-0 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600/20' : 'bg-transparent'} z-20`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              isSelected ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg' : 'bg-white/50 border-white text-transparent'
            }`}>
              <Check size={24} />
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-2 z-20">
          <span className={`px-3 py-1 rounded-xl text-[10px] font-bold shadow-sm backdrop-blur-md ${getSubjectStyles(mistake.subject)}`}>
            {mistake.subject}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
            <Clock size={12} />
            {formatDate(mistake.timestamp)}
          </div>
          <div className="flex items-center gap-1">
             <Star size={12} className={getDifficultyColor(mistake.analysis?.difficulty || '')} fill="currentColor" />
             <span className={`text-[10px] font-bold ${getDifficultyColor(mistake.analysis?.difficulty || '')}`}>
               {mistake.analysis?.difficulty}
             </span>
          </div>
        </div>
        
        <p className="text-sm text-slate-800 line-clamp-2 font-bold leading-relaxed mb-4 text-left">
          {mistake.analysis?.questionText || '点击查看详情...'}
        </p>
        
        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          {mistake.analysis?.tags.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold border border-slate-100">
              #{tag}
            </span>
          ))}
          {box && (
            <span className="ml-auto flex items-center gap-1 text-[9px] font-bold text-indigo-500/50">
              <BoxSelect size={10} />
              AI 锚点
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MistakeCard;
