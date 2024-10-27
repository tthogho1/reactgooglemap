import React, { createContext, useContext, useEffect, useRef,useState ,ReactNode } from 'react';
import { useAuth} from '../contexts/AuthContext';

interface WebSocketContextValue {
  socket: WebSocket | null;
  sendMessage: (message: string) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket,setSocket ] = useState<WebSocket | null>(null);
  const { user ,isAuthenticated} = useAuth();
  const websocketServer = process.env.REACT_APP_WEBSOCKET_URL;

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (user) {
      console.log(user?.username + " is currently logged in");
    }else{
      console.log("No user is currently logged in");
    }
    // WebSocket接続の確立
    const newSocket = new WebSocket(`${websocketServer}/ws?name=${user?.username}`);
    setSocket(newSocket);

    console.log("new WebSocket is created");
    
    // クリーンアップ関数
    return () => {
      if (socket) {
        console.log("WebSocket is closed");
        socket.close();
      }
    };
  }, [isAuthenticated]);

  const sendMessage = (message: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  };

  const value: WebSocketContextValue = {
    socket: socket,
    sendMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (context === null) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};