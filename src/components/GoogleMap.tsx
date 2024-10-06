import React, { useState, useEffect } from 'react';
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

  const handleIdle = (event:MapEvent) => {
    console.log('Map is idle');
    // イベントの詳細情報にアクセス可能
    console.log('Map center:', event.map.getCenter()?.toJSON());
    console.log('Map zoom:', event.map.getZoom());
  };

  useEffect(() => {
    console.log("start map useEffect");
   // if (!geometryLibrary) {
   //   return;
   // }

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
        style={{width: '100vw', height: '80vh', zIndex: 1}}
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
