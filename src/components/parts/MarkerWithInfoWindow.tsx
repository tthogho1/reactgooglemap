import React from 'react';
import { AdvancedMarker,InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import type {user} from '../../types/map';

// マーカーとInfoWindowを組み合わせたコンポーネント
const MarkerWithInfoWindow = ( data: user ) => {
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
            {data.name}
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default MarkerWithInfoWindow;