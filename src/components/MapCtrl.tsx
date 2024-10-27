import React, {  useEffect, useState } from 'react';
import { useMap,Map,MapEvent} from '@vis.gl/react-google-maps';
import type {user} from '../types/map';
import  MarkerWithInfoWindow  from './parts/MarkerWithInfoWindow';
import VideoChat from './videoChat';
import { useAuth } from '../contexts/AuthContext';

const MapCtrl = (position: { lat: number, lng: number }) => {
    const Gmap = useMap() as  google.maps.Map ;
    const [pointerEventsEnabled, setPointerEventsEnabled] = useState<boolean>(true);
    const [users, setUsers] = useState<user[]>([]);
    const [isVideoChatOpen, setIsVideoChatOpen] = useState<boolean>(false);
    const { user } = useAuth();

    const openVideoChat = () => {
      setIsVideoChatOpen(true);
    }

    const closeVideoChat = () => {
      setIsVideoChatOpen(false);
    }
  
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
        if (!Gmap) {
          return;
        }
        Gmap?.setCenter(position);
    }, [position]);
  
    return (
      <div>
        <VideoChat isOpen={isVideoChatOpen} closeVideoChat={closeVideoChat}/>
        <Map
          style={{width: '100vw', height: '80vh', zIndex: 1 , pointerEvents: pointerEventsEnabled ? 'auto' : 'none'}}
          defaultCenter={position}
          defaultZoom={12}
          gestureHandling={'greedy'}
          mapId="DEMO_MAP_ID"
          onIdle={handleIdle}
        >
          { users.map((p) => (
            <MarkerWithInfoWindow key={p.name} 
            data = {p} 
            isIam={p.name === user?.username} 
            openVideoChat={openVideoChat} />
          ))} 
        </Map>
      </div>
    );
  };

  export default MapCtrl