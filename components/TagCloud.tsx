
import React from 'react';
import { Subject } from '../types';
import { Check } from 'lucide-react';

interface TagCloudProps {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  subject: Subject;
}

const TagCloud: React.FC<TagCloudProps> = ({ tags, selectedTags, onToggleTag, subject }) => {
  const getSubjectColors = (sub: Subject) => {
    switch (sub) {
      case Subject.Math: return { active: 'bg-blue-500 text-white border-blue-600', inactive: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-200' };
      case Subject.Chinese: return { active: 'bg-rose-500 text-white border-rose-600', inactive: 'bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-200' };
      case Subject.English: return { active: 'bg-emerald-500 text-white border-emerald-600', inactive: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-200' };
      default: return { active: 'bg-slate-700 text-white border-slate-800', inactive: 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300' };
    }
  };

  const colors = getSubjectColors(subject);

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 no-scrollbar px-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggleTag(tag)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold border-2 transition-all whitespace-nowrap active:scale-95 ${
              isSelected ? colors.active : colors.inactive
            }`}
          >
            {isSelected && <Check size={12} className="animate-in zoom-in" />}
            {tag}
          </button>
        );
      })}
    </div>
  );
};

export default TagCloud;
