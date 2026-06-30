"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex justify-end gap-4 p-6">
        {user ? (
          <>
            <span className="flex items-center text-zinc-300">
              Hi, {user.username}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-zinc-700 px-4 py-2 transition hover:bg-zinc-900"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg border border-zinc-700 px-4 py-2 transition hover:bg-zinc-900"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 transition hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl">
          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400">
            Real-Time Collaborative Development
          </span>

          <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
            Collaborative
            <span className="text-blue-500"> Code Editor</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 md:text-xl">
            Build, edit, and collaborate in real-time using Monaco Editor,
            Yjs CRDT synchronization, and modern web technologies.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/create-room"
              className="rounded-xl bg-blue-600 px-8 py-4 font-medium transition hover:bg-blue-700"
            >
              Create Room
            </Link>

            <Link
              href="/join-room"
              className="rounded-xl border border-zinc-700 px-8 py-4 font-medium transition hover:bg-zinc-900"
            >
              Join Room
            </Link>
          </div>
        </div>

        <div className="mt-24 grid w-full max-w-6xl gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-2 font-semibold">⚡ Real-Time Sync</h3>
            <p className="text-sm text-zinc-400">
              Instant collaborative editing powered by CRDTs.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-2 font-semibold">📝 Monaco Editor</h3>
            <p className="text-sm text-zinc-400">
              VS Code-like editing experience in the browser.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-2 font-semibold">👥 Multi-User Rooms</h3>
            <p className="text-sm text-zinc-400">
              Invite teammates and code together seamlessly.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-2 font-semibold">🔄 Yjs Powered</h3>
            <p className="text-sm text-zinc-400">
              Conflict-free synchronization and state management.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}