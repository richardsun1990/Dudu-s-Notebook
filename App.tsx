
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, LayoutGrid, BookOpen, Settings, Search, Camera, Loader2, ClipboardList, CheckCircle, X, BarChart3, Trophy, Sparkles, Wand2, Filter, Trash2, Target, Hash } from 'lucide-react';
import { Subject, MistakeRecord, AppView, UserStats } from './types';
import { getAllMistakes, saveMistakes, deleteMistakeFromDB, getUserStats, saveUserStats } from './services/storageService';

// Components
import SubjectFilter from './components/SubjectFilter';
import MistakeCard from './components/MistakeCard';
import UploadForm from './components/UploadForm';
import MistakeDetail from './components/MistakeDetail';
import TestPaper from './components/TestPaper';
import LearningReport from './components/LearningReport';
import GamificationHeader from './components/GamificationHeader';
import SmartPracticeDialog from './components/SmartPracticeDialog';
import TagCloud from './components/TagCloud';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('list');
  const [activeSubject, setActiveSubject] = useState<Subject>(Subject.All);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [listTab, setListTab] = useState<'todo' | 'done'>('todo');
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMistake, setSelectedMistake] = useState<MistakeRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Smart Practice State
  const [isSmartBuildOpen, setIsSmartBuildOpen] = useState(false);

  // Game Stats
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 0, level: 1, streak: 0, lastActive: Date.now(), totalMistakes: 0, reviewedCount: 0, achievements: []
  });
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Selection mode for practice
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const [mistakeData, statsData] = await Promise.all([
          getAllMistakes(),
          getUserStats()
        ]);
        setMistakes(mistakeData);
        
        const now = new Date();
        const last = new Date(statsData.lastActive);
        const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 3600 * 24));
        
        let newStreak = statsData.streak;
        if (diffDays === 1) newStreak += 1;
        else if (diffDays > 1) newStreak = 1;
        else if (statsData.streak === 0) newStreak = 1;

        const updatedStats = { ...statsData, streak: newStreak, lastActive: Date.now() };
        setUserStats(updatedStats);
        await saveUserStats(updatedStats);
      } catch (err) {
        console.error("Storage error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Reset tags when subject changes
  useEffect(() => {
    setSelectedTags([]);
  }, [activeSubject]);

  const addXP = async (amount: number) => {
    setUserStats(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      const xpNeeded = prev.level * 200;

      if (newXp >= xpNeeded) {
        newLevel += 1;
        newXp -= xpNeeded;
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }

      const updated = { ...prev, xp: newXp, level: newLevel };
      saveUserStats(updated);
      return updated;
    });
  };

  const handleAddMistakes = async (newMistakes: MistakeRecord[]) => {
    const updatedMistakes = [...newMistakes, ...mistakes];
    setMistakes(updatedMistakes);
    await saveMistakes(newMistakes);
    addXP(newMistakes.length * 10);
    setView('list');
    setListTab('todo');
  };

  const handleUpdateMistake = async (updatedMistake: MistakeRecord) => {
    const original = mistakes.find(m => m.id === updatedMistake.id);
    const updated = mistakes.map(m => m.id === updatedMistake.id ? updatedMistake : m);
    setMistakes(updated);
    await saveMistakes([updatedMistake]);

    if (!original?.isReviewed && updatedMistake.isReviewed) {
      addXP(20);
    }
  };

  const handleToggleReview = async (id: string) => {
    const target = mistakes.find(m => m.id === id);
    if (!target) return;
    const updatedRecord = { ...target, isReviewed: !target.isReviewed };
    handleUpdateMistake(updatedRecord);
  };

  const handleDeleteMistake = async (id: string) => {
    if (window.confirm('确定要删除这条错题吗？')) {
      try {
        await deleteMistakeFromDB(id);
        setMistakes(prev => prev.filter(m => m.id !== id));
        if (selectedMistake?.id === id) setSelectedMistake(null);
        if (view === 'detail') setView('list');
      } catch (err) {
        alert("删除失败");
      }
    }
  };

  const handleDeleteAllDone = async () => {
    const doneMistakes = mistakes.filter(m => m.isReviewed);
    if (doneMistakes.length === 0) return;
    
    if (window.confirm(`确定要清空所有已掌握的 ${doneMistakes.length} 道错题吗？此操作不可撤销。`)) {
      try {
        for (const m of doneMistakes) {
          await deleteMistakeFromDB(m.id);
        }
        setMistakes(prev => prev.filter(m => !m.isReviewed));
      } catch (err) {
        alert("部分错题删除失败");
      }
    }
  };

  const startSmartPractice = (config: { subject: Subject | 'Mixed', count: number, tags?: string[] }) => {
    let candidates = mistakes.filter(m => !m.isReviewed);
    
    // Filter by subject
    if (config.subject !== 'Mixed') {
      candidates = candidates.filter(m => m.subject === config.subject);
    }

    // Filter by tags if provided
    if (config.tags && config.tags.length > 0) {
      candidates = candidates.filter(m => 
        m.analysis?.tags.some(t => config.tags!.includes(t))
      );
    }
    
    // Shuffle and slice
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, config.count);
    
    if (selected.length === 0) {
      alert("没有找到符合条件的题目，试着更换标签或学科。");
      return;
    }

    setSelectedIds(new Set(selected.map(s => s.id)));
    const bonus = config.tags && config.tags.length > 0 ? 50 : 40;
    addXP(bonus);
    setView('practice');
    setIsSmartBuildOpen(false);
  };

  const filteredMistakes = useMemo(() => {
    return mistakes.filter(m => {
      const matchStatus = listTab === 'todo' ? !m.isReviewed : m.isReviewed;
      const matchSubject = activeSubject === Subject.All || m.subject === activeSubject;
      const matchSearch = (m.analysis?.questionText || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchTags = selectedTags.length === 0 || 
        (m.analysis?.tags.some(t => selectedTags.includes(t)) || false);
      
      return matchStatus && matchSubject && matchSearch && matchTags;
    });
  }, [mistakes, activeSubject, selectedTags, searchQuery, listTab]);

  const availableTagsForSubject = useMemo(() => {
    const subjectMistakes = mistakes.filter(m => activeSubject === Subject.All || m.subject === activeSubject);
    const tags = new Set<string>();
    subjectMistakes.forEach(m => {
      m.analysis?.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [mistakes, activeSubject]);

  const showGlobalNav = !isSelectionMode && (view === 'list' || view === 'report');

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header - Fixed with max width for desktop */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm w-full">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('list'); setIsSelectionMode(false); }}>
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform active:scale-95">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight text-left tracking-tight">嘟嘟错题本</h1>
              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest text-left">Learning with Dudu</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {view === 'list' && !isSelectionMode && (
              <button 
                onClick={() => setIsSmartBuildOpen(true)}
                className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full font-bold text-sm hover:bg-indigo-100 transition-colors"
              >
                <Wand2 size={18} />
                <span className="hidden sm:inline">智能组卷</span>
              </button>
            )}
            <button 
              onClick={() => setView('upload')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full font-semibold shadow-md active:scale-95 transition-all hover:bg-indigo-700"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">拍照录入</span>
            </button>
          </div>
        </div>
      </header>

      {/* Game Header - Centered for tablet/desktop */}
      {(view === 'list' || view === 'report') && !isSelectionMode && (
        <div className="sticky top-[65px] z-30 bg-slate-50/80 backdrop-blur-sm w-full">
          <div className="max-w-6xl mx-auto">
            <GamificationHeader stats={userStats} onShowAchievements={() => setView('report')} />
          </div>
        </div>
      )}

      {/* Main Content with dynamic grid scaling */}
      <main className={`flex-1 overflow-auto ${showGlobalNav ? 'pb-24 sm:pb-32' : ''} w-full`}>
        {view === 'list' && (
          <div className="max-w-6xl mx-auto p-4 md:p-8">
            {!isSelectionMode && (
              <div className="mb-8 space-y-6">
                {/* Status Tabs - Compact on mobile, wider on desktop */}
                <div className="flex bg-slate-200/50 p-1 rounded-2xl w-full max-w-sm mx-auto sm:max-w-md">
                  <button 
                    onClick={() => setListTab('todo')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${listTab === 'todo' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    未掌握 ({mistakes.filter(m => !m.isReviewed).length})
                  </button>
                  <button 
                    onClick={() => setListTab('done')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${listTab === 'done' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    已掌握 ({mistakes.filter(m => m.isReviewed).length})
                  </button>
                </div>

                {/* Search - Max width constraint on desktop */}
                <div className="relative group max-w-2xl mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="按题目内容或知识点搜索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm sm:text-base"
                  />
                </div>
                
                {/* Filter Controls */}
                <div className="space-y-6 max-w-4xl mx-auto">
                  <SubjectFilter activeSubject={activeSubject} onSubjectChange={setActiveSubject} />
                  
                  {activeSubject !== Subject.All && availableTagsForSubject.length > 0 && (
                    <div className="animate-in slide-in-from-top-2 duration-300 text-left bg-white/40 p-4 rounded-3xl border border-white/60">
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <Hash size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">知识点过滤</span>
                      </div>
                      <TagCloud 
                        tags={availableTagsForSubject} 
                        selectedTags={selectedTags} 
                        onToggleTag={(tag) => setSelectedTags(prev => 
                          prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                        )} 
                        subject={activeSubject}
                      />
                    </div>
                  )}
                </div>
                
                {/* Section Header */}
                <div className="flex items-center justify-between px-2 pt-2 max-w-6xl mx-auto">
                   <h2 className="font-bold text-slate-800 flex items-center gap-2">
                     <span className="text-lg sm:text-xl">{listTab === 'todo' ? '学习清单' : '成功挑战'}</span>
                     <span className="bg-slate-200/50 px-3 py-1 rounded-full text-xs text-slate-500 font-black">{filteredMistakes.length}</span>
                   </h2>
                   
                   <div className="flex items-center gap-3">
                     {selectedTags.length > 0 && listTab === 'todo' && (
                       <button 
                         onClick={() => startSmartPractice({ subject: activeSubject, count: 5, tags: selectedTags })}
                         className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-black shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
                       >
                         <Target size={16} />
                         针对练习
                       </button>
                     )}
                     
                     {listTab === 'todo' ? (
                       <button 
                         onClick={() => setIsSelectionMode(true)}
                         className="text-indigo-600 text-sm font-bold flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-indigo-100 hover:bg-indigo-50 transition-colors"
                       >
                         <ClipboardList size={18} /> <span className="hidden sm:inline">手动组卷</span>
                       </button>
                     ) : (
                       <button 
                         onClick={handleDeleteAllDone}
                         className="text-rose-500 text-sm font-bold flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-rose-100 hover:bg-rose-50 transition-colors"
                       >
                         <Trash2 size={18} /> <span className="hidden sm:inline">清空历史</span>
                       </button>
                     )}
                   </div>
                </div>
              </div>
            )}

            {/* Selection Mode HUD */}
            {isSelectionMode && (
              <div className="mb-8 bg-slate-900 text-white p-6 rounded-[32px] shadow-2xl flex items-center justify-between animate-in slide-in-from-top duration-300 max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                  <button onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                  <div className="text-left border-l border-white/10 pl-4">
                    <h3 className="font-black text-lg">组卷模式</h3>
                    <p className="text-xs text-slate-400 font-bold">已从错题库中挑选了 <span className="text-indigo-400">{selectedIds.size}</span> 道题</p>
                  </div>
                </div>
                <button 
                  onClick={() => setView('practice')}
                  disabled={selectedIds.size === 0}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  生成练习卷
                </button>
              </div>
            )}

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMistakes.length > 0 ? (
                filteredMistakes.map(mistake => (
                  <MistakeCard 
                    key={mistake.id} 
                    mistake={mistake} 
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedIds.has(mistake.id)}
                    onClick={() => isSelectionMode ? setSelectedIds(prev => {
                      const next = new Set(prev);
                      next.has(mistake.id) ? next.delete(mistake.id) : next.add(mistake.id);
                      return next;
                    }) : (setSelectedMistake(mistake), setView('detail'))}
                    onToggleReview={() => handleToggleReview(mistake.id)}
                    onDelete={() => handleDeleteMistake(mistake.id)}
                  />
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-white/50 border-2 border-dashed border-slate-200 rounded-[40px]">
                  <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <Filter size={40} />
                  </div>
                  <h3 className="text-slate-600 font-black text-xl mb-2">空空如也</h3>
                  <p className="text-slate-400 text-sm">换个学科看看，或者快去拍照录入新错题吧！</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Routing */}
        {view === 'upload' && (
          <div className="max-w-4xl mx-auto">
            <UploadForm onCancel={() => setView('list')} onSuccess={handleAddMistakes} />
          </div>
        )}
        {view === 'detail' && selectedMistake && (
          <div className="max-w-4xl mx-auto">
            <MistakeDetail 
              mistake={selectedMistake} 
              onBack={() => setView('list')}
              onDelete={() => handleDeleteMistake(selectedMistake.id)}
              onToggleReview={() => handleToggleReview(selectedMistake.id)}
            />
          </div>
        )}
        {view === 'practice' && (
          <div className="max-w-5xl mx-auto">
            <TestPaper 
              items={mistakes.filter(m => selectedIds.has(m.id))} 
              onBack={() => { setView('list'); setSelectedIds(new Set()); }} 
              onUpdateMistake={handleUpdateMistake} 
            />
          </div>
        )}
        {view === 'report' && (
          <div className="max-w-4xl mx-auto">
            <LearningReport mistakes={mistakes} onBack={() => setView('list')} />
          </div>
        )}
      </main>

      {/* Level Up Notification */}
      {showLevelUp && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-700 ease-out">
          <div className="bg-slate-900 text-white px-10 py-6 rounded-[32px] shadow-2xl flex items-center gap-6 border-4 border-amber-400 ring-8 ring-indigo-500/20">
            <div className="bg-amber-400 p-3 rounded-2xl text-slate-900 animate-bounce">
              <Trophy size={32} />
            </div>
            <div className="text-left">
              <h4 className="font-black text-2xl tracking-tight">成就达成！</h4>
              <p className="text-amber-400 font-black text-lg">已晋升为等级 Lv.{userStats.level}</p>
            </div>
          </div>
        </div>
      )}

      {/* Smart Practice Dialog */}
      {isSmartBuildOpen && (
        <SmartPracticeDialog 
          onClose={() => setIsSmartBuildOpen(false)}
          onConfirm={startSmartPractice}
          initialSubject={activeSubject === Subject.All ? 'Mixed' : activeSubject}
        />
      )}

      {/* Navigation - Optimized for Thumb and Desktop Hover */}
      {showGlobalNav && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-2xl border border-slate-200/50 py-3 px-10 flex items-center gap-16 sm:gap-24 z-40 shadow-2xl rounded-full ring-1 ring-black/5">
          <button 
            onClick={() => setView('list')} 
            className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${view === 'list' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${view === 'list' ? 'bg-indigo-50' : 'bg-transparent'}`}>
              <LayoutGrid size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">回顾</span>
          </button>
          
          <button 
            onClick={() => setView('upload')} 
            className="flex flex-col items-center gap-1 -mt-4 transition-transform hover:scale-105 active:scale-95"
          >
            <div className="w-16 h-16 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 border-4 border-white">
              <Camera size={28} />
            </div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">录入</span>
          </button>
          
          <button 
            onClick={() => setView('report')} 
            className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${view === 'report' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${view === 'report' ? 'bg-indigo-50' : 'bg-transparent'}`}>
              <Trophy size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">成长</span>
          </button>
        </nav>
      )}
      
      <style>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 24px);
        }
        @media (min-width: 640px) {
          .pb-safe {
            padding-bottom: 32px;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
