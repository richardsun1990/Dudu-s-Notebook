'use client';
import React from 'react';
import ImageUploader from '../components/ImageUploader';

export default function Home() {
  return (
    <main style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '28px', color: '#4F46E5', marginBottom: '30px' }}>嘟嘟错题本 - 智能助手</h1>
      <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <ImageUploader onResult={(data: any) => console.log('AI分析结果:', data)} subject="数学" />
      </div>
    </main>
  );
}
