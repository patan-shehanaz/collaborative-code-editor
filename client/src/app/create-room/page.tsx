'use client';
import { useRouter } from "next/navigation";
import { generateRoomId } from "@/lib/generateRoomId";
import Link from "next/link";

export default function CreateRoomPage() {
    const router = useRouter();
    const handleCreateRoom = () => {
        const roomId = generateRoomId();

        router.push(`/room/${roomId}`);
    };
    return (
        <main className="min-h-screen bg-black text-white">
            <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6">
                <div className="w-full rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
                    <h1 className="text-3xl font-bold">Create Room</h1>

                    <p className="mt-2 text-zinc-400">
                        Create a new collaborative coding workspace.
                    </p>

                    <div className="mt-8 space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-300">
                                Room Name
                            </label>

                            <input
                                type="text"
                                placeholder="My Awesome Project"
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none transition focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-300">
                                Programming Language
                            </label>

                            <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none transition focus:border-blue-500">
                                <option>JavaScript</option>
                                <option>TypeScript</option>
                                <option>Python</option>
                                <option>Java</option>
                                <option>C++</option>
                                <option>Go</option>
                            </select>
                        </div>

                        <button
                            onClick={handleCreateRoom}
                            className="..."
                        >
                            Create Room
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