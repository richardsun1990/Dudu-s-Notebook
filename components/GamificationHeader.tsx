
import React from 'react';
import { Flame, Trophy, Star, Zap } from 'lucide-react';
import { UserStats } from '../types';

interface GamificationHeaderProps {
  stats: UserStats;
  onShowAchievements: () => void;
}

const GamificationHeader: React.FC<GamificationHeaderProps> = ({ stats, onShowAchievements }) => {
  const xpForNextLevel = stats.level * 200;
  const progress = Math.min((stats.xp / xpForNextLevel) * 100, 100);

  const getLevelTitle = (level: number) => {
    if (level < 5) return '学习萌新';
    if (level < 10) return '知识先锋';
    if (level < 20) return '错题克星';
    return '学霸之巅';
  };

  return (
    <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm sticky top-[65px] z-20">
      <div className="flex items-center gap-4">
        {/* Level Circle */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-md">
            Lv.{stats.level}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
            <Star size={10} className="text-amber-500 fill-amber-500" />
          </div>
        </div>

        {/* XP Bar */}
        <div className="flex-1 min-w-[120px]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {getLevelTitle(stats.level)}
            </span>
            <span className="text-[10px] font-black text-indigo-600">{stats.xp} / {xpForNextLevel} XP</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Streak */}
        <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
          <Flame size={16} className="text-orange-500 fill-orange-500" />
          <span className="text-sm font-black text-orange-700">{stats.streak}</span>
        </div>

        {/* Achievement Button */}
        <button 
          onClick={onShowAchievements}
          className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors"
        >
          <Trophy size={20} />
        </button>
      </div>
    </div>
  );
};

export default GamificationHeader;
