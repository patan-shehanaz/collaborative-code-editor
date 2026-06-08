'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const languages = ['javascript', 'typescript', 'python', 'java', 'csharp'];

export default function CreateRoomPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [language, setLanguage] = useState(languages[0]);
  const [error, setError] = useState('');

  function validate() {
    if (!username || username.trim().length < 3) return 'Username must be at least 3 characters';
    if (!roomName || roomName.trim().length < 1) return 'Room name is required';
    if (!language) return 'Language selection is required';
    return '';
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    setError(v);
    if (v) return;

    const roomId = Math.random().toString(36).slice(2, 9);
    // Navigate to room with query params that backend/socket layer commonly expects:
    // username, roomName, language
    router.push(`/room/${roomId}?username=${encodeURIComponent(username)}&roomName=${encodeURIComponent(roomName)}&language=${encodeURIComponent(language)}`);
  }

  return (
    <div style={{ padding: 28 }}>
      <h2 style={{ marginBottom: 12 }}>Create Room</h2>
      <form onSubmit={handleCreate} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
        <label>
          Username
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your display name" />
        </label>

        <label>
          Room Name
          <input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="e.g. Algorithm Jam" />
        </label>

        <label>
          Language
          <select value={language} onChange={e => setLanguage(e.target.value)}>
            {languages.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>

        {error && <div style={{ color: 'red' }}>{error}</div>}

        <div>
          <button type="submit" style={{ padding: '8px 12px' }}>Create Room</button>
        </div>
      </form>
    </div>
  );
}
