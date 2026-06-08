'use client';
import Link from 'next/link';
import React from 'react';

export default function Home() {
  return (
    <div style={{ padding: 40, fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Collaborative Code Editor</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Start a new realtime room or join an existing one.</p>

      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/create-room">
          <button style={{ padding: '10px 16px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Create New Room
          </button>
        </Link>

        <Link href="/join-room">
          <button style={{ padding: '10px 16px', background: '#e2e8f0', color: '#111827', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Join Existing Room
          </button>
        </Link>
      </div>
    </div>
  );
}