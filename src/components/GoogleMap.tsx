import React, { useState, useEffect } from 'react';
import Header from './parts/Header';
import { APIProvider} from '@vis.gl/react-google-maps';
import { useAuth } from '../contexts/AuthContext';
import type {user} from '../types/map';
import {sendUserPosition} from '../api/backend';
import SendMsgForm from './parts/SendMsgForm';
import MapCtrl from './MapCtrl';

const GoogleMap = () => {
  const [position, setPosition] = useState({ lat: 35.4052, lng: 139.76667 });
  const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const { user } = useAuth();
  const [iam, setIam] = useState<user>({} as user);

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
            name: user?.username as string,
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
      <MapCtrl {...position}/>
      // after getting my position set SendMsgForm
      {Object.keys(iam).length > 0 && <SendMsgForm/>}
    </APIProvider>
  );
}

export default GoogleMap;
