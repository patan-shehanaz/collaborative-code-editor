'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const username = params?.get('username') || 'Anonymous';
  const roomName = params?.get('roomName') || '';
  const language = params?.get('language') || '';
  const roomPassword = params?.get('roomPassword') || '';

  const members = [username];

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: '25%', borderRight: '1px solid #e5e7eb', padding: 16, boxSizing: 'border-box' }}>
        <h3 style={{ marginBottom: 8 }}>Active Members</h3>
        <ul>
          {members.map((m, i) => (
            <li key={i} style={{ padding: '6px 0' }}>{m}</li>
          ))}
        </ul>

        <div style={{ marginTop: 20 }}>
          <h4>Room Details</h4>
          <div>Room: {roomName || '(unnamed)'}</div>
          <div>Language: {language || 'unspecified'}</div>
          {roomPassword && <div>Password: •••••</div>}
        </div>
      </aside>

      <main style={{ width: '75%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>{children}</div>

        <footer style={{ height: 36, borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 12px', background: '#fafafa' }}>
          <div style={{ fontSize: 12, color: '#374151' }}>Status: Local CRDT instance active</div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>User: {username}</div>
        </footer>
      </main>
    </div>
  );
}
