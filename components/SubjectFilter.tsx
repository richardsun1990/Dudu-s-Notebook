
import React from 'react';
import { Subject } from '../types';

interface SubjectFilterProps {
  activeSubject: Subject;
  onSubjectChange: (subject: Subject) => void;
}

const SubjectFilter: React.FC<SubjectFilterProps> = ({ activeSubject, onSubjectChange }) => {
  const subjects = [Subject.All, Subject.Math, Subject.Chinese, Subject.English];

  const getSubjectColor = (subject: Subject) => {
    switch (subject) {
      case Subject.Math: return 'bg-blue-500';
      case Subject.Chinese: return 'bg-rose-500';
      case Subject.English: return 'bg-emerald-500';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {subjects.map((s) => (
        <button
          key={s}
          onClick={() => onSubjectChange(s)}
          className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all ${
            activeSubject === s 
              ? `${getSubjectColor(s)} text-white shadow-md scale-105` 
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
};

export default SubjectFilter;
