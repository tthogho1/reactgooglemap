import React, { useState, useRef, useEffect } from 'react';
import { X, Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { useWebSocket } from './WebSocketProvider';
import WebRtc from './class/WebRtc';
import { useAuth } from '../contexts/AuthContext';
import type {Sdp,Ice,ChatMessage} from '../types/webrtc';
import eventBus from './class/EventBus';
import ConfirmDialog from './parts/ConfirmDialog';


interface VideoChatProps {
  isOpen: boolean;
  closeVideoChat: () => void;
  receiver: string;
  sdp: ChatMessage | null;
}

const VideoChat : React.FC<VideoChatProps>= ({ isOpen , closeVideoChat, receiver, sdp}) => {
  const [isConnected, setIsConnected] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socket = useWebSocket();
  const user = useAuth();
  //
  const [closeMessage, setCloseMessage] = useState('');
  const [isCloseOpen, setIsCloseOpen] = useState(false);

  useEffect(() => {
    console.log('isConnected changed:', isConnected);
  }, [isConnected]);
 

  useEffect(() => {
    if (!isOpen || sdp == null){ 
      return;
    }

    // receive offer
    (async () => {
      const pc = WebRtc.getRtcPeerConnection(); //
      setIsConnected(true);

      initializePeerConnection(pc);
      eventBus.on('setClose', setClose);

      await setLocalVideo(pc);
      
      await WebRtc.setRemoteDescription(sdp);

      const answer = await WebRtc.createAnswer() as RTCSessionDescriptionInit;
      await WebRtc.setLocalDescription(answer);

      const message = createMessage(user.user?.username as string, receiver, {type :'answer', sdp: answer.sdp});
      socket?.socket?.send(JSON.stringify(message));    
    })()
  }, [sdp, isOpen]);

  
  const createMessage = (from: string, to: string,message:object) => {
    const messageObject = {
      user_id : from,
      to_id : to,
      message: message
    }

    return messageObject;
  };


  const initializePeerConnection = (pc: RTCPeerConnection) => {
    console.log("Initializing PeerConnection... signalingState:" + pc.signalingState);
    pc.ontrack = (event) => {
      console.log("ontrack evenvt for remote stream");
      const remoteStream = event.streams[0];
      if (remoteVideoRef && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    }; 

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const message = createMessage(user.user?.username as string, receiver,
           {type: 'ice', candidate: event.candidate});
        socket?.socket?.send(JSON.stringify(message));

        console.log("Sending ICE candidate:");
      }
    };

  };

  const setClose = () => {
    receiveDisconnect();
    displayCloseAlert("Cancel or Close from Peer : " + receiver);
  }

  const displayCloseAlert = (message: string) => {
    setCloseMessage(message); 
    setIsCloseOpen(true);
  };

  const closeConfirm = () => {
    setIsCloseOpen(false);
  };

  const setLocalVideo =  async (pc: RTCPeerConnection) =>  {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach(
      track => {
        console.log('Adding track:', track.kind)
        pc.addTrack(track, stream)
      }
    );
  
    if (localVideoRef && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    } 
  }

  // Open video chat 
  const handleConnect = async () => {
    const pc = WebRtc.getRtcPeerConnection(); //

    console.log("signalingState:" + pc.signalingState);
    setIsConnected(true);

    initializePeerConnection(pc);
    eventBus.on('setClose', setClose);

    await setLocalVideo(pc);

    const offer = await WebRtc.createOffer() as RTCSessionDescriptionInit;
    await WebRtc.setLocalDescription(offer);

    const message = createMessage(user.user?.username as string, receiver, {type :'offer', sdp: offer.sdp});
    socket?.socket?.send(JSON.stringify(message));
  };

  const closeVideo = (videoRef: HTMLVideoElement|null) => {
    if (videoRef ) {
      const stream = videoRef.srcObject as MediaStream;
      const tracks = stream?.getTracks();
      if (tracks) {
        tracks.forEach(track => track.stop());
      }
      videoRef.srcObject = null;
    }
  }

  const handleDisconnect = () => {
    receiveDisconnect();

     if (isConnected) {
        const message = createMessage(user.user?.username as string, receiver, {type :'close'});
        socket.socket?.send(JSON.stringify(message));
     }
     setIsConnected(false);
     closeVideoChat();
  };

  const receiveDisconnect = () => {
    const pc = WebRtc.getRtcPeerConnection(); //
    eventBus.off('setClose');

    pc.close();
    //
    closeVideo(remoteVideoRef.current);
    closeVideo(localVideoRef.current);
    setIsConnected(false);

  };

  if (!isOpen) return null;

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

        <ConfirmDialog
          isOpen={isCloseOpen}
          message={closeMessage}
          onConfirm={closeConfirm}
        />

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
