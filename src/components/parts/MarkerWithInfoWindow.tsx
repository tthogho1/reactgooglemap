import React from 'react';
import { AdvancedMarker,InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import type {user} from '../../types/map';
import { ChatMessage } from '../../types/webrtc';


interface MarkerWithInfoWindowProps  {
  data: user;
  isIam: boolean;
  openVideoChat: (name: string, data: ChatMessage | null) => void;
}

// マーカーとInfoWindowを組み合わせたコンポーネント
const MarkerWithInfoWindow = ( {data,isIam,openVideoChat}: MarkerWithInfoWindowProps ) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleInfoWindow = () => setIsOpen(!isOpen);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: data.location.lat, lng: data.location.lng }}
        onClick={toggleInfoWindow}
      />
      {isOpen && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setIsOpen(false)}
        >
          <div>
            <span 
              className={`${!isIam ? 'underline' : ''}`}
              {...(!isIam && { onClick: () => openVideoChat(data.name, null) })}  
            >
                {data.name}
              </span>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default MarkerWithInfoWindow;