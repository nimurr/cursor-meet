import React, { useRef, useEffect } from "react";

export default function Video({ peer, stream, muted, label }) {
  const ref = useRef();

  useEffect(() => {
    if (peer) {
      peer.on("stream", (remoteStream) => {
        if (ref.current) {
          ref.current.srcObject = remoteStream;
        }
      });
    } else if (stream) {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    }
  }, [peer, stream]);

  return (
    <div className="video-wrapper">
      <video playsInline autoPlay ref={ref} muted={muted}></video>
      {label && <span className="video-label">{label}</span>}
    </div>
  );
}