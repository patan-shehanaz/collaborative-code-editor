'use client';

// import { MonacoBinding } from 'y-monaco';
import { socket } from "@/lib/socket";
import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';





export default function EditorComponent({
  roomId,
}: {
  roomId: string;
}) {
  const editorRef = useRef<any>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [participants, setParticipants] = useState<
    { socketId: string; username: string }[]
  >([]);

  async function handleEditorDidMount(editor: any) {
    editorRef.current = editor;

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    const ytext = ydoc.getText('monaco-text');
    const { MonacoBinding } = await import('y-monaco');

    new MonacoBinding(
      ytext,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      null
    );


    ydoc.on('update', (update: Uint8Array) => {
      console.log(
        '📦 Encoded Binary CRDT Delta Packet Generated:',
        update
      );
      socket.emit("yjs-update", {
        roomId,
        update: Array.from(update),
      });
    });
  }

  const handleCopyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  const handleRun = async () => {
    console.log("▶ Run clicked");
    setIsRunning(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: editorRef.current?.getValue(),
            language: language,
          }),
        }
      );

      const data = await response.json();

      console.log("✅ Execute Response:", data);

      setOutput(
        data.stdout ||
        data.stderr ||
        data.compile_output ||
        "No output"
      );
      setIsRunning(false);

    } catch (error) {
      console.error("❌ Execute Error:", error);
      setIsRunning(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.username);
    }
  }, []);

  useEffect(() => {
    if (!username) return;

    socket.emit("join-room", {
      roomId,
      username,
    });


    console.log("Joining room:", roomId, username);
  }, [roomId, username]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);

    });
    return () => {
      socket.off("connect");
    };
  }, []);

  useEffect(() => {
    socket.on("room-joined", (data) => {
      setParticipants(data.participants);
      console.log("Room joined:", data);
    });

    return () => {
      socket.off("room-joined");
    };
  }, []);

  useEffect(() => {
    socket.on("participants-update", (data) => {
      console.log("Participants updated:", data);

      setParticipants(data.participants);
    });

    return () => {
      socket.off("participants-update");
    };
  }, []);

  useEffect(() => {
    socket.on("participant-joined", (participant) => {
      console.log("Participant joined:", participant);
    });

    return () => {
      socket.off("participant-joined");
    };
  }, []);

  useEffect(() => {
    socket.on("language-changed", (data) => {
      console.log("Language changed:", data);

      setLanguage(data.language);
    });



    return () => {
      socket.off("language-changed");
    };
  }, []);

  useEffect(() => {
    socket.on("yjs-update", ({ update }) => {
      console.log("📥 Received YJS Update");

      if (!ydocRef.current) return;

      Y.applyUpdate(
        ydocRef.current,
        new Uint8Array(update)
      );
    });

    return () => {
      socket.off("yjs-update");
    };
  }, []);

  useEffect(() => {
    socket.on("yjs-sync-step1", ({ update }) => {
      console.log("📥 Initial YJS Sync");

      if (!ydocRef.current) return;

      Y.applyUpdate(
        ydocRef.current,
        new Uint8Array(update)
      );
    });

    return () => {
      socket.off("yjs-sync-step1");
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
              {participants.length} online
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

          {participants.map((participant) => (
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
                {participant.username[0].toUpperCase()}
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
              onChange={(e) => {
                const newLanguage = e.target.value;

                setLanguage(newLanguage);

                socket.emit("language-change", {
                  roomId,
                  language: newLanguage,
                });
              }}
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
            </select>

            <button
              onClick={handleRun}
              disabled={isRunning}
              style={{
                backgroundColor: "#16a34a",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {isRunning ? "Running..." : "▶ Run"}
            </button>
          </div>

          <Editor
            height="100%"
            theme="vs-dark"
            language={language}
            defaultValue="// Your collaborative masterwork begins here..."
            onMount={handleEditorDidMount}
          />
          <div
            style={{
              backgroundColor: "#111827",
              color: "#d4d4d8",
              padding: "12px",
              borderTop: "1px solid #27272a",
              minHeight: "120px",
              maxHeight: "200px",
              overflowY: "auto",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
            }}
          >
            <div
              style={{
                color: "#22c55e",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Output
            </div>

            {output || "Run code to see output..."}
          </div>
        </div>
      </div>
    </div>
  );
}