/// <reference types="react-scripts" />

declare global {
  interface Window {
    webkitRTCPeerConnection?: RTCPeerConnection;
    mozRTCPeerConnection?: RTCPeerConnection;
  }
}

export {};