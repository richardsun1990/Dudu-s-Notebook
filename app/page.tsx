'use client';
import React from 'react';
import ImageUploader from '../components/ImageUploader';

export default function Home() {
  return (
    <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>嘟嘟错题本</h1>
      {/* 只保留核心的上传组件 */}
      <ImageUploader onResult={(data) => console.log(data)} subject="数学" />
    </main>
  );
}
