'use client';

import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { io } from 'socket.io-client';

interface Participant {
  socketId: string;
  username: string;
  roomId: string;
}

export default function EditorComponent({
  roomId,
}: {
  roomId: string;
}) {
  const editorRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [participantsList, setParticipantsList] = useState<Participant[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<{
    stdout: string;
    stderr: string;
    compile_output: string;
    exitCode: number;
  } | null>(null);

  // Persistent Yjs Doc and Monaco text representation
  const [ydoc] = useState(() => new Y.Doc());
  const ytext = ydoc.getText('monaco-text');

  const socketRef = useRef<any>(null);
  const bindingRef = useRef<any>(null);
  const [isEditorMounted, setIsEditorMounted] = useState(false);

  const handleRunCode = async () => {
    if (!editorRef.current || isRunning) return;

    setIsRunning(true);
    setRunResult(null);

    const code = editorRef.current.getValue();

    try {
      const response = await fetch("http://localhost:5000/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          code,
        }),
      });

      if (!response.ok) {
        throw new Error(`Execution request failed with status ${response.status}`);
      }

      const result = await response.json();
      setRunResult(result);
    } catch (error: any) {
      console.error(error);
      setRunResult({
        stdout: "",
        stderr: error.message || "Failed to execute code",
        compile_output: "",
        exitCode: -1,
      });
    } finally {
      setIsRunning(false);
    }
  };

  async function handleEditorDidMount(editor: any) {
    editorRef.current = editor;

    // Dynamically import MonacoBinding on the client side to avoid SSR ReferenceErrors
    const { MonacoBinding } = await import('y-monaco');

    // Bind Monaco Editor to Yjs
    const binding = new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      null
    );
    bindingRef.current = binding;
    setIsEditorMounted(true);
  }

  const handleCopyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    const ymap = ydoc.getMap('room-metadata');
    ymap.set('language', newLang);
  };

  useEffect(() => {
    // Only connect socket and join room AFTER Monaco editor is fully mounted and bound
    if (!isEditorMounted) return;

    const savedUsername = localStorage.getItem("username") || "Anonymous";
    setUsername(savedUsername);

    // Safeguard against duplicate connections
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Initialize Socket.IO connection (websocket transport only to prevent reconnect warnings)
    const socket = io("http://localhost:5000", {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO backend');
      socket.emit('join-room', { roomId, username: savedUsername });
    });

    socket.on('participants-updated', (list: Participant[]) => {
      setParticipantsList(list);
    });

    socket.on('yjs-update', (update: ArrayBuffer) => {
      Y.applyUpdate(ydoc, new Uint8Array(update), 'remote');
    });

    socket.on('user-joined', (user: { socketId: string; username: string }) => {
      console.log(`🔔 User joined: ${user.username}`);
    });

    socket.on('user-left', (user: { socketId: string; username: string }) => {
      console.log(`🔔 User left: ${user.username}`);
    });

    const handleYdocUpdate = (update: Uint8Array, origin: any) => {
      if (origin !== 'remote' && socket.connected) {
        socket.emit('yjs-update', update);
      }
    };

    ydoc.on('update', handleYdocUpdate);

    // Room metadata (language) synchronization
    const ymap = ydoc.getMap('room-metadata');
    
    // Set initial language if already present in the shared document
    const initialLang = ymap.get('language') as string;
    if (initialLang) {
      setLanguage(initialLang);
    }

    const handleYmapChange = () => {
      const newLang = ymap.get('language') as string;
      if (newLang) {
        setLanguage(newLang);
      }
    };
    ymap.observe(handleYmapChange);

    return () => {
      socket.disconnect();
      ydoc.off('update', handleYdocUpdate);
      ymap.unobserve(handleYmapChange);
    };
  }, [roomId, ydoc, isEditorMounted]);

  useEffect(() => {
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#1e1e1e',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '12px 18px',
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '12px',
        }}
      >
        <div>
          <h2
            style={{
              color: '#fff',
              fontSize: '20px',
              fontWeight: 'bold',
            }}
          >
            Collaborative Code Editor
          </h2>

          <p
            style={{
              color: '#71717a',
              fontSize: '13px',
              marginTop: '4px',
            }}
          >
            Real-time collaborative workspace
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "999px",
              backgroundColor: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
            }}
          >
            {(username || "A")[0].toUpperCase()}
          </div>

          <div style={{ textAlign: "left" }}>
            <div
              style={{
                color: "#22c55e",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {username || "Anonymous"}
            </div>

            <div
              style={{
                color: "#71717a",
                fontSize: "12px",
              }}
            >
              {participantsList.length === 1 ? "1 online" : `${participantsList.length} online`}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          padding: '10px 16px',
          backgroundColor: '#111827',
          borderRadius: '10px',
        }}
      >
        <div>
          <span style={{ color: "#d4d4d8" }}>
            Room: {roomId}
          </span>

          <span
            style={{
              color: "#71717a",
              fontSize: "12px",
              marginLeft: "10px",
            }}
          >
            Created just now
          </span>
        </div>

        <button
          onClick={handleCopyRoomId}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {copied ? "Copied!" : "Copy Room ID"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          height: "80vh",
        }}
      >
        {/* Participants Panel */}
        {/* Participants Panel */}
        <div
          style={{
            width: "220px",
            backgroundColor: "#18181b",
            borderRadius: "12px",
            padding: "16px",
            border: "1px solid #27272a",
            overflowY: "auto",
          }}
        >
          <h3
            style={{
              color: "#fff",
              marginBottom: "16px",
              fontSize: "16px",
            }}
          >
            Participants
          </h3>

          {participantsList.map((participant) => (
            <div
              key={participant.socketId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "999px",
                  backgroundColor: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {(participant.username || "A")[0].toUpperCase()}
              </div>

              <div>
                <div style={{ color: "#fff" }}>
                  {participant.username}
                </div>

                <div
                  style={{
                    color: "#22c55e",
                    fontSize: "12px",
                  }}
                >
                  Online
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              backgroundColor: "#18181b",
              borderBottom: "1px solid #27272a",
            }}
          >
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              style={{
                backgroundColor: "#27272a",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "8px",
              }}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>

            <button
              onClick={handleRunCode}
              disabled={isRunning}
              style={{
                backgroundColor: isRunning ? "#15803d" : "#16a34a",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                cursor: isRunning ? "not-allowed" : "pointer",
                opacity: isRunning ? 0.7 : 1,
              }}
            >
              {isRunning ? "Running..." : "▶ Run"}
            </button>
          </div>

          <Editor
            height="70%"
            theme="vs-dark"
            language={language}
            defaultValue=""
            onMount={handleEditorDidMount}
          />

          {/* Console Output Panel */}
          <div
            style={{
              height: "30%",
              backgroundColor: "#0c0c0d",
              borderTop: "1px solid #27272a",
              padding: "12px",
              fontFamily: "monospace",
              fontSize: "13px",
              color: "#d4d4d8",
              overflowY: "auto",
            }}
          >
            <div style={{ color: "#71717a", marginBottom: "6px", fontWeight: "bold", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Console Output {isRunning && "(Running...)"}
            </div>
            {runResult ? (
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                {runResult.compile_output && (
                  <div style={{ color: "#f43f5e", marginBottom: "8px" }}>
                    {runResult.compile_output}
                  </div>
                )}
                {runResult.stderr && (
                  <div style={{ color: "#f43f5e" }}>{runResult.stderr}</div>
                )}
                {runResult.stdout && (
                  <div style={{ color: "#22c55e" }}>{runResult.stdout}</div>
                )}
                {!runResult.stdout && !runResult.stderr && !runResult.compile_output && (
                  <div style={{ color: "#a1a1aa" }}>[Program exited with code {runResult.exitCode}]</div>
                )}
              </pre>
            ) : (
              <div style={{ color: "#52525b" }}>Click "▶ Run" to execute your code.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}