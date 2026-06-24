'use client';
'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinRoomPage() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleJoinRoom = () => {
  if (!roomId.trim()) return;

  localStorage.setItem("username", username);

  router.push(`/room/${roomId}`);
};

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6">
        <div className="w-full rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
          <h1 className="text-3xl font-bold">Join Room</h1>

          <p className="mt-2 text-zinc-400">
            Enter an existing room and start collaborating.
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Room ID
              </label>

              <input
                type="text"
                placeholder="room-f469xc"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Username
              </label>

              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <button onClick={handleJoinRoom}
              className="w-full rounded-xl bg-blue-600 py-3 font-medium transition hover:bg-blue-700">
              Join Room
            </button>

            <Link
              href="/"
              className="block text-center text-sm text-zinc-400 hover:text-white"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}