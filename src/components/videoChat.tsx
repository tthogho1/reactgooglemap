import React, { useState, useRef, useEffect } from 'react';
import { X, Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { useWebSocket } from './WebSocketProvider';
import { useAuth } from '../contexts/AuthContext';
import type {Sdp,ChatMessage} from '../types/webrtc';

interface VideoChatProps {
  isOpen: boolean;
  closeVideoChat: () => void;
  receiver: string;
  isCalled: boolean;
}

const VideoChat : React.FC<VideoChatProps>= ({ isOpen , closeVideoChat, receiver, isCalled}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socket = useWebSocket();
  const user = useAuth();

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      // 必要に応じてTURNサーバーも追加
    ]
  };

  if (!isOpen) return null;

  const handleConnect = async () => {
    setIsConnected(true);
    const pc = new RTCPeerConnection(configuration);
    pc.ontrack = (event) => {
      console.log('ontrack');

      const remoteStream = event.streams[0];
      if (remoteVideoRef && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach(
      track => {
        console.log('Adding track:', track.kind)
        pc.addTrack(track, stream)
      }
    );
  
    // ビデオ要素への表示
    if (localVideoRef && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('onicecandidate');

        const messageObject = {
          user_id : user.user?.username,
          to_id : receiver,
          message: { type: 'ice', candidate: event.candidate }
        }
        socket?.socket?.send(JSON.stringify(messageObject));
      }
    };

    const messageObject : ChatMessage = {
      user_id : user.user?.username  as string,
      to_id : receiver ,
      message: { type: 'offer', sdp: offer.sdp } as Sdp   
     }
    socket?.socket?.send(JSON.stringify(messageObject));

  };

  const handleDisconnect = () => {
    setIsConnected(false);
    closeVideoChat();
    // ここで切断処理を実装
    // onClose();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // ここでミュート処理を実装
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // ここでビデオのON/OFF処理を実装
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-4 w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-semibold">Video Chat</h2>
          <button
            onClick={handleDisconnect}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Video Container */}
        <div className="relative h-[480px] mb-4">
          {/* Remote Video (大画面) */}
          <video
            ref={remoteVideoRef}
            className="w-full h-full bg-gray-800 rounded-lg object-cover"
            autoPlay
            playsInline
          />
          
          {/* Local Video (小画面) */}
          <div className="absolute bottom-4 right-4 w-48 h-36">
            <video
              ref={localVideoRef}
              className="w-full h-full bg-gray-700 rounded-lg object-cover"
              autoPlay
              playsInline
              muted
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full ${
              isMuted ? 'bg-red-500' : 'bg-gray-700'
            } hover:opacity-80 transition-opacity`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              !isVideoEnabled ? 'bg-red-500' : 'bg-gray-700'
            } hover:opacity-80 transition-opacity`}
          >
            {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
          </button>

          <button
            onClick={isConnected ? handleDisconnect : handleConnect}
            className={`p-3 rounded-full ${
              isConnected ? 'bg-red-500' : 'bg-green-500'
            } hover:opacity-80 transition-opacity`}
          >
            {isConnected ? <PhoneOff size={24} /> : <Phone size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
