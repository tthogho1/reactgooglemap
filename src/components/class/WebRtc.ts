import type {Sdp,Ice,ChatMessage} from '../../types/webrtc';

class WebRtc {
    private static instance: WebRtc;
    private peerConnection: RTCPeerConnection | null = null;
    private ices: any[] = [];

    private constructor() {
      this.peerConnection = new RTCPeerConnection(this.configuration);
      this.setSignalingState(this.peerConnection);
    }

    private configuration = {
      iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
      ]
    }

    public static getInstance(): WebRtc {
      if (!WebRtc.instance) {
        WebRtc.instance = new WebRtc();
      }
      return WebRtc.instance;
    }

    private setSignalingState(pc: RTCPeerConnection) {
        pc.onconnectionstatechange = (event) => {
          console.log("connectionState:" + pc.connectionState);
        };
    
        pc.oniceconnectionstatechange = (event) => {
          console.log("iceConnectionState:" + pc.iceConnectionState);
        };
    
        pc.onsignalingstatechange = (event) => {
          console.log("signalingState:" + pc.signalingState);
          if (pc.signalingState === 'stable')
           // || pc.signalingState === 'have-remote-offer'
           // || pc.signalingState === 'have-local-offer'
           {
            console.log('call setSavedCandidates');
            this.setSavedCandidates();
          }
        }
    } 

    setSavedCandidates() {

      const iceCandidates = this.ices;
      iceCandidates.forEach((data, index) => {
        this.setCandidate(data);
        iceCandidates.splice(index, 1); // 削除
      })
    }
    
    getRtcPeerConnection() {
      if (this.peerConnection === null 
        || this.peerConnection?.signalingState === 'closed') {

        console.log("CreatePeerConnection " + this.peerConnection?.signalingState);
        this.peerConnection = new RTCPeerConnection(this.configuration);
        this.setSignalingState(this.peerConnection);
      }
      return this.peerConnection;
    }

    setAnswer = (data: ChatMessage) => {

      if (this.peerConnection?.signalingState !== 'stable') {
        console.log(`setAnswer from ${data.user_id}`);
  
        const sdp = data.message as Sdp;
        this.peerConnection?.setRemoteDescription({ type: 'answer', sdp: sdp.sdp });
      }else{
        console.log('setAnswer fail because of not stable');
      }    
    }

    setCandidate = (data: ChatMessage) => {
      const ice = data.message as Ice;      

      if (!this.peerConnection?.remoteDescription || this.peerConnection?.signalingState === 'closed' ||
        !(this.peerConnection?.signalingState === 'stable')){
         // || this.peerConnection?.signalingState === 'have-remote-offer'
         // || this.peerConnection?.signalingState === 'have-local-offer')) {
        console.log(`push ice candidate from ${data.user_id}` + this.peerConnection?.signalingState);
        this.ices.push(data);
        return;
      }

      this.peerConnection?.addIceCandidate(ice.candidate).then(()=>
        {
          console.log(`add ice candidate from ${data.user_id}`)
        }
      ).catch(
        error => console.log('icecandidate error' + error)
      );

    }

    setRtcPeerConnection(RtcPeerConnection: RTCPeerConnection) {
      this.peerConnection = RtcPeerConnection;
    }
  
    reCreateRtcPeerConnection() {
      this.peerConnection = new RTCPeerConnection(this.configuration);
    }

    setRemoteDescription = async ( sdp: ChatMessage) => {
      try {
        await this.peerConnection?.setRemoteDescription({
          type: 'offer',
          sdp: (sdp.message as Sdp).sdp
        });
        console.log('setRemoteDescription');
      } catch (error) {
        console.log("Offer setRemoteDescription", error);
      }
    }


    setLocalDescription = async (answer: RTCSessionDescriptionInit) => {
      try {
        await this.peerConnection?.setLocalDescription(answer);
        console.log('setLocalDescription');
      } catch (error) {
        console.log(error);
      }
  
    } 

    createAnswer = async () =>  {
      try {
        const answer = await this.peerConnection?.createAnswer();
        return answer;
      } catch (error) {
        console.log(error);
      }
    }

    createOffer = async () => {
      try {
        const offer = await this.peerConnection?.createOffer();
        return offer;
      } catch (error) {
        console.log(error);
      }
    }

  }
  
  const instance = WebRtc.getInstance();

  export default instance;