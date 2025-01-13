import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDialog  from './ConfirmDialog';
import { useWebSocket, WebSocketProvider } from '../WebSocketProvider';
import { ChatMessage, Sdp } from '../../types/webrtc';
import eventBus from '../class/EventBus';
import { user } from '../../types/map';
import { updatePositionOnServer } from '../../api/backend';

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
  const [confirmMessage, setConfirmMessage] = useState('');
  const [sdp, setSdp] = useState<ChatMessage | null>(null);
  const { socket , updateSocket} = useWebSocket();
  const [toName, setToName] = useState('');
  const [selectedMsgUser, setSelectedMsgUser] = useState('');
  const BROAD = "broadcast";

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    openVideoChat(toName, sdp);  
  };

  const handleCancel = () => {
    setIsConfirmOpen(false);
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
      console.log("WebSocket connection is not established");
      return;
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      // alert("WebSocket connection is established");
      appendMessage('System: Established WebSocket connection');
    }

    socket.onopen = function(event) {
        console.log("WebSocket connection is opened");
        appendMessage('System: Establish WebSocket connection on open');
    };
  
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
            eventBus.emit('setAnswer', data);
            break;
          case 'ice':
            console.log(`receive ice from ${data.user_id} at ` + new Date());
            eventBus.emit('setCandidate', data);
            break;
          case 'close':
            console.log(`receive close from ${data.user_id}`);
            eventBus.emit('setClose', data);
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
      appendMessage('System: WebSocket connection is closed');
    };

    socket.onerror = function(error) {
        console.error(`WebSocket connection error: ${error}`);
    }

    return () => {  
    };
  }, [socket]);

  return (
    <div className="flex flex-col items-center space-y-2 p-4 bg-gray-100 rounded-lg shadow-md md:flex-row md:space-y-0 md:space-x-2">
      <div className="flex-grow h-64 overflow-y-auto bg-white p-4 rounded-md border border-gray-300 md:w-full">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">{msg}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>  
      <div className="md:flex md:space-x-2 md:w-full"> 
        <div className="w-full md:flex md:flex-col md:space-y-2">
          <div className="w-full md:flex md:space-x-2"> 
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter Message"
              className="w-full md:flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent md:w-full"
            />
            <button
              onClick={handleSetWebsock}
              className="w-full md:w-1/4 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out md:w-full"
            >
              Send
            </button>
          </div>
          <div className="w-full md:flex md:items-center md:space-x-2">
            <label className="md:w-1/5 text-lg font-bold text-gray-700">Select User : </label>
            <select
              value={selectedMsgUser}
              onChange={(e) => setSelectedMsgUser(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
