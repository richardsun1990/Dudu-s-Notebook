
export enum Subject {
  Math = '数学',
  Chinese = '语文',
  English = '英语',
  All = '全部'
}

export interface AIAnalysis {
  questionText: string;
  questionType: string;
  originalAnswer: string;
  correctAnswer: string;
  explanation: string;
  difficulty: '容易' | '中等' | '困难';
  tags: string[];
  sourceImageIndex?: number;
  boundingBox?: [number, number, number, number];
}

export interface DetectedQuestion extends AIAnalysis {
  tempId: string;
  selected: boolean;
}

export interface MistakeRecord {
  id: string;
  timestamp: number;
  subject: Subject;
  imageUrl: string; 
  analysis?: AIAnalysis;
  isReviewed: boolean;
}

export interface WeakPointAnalysis {
  summary: string;
  weakPoints: {
    topic: string;
    description: string;
    count: number;
    suggestion: string;
  }[];
  overallLevel: string;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastActive: number;
  totalMistakes: number;
  reviewedCount: number;
  achievements: string[];
}

export type AppView = 'list' | 'upload' | 'detail' | 'practice' | 'report' | 'achievements';
