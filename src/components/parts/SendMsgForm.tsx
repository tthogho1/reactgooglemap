import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDialog  from './ConfirmDialog';
import { useWebSocket } from '../WebSocketProvider';
import { ChatMessage, Sdp } from '../../types/webrtc';
import eventBus from '../class/EventBus';
import { user } from '../../types/map';
import { updatePositionOnServer } from '../../api/backend';
import webRtc from '../class/WebRtc';
import { FaRegFaceSmile, FaFaceSadCry } from "react-icons/fa6";

interface ChildComponentProps {
  // true if called
  openVideoChat: (name: string, data: ChatMessage | null) => void;
  users: user[];
}

const SendMsgForm :React.FC<ChildComponentProps> = ({ openVideoChat,users }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [websocketOpen, setWebsocketOpen] = useState(true);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [sdp, setSdp] = useState<ChatMessage | null>(null);
  const { socket , updateSocket} = useWebSocket();
  //const {peerConnection,setAnswer} = useRTCPeerConnection();
  const [toName, setToName] = useState('');
  const [selectedMsgUser, setSelectedMsgUser] = useState('');
  const BROAD = "broadcast";

  const createMessage = (from: string, to: string,message:object) => {
    const messageObject = {
      user_id : from,
      to_id : to,
      message: message
    }

    return messageObject;
  };

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    openVideoChat(toName, sdp);  
  };

  const handleCancel = () => {
    setIsConfirmOpen(false);

    const message = createMessage(user?.username as string, toName, {type :'close'});
    socket?.send(JSON.stringify(message));
  };


  const showConfirm = (message: string, data: ChatMessage) => {
    setConfirmMessage(message);
    setIsConfirmOpen(true);
    setToName(data.user_id);
    setSdp(data);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const appendMessage = (msg: string) => {
    setMessages(prevMessages => [...prevMessages, msg]);
  };

  const handleSetWebsock = () => {

    if (message && socket) {
        const messageObject = {
            user_id : user?.username,
            to_id : selectedMsgUser == BROAD ? "" : selectedMsgUser,
            message: message
        };

        socket.send(JSON.stringify(messageObject));
        appendMessage(`Send: ${message}`);
        setMessage('');

        console.log(`Setting websock for user: ${message}`);
    }
  };

  useEffect(() => {
    console.log("WebSocket context updated:", socket);
  }, [socket]);

  useEffect(() => {
    if (!socket) {
      alert("WebSocket connection is not established");
      setWebsocketOpen(false);
      //console.log("WebSocket connection is not established");
      return;
    }

    if (socket.readyState === WebSocket.OPEN){
      setWebsocketOpen(true);
    }else{
      setWebsocketOpen(false);
    }
  
    socket.onmessage = function(event) {

      const data = JSON.parse(event.data) as ChatMessage;
      const sdp = data.message as Sdp;
      if (sdp.type){
        switch(sdp.type){
          case 'offer':
            showConfirm(`receive offer from ${data.user_id}?`,data);
            break;
          case 'answer':
            console.log(`receive answer from ${data.user_id}`);
            webRtc.setAnswer(data);
            break;
          case 'ice':
            console.log(`receive ice from ${data.user_id} at ` + new Date());
            webRtc.setCandidate(data);
            break;
          case 'close':
            console.log(`receive close from ${data.user_id}`);
            eventBus.emit('setClose', data);
            break;
          case 'user':
            console.log(`receive user from ${data.user_id}`);
            eventBus.emit('setUser', data);
            break;
        }
      }else{
        appendMessage(`Receive from: [${data.user_id}] : ${data.message}`);
      }
    };

    socket.onclose = function(event) {
      console.error(`WebSocket connection is closed ${event.code} ${event.reason}`);  
      if (event.code === 1006) {
        setTimeout(() => {
          updateSocket();
          if (user !== null) {
            updatePositionOnServer(user);
          }
        }, 2000);
      }    
      setWebsocketOpen(false);
      appendMessage('System: WebSocket connection is closed');
    };

    socket.onerror = function(error) {
        console.error(`WebSocket connection error: ${error}`);
        setWebsocketOpen(false);
    }
    
    return () => {  
    };
  }, [socket,socket?.readyState]);

  return (
    <div className="flex flex-col items-center space-y-2 p-4 bg-gray-100 rounded-lg shadow-md md:flex-row md:space-y-0 md:space-x-2">
      <div className="flex-grow md:w-full w-full">
        <div className="w-full md:flex md:justify-start md:items-start mb-2">
          {websocketOpen ?  <FaRegFaceSmile size={18} className="md:w-1/6" /> : <FaFaceSadCry className="md:w-1/6" />}
        </div> 
        <div className="flex-grow h-48 overflow-y-auto bg-white p-4 rounded-md border border-gray-300">
          <div> 
            {messages.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>  
      <div className="md:flex md:space-x-2 md:w-full md:h-full">
        <div className="w-full md:flex md:flex-col  md:justify-start md:space-y-2">
          <div className="w-full md:flex md:space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter Message"
              className="w-full md:w-3/4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSetWebsock}
              className="w-full md:w-1/4 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-outz"
            >
              Send
            </button>
          </div>
          <div className="w-full md:flex md:items-center md:space-x-2">
            <label className="md:w-1/5 text-lg font-bold text-gray-700">User : </label>
            <select
              value={selectedMsgUser}
              onChange={(e) => setSelectedMsgUser(e.target.value)}
              className="md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{BROAD}</option>
              {users.map((user) => (
                <option key={user.name} value={user.name}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        message={confirmMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default SendMsgForm;
