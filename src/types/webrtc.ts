type ChatMessage = {
    user_id: string;
    to_id: string;
    message: MessageContent;
  };
  
  type MessageContent = 
    | string
    | Sdp
    | Ice;
  
  type Sdp = {
    type: string;
    sdp: string;
  };
  
  type Ice = {
    type: string;
    candidate: Candidate;
  };
  
  type Candidate = {
    candidate: string;
    sdpMid: string;
    sdpMLineIndex: number;
  };
  
  export type { ChatMessage, MessageContent, Sdp, Ice, Candidate };