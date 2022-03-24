import React, { useEffect, useState } from 'react';
import { emit, listen } from '@tauri-apps/api/event'

function App() {
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    emit("recording", recording);
  }, [recording]);

  return (
    <div
      style={{
        background: "white",
        width: 320,
        height: 400,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <p>Takt</p>

      <button onClick={() => {
        setRecording(recording => !recording);
      }}>{recording ? "stop" : "start"}</button>
    </div>
  );
}

export default App;
