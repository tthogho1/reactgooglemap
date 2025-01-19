class EventBus {
    private events: Record<string, Function[]> = {};
    private ices : any[] = [];
  
    on(event: string, callback: Function) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(callback);
    }
  
    off(event: string) {
      if (this.events[event]) {
        delete this.events[event]; // 指定されたイベントを削除
      }
    }
  
    emit(event: string, data: any) {
      if (this.events[event]) {
        this.events[event].forEach(callback => callback(data));
      }else if (event === 'setCandidate'){
        this.ices.push(data);
      }
    }

    getIces(){
      return this.ices;
    }
  }
  
  export default new EventBus();