'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinRoomPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [error, setError] = useState('');

  function validate() {
    if (!username || username.trim().length < 3) return 'Username must be at least 3 characters';
    if (!roomId || roomId.trim().length < 3) return 'Room ID must be provided';
    return '';
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    setError(v);
    if (v) return;

    // Navigate to room with expected params: username, roomId, roomPassword
    router.push(`/room/${encodeURIComponent(roomId)}?username=${encodeURIComponent(username)}&roomPassword=${encodeURIComponent(roomPassword)}`);
  }

  return (
    <div style={{ padding: 28 }}>
      <h2 style={{ marginBottom: 12 }}>Join Room</h2>
      <form onSubmit={handleJoin} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
        <label>
          Username
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your display name" />
        </label>

        <label>
          Room ID
          <input value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="Enter Room ID" />
        </label>

        <label>
          Room Password (optional)
          <input value={roomPassword} onChange={e => setRoomPassword(e.target.value)} placeholder="If required" />
        </label>

        {error && <div style={{ color: 'red' }}>{error}</div>}

        <div>
          <button type="submit" style={{ padding: '8px 12px' }}>Join Room</button>
        </div>
      </form>
    </div>
  );
}
