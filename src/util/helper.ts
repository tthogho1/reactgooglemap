import type {ChatMessage, MessageContent} from '../types/webrtc';

const createMessage = (from: string, to: string,message:MessageContent) => {
    const messageObject = {
      user_id : from,
      to_id : to,
      message: message
    }

    return messageObject as ChatMessage;
  };

  export {createMessage}