type ChatMessage = {
    user_id: string;
    to_id: string;
    message: MessageContent;
  };
  
  type MessageContent = 
    | string
    | Sdp
    | Ice
    | Close // Close is not protocol, use for disconnect opponent
    | User
    | RMUser;
  
  type Sdp = {
    type: string;
    sdp: string;
  };
  
  type Ice = {
    type: string;
    candidate: Candidate;
  };
  
  // Close is not protocol , use for disconnect opponent
  type Close = {
    type: string;
  };

  type User = {
    type: string,
    user_id: string,
    location: { lat: number; lng: number };
  };

  type RMUser = {
    type: string,
    user_id: string,
    location: { lat: number; lng: number };
  };

  type Candidate = {
    candidate: string;
    sdpMid: string;
    sdpMLineIndex: number;
  };

  
  export type { ChatMessage, MessageContent, Sdp, Ice, Candidate, Close, User };