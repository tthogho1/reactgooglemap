import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDialog  from './ConfirmDialog';
import { useWebSocket } from '../WebSocketProvider';


interface ChildComponentProps {
  // true if called
  openVideoChat: (name: string, called:boolean) => void;
}

const SendMsgForm :React.FC<ChildComponentProps> = ({ openVideoChat }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const { user } = useAuth();
  //const [socket, setSocket] = useState(null as WebSocket | null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  const { socket } = useWebSocket();
  const [toName, setToName] = useState('');

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    openVideoChat(toName,true);  
  };

  const handleCancel = () => {
    setIsConfirmOpen(false);
  };

  const showConfirm = (message: string,name: string) => {
    setConfirmMessage(message);
    setIsConfirmOpen(true);
    setToName(name);
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
      console.log(`Receive: ${event.data}`);
      
      const data = JSON.parse(event.data);
      if (data.message.type){
        switch(data.message.type){
          case 'offer':
            showConfirm(`receive offer from ${data.user_id}?`,data.user_id);
            break;
          case 'answer':
          case 'ice':
        }
       // console.log(`Receive: ${data.message.type}`);
        //appendMessage(`Receive: ${data.message.type}`);
      }else{
        appendMessage(`Receive from: [${data.user_id}] : ${data.message}`);
      }

    };
  
    socket.onclose = function(event) {
        console.log("System: WebSocket connection is closed");      
        appendMessage('System: WebSocket connection is closed');
    };

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
