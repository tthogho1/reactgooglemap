import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDialog  from './ConfirmDialog';
import { useWebSocket } from '../WebSocketProvider';
import { ChatMessage, Sdp } from '../../types/webrtc';
import eventBus from '../class/EventBus';

interface ChildComponentProps {
  // true if called
  openVideoChat: (name: string, data: ChatMessage | null) => void;
}

const SendMsgForm :React.FC<ChildComponentProps> = ({ openVideoChat }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const { user } = useAuth();
  //const [socket, setSocket] = useState(null as WebSocket | null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [sdp, setSdp] = useState<ChatMessage | null>(null);
  const { socket } = useWebSocket();
  const [toName, setToName] = useState('');

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
    // const toName = toNameInput.value;

    if (message && socket) {
        const messageObject = {
            user_id : user?.username,
            to_id : "",
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
      // console.log(`Receive: ${event.data}`);
      
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
            console.log(`receive ice from ${data.user_id}`);
            eventBus.emit('setCandidate', data);
            break;
        }
        //appendMessage(`Receive: ${data.message.type}`);
      }else{
        appendMessage(`Receive from: [${data.user_id}] : ${data.message}`);
      }

    };
  
    socket.onclose = function(event) {
        console.error(`WebSocket connection is closed ${event.code} ${event.reason}`);      
        appendMessage('System: WebSocket connection is closed');
    };

    socket.onerror = function(error) {
        console.error(`WebSocket connection error: ${error}`);
    }

    //setSocket(newsocket);

    return () => {
      // close in context provider
      /*
            if (socket && socket.readyState === WebSocket.OPEN) {
          socket.close();
       } */
    };
  }, [socket]);

  return (
    <div className="flex items-center space-x-2 p-4 bg-gray-100 rounded-lg shadow-md">
      <div className="flex-grow h-64 overflow-y-auto bg-white p-4 rounded-md border border-gray-300">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">{msg}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter Message"
        className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        onClick={handleSetWebsock}
        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out"
      >
        Send
      </button>

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
