'use client';
import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';

export default function EditorComponent() {
  const editorRef = useRef<any>(null);

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('monaco-text');
    new MonacoBinding(ytext, editorRef.current.getModel(), new Set([editorRef.current]), null);

    ydoc.on('update', (update: Uint8Array) => {
      console.log('📦 Encoded Binary CRDT Delta Packet Generated:', update);
    });
  }

  return (
    <div style={{ height: '100vh', backgroundColor: '#1e1e1e', padding: '20px' }}>
      <div style={{ marginBottom: '15px' }}>
        <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>⚡ Collaborative Workspace Matrix</h2>
        <p style={{ color: '#888', fontSize: '14px' }}>Algorithmic Concurrency Client Engine Active (TS)</p>
      </div>
      <Editor
        height="85%"
        theme="vs-dark"
        defaultLanguage="javascript"
        defaultValue="// Your collaborative masterwork begins here..."
        onMount={handleEditorDidMount}
      />
    </div>
  );
}