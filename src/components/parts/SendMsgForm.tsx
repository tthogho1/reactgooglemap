import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type {user} from '../../types/map';

const SendMsgForm = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const { user } = useAuth();
  const [socket, setSocket] = useState(null as WebSocket | null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLocked, setIsLocked] = useState(false);


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
            user_id : user.username,
            to_id : "",
            message: message
        };

        socket.send(JSON.stringify(messageObject));
        appendMessage(`Send: ${message}`);
        setMessage('');
    }

    console.log(`Setting websock for user: ${message}`);
  };

  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      return;
    }
    const newsocket = new WebSocket(`ws://localhost:8000/ws?name=${user.username}`) as WebSocket;

    newsocket.onopen = function(event) {
        console.log("WebSocket connection is opened");
        appendMessage('System: Establish WebSocket connection');
    };
  
    newsocket.onmessage = function(event) {
       appendMessage(`Receive: ${event.data}`);
       console.log(`Receive: ${event.data}`);
    };
  
    newsocket.onclose = function(event) {
        console.log("System: WebSocket connection is closed");      
        appendMessage('System: WebSocket connection is closed');
    };

    setSocket(newsocket);

    return () => {
      if (newsocket.readyState === WebSocket.OPEN) {
          newsocket.close();
      }
    };
  }, []);

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
    </div>
  );
};

export default SendMsgForm;
