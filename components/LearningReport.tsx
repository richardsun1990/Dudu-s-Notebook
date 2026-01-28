
import React, { useState, useEffect } from 'react';
import { ChevronLeft, BarChart3, Loader2, Target, Lightbulb, AlertCircle, TrendingUp, BookOpen, Sparkles, Trophy, Award, Medal, Flame } from 'lucide-react';
import { MistakeRecord, WeakPointAnalysis, UserStats } from '../types';
import { generateWeakPointAnalysis } from '../services/geminiService';
import { getUserStats } from '../services/storageService';

interface LearningReportProps {
  mistakes: MistakeRecord[];
  onBack: () => void;
}

const LearningReport: React.FC<LearningReportProps> = ({ mistakes, onBack }) => {
  const [analysis, setAnalysis] = useState<WeakPointAnalysis | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [report, s] = await Promise.all([
          mistakes.length > 0 ? generateWeakPointAnalysis(mistakes) : null,
          getUserStats()
        ]);
        setAnalysis(report);
        setStats(s);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [mistakes]);

  const achievements = [
    { id: '1', title: '勤奋小蜜蜂', desc: '累计录入 10 道错题', icon: <Medal />, unlocked: mistakes.length >= 10 },
    // Fix: Added missing 'Flame' icon import from lucide-react to resolve the "Cannot find name 'Flame'" error
    { id: '2', title: '坚持不懈', desc: '学习连击达到 3 天', icon: <Flame />, unlocked: (stats?.streak || 0) >= 3 },
    { id: '3', title: '复习能手', desc: '复习 5 道错题', icon: <Award />, unlocked: mistakes.filter(m => m.isReviewed).length >= 5 },
    { id: '4', title: '学霸之路', desc: '等级达到 Lv.5', icon: <Trophy />, unlocked: (stats?.level || 0) >= 5 },
  ];

  if (isLoading) return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="min-h-full bg-slate-50 flex flex-col pb-24 text-left">
      <div className="bg-white px-4 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-30">
        <button onClick={onBack} className="text-slate-600 p-2 hover:bg-slate-100 rounded-full"><ChevronLeft size={24} /></button>
        <h2 className="text-lg font-bold text-slate-900">成长中心</h2>
        <div className="w-10"></div>
      </div>

      <div className="max-w-2xl mx-auto w-full p-4 space-y-6">
        {/* Growth Stats Card */}
        <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12"><Trophy size={160} /></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/30 flex flex-col items-center justify-center shadow-inner">
               <span className="text-[10px] font-bold uppercase">Level</span>
               <span className="text-3xl font-black">{stats?.level}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">学情战斗力：{stats ? stats.level * 100 + stats.xp : 0}</h3>
              <p className="text-indigo-100 text-sm opacity-80">你已经战胜了 85% 的同级学生！</p>
            </div>
          </div>
        </section>

        {/* Achievement Wall */}
        <section className="space-y-4">
          <h3 className="text-slate-900 font-bold px-2 flex items-center gap-2">
            <Award size={20} className="text-amber-500" />
            荣誉勋章墙
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((ach) => (
              <div 
                key={ach.id} 
                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-2 ${
                  ach.unlocked ? 'bg-white border-amber-200 shadow-sm' : 'bg-slate-100 border-slate-200 grayscale opacity-40'
                }`}
              >
                <div className={`p-3 rounded-2xl ${ach.unlocked ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
                  {React.cloneElement(ach.icon as React.ReactElement, { size: 32 })}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{ach.title}</h4>
                  <p className="text-[10px] text-slate-500">{ach.desc}</p>
                </div>
                {ach.unlocked && <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">已点亮</div>}
              </div>
            ))}
          </div>
        </section>

        {/* AI Analysis (If available) */}
        {analysis && (
          <section className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
             <div className="flex items-center gap-2 text-indigo-600 font-bold">
               <Sparkles size={20} />
               <span>AI 复盘分析</span>
             </div>
             <p className="text-slate-600 text-sm leading-relaxed">{analysis.summary}</p>
             <div className="grid grid-cols-1 gap-3">
               {analysis.weakPoints.slice(0, 2).map((p, i) => (
                 <div key={i} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500">薄弱点：{p.topic}</span>
                 </div>
               ))}
             </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default LearningReport;
