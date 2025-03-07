import { ChatMessage, Sdp } from '../../types/webrtc';
import eventBus from '../class/EventBus';

class WebSocketWrapper {
    private socket: WebSocket | null = null;
    private url: string = "";

    constructor(url:string) {
      this.url = url;
      this.socket = new WebSocket(url);
      this.socket.onopen = () => {
        console.log(`WebSocket connection is opened to ${url}`);
      }
      this.socket.onmessage = function(event) {
        const data = JSON.parse(event.data) as ChatMessage;
        const sdp = data.message as Sdp;
        if (sdp && typeof sdp.type === 'string') {
          switch(sdp.type){
            case 'OpenVideo':
              console.log(`receive OpenVideo from ${data.user_id}`);
              eventBus.emit('showConfirm',data);
              break;
            case 'offer':
              console.log(`receive offer from ${data.user_id}`);
              eventBus.emit('setOffer',data);
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
            case 'user':
              console.log(`receive user from ${data.user_id}`);
              eventBus.emit('setUser', data);
              break;
            case 'rmuser':
              console.log(`receive user from ${data.user_id}`);
              eventBus.emit('setUser', data);  // same as 'user'
              break;
          }
        }else{
          console.log(`Receive from: [${data.user_id}] : ${data.message}`);
          eventBus.emit('appendMessage', data);
        }
      };
      

      this.socket.onclose = function(event) {
        console.error(`WebSocket connection is closed ${event.code} ${event.reason}`);  
        if (event.code === 1006) {
          setTimeout(() => {
            eventBus.emit('retryConnect', null);
          }, 3000);
        }    
      };

      this.socket.onerror = function(error) {
        console.error(`WebSocket connection error: ${error}`);
        eventBus.emit('socketStatus', false);
      }

    }

    getSocket() {
      return this.socket;
    }


} 

export default WebSocketWrapper