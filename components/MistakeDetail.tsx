
import React, { useState } from 'react';
import { ChevronLeft, Trash2, CheckCircle2, Circle, Calendar, Tag, Info, BrainCircuit, ExternalLink, X, BoxSelect } from 'lucide-react';
import { MistakeRecord, Subject } from '../types';

interface MistakeDetailProps {
  mistake: MistakeRecord;
  onBack: () => void;
  onDelete: () => void;
  onToggleReview: () => void;
}

const MistakeDetail: React.FC<MistakeDetailProps> = ({ mistake, onBack, onDelete, onToggleReview }) => {
  const [showImageFull, setShowImageFull] = useState(false);

  const getSubjectColor = (subject: Subject) => {
    switch (subject) {
      case Subject.Math: return 'text-blue-600 bg-blue-50';
      case Subject.Chinese: return 'text-rose-600 bg-rose-50';
      case Subject.English: return 'text-emerald-600 bg-emerald-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const box = mistake.analysis?.boundingBox;

  return (
    <div className="min-h-full bg-slate-50 flex flex-col pb-24 text-left">
      {/* Detail Header */}
      <div className="bg-white px-4 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-30">
        <button onClick={onBack} className="text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-lg font-bold text-slate-900">错题详情</h2>
        </div>
        <button onClick={onDelete} className="text-rose-500 p-2 hover:bg-rose-50 rounded-full transition-colors">
          <Trash2 size={22} />
        </button>
      </div>

      <div className="max-w-2xl mx-auto w-full p-4 space-y-6">
        {/* Original Photo Section */}
        <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getSubjectColor(mistake.subject)}`}>
                {mistake.subject}
              </span>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Calendar size={12} />
                {new Date(mistake.timestamp).toLocaleDateString()}
              </div>
            </div>
            <button 
              onClick={onToggleReview}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                mistake.isReviewed 
                  ? 'bg-green-500 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {mistake.isReviewed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              {mistake.isReviewed ? '已复习' : '未复习'}
            </button>
          </div>
          <div 
            className="relative cursor-zoom-in group bg-slate-50"
            onClick={() => setShowImageFull(true)}
          >
            <img 
              src={mistake.imageUrl} 
              alt="Problem" 
              className="w-full max-h-[500px] object-contain"
            />
            
            {/* Highlight Box in Detail View */}
            {box && (
              <div 
                className="absolute border-2 border-indigo-500 bg-indigo-500/10 pointer-events-none rounded-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                style={{
                  top: `${box[0] / 10}%`,
                  left: `${box[1] / 10}%`,
                  width: `${(box[3] - box[1]) / 10}%`,
                  height: `${(box[2] - box[0]) / 10}%`,
                }}
              >
                <div className="absolute -top-6 left-0 flex items-center gap-1 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-t-md font-bold shadow-md">
                   <BoxSelect size={12} />
                   AI 提取区域
                </div>
              </div>
            )}

            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 shadow-xl">
              <ExternalLink size={16} />
              查看全图
            </div>
          </div>
        </section>

        {/* AI Analysis Sections */}
        {mistake.analysis && (
          <div className="space-y-4">
            {/* Question Text */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-1 opacity-[0.03]">
                 <BrainCircuit size={120} />
               </div>
               <h3 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
                 <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                 题目文本
               </h3>
               <p className="text-slate-700 leading-relaxed text-base bg-slate-50 p-5 rounded-2xl border border-slate-100 font-medium">
                 {mistake.analysis.questionText}
               </p>
            </div>

            {/* Answer & Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
                  参考答案
                </h3>
                <div className="text-green-700 font-bold text-xl bg-green-50 p-4 rounded-2xl border border-green-100 shadow-inner">
                  {mistake.analysis.correctAnswer}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                  难度系数
                </h3>
                <div className="flex items-center">
                  <span className={`px-5 py-2.5 rounded-2xl font-black text-xl shadow-sm ${
                    mistake.analysis.difficulty === '容易' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' :
                    mistake.analysis.difficulty === '中等' ? 'text-amber-600 bg-amber-50 border border-amber-100' :
                    'text-rose-600 bg-rose-50 border border-rose-100'
                  }`}>
                    {mistake.analysis.difficulty}
                  </span>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                错题精讲
              </h3>
              <div className="text-slate-700 leading-loose text-base bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100/50">
                {mistake.analysis.explanation.split('\n').map((line, i) => (
                  <p key={i} className="mb-3 last:mb-0">{line}</p>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                <Tag size={16} className="text-slate-400" />
                {mistake.analysis.tags.map((tag, i) => (
                  <span key={i} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Image Overlay */}
      {showImageFull && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowImageFull(false)}
        >
          <button className="absolute top-6 right-6 text-white p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
            <X size={28} />
          </button>
          <div className="relative max-w-full max-h-full">
            <img 
              src={mistake.imageUrl} 
              alt="Full view" 
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
            />
            {box && (
              <div 
                className="absolute border-4 border-indigo-400 bg-indigo-500/10 pointer-events-none rounded-md"
                style={{
                  top: `${box[0] / 10}%`,
                  left: `${box[1] / 10}%`,
                  width: `${(box[3] - box[1]) / 10}%`,
                  height: `${(box[2] - box[0]) / 10}%`,
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MistakeDetail;
