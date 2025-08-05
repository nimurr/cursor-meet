import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function Landing() {
  const [roomIdInput, setRoomIdInput] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    const id = uuidv4();
    navigate(`/room/${id}`);
  };

  const joinRoom = () => {
    if (roomIdInput.trim()) {
      navigate(`/room/${roomIdInput.trim()}`);
    }
  };

  return (
    <div className="landing-container">
      <h1>Welcome to Video Meet</h1>
      <div className="actions">
        <button onClick={createRoom}>Create New Meeting</button>
      </div>
      <div className="join-section">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value)}
        />
        <button onClick={joinRoom}>Join Meeting</button>
      </div>
    </div>
  );
}