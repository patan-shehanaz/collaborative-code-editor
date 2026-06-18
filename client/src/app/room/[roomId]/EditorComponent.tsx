'use client';

import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';


export default function EditorComponent({
  roomId,
}: {
  roomId: string;
}) {
  const editorRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState("");

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('monaco-text');

    ydoc.on('update', (update: Uint8Array) => {
      console.log(
        '📦 Encoded Binary CRDT Delta Packet Generated:',
        update
      );
    });
  }

  const handleCopyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  useEffect(() => {
  const savedUsername = localStorage.getItem("username");

  if (savedUsername) {
    setUsername(savedUsername);
  }
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
      1 online
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
        <span style={{ color: '#d4d4d8' }}>
          Room: {roomId}
        </span>

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

      <Editor
        height="80vh"
        theme="vs-dark"
        defaultLanguage="javascript"
        defaultValue="// Your collaborative masterwork begins here..."
        onMount={handleEditorDidMount}
      />
    </div>
  );
}