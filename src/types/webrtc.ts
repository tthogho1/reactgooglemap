type ChatMessage = {
    user_id: string;
    to_id: string;
    message: MessageContent;
  };
  
  type MessageContent = 
    | string
    | Sdp
    | Ice
    | Close; // Close is not protocol, use for disconnect opponent
  
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

  type Candidate = {
    candidate: string;
    sdpMid: string;
    sdpMLineIndex: number;
  };
  
  export type { ChatMessage, MessageContent, Sdp, Ice, Candidate };