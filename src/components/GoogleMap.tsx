import React, { useState, useEffect, PointerEvent } from 'react';
import Header from './parts/Header';
import { APIProvider, Map, useMapsLibrary ,MapEvent} from '@vis.gl/react-google-maps';
import { useAuth } from '../contexts/AuthContext';
import type {user} from '../types/map';
import {sendUserPosition, getUserPosition} from '../api/backend';
import  MarkerWithInfoWindow  from './parts/MarkerWithInfoWindow';
import SendMsgForm from './parts/SendMsgForm';

const GoogleMap = () => {
  const [position, setPosition] = useState({ lat: 35.4052, lng: 139.76667 });
  const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const { user } = useAuth();
  const [users, setUsers] = useState<user[]>([]);
  const [iam, setIam] = useState<user>({} as user);
  const geometryLibrary = useMapsLibrary('geometry');
  const [pointerEventsEnabled, setPointerEventsEnabled] = useState<boolean>(true);

  const handleIdle = (event:MapEvent) => {
    
    const center = event.map.getCenter() as google.maps.LatLng;
    const bounds = event.map.getBounds();
    const ne = bounds?.getNorthEast() as google.maps.LatLng;
    const radius = google.maps.geometry.spherical.computeDistanceBetween(center, ne);

    console.log('Map center:', event.map.getCenter()?.toJSON(),radius);

    const locationQuery = {
      location: {
        lat: center.lat(),
        lng: center.lng()
      },
      radius: radius
    };
    
    setPointerEventsEnabled(false);
    fetch('/usersinbounds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(locationQuery)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Received data:', data);
      setUsers(data.users);

    })
    .catch(error => {
      console.error('Fetch error:', error);
    })
    .finally(() => {
      setPointerEventsEnabled(true);
    });
 
  } 

  useEffect(() => {
    console.log("start map useEffect");

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });

          const t_iam:user = {
            name: user.username,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }

          await sendUserPosition(t_iam);
          // if not iam == {} (empty) then setIam
          if (Object.keys(iam).length === 0) {
            console.log("set Iam");
            setIam(t_iam);
          }

          const tusers = await getUserPosition();
          setUsers(tusers);      

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
    <APIProvider apiKey={API_KEY} libraries={['geometry']}>
      <Header/>
      <Map
        style={{width: '100vw', height: '80vh', zIndex: 1 , pointerEvents: pointerEventsEnabled ? 'auto' : 'none'}}
        defaultCenter={position}
        defaultZoom={12}
        gestureHandling={'greedy'}
        mapId="DEMO_MAP_ID"
        onIdle={handleIdle}
      >
        { users.map((p) => (
          <MarkerWithInfoWindow key={p.name} {...p} />
        ))}  

      </Map>
      {Object.keys(iam).length > 0 && <SendMsgForm/>}
    </APIProvider>
  );
}

export default GoogleMap;
