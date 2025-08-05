import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";
import Video from "../components/Video";

const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export default function Room() {
  const { roomId } = useParams();
  const [peers, setPeers] = useState([]); // [{ peer, userId, socketId }]
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const [stream, setStream] = useState(null);
  const userId = useRef(Math.floor(Math.random() * 10000).toString());

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);

        // Join room after stream ready
        socketRef.current.emit("join_room", { roomId, userId: userId.current });

        socketRef.current.on("all_users", (users) => {
          const peersInit = [];
          users.forEach((user) => {
            const peer = createPeer(user.socketId, socketRef.current.id, mediaStream);
            peersRef.current.push({ peerId: user.socketId, peer });
            peersInit.push({ peer, userId: user.userId, socketId: user.socketId });
          });
          setPeers(peersInit);
        });

        socketRef.current.on("user_joined", ({ signal, callerId, socketId }) => {
          const peer = addPeer(signal, callerId, mediaStream);
          peersRef.current.push({ peerId: callerId, peer });
          setPeers((prevPeers) => [...prevPeers, { peer, userId: callerId, socketId }]);
        });

        socketRef.current.on("receiving_returned_signal", ({ signal, id }) => {
          const item = peersRef.current.find((p) => p.peerId === id);
          if (item) {
            item.peer.signal(signal);
          }
        });

        socketRef.current.on("user_left", ({ socketId }) => {
          setPeers((prevPeers) => prevPeers.filter((p) => p.socketId !== socketId));
          const peerObj = peersRef.current.find((p) => p.peerId === socketId);
          if (peerObj) {
            peerObj.peer.destroy();
          }
          peersRef.current = peersRef.current.filter((p) => p.peerId !== socketId);
        });
      })
      .catch((err) => {
        console.error("Error accessing media devices.", err);
      });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [roomId]);

  function createPeer(userToSignal, callerId, stream) {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending_signal", { userToSignal, callerId: socketRef.current.id, signal });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning_signal", { signal, callerId });
    });

    peer.signal(incomingSignal);
    return peer;
  }

  return (
    <div className="room-container">
      <h2>Room ID: {roomId}</h2>
      <div className="videos-grid">
        {stream && <Video stream={stream} muted={true} label="You" />}
        {peers.map(({ peer, userId, socketId }) => (
          <Video key={socketId} peer={peer} label={userId} />
        ))}
      </div>
    </div>
  );
}