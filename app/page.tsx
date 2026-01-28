'use client';
import React from 'react';
import GamificationHeader from '../components/GamificationHeader';
import ImageUploader from '../components/ImageUploader';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FE]">
      {/* 恢复你原本的紫色导航栏 */}
      <GamificationHeader />
      
      <main className="max-w-4xl mx-auto p-4 pt-24">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-purple-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
            智能拍照录入
          </h2>
          {/* 引用拍照录入组件 */}
          <ImageUploader onResult={(data) => console.log(data)} subject="数学" />
        </div>
      </main>
    </div>
  );
}
