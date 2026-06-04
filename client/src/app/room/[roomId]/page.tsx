'use client';
import dynamic from 'next/dynamic';

// Force Next.js to load your Editor component completely on the client-side (ssr: false)
const EditorComponent = dynamic(() => import('./EditorComponent'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100vh', backgroundColor: '#1e1e1e', color: '#fff', padding: '20px' }}>
      Loading Collaborative Architecture Matrix...
    </div>
  ),
});

export default function RoomPage() {
  return <EditorComponent />;
}