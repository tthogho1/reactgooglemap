import { ChatMessage, Sdp } from '../../types/webrtc';

class WebSocketWrapper {
    private socket: WebSocket | null = null;
    private url: string = "";

    constructor(url:string) {
      this.url = url;
      this.socket = new WebSocket(url);
      this.socket.onopen = () => {console.log("WebSocket connection is opened")}
      /*
      this.socket.onerror = (error) => {
        console.error(`WebSocket connection error: ${error}`)
      }*/
    }

    getSocket() {
      return this.socket;
    }
} 

export default WebSocketWrapper