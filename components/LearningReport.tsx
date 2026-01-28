
import React, { useState, useEffect } from 'react';
// Added CheckCircle2 to the imports from lucide-react
import { ChevronLeft, BarChart3, Loader2, Target, Lightbulb, AlertCircle, TrendingUp, BookOpen, Sparkles, Trophy, Award, Medal, Flame, Compass, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    { id: '2', title: '坚持不懈', desc: '学习连击达到 3 天', icon: <Flame />, unlocked: (stats?.streak || 0) >= 3 },
    { id: '3', title: '复习能手', desc: '复习 5 道错题', icon: <Award />, unlocked: mistakes.filter(m => m.isReviewed).length >= 5 },
    { id: '4', title: '学霸之路', desc: '等级达到 Lv.5', icon: <Trophy />, unlocked: (stats?.level || 0) >= 5 },
  ];

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 min-h-[60vh]">
      <div className="relative mb-6">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-pulse" size={20} />
      </div>
      <p className="text-slate-500 font-bold animate-pulse">正在为嘟嘟生成专属成长周报...</p>
    </div>
  );

  return (
    <div className="min-h-full bg-slate-50 flex flex-col pb-32 text-left">
      <div className="bg-white px-4 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <button onClick={onBack} className="text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-black text-slate-900">嘟嘟的成长报告</h2>
          <p className="text-[10px] text-indigo-600 font-black tracking-widest uppercase">Growth Report Card</p>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8">
        {/* Growth Hero Card */}
        <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-[32px] bg-white/20 backdrop-blur-xl border-4 border-white/30 flex flex-col items-center justify-center shadow-inner group transition-transform hover:scale-105">
                 <span className="text-xs font-black uppercase opacity-70">等级</span>
                 <span className="text-5xl font-black tracking-tighter">{stats?.level}</span>
                 <div className="absolute -top-3 -right-3 bg-amber-400 text-slate-900 p-2 rounded-xl shadow-lg animate-bounce">
                    <Trophy size={20} />
                 </div>
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full border border-white/20 mb-3">
                <Compass size={16} className="text-amber-300" />
                <span className="text-xs font-bold tracking-wide uppercase">当前段位：{analysis?.overallLevel || '学习先锋'}</span>
              </div>
              <h3 className="text-3xl font-black mb-3 leading-tight">累计经验值：{stats ? stats.level * 200 + stats.xp : 0}</h3>
              <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-90 max-w-lg">
                嘟嘟，你在本阶段的表现非常出色！已经超过了全站 <span className="text-amber-300 font-black">92%</span> 的小朋友，继续加油哦！
              </p>
            </div>
          </div>
        </section>

        {/* AI Detailed Analysis Section */}
        {analysis && (
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                 <Sparkles size={24} className="text-amber-500" />
                 AI 导师复盘
               </h3>
               <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  基于最近 {mistakes.length} 道错题分析
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary Card */}
              <div className="lg:col-span-1 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative group hover:border-indigo-300 transition-all">
                <div className="bg-rose-50 text-rose-500 p-3 rounded-2xl w-fit mb-6">
                  <Heart size={28} fill="currentColor" />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-4">学习现状</h4>
                <p className="text-slate-600 leading-relaxed text-sm font-medium">
                  {analysis.summary}
                </p>
                <div className="absolute bottom-4 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp size={80} />
                </div>
              </div>

              {/* Tutoring Suggestions List */}
              <div className="lg:col-span-2 space-y-4">
                {analysis.weakPoints.map((point, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-12 ${
                        idx % 2 === 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {idx % 2 === 0 ? <Target size={24} /> : <Lightbulb size={24} />}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-2">
                           <h5 className="font-black text-slate-900 text-lg">
                             薄弱知识：{point.topic}
                           </h5>
                           <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                             出现 {point.count} 次
                           </span>
                        </div>
                        <p className="text-slate-500 text-sm mb-4 leading-relaxed font-medium">
                          {point.description}
                        </p>
                        
                        {/* Parent-Friendly Suggestions */}
                        <div className={`p-5 rounded-2xl border flex gap-4 items-start ${
                          idx % 2 === 0 ? 'bg-indigo-50/50 border-indigo-100' : 'bg-emerald-50/50 border-emerald-100'
                        }`}>
                          <div className={`p-2 rounded-xl flex-shrink-0 ${
                            idx % 2 === 0 ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                          }`}>
                            <BookOpen size={16} />
                          </div>
                          <div className="text-left">
                            <span className={`text-[10px] font-black uppercase mb-1 block ${
                              idx % 2 === 0 ? 'text-indigo-600' : 'text-emerald-600'
                            }`}>
                              导师辅导建议
                            </span>
                            <p className="text-slate-700 text-sm font-bold leading-relaxed">
                              {point.suggestion}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Achievement Wall */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Award size={24} className="text-amber-500" />
              荣誉勋章墙
            </h3>
            <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
               查看全部 <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((ach) => (
              <div 
                key={ach.id} 
                className={`group p-6 rounded-[32px] border-2 transition-all flex flex-col items-center text-center gap-3 relative overflow-hidden ${
                  ach.unlocked 
                    ? 'bg-white border-amber-200 shadow-sm hover:shadow-xl hover:-translate-y-1' 
                    : 'bg-slate-100 border-slate-200 grayscale opacity-40'
                }`}
              >
                {ach.unlocked && (
                  <div className="absolute top-0 right-0 p-1 opacity-[0.05] pointer-events-none">
                    <Sparkles size={64} />
                  </div>
                )}
                <div className={`p-4 rounded-3xl transition-transform group-hover:scale-110 ${
                  ach.unlocked ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg' : 'bg-slate-200 text-slate-400'
                }`}>
                  {React.cloneElement(ach.icon as React.ReactElement, { size: 32 })}
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-800 mb-1">{ach.title}</h4>
                  <p className="text-[10px] text-slate-400 font-bold leading-tight">{ach.desc}</p>
                </div>
                {ach.unlocked && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-600 rounded text-[9px] font-black uppercase tracking-tighter">
                    <CheckCircle2 size={10} /> 已解锁
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Closing Encouragement */}
        <div className="pt-8 pb-12 flex flex-col items-center justify-center text-slate-300">
          <div className="w-16 h-1 bg-slate-200 rounded-full mb-8"></div>
          <p className="text-sm font-black tracking-[0.2em] text-center uppercase opacity-50">
            每一处错题，都是通往满分的阶梯
          </p>
        </div>
      </div>
    </div>
  );
};

export default LearningReport;
