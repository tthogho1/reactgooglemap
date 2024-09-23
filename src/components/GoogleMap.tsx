import React, { useState, useEffect } from 'react';
import Header from './parts/Header';
import { APIProvider, Map, AdvancedMarker,Pin,InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { useAuth } from '../contexts/AuthContext';

const GoogleMap = () => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [position, setPosition] = useState({ lat: 35.4052, lng: 139.76667 });
  const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const {user} = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const infoPosition = ({lat,lng}:{lat:number,lng:number}) =>{
    return {
      lat: lat + 0.001,
      lng: lng 
    }
  }

  useEffect(() => {
    console.log("start map useEffect");

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting geolocation:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <APIProvider apiKey={API_KEY}>
      <Header/>
      <Map
        style={{width: '100vw', height: '70vh', zIndex: 1}}
        defaultCenter={position}
        zoom={12}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId="DEMO_MAP_ID"
      >
        <AdvancedMarker ref={markerRef} position={position} onClick={() => setIsOpen(!isOpen)} >
        </AdvancedMarker>

        {isOpen && (
          <InfoWindow
            anchor = {marker}
            onCloseClick={() => setIsOpen(!isOpen)}
          >
          <div>{user.username}</div>
          </InfoWindow>
        )}
 
      </Map>
    </APIProvider>
  );
}

export default GoogleMap;
