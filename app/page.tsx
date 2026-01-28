'use client';
import ImageUploader from '../components/ImageUploader';
import GamificationHeader from '../components/GamificationHeader';

export default function Home() {
  return (
    <main>
      <GamificationHeader />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <ImageUploader onResult={(data) => console.log(data)} subject="数学" />
      </div>
    </main>
  );
}
