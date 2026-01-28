'use client';
import ImageUploader from '../components/ImageUploader';
import GamificationHeader from '../components/GamificationHeader';

export default function Home() {
  const handleResults = (data: any) => {
    console.log('AI 分析成功：', data);
    // 以后可以在这里添加将数据存入数据库的逻辑
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* 引入你现有的顶部组件 */}
      <GamificationHeader />
      
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <section style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#333' }}>拍照录入题目</h2>
          
          {/* 引入你刚才更新的上传组件 */}
          <ImageUploader 
            onResult={handleResults} 
            subject="数学" 
          />
          
        </section>
      </div>
    </main>
  );
}
