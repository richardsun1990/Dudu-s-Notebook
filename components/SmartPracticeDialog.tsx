
import React, { useState } from 'react';
import { X, Wand2, Calculator, Languages, BookOpen, Layers, Dices, ChevronRight } from 'lucide-react';
import { Subject } from '../types';

interface SmartPracticeDialogProps {
  onClose: () => void;
  onConfirm: (config: { subject: Subject | 'Mixed', count: number }) => void;
  initialSubject?: Subject | 'Mixed';
}

const SmartPracticeDialog: React.FC<SmartPracticeDialogProps> = ({ onClose, onConfirm, initialSubject = 'Mixed' }) => {
  const [subject, setSubject] = useState<Subject | 'Mixed'>(initialSubject);
  const [count, setCount] = useState(5);

  const options = [
    { id: 'Mixed', name: '全科混合', icon: <Layers className="text-indigo-500" /> },
    { id: Subject.Math, name: '数学专项', icon: <Calculator className="text-blue-500" /> },
    { id: Subject.Chinese, name: '语文专项', icon: <BookOpen className="text-rose-500" /> },
    { id: Subject.English, name: '英语专项', icon: <Languages className="text-emerald-500" /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-4">
            <Wand2 size={32} />
          </div>
          <h2 className="text-2xl font-black mb-2">智能组卷练习</h2>
          <p className="text-indigo-100 text-sm opacity-80">AI 将从你未掌握的错题中智能抽选题型</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Subject Select */}
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">选择练习方向</label>
            <div className="grid grid-cols-2 gap-3">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSubject(opt.id as any)}
                  className={`flex items-center gap-3 p-4 rounded-3xl border-2 transition-all text-left ${
                    subject === opt.id 
                      ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${subject === opt.id ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                    {opt.icon}
                  </div>
                  <span className={`font-bold text-sm ${subject === opt.id ? 'text-indigo-700' : 'text-slate-600'}`}>
                    {opt.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Count Select */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">题目数量</label>
              <span className="text-indigo-600 font-black text-xl">{count} <span className="text-xs">题</span></span>
            </div>
            <div className="flex gap-2">
              {[3, 5, 8, 10].map(c => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`flex-1 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${
                    count === c 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                      : 'bg-white border-slate-100 text-slate-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Action */}
          <button
            onClick={() => onConfirm({ subject, count })}
            className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 group"
          >
            <Dices size={24} className="group-hover:rotate-45 transition-transform" />
            随机生成练习卷
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartPracticeDialog;
